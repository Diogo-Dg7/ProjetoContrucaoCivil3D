import * as THREE from 'three';
import { ItemPile } from './stations/ItemPile.js';

const MERGE_DISTANCE = 0.9; // largar perto de uma pilha igual junta as duas

/** Guarda as pilhas de itens largadas no chão, para nada sumir (ex.: meios tijolos já cortados) */
export class DroppedItems {
  constructor(scene, services) {
    this.services = services;
    this.group = new THREE.Group();
    this.group.name = 'DroppedItems';
    scene.add(this.group);
    this.piles = [];
  }

  drop(itemId, count, position) {
    const near = this.piles.find((pile) => pile.itemId === itemId && pile.object.position.distanceTo(position) < MERGE_DISTANCE);
    if (near) {
      near.add(count);
      return near;
    }
    const pile = new ItemPile(this.services, itemId, count, position, (empty) => this.remove(empty));
    this.group.add(pile.object);
    this.piles.push(pile);
    return pile;
  }

  remove(pile) {
    this.group.remove(pile.object);
    this.piles = this.piles.filter((other) => other !== pile);
  }

  /** Pilha mais próxima de um item (usada pelo tutorial) */
  nearest(itemId, from) {
    let best = null;
    let bestDistance = Infinity;
    for (const pile of this.piles) {
      if (pile.itemId !== itemId) continue;
      const distance = pile.object.position.distanceToSquared(from);
      if (distance < bestDistance) {
        best = pile;
        bestDistance = distance;
      }
    }
    return best;
  }
}
