import * as THREE from 'three';
import { formatAmount, ITEMS, MIXER_RECIPE } from '../../config/items.js';
import { GAMEPLAY } from '../../config/settings.js';

const _box = new THREE.Box3();
const _top = new THREE.Vector3();

/**
 * O "professor" do jogo: olha o estado da obra e do personagem e decide
 * qual é o PRÓXIMO PASSO. Mostra o texto no painel e uma seta amarela
 * flutuando sobre o objeto certo (visível através das paredes).
 */
export class TutorialGuide {
  constructor({ scene, camera, inventory, buildSite, stations, dropped, placement }) {
    this.camera = camera;
    this.inventory = inventory;
    this.site = buildSite;
    this.stations = stations;
    this.dropped = dropped;
    this.placement = placement;
    this.trough = stations.find((s) => s.kind === 'trough');
    this.planBoard = stations.find((s) => s.kind === 'planBoard');

    this.hint = { text: '', target: null };
    this.timer = 0;
    this.time = 0;
    this.markerBaseY = 0;
    this.marker = createMarker();
    scene.add(this.marker);
  }

  /** Retorna true quando a dica foi recalculada (para o painel atualizar) */
  update(delta) {
    this.time += delta;
    this.timer -= delta;
    let changed = false;
    if (this.timer <= 0) {
      this.timer = GAMEPLAY.hintInterval;
      this.hint = this.compute();
      this.placeMarker(this.hint.target);
      changed = true;
    }
    this.marker.position.y = this.markerBaseY + Math.sin(this.time * 3) * 0.12;
    this.marker.rotation.y += delta * 2;
    return changed;
  }

  compute() {
    const site = this.site;
    const held = this.inventory.held;

    if (this.placement.active) {
      return hint('Mire no chão da área verde para posicionar o molde. R gira, E confirma, Q cancela.', this.placement.preview);
    }
    if (!site.isActive) {
      return hint('Vá até o Quadro de Projetos e escolha uma planta (ou aperte P).', this.planBoard);
    }
    if (site.isComplete) return hint('Obra concluída! Aperte P para escolher outra planta.');

    const needed = site.neededItems();
    const troughEmpty = site.needsMortar() && this.trough.portions === 0;

    if (held) {
      if (held.id === 'argamassa') return hint('Despeje a argamassa no cocho da obra.', this.trough);
      if (needed.has(held.id)) {
        if (troughEmpty) return hint('O cocho está sem argamassa! Deixe o que está segurando no chão (Q) e prepare argamassa na betoneira.', this.trough);
        return hint(`Assente os ${ITEMS[held.id].plural} nos blocos fantasmas (mire e segure E).`, site.ghostGroup);
      }
      if (held.id in MIXER_RECIPE.inputs) {
        const mixer = this.nearest(this.stations.filter((s) => s.kind === 'mixer' && s.state === 'idle' && s.missing(held.id) > 0));
        if (mixer) return hint(`Coloque na betoneira (${mixer.location}).`, mixer);
      }
      const cutter = this.stations.find((s) => s.kind === 'cutter' && s.recipe.input === held.id && needed.has(s.recipe.output));
      if (cutter) return hint(`Leve até a ${cutter.name} (${cutter.location}) para cortar.`, cutter);
      return hint(`${formatAmount(held.id, held.count)} não é usado agora. Aperte Q para deixar no chão (ou olhando para o estoque, para devolver).`);
    }

    // Mãos vazias
    if (troughEmpty) return this.mortarHint();

    const cutterReady = this.stations.find((s) => s.kind === 'cutter' && s.output && needed.has(s.output.id));
    if (cutterReady) return hint(`Pegue as peças cortadas na ${cutterReady.name}.`, cutterReady);

    for (const id of needed) {
      const supply = this.supply(id);
      if (supply) return hint(`Pegue ${ITEMS[id].plural} ${where(supply)}.`, supply);

      const cutter = this.stations.find((s) => s.kind === 'cutter' && s.recipe.output === id);
      if (cutter) {
        const input = this.supply(cutter.recipe.input);
        return hint(
          `Precisa de ${ITEMS[id].plural}: pegue ${ITEMS[cutter.recipe.input].plural} ${where(input)} e corte na ${cutter.name} (${cutter.location}).`,
          input,
        );
      }
    }
    return hint('Continue a obra!');
  }

  /** Passo a passo da argamassa: cimento → areia → ligar → pegar → cocho */
  mortarHint() {
    const mixers = this.stations.filter((s) => s.kind === 'mixer');
    const ready = mixers.find((m) => m.state === 'ready');
    if (ready) return hint('A argamassa está pronta! Pegue na betoneira.', ready);

    const mixing = mixers.find((m) => m.state === 'mixing');
    if (mixing) return hint('A betoneira está misturando… aguarde.', mixing);

    const mixer = [...mixers].sort((a, b) => b.loadedAmount - a.loadedAmount)[0];
    for (const [id, need] of Object.entries(MIXER_RECIPE.inputs)) {
      const missing = mixer.missing(id);
      if (missing > 0) {
        const supply = this.supply(id);
        const prefix = id === 'cimento' ? `Prepare argamassa (traço ${MIXER_RECIPE.label}): ` : '';
        return hint(`${prefix}pegue ${formatAmount(id, missing)} ${where(supply)} (${need - missing}/${need} na betoneira).`, supply);
      }
    }
    return hint(`Tudo pronto: ligue a betoneira (${mixer.location}).`, mixer);
  }

  /** De onde pegar um item: primeiro uma pilha largada no chão, senão o estoque mais próximo */
  supply(itemId) {
    return this.dropped.nearest(itemId, this.camera.position) ?? this.nearestSource(itemId);
  }

  /** Estoque mais próximo que ainda tem material (se todos estiverem vazios, o mais próximo) */
  nearestSource(itemId) {
    const sources = this.stations.filter((s) => s.kind === 'source' && s.itemId === itemId);
    return this.nearest(sources.filter((s) => !s.isEmpty)) ?? this.nearest(sources);
  }

  nearest(stations) {
    const position = this.camera.position;
    return stations.reduce((best, station) => {
      const distance = station.object.position.distanceToSquared(position);
      return !best || distance < best.distance ? { station, distance } : best;
    }, null)?.station ?? null;
  }

  placeMarker(target) {
    const object = target?.object ?? target;
    this.marker.visible = Boolean(object);
    if (!object) return;

    _box.setFromObject(object);
    if (_box.isEmpty()) object.getWorldPosition(_top);
    else _box.getCenter(_top).setY(_box.max.y);
    this.marker.position.set(_top.x, 0, _top.z);
    this.markerBaseY = _top.y + 0.6;
  }
}

function where(supply) {
  if (supply.kind === 'pile') return `no chão, onde você deixou (${supply.location})`;
  if (supply.isEmpty) return `em: ${supply.location} — o estoque acabou, a reposição chega em ${Math.ceil(supply.restockTimer)} s`;
  return `em: ${supply.location}`;
}

function hint(text, target = null) {
  return { text, target };
}

function createMarker() {
  const material = new THREE.MeshBasicMaterial({ color: '#ffd400', depthTest: false, transparent: true, opacity: 0.95 });
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 16), material);
  arrow.rotation.x = Math.PI; // ponta para baixo
  arrow.renderOrder = 999;
  const marker = new THREE.Group();
  marker.add(arrow);
  marker.visible = false;
  return marker;
}
