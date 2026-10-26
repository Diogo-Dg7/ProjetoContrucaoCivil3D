import * as THREE from 'three';
import { Materials } from '../materials/Materials.js';
import { box, floorLine, scaleUV } from '../utils/meshHelpers.js';
import { buildWall } from '../utils/wallBuilder.js';

/**
 * Constrói a "casca" da sala a partir do layout: piso, teto, paredes,
 * pilares e faixas no chão.
 * Retorna { group, colliders } — colliders são as peças que bloqueiam o personagem.
 */
export function buildStructure(layout) {
  const group = new THREE.Group();
  group.name = 'Structure';
  const colliders = [];

  for (const [x1, z1, x2, z2] of layout.areas) {
    group.add(createSurface(x1, z1, x2, z2, 0, Materials.floor(), -Math.PI / 2));
    group.add(createSurface(x1, z1, x2, z2, layout.height, Materials.ceiling(), Math.PI / 2));
  }

  for (const wall of layout.walls) {
    const pieces = buildWall({
      ...wall,
      height: wall.height ?? layout.height,
      thickness: layout.wallThickness,
      material: Materials.bricks(),
      glassMaterial: Materials.glass(),
      extend: layout.wallThickness / 2,
    });
    group.add(...pieces);
    colliders.push(...pieces);
  }

  for (const [x, z] of layout.pillars) {
    const pillar = box(0.45, layout.height, 0.45, Materials.concrete(), x, 0, z);
    scaleUV(pillar.geometry, 0.15, layout.height / 3);
    group.add(pillar);
    colliders.push(pillar);
  }

  for (const line of layout.floorLines ?? []) {
    group.add(floorLine(line.from, line.to, line.color, line.width));
  }

  return { group, colliders };
}

function createSurface(x1, z1, x2, z2, y, material, rotationX) {
  const width = x2 - x1;
  const depth = z2 - z1;
  const [tileU, tileV] = material.userData.tile;
  const mesh = new THREE.Mesh(scaleUV(new THREE.PlaneGeometry(width, depth), width / tileU, depth / tileV), material);
  mesh.rotation.x = rotationX;
  mesh.position.set(x1 + width / 2, y, z1 + depth / 2);
  mesh.receiveShadow = true;
  return mesh;
}
