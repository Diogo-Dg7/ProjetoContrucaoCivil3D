import { ITEMS } from '../config/items.js';
import { generatePlan, summarizeMaterials } from '../gameplay/building/PlanGenerator.js';

/**
 * Janela de escolha de planta. Cada cartão mostra a vista de cima
 * (gerada a partir da própria planta) e a lista de materiais.
 */
export class PlanSelector {
  constructor(root, { plans, onSelect, onCancel, onDismiss }) {
    this.root = root;
    this.plans = plans;
    this.isOpen = false;
    this.warning = root.querySelector('[data-role="warning"]');

    const grid = root.querySelector('[data-role="plans"]');
    grid.innerHTML = plans.map((plan) => renderCard(plan)).join('');
    grid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-plan]');
      if (button) onSelect(plans.find((plan) => plan.id === button.dataset.plan));
    });
    root.querySelector('[data-action="cancel"]').addEventListener('click', onCancel);
    window.addEventListener('keydown', (event) => {
      if (this.isOpen && event.code === 'Escape') onDismiss();
    });
  }

  open(activePlanId) {
    this.isOpen = true;
    this.warning.hidden = !activePlanId;
    for (const card of this.root.querySelectorAll('[data-card]')) {
      card.classList.toggle('is-active', card.dataset.card === activePlanId);
    }
    this.root.hidden = false;
  }

  close() {
    this.isOpen = false;
    this.root.hidden = true;
  }
}

function renderCard(plan) {
  const generated = generatePlan(plan);
  const { counts, mortarBatches } = summarizeMaterials(generated);
  const materials = [];

  if (counts.tijolo) materials.push(`${counts.tijolo} ${ITEMS.tijolo.plural}`);
  if (counts.meioTijolo) {
    materials.push(`${counts.meioTijolo} ${ITEMS.meioTijolo.plural} <small>(cortar ${Math.ceil(counts.meioTijolo / 2)} tijolos)</small>`);
  }
  if (counts.piso) materials.push(`${counts.piso} ${ITEMS.piso.plural}`);
  if (counts.caibro) materials.push(`${counts.caibro} ${ITEMS.caibro.plural} <small>(cortar tábuas)</small>`);
  if (counts.telha) materials.push(`${counts.telha} ${ITEMS.telha.plural}`);
  materials.push(`${mortarBatches} betonada${mortarBatches > 1 ? 's' : ''} de argamassa`);

  return `
    <article class="plan-card" data-card="${plan.id}">
      <div class="plan-card__preview">${renderFootprint(generated)}</div>
      <div class="plan-card__body">
        <span class="plan-card__level">${plan.difficulty}</span>
        <h3>${plan.name}</h3>
        <p>${plan.description}</p>
        <ul class="plan-card__materials">${materials.map((m) => `<li>${m}</li>`).join('')}</ul>
        <p class="plan-card__steps">${generated.steps.length} etapas</p>
        <button class="plan-card__button" data-plan="${plan.id}">Escolher local e construir</button>
      </div>
    </article>`;
}

/** Vista de cima das duas primeiras fiadas (mostra a amarração) */
function renderFootprint({ steps, size: [width, depth] }) {
  const pad = 0.3;
  const rects = steps.slice(0, 2).flatMap((step, row) =>
    step.slots.map(({ item, position: [x, , z], size: [w, , d] }) => {
      const color = item === 'meioTijolo' ? '#ffa726' : row === 0 ? '#c4552e' : '#e0855f';
      return `<rect x="${x - w / 2}" y="${z - d / 2}" width="${w}" height="${d}" fill="${color}" opacity="${row ? 0.55 : 1}"/>`;
    }));
  return `<svg viewBox="${-pad} ${-pad} ${width + pad * 2} ${depth + pad * 2}" role="img" aria-label="Vista de cima">${rects.join('')}</svg>`;
}
