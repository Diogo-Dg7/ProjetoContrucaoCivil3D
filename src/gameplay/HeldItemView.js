import * as THREE from 'three';
import { createHeldModel } from './items/itemVisuals.js';

const HAND_OFFSET = new THREE.Vector3(0.3, -0.32, -0.6);

/**
 * Mostra o item carregado no canto da tela (como em jogos de 1ª pessoa).
 * Fica na cena "overlay" do App, desenhada por cima de tudo.
 */
export class HeldItemView {
  constructor(overlayScene, camera, inventory) {
    this.camera = camera;
    this.time = 0;

    this.root = new THREE.Group();
    this.hand = new THREE.Group();
    this.hand.position.copy(HAND_OFFSET);
    this.hand.rotation.set(0.15, -0.5, 0);
    this.hand.scale.setScalar(0.4);
    this.root.add(this.hand);
    overlayScene.add(this.root);

    // A cena overlay precisa das próprias luzes
    overlayScene.add(new THREE.HemisphereLight('#ffffff', '#6b6658', 1.4));
    const light = new THREE.DirectionalLight('#ffffff', 1.2);
    light.position.set(1, 2, 1);
    overlayScene.add(light);

    inventory.on('change', (held) => this.show(held));
  }

  show(held) {
    this.hand.clear();
    if (held) this.hand.add(createHeldModel(held.id, held.count));
  }

  update(delta) {
    this.time += delta;
    this.root.position.copy(this.camera.position);
    this.root.quaternion.copy(this.camera.quaternion);
    this.hand.position.y = HAND_OFFSET.y + Math.sin(this.time * 2) * 0.006;
  }
}
