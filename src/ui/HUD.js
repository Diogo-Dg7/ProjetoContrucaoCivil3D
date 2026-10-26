/** Informações na tela durante a exploração: mira, área atual, ação da mira, item na mão e avisos */
export class HUD {
  constructor(root) {
    this.root = root;
    this.zoneEl = root.querySelector('[data-hud="zone"]');
    this.toastEl = root.querySelector('[data-hud="toast"]');
    this.promptEl = root.querySelector('[data-hud="prompt"]');
    this.heldEl = root.querySelector('[data-hud="held"]');
    this.modeEl = root.querySelector('[data-hud="mode"]');
    this.currentZone = undefined;
    this.currentPrompt = undefined;
    this.toastTimer = null;
  }

  show() {
    this.root.hidden = false;
  }

  hide() {
    this.root.hidden = true;
  }

  /** Só mexe no DOM quando a área muda (evita trabalho a cada frame) */
  setZone(name) {
    if (name === this.currentZone) return;
    this.currentZone = name;
    this.zoneEl.textContent = name ?? '—';
  }

  /** prompt = { text, enabled, hint?, stock?: { count, max, label } } | null */
  setPrompt(prompt) {
    const stock = prompt?.stock;
    const key = prompt ? `${prompt.enabled}:${prompt.text}:${prompt.hint}:${stock?.count}/${stock?.max}` : '';
    if (key === this.currentPrompt) return;
    this.currentPrompt = key;

    this.promptEl.hidden = !prompt;
    if (!prompt) return;
    this.promptEl.classList.toggle('is-disabled', !prompt.enabled);
    this.promptEl.innerHTML = prompt.enabled ? '<kbd>E</kbd> ' : '';
    this.promptEl.append(prompt.text);
    if (stock) this.promptEl.append(renderStock(stock));
    if (prompt.hint) {
      const hint = document.createElement('small');
      hint.textContent = prompt.hint;
      this.promptEl.append(hint);
    }
  }

  /** text = o que está carregando; dropText = o que o Q vai fazer */
  setHeld(text, dropText = '') {
    this.heldEl.hidden = !text;
    this.heldEl.querySelector('strong').textContent = text ?? '';
    this.heldEl.querySelector('[data-hud="drop"]').textContent = dropText;
  }

  /** Painel de ajuda temporário para modos especiais (ex.: posicionar a obra) */
  setMode(text) {
    this.modeEl.hidden = !text;
    this.modeEl.innerHTML = text ?? '';
  }

  toast(message, duration = 1500) {
    this.toastEl.textContent = message;
    this.toastEl.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastEl.hidden = true; }, duration);
  }
}

/** "Estoque: 63 / 90 tijolos" com uma barrinha de nível */
function renderStock({ count, max, label }) {
  const element = document.createElement('div');
  element.className = 'hud__stock';
  const level = count / max;
  element.classList.toggle('is-low', level <= 0.2);
  element.innerHTML = `<span>Estoque: <b>${count}</b> / ${max} ${label}</span><i><em style="width:${Math.round(level * 100)}%"></em></i>`;
  return element;
}
