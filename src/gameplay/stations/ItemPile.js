import * as THREE from 'three';
import { formatAmount, ITEMS } from '../../config/items.js';
import { createHeldModel } from '../items/itemVisuals.js';
import { Station } from './Station.js';

/** Pilha de itens largada no chão (tecla Q). Pega de volta com E. */
export class ItemPile extends Station {
  constructor(services, itemId, count, position, onEmpty) {
    const object = new THREE.Group();
    object.position.copy(position);
    super(object, services, { kind: 'pile', name: 'Pilha no chão' });
    this.itemId = itemId;
    this.count = count;
    this.onEmpty = onEmpty;
    object.userData.interactable = this;
    this.refresh();
  }

  add(count) {
    this.count += count;
    this.refresh();
  }

  refresh() {
    this.object.clear();
    const model = createHeldModel(this.itemId, this.count);
    model.traverse((child) => { child.castShadow = true; });
    this.object.add(model);
  }

  get collectable() {
    return Math.min(this.count, this.inventory.spaceFor(this.itemId));
  }

  getPrompt() {
    if (this.collectable > 0) {
      return Station.action(
        `Pegar 1 ${ITEMS[this.itemId].singular} do chão (${this.count} aqui)`,
        this.collectable > 1 ? `pegar ${formatAmount(this.itemId, this.collectable)}` : null,
      );
    }
    return Station.info(`${formatAmount(this.itemId, this.count)} no chão — mãos ocupadas`);
  }

  interact(hit, bulk) {
    this.count -= this.inventory.add(this.itemId, bulk ? this.collectable : 1);
    if (this.count > 0) this.refresh();
    else this.onEmpty(this);
  }
}
