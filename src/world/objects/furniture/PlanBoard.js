import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { TextureFactory } from '../../../materials/TextureFactory.js';
import { box } from '../../../utils/meshHelpers.js';

/** Quadro de Projetos fixado na parede, com uma planta azul (blueprint). A parede fica em z = 0. */
export function createPlanBoard({ width = 1.4, height = 0.95, mountY = 1.1 } = {}) {
  const group = new THREE.Group();
  const frame = Materials.darkMetal();

  group.add(box(width + 0.1, height + 0.1, 0.04, frame, 0, mountY - 0.05, 0.02));

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.02),
    [frame, frame, frame, frame, new THREE.MeshStandardMaterial({ map: TextureFactory.blueprint(), roughness: 0.6 }), frame],
  );
  board.position.set(0, mountY + height / 2, 0.05);
  board.castShadow = true;
  group.add(board);

  // Calha para canetas/marcadores
  group.add(box(width * 0.6, 0.03, 0.08, frame, 0, mountY - 0.08, 0.06));
  return group;
}
