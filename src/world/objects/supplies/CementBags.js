import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { createPallet, PALLET_HEIGHT } from './Pallet.js';
import { attachStock, createStockStack } from './stockStack.js';

const BAG = [0.55, 0.12, 0.4];

/** Palete com sacos de cimento (camadas cruzadas, como na obra) */
export function createCementBags({ layers = 5 } = {}) {
  const group = createPallet();
  const positions = [];
  for (let layer = 0; layer < layers; layer++) {
    const y = PALLET_HEIGHT + layer * 0.125 + BAG[1] / 2;
    const crossed = layer % 2 === 1; // amarração: cada camada vira 90°
    for (const offset of [-1, 1]) {
      positions.push(crossed
        ? { x: offset * 0.3, y, z: 0, rotationY: Math.PI / 2 }
        : { x: 0, y, z: offset * 0.22, rotationY: 0 });
    }
  }

  const stack = createStockStack(positions, [
    { geometry: new THREE.BoxGeometry(...BAG), material: Materials.color('#cfc8b4', { roughness: 1 }) },
    { geometry: new THREE.BoxGeometry(0.12, BAG[1] + 0.002, BAG[2] + 0.002).translate(-0.15, 0, 0), material: Materials.color('#2f5fb3') },
  ]);
  return attachStock(group, stack);
}
