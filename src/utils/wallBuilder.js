import * as THREE from 'three';
import { scaleUV } from './meshHelpers.js';

/**
 * Constrói uma parede reta de `from` até `to` ([x, z]) com aberturas.
 * Retorna uma LISTA de peças (meshes) — cada uma vira uma caixa de colisão
 * separada, por isso as portas ficam realmente passáveis.
 *
 * openings: [{ offset, width, height, sill = 0, glass = false }]
 *   offset = distância (m) a partir de `from` até o início da abertura
 *   sill   = altura do peitoril (0 = porta, > 0 = janela)
 */
export function buildWall({ from, to, height, thickness = 0.2, material, glassMaterial, openings = [], extend = 0 }) {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const length = Math.hypot(x2 - x1, z2 - z1);
  const ux = (x2 - x1) / length;
  const uz = (z2 - z1) / length;
  const angle = Math.atan2(z2 - z1, x2 - x1);
  const [tileU, tileV] = material.userData.tile ?? [1, 1];
  const pieces = [];

  const addPiece = (start, end, bottom, top, mat = material, depth = thickness) => {
    const len = end - start;
    const h = top - bottom;
    if (len <= 0.001 || h <= 0.001) return;

    const geometry = scaleUV(new THREE.BoxGeometry(len, h, depth), len / tileU, h / tileV);
    const mesh = new THREE.Mesh(geometry, mat);
    const middle = (start + end) / 2;
    mesh.position.set(x1 + ux * middle, bottom + h / 2, z1 + uz * middle);
    mesh.rotation.y = -angle;
    mesh.castShadow = mat === material;
    mesh.receiveShadow = true;
    pieces.push(mesh);
  };

  let cursor = -extend; // estende um pouco para fechar os cantos
  for (const opening of [...openings].sort((a, b) => a.offset - b.offset)) {
    const sill = opening.sill ?? 0;
    const top = Math.min(sill + opening.height, height);
    const end = opening.offset + opening.width;

    addPiece(cursor, opening.offset, 0, height);      // trecho antes da abertura
    addPiece(opening.offset, end, 0, sill);           // peitoril (janelas)
    addPiece(opening.offset, end, top, height);       // verga (acima)
    if (opening.glass && glassMaterial) addPiece(opening.offset, end, sill, top, glassMaterial, 0.02);
    cursor = end;
  }
  addPiece(cursor, length + extend, 0, height);

  return pieces;
}
