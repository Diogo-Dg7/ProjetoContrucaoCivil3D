import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box, horizontalCylinder } from '../../../utils/meshHelpers.js';

/** Serra de esquadria (amarela) no suporte com rodinhas */
export function createMiterSaw() {
  const group = new THREE.Group();
  const yellow = Materials.machineYellow();

  for (const sx of [-1, 1]) {
    group.add(box(0.05, 0.8, 0.05, yellow, sx * 0.35, 0, 0.15));
    group.add(box(0.05, 0.8, 0.05, yellow, sx * 0.35, 0, -0.15));
    group.add(horizontalCylinder(0.09, 0.05, Materials.rubber(), sx * 0.42, 0.09, 0.2));
  }
  group.add(box(1.4, 0.05, 0.08, Materials.darkMetal(), 0, 0.8, -0.12));
  group.add(box(1.4, 0.05, 0.08, Materials.darkMetal(), 0, 0.8, 0.12));

  group.add(box(0.55, 0.08, 0.45, Materials.metal(), 0, 0.85, 0));
  group.add(box(0.08, 0.3, 0.08, Materials.darkMetal(), 0, 0.93, -0.18));
  group.add(box(0.3, 0.18, 0.2, yellow, 0, 1.15, -0.05));
  const blade = horizontalCylinder(0.16, 0.02, Materials.metal(), 0, 1.1, 0.05, 24);
  blade.name = 'blade'; // girado pela CutterStation
  group.add(blade);
  return group;
}
