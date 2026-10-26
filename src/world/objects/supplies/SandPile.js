import * as THREE from 'three';
import { Materials } from '../../../materials/Materials.js';
import { scaleUV } from '../../../utils/meshHelpers.js';

/** Monte de areia: vai baixando conforme o aluno tira baldes */
export function createSandPile({ radius = 1.5, height = 1, buckets = 60 } = {}) {
  const geometry = scaleUV(new THREE.ConeGeometry(radius, height, 32, 4), 3, 1);
  geometry.translate(0, height / 2, 0); // base no chão: dá para "achatar" pela escala
  const pile = new THREE.Mesh(geometry, Materials.sand());
  pile.castShadow = true;
  pile.receiveShadow = true;

  const group = new THREE.Group();
  group.add(pile);

  // Mesmo "contrato de estoque" das pilhas de itens (ver stockStack.js)
  group.userData.stock = {
    max: buckets,
    show(count) {
      const fill = count / buckets;
      pile.visible = count > 0;
      pile.scale.set(0.45 + 0.55 * fill, Math.max(0.04, fill), 0.45 + 0.55 * fill);
    },
    worldPosition(index, target = new THREE.Vector3()) {
      return pile.localToWorld(target.set(0, height * 0.9, 0));
    },
  };
  return group;
}
