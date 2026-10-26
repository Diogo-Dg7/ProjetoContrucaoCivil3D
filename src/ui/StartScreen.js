/**
 * Tela inicial (explica o projeto e os controles) que também vira a tela de pausa.
 * O conteúdo de texto fica no index.html — aqui só controlamos o comportamento.
 */
export class StartScreen {
  constructor(root, { onEnter }) {
    this.root = root;
    this.button = root.querySelector('[data-action="enter"]');
    this.note = root.querySelector('[data-role="note"]');
    this.defaultNote = this.note.textContent;
    this.button.addEventListener('click', onEnter);
  }

  setReady() {
    this.button.disabled = false;
    this.button.textContent = 'Entrar na sala';
  }

  show(mode = 'start') {
    this.root.dataset.mode = mode;
    this.button.textContent = mode === 'pause' ? 'Continuar' : 'Entrar na sala';
    this.root.hidden = false;
  }

  hide() {
    this.root.hidden = true;
    this.setNote(this.defaultNote);
  }

  setNote(text, isError = false) {
    this.note.textContent = text;
    this.note.classList.toggle('is-error', isError);
  }
}
