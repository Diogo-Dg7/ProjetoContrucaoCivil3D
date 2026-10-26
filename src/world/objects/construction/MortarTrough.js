import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box } from '../../../utils/meshHelpers.js';

export const TROUGH_INNER_HEIGHT = 0.2;

/**
 * Cocho (masseira) onde fica a argamassa da obra.
 * O filho "mortar" é a massa — a TroughStation sobe/desce conforme o nível.
 */
export function createMortarTrough({ width = 1.1, depth = 0.6 } = {}) {
  const group = new THREE.Group();
  const shell = Materials.color('#3b3f45', { roughness: 0.7 });
  const t = 0.04;
  const h = TROUGH_INNER_HEIGHT + 0.05;

  group.add(box(width, 0.05, depth, shell));
  group.add(box(width, h, t, shell, 0, 0, depth / 2 - t / 2));
  group.add(box(width, h, t, shell, 0, 0, -depth / 2 + t / 2));
  group.add(box(t, h, depth, shell, width / 2 - t / 2, 0, 0));
  group.add(box(t, h, depth, shell, -width / 2 + t / 2, 0, 0));

  const mortar = box(width - 2 * t, 0.02, depth - 2 * t, Materials.color('#8d8a83', { roughness: 1 }), 0, 0.05, 0);
  mortar.name = 'mortar';
  mortar.visible = false;
  group.add(mortar);

  // Colher de pedreiro apoiada na borda
  group.add(box(0.06, 0.01, 0.28, Materials.metal(), width / 2 - 0.15, h, 0));
  return group;
}
