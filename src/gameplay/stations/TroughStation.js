import { MORTAR } from '../../config/items.js';
import { TROUGH_INNER_HEIGHT } from '../../world/objects/construction/MortarTrough.js';
import { Station } from './Station.js';

/** Cocho da obra: guarda as porções de argamassa usadas para assentar blocos */
export class TroughStation extends Station {
  constructor(object, services) {
    super(object, services, { kind: 'trough', name: 'Cocho de argamassa' });
    this.portions = 0;
    this.mortar = object.getObjectByName('mortar');
    this.baseY = this.mortar?.position.y ?? 0;
  }

  getPrompt() {
    const status = `${this.portions}/${MORTAR.troughCapacity} porções`;
    if (this.inventory.held?.id === 'argamassa') {
      return this.portions < MORTAR.troughCapacity
        ? Station.action(`Despejar argamassa no cocho (${status})`)
        : Station.info('Cocho cheio');
    }
    return Station.info(`Cocho de argamassa: ${status}`);
  }

  interact() {
    this.inventory.take(1);
    this.portions = Math.min(MORTAR.troughCapacity, this.portions + MORTAR.portionsPerBatch);
    this.refresh();
  }

  /** Gasta 1 porção. Retorna false se o cocho estiver vazio. */
  consume() {
    if (this.portions <= 0) return false;
    this.portions--;
    this.refresh();
    return true;
  }

  reset() {
    this.portions = 0;
    this.refresh();
  }

  refresh() {
    if (!this.mortar) return;
    this.mortar.visible = this.portions > 0;
    this.mortar.position.y = this.baseY + (this.portions / MORTAR.troughCapacity) * (TROUGH_INNER_HEIGHT - 0.02);
  }
}
