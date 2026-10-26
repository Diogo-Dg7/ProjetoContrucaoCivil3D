import { ITEMS } from '../config/items.js';
import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * O que o personagem está carregando. Regra simples (e realista):
 * só UM tipo de item por vez, até a capacidade dele (ITEMS[id].capacity).
 * Evento: 'change' → (held | null)
 */
export class Inventory extends EventEmitter {
  constructor() {
    super();
    this.held = null; // { id, count }
  }

  get isEmpty() {
    return this.held === null;
  }

  /** Quantos itens `id` ainda cabem nas mãos */
  spaceFor(id) {
    if (this.held && this.held.id !== id) return 0;
    return ITEMS[id].capacity - (this.held?.count ?? 0);
  }

  /** Adiciona o que couber. Retorna quanto foi adicionado. */
  add(id, amount) {
    const added = Math.min(amount, this.spaceFor(id));
    if (added <= 0) return 0;
    this.held = { id, count: (this.held?.count ?? 0) + added };
    this.emit('change', this.held);
    return added;
  }

  /** Remove `amount` do item segurado. Retorna quanto foi removido. */
  take(amount = 1) {
    if (!this.held) return 0;
    const taken = Math.min(amount, this.held.count);
    this.held.count -= taken;
    if (this.held.count === 0) this.held = null;
    this.emit('change', this.held);
    return taken;
  }

  clear() {
    this.held = null;
    this.emit('change', null);
  }
}
