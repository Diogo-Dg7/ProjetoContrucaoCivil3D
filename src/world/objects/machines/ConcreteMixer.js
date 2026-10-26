import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { box, cylinder, horizontalCylinder } from '../../../utils/meshHelpers.js';

/** Betoneira amarela com tambor inclinado, rodas e volante */
export function createConcreteMixer() {
  const group = new THREE.Group();
  const yellow = Materials.machineYellow();
  const black = Materials.rubber();

  // Chassi
  for (const sx of [-1, 1]) group.add(box(0.08, 1, 0.08, yellow, sx * 0.5, 0, -0.3));
  group.add(box(1.1, 0.08, 0.08, yellow, 0, 0.92, -0.3));
  group.add(box(1.1, 0.08, 0.08, yellow, 0, 0.3, 0.35));
  group.add(horizontalCylinder(0.03, 1.2, Materials.metal(), 0, 0.22, 0.35));
  for (const sx of [-1, 1]) group.add(horizontalCylinder(0.22, 0.1, black, sx * 0.62, 0.22, 0.35));
  group.add(box(0.3, 0.25, 0.3, Materials.color('#c99600'), -0.42, 0.45, 0)); // motor

  // Tambor
  const drum = new THREE.Group();
  drum.name = 'drum'; // girado pela MixerStation
  drum.add(cylinder(0.5, 0.36, 0.35, yellow, 0, -0.35, 0));
  drum.add(cylinder(0.3, 0.5, 0.42, yellow, 0, 0, 0));
  drum.add(cylinder(0.25, 0.25, 0.05, black, 0, 0.42, 0));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 32), black);
  ring.rotation.x = Math.PI / 2;
  drum.add(ring);
  drum.position.set(0, 1.05, 0);
  drum.rotation.x = 0.5;
  group.add(drum);

  // Volante
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 24), yellow);
  wheel.rotation.y = Math.PI / 2;
  wheel.position.set(0.68, 0.95, -0.1);
  wheel.castShadow = true;
  group.add(wheel, horizontalCylinder(0.03, 0.2, yellow, 0.58, 0.95, -0.1));

  return group;
}
