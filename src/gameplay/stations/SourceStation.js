import { formatAmount, ITEMS, STOCK } from '../../config/items.js';
import { Station } from './Station.js';

/**
 * Estoque de um material (palete de tijolos, monte de areia...).
 * A quantidade é limitada pelo visual do objeto (object.userData.stock.max):
 * cada item pego some da pilha. Quando acaba, chega reposição depois de
 * STOCK.restockTime segundos. Itens devolvidos (Q) voltam para a pilha.
 */
export class SourceStation extends Station {
  constructor(object, services, itemId) {
    const item = ITEMS[itemId];
    super(object, services, { kind: 'source', name: `Estoque de ${item.plural}` });
    this.itemId = itemId;
    this.item = item;
    this.stock = object.userData.stock ?? null; // visual da pilha (null = estoque infinito)
    this.max = this.stock?.max ?? Infinity;
    this.count = this.max;
    this.restockTimer = 0;
  }

  get isEmpty() {
    return this.count === 0;
  }

  /** Quanto ainda cabe de volta na pilha */
  get room() {
    return this.max - this.count;
  }

  getPrompt() {
    const held = this.inventory.held;
    const space = this.inventory.spaceFor(this.itemId);
    const stock = Number.isFinite(this.max) ? { count: this.count, max: this.max, label: this.item.plural } : null;
    const withStock = (prompt) => ({ ...prompt, stock });

    if (this.isEmpty) {
      return withStock(Station.info(`Estoque vazio — chega mais material em ${Math.ceil(this.restockTimer)} s`));
    }
    if (held && held.id !== this.itemId) return withStock(Station.info('Mãos ocupadas — aperte Q para deixar no chão'));
    if (space === 0) return withStock(Station.info(`Mãos cheias (máximo: ${formatAmount(this.itemId, this.item.capacity)})`));

    const bulkAmount = Math.min(space, this.count);
    return withStock(Station.action(
      `Pegar 1 ${this.item.singular}`,
      bulkAmount > 1 ? `pegar ${formatAmount(this.itemId, bulkAmount)}` : null,
    ));
  }

  interact(hit, bulk) {
    const wanted = bulk ? this.inventory.spaceFor(this.itemId) : 1;
    const from = this.stock?.worldPosition(this.count - 1);
    const taken = this.inventory.add(this.itemId, Math.min(wanted, this.count));
    if (taken === 0) return;

    this.count -= taken;
    this.refresh();
    if (from) this.services.effects.flyToHand(this.itemId, from);
    if (this.isEmpty) this.restockTimer = STOCK.restockTime;
  }

  /** Devolve itens para a pilha. Retorna quantos couberam. */
  giveBack(amount) {
    const accepted = Math.min(amount, this.room);
    if (accepted === 0) return 0;
    if (this.stock) this.services.effects.flyFromHand(this.itemId, this.stock.worldPosition(this.count));
    this.count += accepted;
    this.refresh();
    return accepted;
  }

  refresh() {
    this.stock?.show(this.count);
  }

  update(delta) {
    if (!this.isEmpty) return;
    this.restockTimer -= delta;
    if (this.restockTimer <= 0) {
      this.count = this.max;
      this.refresh();
      this.services.toast(`Chegou material: ${this.item.plural} repostos (${this.location})`);
    }
  }
}
