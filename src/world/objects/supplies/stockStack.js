import * as THREE from 'three';

const _matrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _position = new THREE.Vector3();
const _scale = new THREE.Vector3(1, 1, 1);
const _up = new THREE.Vector3(0, 1, 0);

/**
 * Posições de uma pilha em grade, DE BAIXO PARA CIMA.
 * A última posição é a primeira a sair quando o aluno pega um item.
 */
export function gridPositions({ size: [w, h, d], cols, rows, layers, gap = 0.01, baseY = 0 }) {
  const positions = [];
  for (let layer = 0; layer < layers; layer++) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        positions.push({
          x: (col - (cols - 1) / 2) * (w + gap),
          y: baseY + layer * (h + gap) + h / 2,
          z: (row - (rows - 1) / 2) * (d + gap),
          rotationY: 0,
        });
      }
    }
  }
  return positions;
}

/**
 * Pilha de itens INDIVIDUAIS que diminui conforme o estoque.
 * Usa InstancedMesh: centenas de tijolos custam o mesmo que 1 só para a placa de vídeo.
 *
 * parts: [{ geometry, material, colors? }]  (várias partes = ex.: saco + faixa do saco)
 * Retorna o "contrato de estoque" que a SourceStation usa:
 *   { group, max, show(count), worldPosition(index) }
 */
export function createStockStack(positions, parts) {
  const group = new THREE.Group();
  const meshes = parts.map(({ geometry, material, colors }) => {
    const mesh = new THREE.InstancedMesh(geometry, material, positions.length);
    positions.forEach((p, i) => {
      _quaternion.setFromAxisAngle(_up, p.rotationY ?? 0);
      mesh.setMatrixAt(i, _matrix.compose(_position.set(p.x, p.y, p.z), _quaternion, _scale));
      if (colors) mesh.setColorAt(i, new THREE.Color(colors[i]));
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  });

  return {
    group,
    max: positions.length,
    /** Mostra só os `count` primeiros itens (os de cima somem primeiro) */
    show(count) {
      for (const mesh of meshes) mesh.count = count;
    },
    /** Posição no mundo do item `index` (para a animação de pegar) */
    worldPosition(index, target = new THREE.Vector3()) {
      const p = positions[THREE.MathUtils.clamp(index, 0, positions.length - 1)];
      return group.localToWorld(target.set(p.x, p.y, p.z));
    },
  };
}

/** Liga a pilha ao objeto do layout: a SourceStation encontra em userData.stock */
export function attachStock(object, stack) {
  object.add(stack.group);
  object.userData.stock = stack;
  return object;
}
