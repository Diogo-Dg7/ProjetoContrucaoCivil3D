import { formatAmount, ITEMS } from '../../config/items.js';
import { Station } from './Station.js';

/**
 * Máquina de corte genérica (cortadora de tijolo, serra de esquadria...).
 * A receita vem de CUTTING_RECIPES em config/items.js.
 *
 * Cada E coloca 1 peça na FILA da máquina (Shift+E coloca todas).
 * A máquina corta uma de cada vez; as peças prontas ficam esperando nela
 * até serem recolhidas (de 1 em 1 com E, ou todas com Shift+E).
 */
export class CutterStation extends Station {
  constructor(object, services, recipe) {
    super(object, services, { kind: 'cutter', name: recipe.machineName });
    this.recipe = recipe;
    this.blade = object.getObjectByName('blade');
    this.queue = 0;   // peças esperando para serem cortadas (incluindo a atual)
    this.timer = 0;
    this.ready = 0;   // peças cortadas esperando para serem retiradas
  }

  get busy() {
    return this.queue > 0;
  }

  /** Para o tutorial: { id, count } das peças prontas, ou null */
  get output() {
    return this.ready > 0 ? { id: this.recipe.output, count: this.ready } : null;
  }

  get readyWord() {
    return this.ready === 1 ? 'pronto' : 'prontos';
  }

  get collectable() {
    return Math.min(this.ready, this.inventory.spaceFor(this.recipe.output));
  }

  get statusText() {
    const parts = [];
    if (this.busy) parts.push(`cortando… ${this.queue} na fila`);
    if (this.ready) parts.push(`${formatAmount(this.recipe.output, this.ready)} ${this.readyWord}`);
    return parts.join(' · ');
  }

  getPrompt() {
    const held = this.inventory.held;
    const { input, output, ratio, verb } = this.recipe;

    if (held?.id === input) {
      return Station.action(
        `${verb}: 1 ${ITEMS[input].singular} → ${formatAmount(output, ratio)}${this.busy ? ` (${this.queue} na fila)` : ''}`,
        held.count > 1 ? `cortar ${formatAmount(input, held.count)}` : null,
      );
    }
    if (this.collectable > 0) {
      return Station.action(
        `Pegar 1 ${ITEMS[output].singular} (${this.ready} ${this.readyWord})`,
        this.collectable > 1 ? `pegar ${formatAmount(output, this.collectable)}` : null,
      );
    }
    if (this.ready > 0) return Station.info(`${this.statusText} — esvazie as mãos (Q) para pegar`);
    if (this.busy) return Station.info(this.statusText);
    return Station.info(`${this.name}: transforma ${ITEMS[input].plural} em ${ITEMS[output].plural}`);
  }

  interact(hit, bulk) {
    const held = this.inventory.held;
    if (held?.id === this.recipe.input) {
      this.queue += this.inventory.take(bulk ? held.count : 1);
      return;
    }
    this.ready -= this.inventory.add(this.recipe.output, bulk ? this.collectable : 1);
  }

  update(delta) {
    if (!this.busy) return;
    this.timer += delta;
    this.blade?.rotateY(delta * 30);
    if (this.timer >= this.recipe.time) {
      this.timer = 0;
      this.queue--;
      this.ready += this.recipe.ratio;
    }
  }
}
