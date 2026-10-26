import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box } from '../../../utils/meshHelpers.js';
import { attachStock, createStockStack, gridPositions } from './stockStack.js';

/** Pilha de telhas de fibrocimento (1,10 × 2,44 m) sobre calços. Cada telha pega some da pilha. */
export function createRoofSheetStack({ sheets = 12 } = {}) {
  const group = new THREE.Group();
  for (const z of [-0.9, 0, 0.9]) group.add(box(1.1, 0.08, 0.1, Materials.wood(), 0, 0, z));

  const size = [1.1, 0.025, 2.44];
  const positions = gridPositions({ size, cols: 1, rows: 1, layers: sheets, gap: 0.002, baseY: 0.08 });
  const stack = createStockStack(positions, [{
    geometry: new THREE.BoxGeometry(...size),
    material: Materials.color('#ffffff', { roughness: 0.7 }),
    colors: positions.map((_, i) => (i % 2 ? '#9ea4a8' : '#8f9599')),
  }]);
  return attachStock(group, stack);
}
