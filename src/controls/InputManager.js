import { KEY_BINDINGS } from '../config/settings.js';

/**
 * Guarda o estado do teclado e traduz teclas em "ações" (forward, run, ...).
 * O resto do código pergunta pela ação, nunca pela tecla — assim trocar teclas
 * é só editar KEY_BINDINGS em settings.js.
 */
export class InputManager {
  constructor(target = window) {
    this.pressed = new Set();
    this.actionHandlers = new Map();

    target.addEventListener('keydown', (event) => {
      this.pressed.add(event.code);
      if (event.repeat) return;
      for (const [action, handlers] of this.actionHandlers) {
        if (KEY_BINDINGS[action]?.includes(event.code)) handlers.forEach((fn) => fn());
      }
    });
    target.addEventListener('keyup', (event) => this.pressed.delete(event.code));
    window.addEventListener('blur', () => this.reset());
  }

  /** true enquanto alguma tecla da ação estiver pressionada */
  isAction(action) {
    return KEY_BINDINGS[action].some((code) => this.pressed.has(code));
  }

  /** Executa `handler` uma vez a cada vez que a ação é acionada */
  onAction(action, handler) {
    if (!this.actionHandlers.has(action)) this.actionHandlers.set(action, []);
    this.actionHandlers.get(action).push(handler);
  }

  reset() {
    this.pressed.clear();
  }
}
