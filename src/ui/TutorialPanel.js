/** Painel do tutorial (canto direito): planta, etapa, dica didática e próximo passo */
export class TutorialPanel {
  constructor(root) {
    this.root = root;
    this.fields = Object.fromEntries(
      [...root.querySelectorAll('[data-t]')].map((element) => [element.dataset.t, element]),
    );
    this.lastKey = '';
  }

  render(state) {
    const key = JSON.stringify(state);
    if (key === this.lastKey) return;
    this.lastKey = key;

    const hasPlan = Boolean(state.planName);
    this.fields.plan.textContent = state.planName ?? 'Nenhuma planta escolhida';
    this.fields.stepLabel.textContent = state.stepLabel;
    this.fields.stepTitle.textContent = state.stepTitle;
    this.fields.tip.textContent = state.stepTip;
    this.fields.tip.hidden = !state.stepTip;
    this.fields.bar.style.width = `${Math.round(state.progress * 100)}%`;
    this.fields.progress.hidden = !hasPlan;
    this.fields.objective.textContent = state.objective;
    this.fields.status.textContent = state.status;
    this.fields.status.hidden = !state.status;
  }
}
