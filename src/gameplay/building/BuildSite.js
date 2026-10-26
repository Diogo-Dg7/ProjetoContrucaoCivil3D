import * as THREE from 'three';
import { ITEMS } from '../../config/items.js';
import { PLAYER } from '../../config/settings.js';
import { CollisionWorld } from '../../physics/CollisionWorld.js';
import { EventEmitter } from '../../utils/EventEmitter.js';
import { boxGeometry, ghostMaterial, placedMaterial } from '../items/itemVisuals.js';
import { generatePlan } from './PlanGenerator.js';

const _box = new THREE.Box3();

/**
 * Canteiro de obra: mostra os blocos fantasmas da etapa atual e recebe os
 * materiais que o personagem assenta.
 *
 * Eventos: 'step' → { step, index }   'complete' → plan
 */
export class BuildSite extends EventEmitter {
  constructor({ collision, services, trough }) {
    super();
    this.collision = collision;
    this.services = services;
    this.trough = trough;

    this.root = new THREE.Group();
    this.root.name = 'BuildSite';

    this.planGroup = new THREE.Group();
    this.ghostGroup = new THREE.Group();
    this.placedGroup = new THREE.Group();
    this.planGroup.add(this.ghostGroup, this.placedGroup);
    this.root.add(this.planGroup);

    this.plan = null;
    this.steps = [];
    this.stepIndex = 0;
    this.colliders = [];

    // Um único "interagível" compartilhado por todos os fantasmas
    this.interactable = {
      perMesh: true,
      getPrompt: (mesh) => this.getPrompt(mesh.userData.slot),
      interact: (mesh) => this.place(mesh),
      onHover: (mesh) => { mesh.material = ghostMaterial(mesh.userData.slot.item, true); },
      onUnhover: (mesh) => {
        if (!mesh.userData.slot.placed) mesh.material = ghostMaterial(mesh.userData.slot.item);
      },
    };
  }

  get isActive() {
    return this.plan !== null;
  }

  get isComplete() {
    return this.isActive && this.stepIndex >= this.steps.length;
  }

  get currentStep() {
    return this.steps[this.stepIndex] ?? null;
  }

  get remainingSlots() {
    return this.currentStep?.slots.filter((slot) => !slot.placed) ?? [];
  }

  /** Itens que a etapa atual ainda pede */
  neededItems() {
    return new Set(this.remainingSlots.map((slot) => slot.item));
  }

  needsMortar() {
    return this.remainingSlots.some((slot) => slot.needsMortar);
  }

  /** Progresso total da obra (0 a 1) */
  get progress() {
    const all = this.steps.flatMap((step) => step.slots);
    return all.length ? all.filter((slot) => slot.placed).length / all.length : 0;
  }

  /** Começa uma obra no local escolhido (center = [x, z] do meio da obra, rotation em graus) */
  setPlan(plan, { center, rotation = 0 }) {
    this.clear();
    this.root.position.set(center[0], 0, center[1]);
    this.root.rotation.y = THREE.MathUtils.degToRad(rotation);
    const generated = generatePlan(plan);
    this.plan = plan;
    this.steps = generated.steps;
    this.planGroup.position.set(-generated.size[0] / 2, 0, -generated.size[1] / 2);
    this.showStep(0);
  }

  clear() {
    this.ghostGroup.clear();
    this.placedGroup.clear();
    this.collision.remove(this.colliders);
    this.colliders = [];
    this.plan = null;
    this.steps = [];
    this.stepIndex = 0;
  }

  showStep(index) {
    this.stepIndex = index;
    const step = this.currentStep;
    if (!step) {
      this.emit('complete', this.plan);
      return;
    }

    step.slots.forEach((slot, i) => {
      const mesh = new THREE.Mesh(boxGeometry(slot.size), ghostMaterial(slot.item));
      mesh.position.set(...slot.position);
      mesh.userData = { slot, variant: (i * 7 + index) % 6, interactable: this.interactable };
      slot.mesh = mesh;
      this.ghostGroup.add(mesh);
    });

    for (const extra of step.extras) {
      const mesh = new THREE.Mesh(boxGeometry(extra.size), placedMaterial(extra.item));
      mesh.position.set(...extra.position);
      mesh.castShadow = true;
      this.placedGroup.add(mesh);
    }

    this.emit('step', { step, index });
  }

  getPrompt(slot) {
    const item = ITEMS[slot.item];
    const held = this.services.inventory.held;

    if (held?.id !== slot.item) return { text: `Precisa de: ${item.name}`, enabled: false };
    if (slot.needsMortar && !this.trough?.portions) return { text: 'Sem argamassa no cocho!', enabled: false };
    return { text: `Assentar ${item.singular} (segure E para continuar)`, enabled: true };
  }

  place(mesh) {
    const { slot } = mesh.userData;
    if (slot.placed) return;

    mesh.updateWorldMatrix(true, false); // atualiza também os "pais" (posição da obra)
    _box.setFromObject(mesh);
    const player = this.services.getPlayerPosition();
    if (slot.solid && CollisionWorld.circleHitsBox(player.x, player.z, PLAYER.radius, _box)) {
      this.services.toast('Saia do lugar do bloco para assentá-lo!');
      return;
    }

    this.services.inventory.take(1);
    if (slot.needsMortar) this.trough.consume();

    slot.placed = true;
    mesh.material = placedMaterial(slot.item, mesh.userData.variant, slot.size);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    delete mesh.userData.interactable;
    this.placedGroup.add(mesh);
    if (slot.solid) this.colliders.push(this.collision.addObject(mesh));
    this.services.effects?.settle(mesh);

    if (this.remainingSlots.length === 0) this.showStep(this.stepIndex + 1);
  }
}
