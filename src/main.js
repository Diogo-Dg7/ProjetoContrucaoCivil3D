/**
 * Ponto de entrada: só "liga as peças". A lógica fica em cada módulo.
 *
 *   App (renderer/cena/loop) ─┬─ World    (sala montada a partir do LAYOUT)
 *                             ├─ Player   (câmera 1ª pessoa + colisão)
 *                             ├─ Game     (jogabilidade: obra, máquinas, tutorial)
 *                             └─ UI       (StartScreen, HUD, TutorialPanel, PlanSelector)
 */
import { HOUSE_PLANS } from './config/housePlans.js';
import { LAYOUT } from './config/layout.js';
import { InputManager } from './controls/InputManager.js';
import { Player } from './controls/Player.js';
import { App } from './core/App.js';
import { Game } from './gameplay/Game.js';
import { CollisionWorld } from './physics/CollisionWorld.js';
import { HUD } from './ui/HUD.js';
import { PlanSelector } from './ui/PlanSelector.js';
import { StartScreen } from './ui/StartScreen.js';
import { TutorialPanel } from './ui/TutorialPanel.js';
import { World } from './world/World.js';

const app = new App(document.getElementById('app'));
const collision = new CollisionWorld();

const world = new World(app.scene, collision);
world.build(LAYOUT);

const input = new InputManager();
const player = new Player(app.camera, app.renderer.domElement, input, collision);

const hud = new HUD(document.getElementById('hud'));
const tutorialPanel = new TutorialPanel(document.querySelector('.tutorial'));
const startScreen = new StartScreen(document.getElementById('start-screen'), {
  onEnter: () => player.lock(),
});

const planSelector = new PlanSelector(document.getElementById('plan-selector'), {
  plans: HOUSE_PLANS,
  onSelect: (plan) => {
    planSelector.close();
    game.choosePlan(plan); // abre o molde para escolher o local
    player.lock();
  },
  onCancel: () => {
    planSelector.close();
    player.lock();
  },
  onDismiss: () => {
    planSelector.close();
    startScreen.show('pause');
  },
});

function openPlanSelector() {
  planSelector.open(game.activePlanId);
  player.unlock(); // libera o mouse para clicar nos cartões
}

const game = new Game({
  app,
  world,
  collision,
  input,
  hud,
  tutorialPanel,
  isActive: () => player.isLocked,
  openPlanSelector,
});

player.look.on('lock', () => {
  startScreen.hide();
  hud.show();
});
player.look.on('unlock', () => {
  hud.hide();
  game.interaction.clear();
  if (!planSelector.isOpen) startScreen.show('pause');
});
document.addEventListener('pointerlockerror', () => {
  startScreen.setNote('Não foi possível capturar o mouse. Aguarde um instante e clique novamente.', true);
});

input.onAction('toggleLabels', () => {
  if (!player.isLocked) return;
  const visible = world.zones.toggleLabels();
  hud.toast(visible ? 'Nomes das áreas: visíveis' : 'Nomes das áreas: ocultos');
});
input.onAction('plans', () => {
  if (player.isLocked) openPlanSelector();
});

app.add(player);
app.add(game);
app.add({
  update: () => hud.setZone(world.zones.getZoneAt(app.camera.position.x, app.camera.position.z)?.name),
});

app.start();
startScreen.setReady();
