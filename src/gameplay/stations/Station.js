/**
 * Base de todo objeto com FUNÇÃO na sala (fonte de material, máquina...).
 *
 * Toda estação responde a duas perguntas do InteractionSystem:
 *   getPrompt(hit)      → { text, enabled, bulkText? } | null   o que aparece na mira
 *   interact(hit, bulk) → executa a ação (só é chamado se enabled = true)
 *                         bulk = false → 1 unidade (E) · true → tudo (Shift+E)
 * E pode ter update(delta) para animações/temporizadores.
 *
 * `services` = { inventory, toast(msg), zoneNameAt(x, z), openPlanSelector() }
 */
export class Station {
  constructor(object, services, { kind, name }) {
    this.object = object;
    this.services = services;
    this.inventory = services.inventory;
    this.kind = kind;
    this.name = name;
  }

  /** Nome da área onde a estação está (ex.: "Depósito 1") — usado nas dicas */
  get location() {
    return this.services.zoneNameAt(this.object.position.x, this.object.position.z);
  }

  /** bulkText: o que o Shift+E faz (null = não oferece "tudo de uma vez") */
  static action(text, bulkText = null) {
    return { text, enabled: true, bulkText };
  }

  static info(text) {
    return { text, enabled: false };
  }

  getPrompt() {
    return null;
  }

  interact() {}
}
