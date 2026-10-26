import * as THREE from 'three';
import { createHeldModel } from './items/itemVisuals.js';

const HAND = new THREE.Vector3(0.3, -0.35, -0.6); // mesma posição da mão do HeldItemView
const FLY_TIME = 0.28;
const SETTLE_TIME = 0.18;
const SETTLE_HEIGHT = 0.25;

const easeOut = (t) => 1 - (1 - t) ** 3;

/**
 * Animações curtas dos itens:
 *   flyToHand(item, de)  → o item sai da pilha e voa até a mão
 *   flyFromHand(item, para) → sai da mão e cai no chão (ao largar)
 *   settle(mesh)         → o bloco "assenta" descendo um pouquinho ao ser colocado na obra
 */
export class ItemEffects {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.animations = [];
  }

  /** Posição da mão no mundo (na frente da câmera) */
  handPosition(target = new THREE.Vector3()) {
    return this.camera.localToWorld(target.copy(HAND));
  }

  flyToHand(itemId, from) {
    this.fly(itemId, from.clone(), () => this.handPosition(), 1, 0.4);
  }

  flyFromHand(itemId, to) {
    this.fly(itemId, this.handPosition(), () => to, 0.4, 1);
  }

  fly(itemId, from, getTarget, startScale, endScale) {
    const mesh = createHeldModel(itemId, 1);
    mesh.position.copy(from);
    mesh.scale.setScalar(startScale);
    this.scene.add(mesh);
    this.animations.push({ time: 0, duration: FLY_TIME, update: (t) => {
      const k = easeOut(t);
      mesh.position.lerpVectors(from, getTarget(), k);
      mesh.position.y += Math.sin(t * Math.PI) * 0.25; // pequeno arco
      mesh.scale.setScalar(THREE.MathUtils.lerp(startScale, endScale, k));
      mesh.rotation.y = k * Math.PI;
    }, done: () => this.scene.remove(mesh) });
  }

  settle(mesh) {
    const endY = mesh.position.y;
    this.animations.push({ time: 0, duration: SETTLE_TIME, update: (t) => {
      mesh.position.y = endY + SETTLE_HEIGHT * (1 - easeOut(t));
    }, done: () => { mesh.position.y = endY; } });
  }

  update(delta) {
    this.animations = this.animations.filter((animation) => {
      animation.time += delta;
      const t = Math.min(1, animation.time / animation.duration);
      animation.update(t);
      if (t < 1) return true;
      animation.done();
      return false;
    });
  }
}
