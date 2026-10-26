import * as THREE from 'three';
import { RENDER } from '../config/settings.js';
import { Materials } from '../materials/Materials.js';
import { box } from '../utils/meshHelpers.js';

const FIXTURE_SPACING = 3.5;

/**
 * Iluminação da sala:
 *  - Hemisphere: luz ambiente geral (céu/chão)
 *  - Directional: luz principal, a única que projeta sombras (mais leve)
 *  - Point lights: uma por área, para dar volume
 *  - Luminárias: apenas visuais (material emissivo), sem custo de luz real
 */
export function createLighting(layout) {
  const group = new THREE.Group();
  group.name = 'Lighting';

  group.add(new THREE.HemisphereLight('#ffffff', '#6b6658', 1.1));

  const sun = new THREE.DirectionalLight('#fff5e6', 1.6);
  sun.position.set(19, 30, 18);
  sun.target.position.set(13, 0, 12.5);
  sun.castShadow = RENDER.shadows;
  sun.shadow.mapSize.set(RENDER.shadowMapSize, RENDER.shadowMapSize);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  group.add(sun, sun.target);

  for (const [x1, z1, x2, z2] of layout.areas) {
    const light = new THREE.PointLight('#fff1dc', 30, 20, 1.6);
    light.position.set((x1 + x2) / 2, layout.height - 0.8, (z1 + z2) / 2);
    group.add(light);

    // Luminárias em grade no teto
    for (let x = x1 + FIXTURE_SPACING / 2; x < x2; x += FIXTURE_SPACING) {
      for (let z = z1 + FIXTURE_SPACING / 2; z < z2; z += FIXTURE_SPACING) {
        const lamp = box(1.2, 0.06, 0.25, Materials.lamp(), x, layout.height - 0.45, z);
        lamp.castShadow = false;
        group.add(lamp);
      }
    }
  }

  return group;
}
