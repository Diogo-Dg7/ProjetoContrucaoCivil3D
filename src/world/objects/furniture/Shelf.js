import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box } from '../../../utils/meshHelpers.js';
import { createRng, pick } from '../../../utils/random.js';

const ITEM_COLORS = ['#c9a878', '#b8915f', '#5b7fa6', '#e7e4dc', '#c0392b', '#3f8f4f', '#f0b400'];

/** Estante metálica com caixas e materiais variados. O fundo fica em z = 0. */
export function createShelf({ width = 2, depth = 0.5, height = 2.1, levels = 4, seed = 1 } = {}) {
  const group = new THREE.Group();
  const frame = Materials.color('#4f6a8a', { metalness: 0.4, roughness: 0.5 });
  const board = Materials.color('#8f9499', { metalness: 0.3, roughness: 0.6 });
  const rng = createRng(seed);
  const cz = depth / 2;

  for (const sx of [-1, 1]) {
    for (const z of [0.03, depth - 0.03]) group.add(box(0.05, height, 0.05, frame, sx * (width / 2 - 0.03), 0, z));
  }

  for (let i = 0; i < levels; i++) {
    const y = 0.1 + i * ((height - 0.2) / (levels - 1));
    group.add(box(width, 0.03, depth, board, 0, y, cz));
    if (i === levels - 1) continue;

    // Caixas sobre a prateleira
    let x = -width / 2 + 0.08;
    while (x < width / 2 - 0.3) {
      const w = 0.2 + rng() * 0.35;
      const h = 0.15 + rng() * 0.3;
      const d = depth * (0.5 + rng() * 0.4);
      if (rng() > 0.2) group.add(box(w, h, d, Materials.color(pick(rng, ITEM_COLORS)), x + w / 2, y + 0.03, cz));
      x += w + 0.05;
    }
  }
  return group;
}
