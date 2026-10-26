import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { createPallet, PALLET_HEIGHT } from './Pallet.js';
import { attachStock, createStockStack, gridPositions } from './stockStack.js';

const TILE_SIZE = [0.4, 0.018, 0.4];

/** Palete com pisos cerâmicos empilhados (cada piso pego some da pilha) */
export function createTileStack({ layers = 25 } = {}) {
  const group = createPallet();
  const positions = gridPositions({ size: TILE_SIZE, cols: 2, rows: 2, layers, gap: 0.004, baseY: PALLET_HEIGHT });
  const stack = createStockStack(positions, [{
    geometry: new THREE.BoxGeometry(...TILE_SIZE),
    material: Materials.ceramicTile(),
  }]);
  return attachStock(group, stack);
}
