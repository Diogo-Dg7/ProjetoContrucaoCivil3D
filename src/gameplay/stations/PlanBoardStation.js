import { Station } from './Station.js';

/** Quadro de Projetos: abre a tela de escolha de plantas */
export class PlanBoardStation extends Station {
  constructor(object, services) {
    super(object, services, { kind: 'planBoard', name: 'Quadro de Projetos' });
  }

  getPrompt() {
    return Station.action('Ver as plantas de casas');
  }

  interact() {
    this.services.openPlanSelector();
  }
}
