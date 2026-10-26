import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box } from '../../../utils/meshHelpers.js';

export const PALLET_HEIGHT = 0.14;

/** Palete de madeira — base usada por vários outros objetos */
export function createPallet({ width = 1.2, depth = 1 } = {}) {
  const group = new THREE.Group();
  const wood = Materials.color('#b8986a');
  for (const sz of [-1, 0, 1]) group.add(box(width, 0.1, 0.1, wood, 0, 0, sz * (depth / 2 - 0.05)));
  for (let x = -width / 2 + 0.06; x <= width / 2; x += width / 6) {
    group.add(box(0.1, 0.03, depth, wood, x, 0.1, 0));
  }
  return group;
}
