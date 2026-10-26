import * as THREE from 'three';
import { Materials } from '../materials/Materials.js';

/**
 * Atalhos para criar formas básicas. Convenção: `y` é a altura da BASE do
 * objeto (não do centro) — fica bem mais fácil "empilhar" peças.
 */

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Multiplica as coordenadas UV para a textura repetir em vez de esticar */
export function scaleUV(geometry, scaleU, scaleV) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * scaleU, uv.getY(i) * scaleV);
  uv.needsUpdate = true;
  return geometry;
}

export function box(width, height, depth, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y + height / 2, z);
  return enableShadows(mesh);
}

export function cylinder(radiusTop, radiusBottom, height, material, x = 0, y = 0, z = 0, segments = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.position.set(x, y + height / 2, z);
  return enableShadows(mesh);
}

/** Cilindro deitado ao longo do eixo X (rodas, canos). Aqui `y` é o CENTRO. */
export function horizontalCylinder(radius, length, material, x = 0, y = 0, z = 0, segments = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, segments), material);
  mesh.rotation.z = Math.PI / 2;
  mesh.position.set(x, y, z);
  return enableShadows(mesh);
}

/** Faixa pintada no chão entre dois pontos [x, z] */
export function floorLine(from, to, color = '#f2c200', width = 0.08) {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const length = Math.hypot(x2 - x1, z2 - z1);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(length, width), Materials.color(color, { roughness: 0.6 }));
  mesh.rotation.set(-Math.PI / 2, 0, -Math.atan2(z2 - z1, x2 - x1));
  mesh.position.set((x1 + x2) / 2, 0.006, (z1 + z2) / 2);
  mesh.receiveShadow = true;
  return mesh;
}

/** Contorno retangular pintado no chão. rect = [x1, z1, x2, z2] */
export function floorRect([x1, z1, x2, z2], color, width) {
  const group = new THREE.Group();
  group.add(
    floorLine([x1, z1], [x2, z1], color, width),
    floorLine([x2, z1], [x2, z2], color, width),
    floorLine([x2, z2], [x1, z2], color, width),
    floorLine([x1, z2], [x1, z1], color, width),
  );
  return group;
}
