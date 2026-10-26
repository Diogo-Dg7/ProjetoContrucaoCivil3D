import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box } from '../../../utils/meshHelpers.js';
import { attachStock, createStockStack, gridPositions } from './stockStack.js';

/** Pilha de tábuas compridas sobre calços (ao longo de X). Cada tábua pega some da pilha. */
export function createLumberStack({ length = 2.4, layers = 5, perLayer = 4 } = {}) {
  const group = new THREE.Group();
  for (const x of [-length / 2 + 0.3, 0, length / 2 - 0.3]) {
    group.add(box(0.1, 0.08, 0.7, Materials.darkMetal(), x, 0, 0));
  }

  const size = [length, 0.04, 0.14];
  const positions = gridPositions({ size, cols: 1, rows: perLayer, layers, gap: 0.006, baseY: 0.08 });
  const stack = createStockStack(positions, [{
    geometry: new THREE.BoxGeometry(...size),
    material: Materials.color('#ffffff'),
    colors: positions.map((_, i) => (i % 3 === 0 ? '#a8824f' : '#b8915f')),
  }]);
  return attachStock(group, stack);
}
