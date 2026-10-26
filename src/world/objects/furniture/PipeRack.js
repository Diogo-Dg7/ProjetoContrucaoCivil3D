import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box, horizontalCylinder } from '../../../utils/meshHelpers.js';
import { createRng, pick } from '../../../utils/random.js';

const PIPE_COLORS = ['#e9e9e4', '#d4d4cd', '#9aa0a6', '#d9682b', '#3f8f4f'];

/**
 * Suporte de parede com canos e perfis metálicos (como na foto do depósito).
 * Comprimento ao longo de X; a parede fica em z = 0 e os braços avançam em +z.
 */
export function createPipeRack({ length = 6, height = 1, levels = 3, depth = 0.5, seed = 7 } = {}) {
  const group = new THREE.Group();
  const metal = Materials.darkMetal();
  const rng = createRng(seed);
  const posts = Math.max(2, Math.round(length / 1.5) + 1);

  for (let i = 0; i < posts; i++) {
    const x = -length / 2 + (i * length) / (posts - 1);
    group.add(box(0.06, height, 0.06, metal, x, 0, 0.03));
    for (let l = 0; l < levels; l++) {
      group.add(box(0.04, 0.04, depth, metal, x, levelY(l, levels, height), depth / 2));
    }
  }

  for (let l = 0; l < levels; l++) {
    const y = levelY(l, levels, height) + 0.04;
    let z = 0.08;
    while (z < depth - 0.05) {
      const radius = 0.02 + rng() * 0.04;
      const pipeLength = length - 0.2 - rng() * 0.8;
      if (l === levels - 1 && rng() > 0.5) {
        group.add(box(pipeLength, 0.05, 0.05, Materials.metal(), 0, y, z + 0.025)); // perfil metálico
      } else {
        group.add(horizontalCylinder(radius, pipeLength, Materials.color(pick(rng, PIPE_COLORS)), 0, y + radius, z + radius, 12));
      }
      z += radius * 2 + 0.03;
    }
  }
  return group;
}

function levelY(level, levels, height) {
  return 0.15 + level * ((height - 0.2) / (levels - 1));
}
