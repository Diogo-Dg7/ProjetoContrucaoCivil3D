import * as THREE from 'three';
import { formatAmount } from '../config/items.js';
import { LAYOUT } from '../config/layout.js';
import { BuildSite } from './building/BuildSite.js';
import { PlacementMode } from './building/PlacementMode.js';
import { DroppedItems } from './DroppedItems.js';
import { HeldItemView } from './HeldItemView.js';
import { InteractionSystem } from './InteractionSystem.js';
import { ItemEffects } from './ItemEffects.js';
import { Inventory } from './Inventory.js';
import { createStations } from './stations/index.js';
import { TutorialGuide } from './tutorial/TutorialGuide.js';
import { HoldRepeater } from '../utils/HoldRepeater.js';

const DROP_DISTANCE = 1; // a pilha cai a ~1 m na frente do personagem
const _forward = new THREE.Vector3();
const _origin = new THREE.Vector3();

/**
 * Camada de JOGABILIDADE: dá função aos objetos do World.
 *   Inventory (mãos) · Stations (máquinas/estoques) · BuildSite (obra) · DroppedItems (pilhas no chão)
 *   PlacementMode (escolher onde construir) · InteractionSystem (mira + E) · TutorialGuide (próximo passo)
 */
export class Game {
  constructor({ app, world, collision, input, hud, tutorialPanel, isActive, openPlanSelector }) {
    this.camera = app.camera;
    this.hud = hud;
    this.tutorialPanel = tutorialPanel;
    this.isActive = isActive;
    this.input = input;
    this.inventory = new Inventory();
    this.dropRepeater = new HoldRepeater();
    this.effects = new ItemEffects(app.scene, this.camera);

    const services = {
      inventory: this.inventory,
      toast: (message) => hud.toast(message, 2500),
      zoneNameAt: (x, z) => world.zones.getZoneAt(x, z)?.name ?? 'sala',
      getPlayerPosition: () => this.camera.position,
      effects: this.effects,
      openPlanSelector,
    };

    this.stations = createStations(world.objects, services);
    this.trough = this.stations.find((s) => s.kind === 'trough');

    this.buildSite = new BuildSite({ collision, services, trough: this.trough });
    app.scene.add(this.buildSite.root);
    this.dropped = new DroppedItems(app.scene, services);
    this.dropBlockers = [world.structure, this.buildSite.placedGroup];
    this.dropRay = new THREE.Raycaster();

    this.placement = new PlacementMode({
      scene: app.scene,
      camera: this.camera,
      area: LAYOUT.buildSite.area,
      collision,
      buildSite: this.buildSite,
      dropped: this.dropped,
    });

    this.interaction = new InteractionSystem({
      camera: this.camera,
      input,
      hud,
      scene: app.scene,
      targets: [...this.stations.map((s) => s.object), this.buildSite.ghostGroup, this.dropped.group],
      occluders: [world.structure, this.buildSite.placedGroup],
    });
    this.heldView = new HeldItemView(app.overlayScene, this.camera, this.inventory);
    this.guide = new TutorialGuide({
      scene: app.scene,
      camera: this.camera,
      inventory: this.inventory,
      buildSite: this.buildSite,
      stations: this.stations,
      dropped: this.dropped,
      placement: this.placement,
    });

    // Teclas: durante o posicionamento da obra, E/Q/R mudam de função
    input.onAction('interact', () => {
      if (!this.isActive()) return;
      if (this.placement.active) this.confirmPlacement();
      else this.interaction.onPress();
    });
    input.onAction('drop', () => {
      if (!this.isActive()) return;
      if (this.placement.active) {
        this.cancelPlacement();
        return;
      }
      this.drop(input.isAction('bulk'));
      this.dropRepeater.press();
    });
    input.onAction('rotate', () => this.isActive() && this.placement.active && this.placement.rotate());

    this.inventory.on('change', () => this.refreshHeld());
    this.buildSite.on('step', ({ step, index }) => {
      if (index > 0) hud.toast(`Etapa concluída! Agora: ${step.title}`, 3000);
    });
    this.buildSite.on('complete', (plan) => hud.toast(`🎉 ${plan.name} concluída! Parabéns!`, 5000));
  }

  get activePlanId() {
    return this.buildSite.plan?.id ?? null;
  }

  // ---------- Escolha da planta e do local ----------

  /** Chamado pelo seletor de plantas: começa o modo de escolher o local */
  choosePlan(plan) {
    this.interaction.clear();
    this.placement.start(plan);
    this.hud.setMode(
      `Escolha onde construir a <b>${plan.name}</b>: mire no chão da área verde · `
      + '<kbd>E</kbd> construir aqui · <kbd>R</kbd> girar · <kbd>Q</kbd> cancelar',
    );
  }

  confirmPlacement() {
    const choice = this.placement.confirm();
    if (!choice) {
      this.hud.toast(this.placement.reason, 2500);
      return;
    }
    this.buildSite.setPlan(choice.plan, choice);
    this.trough.reset();
    this.placement.stop();
    this.hud.setMode(null);
    this.hud.toast(`Obra marcada! Começando: ${choice.plan.name}`, 2500);
  }

  cancelPlacement() {
    this.placement.stop();
    this.hud.setMode(null);
    this.hud.toast('Escolha de local cancelada');
  }

  // ---------- Largar (Q) ----------

  refreshHeld() {
    const held = this.inventory.held;
    if (!held) {
      this.hud.setHeld(null);
      return;
    }
    const dropText = held.count > 1 ? 'Q deixa 1 no chão · segure Q: vários · Shift+Q: tudo' : 'Q deixa no chão';
    this.hud.setHeld(formatAmount(held.id, held.count), dropText);
  }

  /**
   * Q: deixa 1 unidade no chão (bulk = Shift+Q → tudo).
   * Olhando para o estoque do mesmo item, devolve ao estoque em vez de largar.
   */
  drop(bulk = false) {
    const held = this.inventory.held;
    if (!held) return;
    const id = held.id;
    const wanted = bulk ? held.count : 1;
    const target = this.interaction.current?.interactable;

    // Olhando para o estoque do mesmo item (e ainda tem lugar nele): devolve
    if (target?.kind === 'source' && target.itemId === id && target.room > 0) {
      const returned = target.giveBack(Math.min(wanted, held.count));
      this.inventory.take(returned);
      this.hud.toast(`Devolveu ${formatAmount(id, returned)} ao estoque · ${this.inventory.held?.count ?? 0} na mão`);
      return;
    }
    const count = this.inventory.take(wanted);
    const position = this.dropPosition();
    const pile = this.dropped.drop(id, count, position);
    this.effects.flyFromHand(id, position);
    this.hud.toast(`${formatAmount(id, pile.count)} no chão · ${this.inventory.held?.count ?? 0} na mão`);
  }

  /** Ponto no chão à frente do personagem, sem atravessar paredes */
  dropPosition() {
    this.camera.getWorldDirection(_forward).setY(0).normalize();
    _origin.copy(this.camera.position).setY(0.5);
    this.dropRay.set(_origin, _forward);
    this.dropRay.far = DROP_DISTANCE + 0.4;
    const [hit] = this.dropRay.intersectObjects(this.dropBlockers, true);
    const distance = hit ? Math.max(0.2, hit.distance - 0.4) : DROP_DISTANCE;
    return _origin.addScaledVector(_forward, distance).setY(0).clone();
  }

  // ---------- Loop ----------

  update(delta) {
    this.heldView.update(delta);
    this.effects.update(delta);
    if (!this.isActive()) return;

    for (const station of this.stations) station.update?.(delta);
    if (!this.placement.active && this.dropRepeater.tick(delta, this.input.isAction('drop'))) this.drop(false);
    if (this.placement.active) {
      this.placement.update();
      this.hud.setPrompt(this.placement.valid
        ? { text: 'Construir aqui', enabled: true, hint: 'R gira · Q cancela' }
        : { text: this.placement.reason, enabled: false, hint: 'R gira · Q cancela' });
    } else {
      this.interaction.update(delta);
    }
    if (this.guide.update(delta)) this.tutorialPanel.render(this.panelState());
  }

  panelState() {
    const site = this.buildSite;
    const step = site.currentStep;
    const status = site.isActive ? `Cocho: ${this.trough.portions} porções de argamassa` : '';

    if (this.placement.active) {
      return {
        planName: this.placement.plan.name,
        stepLabel: '',
        stepTitle: 'Escolhendo o local',
        stepTip: 'O molde mostra a 1ª fiada. A obra precisa ficar dentro da área verde, deixando espaço para passar em volta.',
        progress: 0,
        objective: this.guide.hint.text,
        status,
      };
    }
    return {
      planName: site.plan?.name ?? null,
      stepLabel: site.isActive ? `Etapa ${Math.min(site.stepIndex + 1, site.steps.length)} de ${site.steps.length}` : '',
      stepTitle: site.isComplete ? 'Obra concluída! 🎉' : step?.title ?? '',
      stepTip: step?.tip ?? '',
      progress: site.progress,
      objective: this.guide.hint.text,
      status,
    };
  }
}
