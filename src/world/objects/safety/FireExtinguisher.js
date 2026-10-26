import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box, cylinder } from '../../../utils/meshHelpers.js';

/** Extintor de parede com placa de sinalização. A parede fica em z = 0. */
export function createFireExtinguisher({ mount = 0.9 } = {}) {
  const group = new THREE.Group();
  const red = Materials.color('#c62828', { roughness: 0.4 });

  group.add(cylinder(0.08, 0.08, 0.5, red, 0, mount, 0.1));
  group.add(cylinder(0.03, 0.05, 0.08, Materials.rubber(), 0, mount + 0.5, 0.1));
  group.add(box(0.06, 0.03, 0.12, Materials.rubber(), 0, mount + 0.56, 0.1));
  group.add(box(0.22, 0.32, 0.01, red, 0, mount + 0.8, 0.01));
  group.add(box(0.12, 0.12, 0.012, Materials.color('#ffffff'), 0, mount + 0.92, 0.012));
  return group;
}
