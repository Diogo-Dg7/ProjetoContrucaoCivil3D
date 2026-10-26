import * as THREE from 'three';
import { ITEMS } from '../../config/items.js';
import { Materials } from '../../materials/Materials.js';
import { box, cylinder } from '../../utils/meshHelpers.js';

/**
 * Aparência dos itens: blocos assentados na obra, blocos fantasmas
 * e o modelo que aparece na mão do personagem.
 */

/**
 * Material do item já assentado. `variant` dá uma leve variação de cor;
 * `size` diz para que lado o tijolo está deitado (furos sempre nas pontas).
 */
export function placedMaterial(itemId, variant = 0, size = null) {
  switch (itemId) {
    case 'tijolo':
    case 'meioTijolo':
      return Materials.brickBlock(variant, !size || size[0] >= size[2]);
    case 'piso':
      return Materials.ceramicTile(variant);
    case 'caibro':
    case 'tabua':
      return Materials.wood();
    case 'telha':
      return Materials.color('#9ea4a8', { roughness: 0.7 });
    case 'verga':
      return Materials.color('#9d9d98');
    default:
      return Materials.color('#ff00ff');
  }
}

const ghostCache = new Map();

/** Material translúcido do bloco fantasma (mais claro quando a mira está nele) */
export function ghostMaterial(itemId, hover = false) {
  const key = `${itemId}:${hover}`;
  if (!ghostCache.has(key)) {
    ghostCache.set(key, new THREE.MeshBasicMaterial({
      color: hover ? '#ffffff' : ITEMS[itemId].ghostColor,
      transparent: true,
      opacity: hover ? 0.65 : 0.3,
      depthWrite: false,
    }));
  }
  return ghostCache.get(key);
}

const geometryCache = new Map();

/** BoxGeometry reaproveitada para blocos do mesmo tamanho */
export function boxGeometry([x, y, z]) {
  const key = [x, y, z].map((v) => v.toFixed(3)).join('x');
  if (!geometryCache.has(key)) geometryCache.set(key, new THREE.BoxGeometry(x, y, z));
  return geometryCache.get(key);
}

// ---------------------------------------------------------------------------
// Modelos segurados na mão
// ---------------------------------------------------------------------------

function stack(layers, [w, h, d], material) {
  const group = new THREE.Group();
  for (let i = 0; i < layers; i++) group.add(box(w, h, d, material, (i % 2) * 0.02, i * (h + 0.005), 0));
  return group;
}

function bucket(contentColor) {
  const group = new THREE.Group();
  group.add(cylinder(0.16, 0.13, 0.3, Materials.color('#2b2b2b'), 0, 0, 0));
  group.add(cylinder(0.15, 0.15, 0.02, Materials.color(contentColor, { roughness: 1 }), 0, 0.27, 0));
  return group;
}

function planks(count, [w, h, d]) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) group.add(box(w, h, d, Materials.wood(), 0, i * (h + 0.005), 0));
  return group;
}

const HELD_MODELS = {
  tijolo: (n) => stack(Math.min(4, Math.ceil(n / 6)), [0.39, 0.19, 0.19], placedMaterial('tijolo')),
  meioTijolo: (n) => stack(Math.min(4, Math.ceil(n / 12)), [0.19, 0.19, 0.19], placedMaterial('meioTijolo')),
  piso: (n) => stack(Math.min(8, n), [0.4, 0.02, 0.4], placedMaterial('piso')),
  cimento: () => stack(1, [0.45, 0.13, 0.32], Materials.color('#cfc8b4', { roughness: 1 })),
  areia: () => bucket('#c2a874'),
  argamassa: () => bucket('#8d8a83'),
  tabua: (n) => planks(Math.min(3, n), [0.14, 0.04, 1.2]),
  caibro: (n) => planks(Math.min(3, n), [0.06, 0.1, 1]),
  telha: () => stack(1, [0.7, 0.025, 1], placedMaterial('telha')),
};

export function createHeldModel(itemId, count) {
  const model = HELD_MODELS[itemId]?.(count) ?? stack(1, [0.2, 0.2, 0.2], Materials.color('#ff00ff'));
  model.traverse((child) => { child.castShadow = false; child.receiveShadow = false; });
  return model;
}
