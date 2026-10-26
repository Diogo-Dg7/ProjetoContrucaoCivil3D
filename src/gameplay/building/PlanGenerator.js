import { MORTAR } from '../../config/items.js';

/**
 * Transforma uma planta (config/housePlans.js) em ETAPAS com blocos ("slots").
 *
 * Regras de alvenaria usadas (as mesmas da obra de verdade):
 *  - Juntas desencontradas: cada fiada começa meio tijolo deslocada da anterior.
 *  - Amarração nos cantos: numa fiada as paredes da frente/fundo passam por cima
 *    do canto; na seguinte, são as laterais.
 *  - Nas pontas e nas laterais de portas/janelas entram MEIOS tijolos.
 *  - Acima de cada abertura vai uma verga.
 *
 * Coordenadas locais: x = largura, z = profundidade, origem no canto da obra.
 */

const MODULE = 0.4;               // tijolo + junta
const HALF = MODULE / 2;          // meio tijolo + junta
export const ROW_HEIGHT = 0.2;
export const WALL_THICKNESS = 0.2;
const JOINT = 0.01;
const EPS = 1e-4;

export function generatePlan(plan) {
  const isRoom = plan.shape === 'room';
  const width = isRoom ? plan.width : plan.length;
  const depth = isRoom ? plan.depth : WALL_THICKNESS;
  const walls = isRoom ? roomWalls(width, depth) : straightWall(width);
  const openings = plan.openings ?? [];

  const steps = [];
  for (let row = 0; row < plan.rows; row++) {
    const slots = [];
    const extras = [];
    const y = row * ROW_HEIGHT + ROW_HEIGHT / 2;

    for (const wall of walls) {
      const { span, phase } = wall.courses[row % 2];
      const wallOpenings = openings.filter((o) => o.wall === wall.id);
      const holes = wallOpenings
        .filter((o) => row >= o.fromRow && row < o.toRow)
        .map((o) => [o.offset, o.offset + o.width]);

      for (const [start, end] of subtract(span, holes)) {
        for (const brick of fillCourse(start, end, phase)) slots.push(brickSlot(wall, brick, y));
      }
      for (const o of wallOpenings) if (o.toRow === row && row > 0) extras.push(lintel(wall, o, row));
    }

    steps.push({ title: `${row + 1}ª fiada`, tip: rowTip(row, plan, slots, extras), slots, extras });
  }

  if (plan.floor) steps.push(floorStep(width, depth));
  if (plan.roof) steps.push(...roofSteps(width, depth, plan.rows * ROW_HEIGHT));

  steps.forEach((step, index) => step.slots.forEach((slot) => { slot.step = index; }));
  return { steps, size: [width, depth] };
}

/** Lista de materiais da planta (para a tela de escolha) */
export function summarizeMaterials({ steps }) {
  const counts = {};
  let mortarPortions = 0;
  for (const step of steps) {
    for (const slot of step.slots) {
      counts[slot.item] = (counts[slot.item] ?? 0) + 1;
      if (slot.needsMortar) mortarPortions++;
    }
  }
  return { counts, mortarBatches: Math.ceil(mortarPortions / MORTAR.portionsPerBatch) };
}

// ---------------------------------------------------------------------------

function straightWall(length) {
  return [{
    id: 'front', axis: 'x', fixed: WALL_THICKNESS / 2,
    courses: [{ span: [0, length], phase: 0 }, { span: [0, length], phase: HALF }],
  }];
}

function roomWalls(width, depth) {
  const t = WALL_THICKNESS;
  const xFull = { span: [0, width], phase: 0 };
  const xInner = { span: [t, width - t], phase: t };
  const zFull = { span: [0, depth], phase: 0 };
  const zInner = { span: [t, depth - t], phase: t };
  return [
    { id: 'front', axis: 'x', fixed: depth - t / 2, courses: [xFull, xInner] },
    { id: 'back', axis: 'x', fixed: t / 2, courses: [xFull, xInner] },
    { id: 'left', axis: 'z', fixed: t / 2, courses: [zInner, zFull] },
    { id: 'right', axis: 'z', fixed: width - t / 2, courses: [zInner, zFull] },
  ];
}

/** Intervalo [a, b] menos os buracos (aberturas) */
function subtract([a, b], holes) {
  const pieces = [];
  let cursor = a;
  for (const [h0, h1] of [...holes].sort((p, q) => p[0] - q[0])) {
    if (h0 > cursor + EPS) pieces.push([cursor, Math.min(h0, b)]);
    cursor = Math.max(cursor, h1);
  }
  if (b > cursor + EPS) pieces.push([cursor, b]);
  return pieces;
}

/** Preenche um trecho com tijolos alinhados à "grade" da fiada (phase) */
function fillCourse(start, end, phase) {
  const bricks = [];
  let pos = start;
  const offset = (((pos - phase) % MODULE) + MODULE) % MODULE;
  if (offset > EPS && offset < MODULE - EPS && end - pos >= HALF - EPS) {
    bricks.push({ start: pos, length: HALF });
    pos += HALF;
  }
  while (pos + MODULE <= end + EPS) {
    bricks.push({ start: pos, length: MODULE });
    pos += MODULE;
  }
  if (end - pos >= HALF - EPS) bricks.push({ start: pos, length: HALF });
  return bricks;
}

function alongWall(wall, center, along, y, height) {
  const across = WALL_THICKNESS - JOINT;
  return wall.axis === 'x'
    ? { position: [center, y, wall.fixed], size: [along, height, across] }
    : { position: [wall.fixed, y, center], size: [across, height, along] };
}

function brickSlot(wall, { start, length }, y) {
  return {
    item: length > HALF + EPS ? 'tijolo' : 'meioTijolo',
    ...alongWall(wall, start + length / 2, length - JOINT, y, ROW_HEIGHT - JOINT),
    needsMortar: true,
    solid: true,
  };
}

function lintel(wall, opening, row) {
  const height = 0.06;
  return {
    item: 'verga',
    ...alongWall(wall, opening.offset + opening.width / 2, opening.width, row * ROW_HEIGHT - height / 2, height),
  };
}

function floorStep(width, depth) {
  const t = WALL_THICKNESS;
  const tile = 0.4;
  const slots = [];
  for (let x = t; x + tile <= width - t + EPS; x += tile) {
    for (let z = t; z + tile <= depth - t + EPS; z += tile) {
      slots.push({
        item: 'piso',
        position: [x + tile / 2, 0.012, z + tile / 2],
        size: [tile - JOINT, 0.02, tile - JOINT],
        needsMortar: true,
        solid: false,
      });
    }
  }
  return {
    title: 'Piso',
    tip: 'O piso é assentado com argamassa, de dentro para fora — comece pelo fundo e vá em direção à porta para não pisar no que já foi feito.',
    slots,
    extras: [],
  };
}

function roofSteps(width, depth, top) {
  const rafterCount = Math.max(2, Math.round(width / 0.6) + 1);
  const rafters = Array.from({ length: rafterCount }, (_, i) => ({
    item: 'caibro',
    position: [0.1 + (i * (width - 0.2)) / (rafterCount - 1), top + 0.05, depth / 2],
    size: [0.06, 0.1, depth + 0.3],
    needsMortar: false,
    solid: false,
  }));

  const sheetCount = Math.ceil((width + 0.3) / 1.1);
  const sheetWidth = (width + 0.3) / sheetCount;
  const sheets = Array.from({ length: sheetCount }, (_, i) => ({
    item: 'telha',
    position: [-0.15 + sheetWidth * (i + 0.5), top + 0.1 + 0.0125, depth / 2],
    size: [sheetWidth - 0.01, 0.025, depth + 0.5],
    needsMortar: false,
    solid: false,
  }));

  return [
    {
      title: 'Estrutura do telhado',
      tip: 'Os caibros são as peças de madeira que apoiam as telhas. Corte as tábuas na serra de esquadria (no corredor).',
      slots: rafters,
      extras: [],
    },
    {
      title: 'Telhas',
      tip: 'As telhas de fibrocimento ficam sobre os caibros, sobrando um pouco para fora (beiral) para proteger as paredes da chuva.',
      slots: sheets,
      extras: [],
    },
  ];
}

function rowTip(row, plan, slots, extras) {
  const tips = [];
  if (row === 0) {
    tips.push('A 1ª fiada define o nível e o alinhamento de toda a parede — capriche aqui!');
  } else if (row === 1) {
    tips.push(plan.shape === 'room'
      ? 'Repare nos cantos: as paredes se cruzam fiada sim, fiada não. Essa amarração trava uma parede na outra.'
      : 'As juntas ficam desencontradas (amarração): isso espalha o peso e evita trincas.');
  } else {
    tips.push('Confira o prumo (parede bem na vertical) e o nível de cada fiada.');
  }
  if (slots.some((slot) => slot.item === 'meioTijolo')) {
    tips.push('Os fantasmas laranja são MEIOS tijolos: corte tijolos na cortadora da Área de Máquinas.');
  }
  if (extras.length) {
    tips.push('Uma verga de concreto foi colocada sobre a abertura: ela sustenta os tijolos de cima.');
  }
  return tips.join(' ');
}
