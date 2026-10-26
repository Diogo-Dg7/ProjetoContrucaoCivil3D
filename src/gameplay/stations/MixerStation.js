import { formatAmount, ITEMS, MIXER_RECIPE } from '../../config/items.js';
import { Station } from './Station.js';

/**
 * Betoneira: recebe cimento + areia (MIXER_RECIPE), mistura por alguns
 * segundos e entrega argamassa.  Estados: 'idle' → 'mixing' → 'ready'
 */
export class MixerStation extends Station {
  constructor(object, services) {
    super(object, services, { kind: 'mixer', name: 'Betoneira' });
    this.drum = object.getObjectByName('drum');
    this.state = 'idle';
    this.timer = 0;
    this.contents = Object.fromEntries(Object.keys(MIXER_RECIPE.inputs).map((id) => [id, 0]));
  }

  missing(id) {
    return MIXER_RECIPE.inputs[id] - this.contents[id];
  }

  get isLoaded() {
    return Object.keys(this.contents).every((id) => this.missing(id) === 0);
  }

  /** Quanto já foi colocado (usado pelo tutorial para escolher a betoneira "em andamento") */
  get loadedAmount() {
    return Object.values(this.contents).reduce((sum, value) => sum + value, 0);
  }

  get contentsLabel() {
    return Object.entries(MIXER_RECIPE.inputs)
      .map(([id, need]) => `${id} ${this.contents[id]}/${need}`)
      .join(' · ');
  }

  /** Quanto do item segurado ainda pode entrar na betoneira */
  insertable() {
    const held = this.inventory.held;
    if (this.state !== 'idle' || !held || !(held.id in this.contents)) return 0;
    return Math.min(held.count, this.missing(held.id));
  }

  getPrompt() {
    const held = this.inventory.held;

    if (this.state === 'mixing') {
      return Station.info(`Misturando… ${Math.round((this.timer / MIXER_RECIPE.time) * 100)}%`);
    }
    if (this.state === 'ready') {
      return held ? Station.info('Argamassa pronta — esvazie as mãos (Q) para pegar') : Station.action('Pegar a argamassa pronta');
    }
    if (held && held.id in this.contents) {
      const need = this.missing(held.id);
      return need > 0
        ? Station.action(
          `Colocar 1 ${ITEMS[held.id].singular} na betoneira (${this.contents[held.id]}/${MIXER_RECIPE.inputs[held.id]})`,
          this.insertable() > 1 ? `colocar ${formatAmount(held.id, this.insertable())}` : null,
        )
        : Station.info(`A betoneira já tem ${ITEMS[held.id].plural} suficiente`);
    }
    if (this.isLoaded) return Station.action(`Ligar a betoneira (traço ${MIXER_RECIPE.label})`);
    return Station.info(`Betoneira — ${this.contentsLabel}`);
  }

  interact(hit, bulk) {
    const held = this.inventory.held;

    if (this.state === 'ready') {
      this.inventory.add(MIXER_RECIPE.output, 1);
      this.state = 'idle';
      return;
    }
    if (held && held.id in this.contents) {
      this.contents[held.id] += this.inventory.take(bulk ? this.insertable() : 1);
      return;
    }
    if (this.isLoaded) {
      this.state = 'mixing';
      this.timer = 0;
      for (const id of Object.keys(this.contents)) this.contents[id] = 0;
    }
  }

  update(delta) {
    if (this.state === 'mixing') {
      this.timer += delta;
      this.drum?.rotateY(delta * 5);
      if (this.timer >= MIXER_RECIPE.time) {
        this.state = 'ready';
        this.services.toast('A argamassa ficou pronta na betoneira!');
      }
    }
  }
}
