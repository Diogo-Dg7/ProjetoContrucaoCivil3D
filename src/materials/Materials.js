import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';

/**
 * Biblioteca central de materiais. Cada material é criado uma única vez e
 * reaproveitado (cache) — economiza memória da placa de vídeo.
 *
 * Materiais com textura guardam em `userData.tile` o tamanho (em metros)
 * que a textura representa, usado por scaleUV() para não esticar os tijolos.
 */

const cache = new Map();
const BRICK_TINTS = ['#ffffff', '#ead6cb', '#ffe4d4']; // multiplicam a textura do tijolo

function cached(key, create) {
  if (!cache.has(key)) cache.set(key, create());
  return cache.get(key);
}

function textured(key, createTexture, tile, params = {}) {
  return cached(key, () => {
    const material = new THREE.MeshStandardMaterial({ map: createTexture(), roughness: 0.9, ...params });
    material.userData.tile = tile;
    return material;
  });
}

export const Materials = {
  /** Material de cor sólida. Ex.: Materials.color('#f0b400', { metalness: 0.3 }) */
  color(hex, params = {}) {
    return cached(`color:${hex}:${JSON.stringify(params)}`,
      () => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8, ...params }));
  },

  // ---------- Estrutura ----------
  bricks: () => textured('bricks', () => TextureFactory.bricks(), [1, 0.5], { roughness: 0.95 }),
  ceramicBlock: () => textured('ceramicBlock',
    () => TextureFactory.bricks({ brickColor: '#c4552e', mortarColor: '#a49c90', cols: 2, rows: 4, mortar: 12, seed: 4 }),
    [0.8, 0.8]),
  concrete: () => textured('concrete', () => TextureFactory.concrete({ base: '#9d9d98', seed: 3 }), [3, 3]),
  floor: () => textured('floor', () => TextureFactory.concrete({ base: '#7f817e', blotches: 140, seed: 5 }), [4, 4], { roughness: 0.85 }),
  ceiling: () => textured('ceiling', () => TextureFactory.concrete({ base: '#b3b3ae', seed: 6 }), [5, 5], { emissive: '#3c3c39' }),
  sand: () => textured('sand', () => TextureFactory.concrete({ base: '#c2a874', grain: 40, seed: 7 }), [1.5, 1.5], { roughness: 1 }),
  glass: () => cached('glass', () => new THREE.MeshStandardMaterial({
    color: '#cfe3f2', transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.1, depthWrite: false,
  })),

  // ---------- Peças de obra (tijolo e piso) ----------

  /**
   * Tijolo cerâmico: lista de 6 materiais (um por face da caixa).
   * alongX = o comprimento do tijolo está no eixo X (senão, no eixo Z).
   * variant dá uma leve variação de tom entre tijolos.
   */
  brickBlock(variant = 0, alongX = true) {
    const [end, side] = cached(`brickFaces:${variant % BRICK_TINTS.length}`, () => {
      const color = BRICK_TINTS[variant % BRICK_TINTS.length];
      const endMap = cached('tex:brickEnd', () => TextureFactory.brickEnd());
      const sideMap = cached('tex:brickSide', () => TextureFactory.brickSide());
      return [
        new THREE.MeshStandardMaterial({ map: endMap, color, roughness: 0.9 }),
        new THREE.MeshStandardMaterial({ map: sideMap, color, roughness: 0.9 }),
      ];
    });
    // Ordem das faces de uma caixa: +x, -x, +y, -y, +z, -z (furos nas pontas)
    return alongX ? [end, end, side, side, side, side] : [side, side, side, side, end, end];
  },

  ceramicTile: (variant = 0) => cached(`ceramicTile:${variant % 2}`, () => new THREE.MeshStandardMaterial({
    map: cached('tex:ceramicTile', () => TextureFactory.ceramicTile()),
    color: variant % 2 ? '#f4ece0' : '#ffffff',
    roughness: 0.25,
  })),

  // ---------- Atalhos de cores comuns ----------
  metal: () => Materials.color('#9aa0a6', { metalness: 0.6, roughness: 0.4 }),
  darkMetal: () => Materials.color('#3a3d42', { metalness: 0.5, roughness: 0.5 }),
  rubber: () => Materials.color('#1c1c1c', { roughness: 0.9 }),
  wood: () => Materials.color('#a8824f'),
  plywood: () => Materials.color('#cfb284'),
  machineYellow: () => Materials.color('#f0b400', { metalness: 0.2, roughness: 0.45 }),
  machineOrange: () => Materials.color('#e2611f', { metalness: 0.2, roughness: 0.45 }),
  drywall: () => Materials.color('#d9d5cc', { roughness: 0.95 }),
  lamp: () => Materials.color('#ffffff', { emissive: '#fff6e0', emissiveIntensity: 1.5 }),
};
