import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box, horizontalCylinder } from '../../../utils/meshHelpers.js';

/** Cortadora de piso (laranja) sobre cavalete */
export function createTileSaw() {
  const group = new THREE.Group();
  const orange = Materials.machineOrange();

  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    group.add(box(0.05, 0.75, 0.05, Materials.darkMetal(), sx * 0.5, 0, sz * 0.22));
  }
  group.add(box(1.15, 0.12, 0.55, orange, 0, 0.75, 0));
  group.add(box(1.05, 0.04, 0.45, Materials.metal(), 0, 0.87, 0));
  group.add(box(0.08, 0.5, 0.08, orange, 0, 0.87, -0.22));
  group.add(box(0.35, 0.2, 0.25, orange, 0.12, 1.3, -0.12));
  const blade = horizontalCylinder(0.18, 0.02, Materials.metal(), -0.08, 1.2, -0.12, 24);
  blade.name = 'blade'; // girado pela CutterStation
  group.add(blade);
  return group;
}
