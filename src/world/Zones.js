import * as THREE from 'three';
import { LABELS } from '../config/settings.js';
import { createLabel } from '../utils/labels.js';
import { floorRect } from '../utils/meshHelpers.js';

const area = ({ rect: [x1, z1, x2, z2] }) => (x2 - x1) * (z2 - z1);

/**
 * Áreas nomeadas da sala: desenha as placas flutuantes, as marcações no chão
 * e responde "em qual área o jogador está?" (usado pelo HUD).
 */
export class Zones {
  constructor(zones) {
    this.group = new THREE.Group();
    this.group.name = 'Zones';
    this.labels = new THREE.Group();
    this.labels.visible = LABELS.visibleOnStart;
    this.group.add(this.labels);

    // Áreas menores primeiro: "Área de Construção" ganha de "Sala Principal"
    this.zones = [...zones].sort((a, b) => area(a) - area(b));

    for (const zone of zones) {
      const [x1, z1, x2, z2] = zone.rect;
      if (zone.outline) this.group.add(floorRect(zone.rect, zone.outlineColor ?? zone.color, 0.1));

      if (zone.showLabel !== false) {
        const label = createLabel(zone.name, zone.color);
        const [lx, lz] = zone.labelAt ?? [(x1 + x2) / 2, (z1 + z2) / 2];
        label.position.set(lx, LABELS.height, lz);
        this.labels.add(label);
      }
    }
  }

  getZoneAt(x, z) {
    return this.zones.find(({ rect: [x1, z1, x2, z2] }) => x >= x1 && x <= x2 && z >= z1 && z <= z2) ?? null;
  }

  toggleLabels() {
    this.labels.visible = !this.labels.visible;
    return this.labels.visible;
  }
}
