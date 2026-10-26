import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { createRng } from '../../../utils/random.js';
import { createPallet, PALLET_HEIGHT } from './Pallet.js';
import { attachStock, createStockStack, gridPositions } from './stockStack.js';

const BRICK_SIZE = [0.39, 0.19, 0.19];
const TINTS = ['#ffffff', '#f1e2d9', '#ffeadd'];

/** Palete com tijolos cerâmicos INDIVIDUAIS (cada tijolo pego some da pilha) */
export function createBrickPallet({ cols = 3, rows = 5, layers = 6, seed = 1 } = {}) {
  const group = createPallet({ width: 1.3, depth: 1.1 });
  const rng = createRng(seed);
  const positions = gridPositions({ size: BRICK_SIZE, cols, rows, layers, gap: 0.008, baseY: PALLET_HEIGHT });

  const stack = createStockStack(positions, [{
    geometry: new THREE.BoxGeometry(...BRICK_SIZE),
    material: Materials.brickBlock(0, true),
    colors: positions.map(() => TINTS[Math.floor(rng() * TINTS.length)]),
  }]);
  return attachStock(group, stack);
}
