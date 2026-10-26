import * as THREE from 'three';
import { floorRect } from '../../utils/meshHelpers.js';
import { boxGeometry } from '../items/itemVisuals.js';
import { generatePlan } from './PlanGenerator.js';

const GRID = 0.2;          // o molde "encaixa" de 20 em 20 cm (meio tijolo)
const CLEARANCE = 0.4;     // espaço livre mínimo entre a obra e outros objetos (m)
const MAX_DISTANCE = 14;   // até onde a mira alcança no chão
const SCREEN_CENTER = new THREE.Vector2(0, 0);
const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hit = new THREE.Vector3();

const COLORS = { valid: '#66bb6a', invalid: '#ef5350' };
const materials = Object.fromEntries(Object.entries(COLORS).map(([key, color]) => [key, {
  brick: new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false }),
  fill: new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false }),
}]));

/**
 * Modo de posicionamento: depois de escolher a planta, o aluno escolhe ONDE
 * construir. Um molde (contorno + 1ª fiada) segue a mira no chão, dentro da
 * área permitida (layout.buildSite.area), e fica vermelho se não puder ficar ali.
 */
export class PlacementMode {
  constructor({ scene, camera, area, collision, buildSite, dropped }) {
    this.camera = camera;
    this.area = area;
    this.collision = collision;
    this.buildSite = buildSite;
    this.dropped = dropped;
    this.raycaster = new THREE.Raycaster();

    this.plan = null;
    this.size = [0, 0];
    this.rotation = 0;
    this.center = [0, 0];
    this.valid = false;
    this.reason = '';

    this.areaMarker = createAreaMarker(area);
    this.preview = new THREE.Group();
    this.areaMarker.visible = this.preview.visible = false;
    scene.add(this.areaMarker, this.preview);
  }

  get active() {
    return this.plan !== null;
  }

  /** Tamanho da obra no chão já considerando a rotação */
  get footprint() {
    const [w, d] = this.size;
    return this.rotation % 180 === 0 ? [w, d] : [d, w];
  }

  start(plan) {
    const generated = generatePlan(plan);
    this.plan = plan;
    this.size = generated.size;
    this.rotation = 0;
    this.buildPreview(generated);

    const [x1, z1, x2, z2] = this.area;
    this.moveTo((x1 + x2) / 2, (z1 + z2) / 2);
    this.areaMarker.visible = this.preview.visible = true;
  }

  stop() {
    this.plan = null;
    this.areaMarker.visible = this.preview.visible = false;
  }

  rotate() {
    this.rotation = (this.rotation + 90) % 360;
    this.moveTo(...this.center); // re-encaixa na área com o novo tamanho
  }

  update() {
    this.raycaster.setFromCamera(SCREEN_CENTER, this.camera);
    const hit = this.raycaster.ray.intersectPlane(FLOOR, _hit);
    if (hit && hit.distanceTo(this.camera.position) < MAX_DISTANCE) this.moveTo(hit.x, hit.z);

    this.preview.position.set(this.center[0], 0, this.center[1]);
    this.preview.rotation.y = THREE.MathUtils.degToRad(this.rotation);
    this.validate();
  }

  /** Retorna { plan, center, rotation } se o local for válido; senão null */
  confirm() {
    if (!this.valid) return null;
    return { plan: this.plan, center: [...this.center], rotation: this.rotation };
  }

  // -------------------------------------------------------------------------

  moveTo(x, z) {
    const [w, d] = this.footprint;
    const [x1, z1, x2, z2] = this.area;
    // Encaixa o CANTO na grade e mantém a obra dentro da área (desliza pelas bordas)
    const left = THREE.MathUtils.clamp(snap(x - w / 2), x1, Math.max(x1, x2 - w));
    const top = THREE.MathUtils.clamp(snap(z - d / 2), z1, Math.max(z1, z2 - d));
    this.center = [left + w / 2, top + d / 2];
  }

  /** Retângulo [x1, z1, x2, z2] ocupado pela obra, com uma margem opcional */
  rect(margin = 0) {
    const [w, d] = this.footprint;
    const [cx, cz] = this.center;
    return [cx - w / 2 - margin, cz - d / 2 - margin, cx + w / 2 + margin, cz + d / 2 + margin];
  }

  validate() {
    const [w, d] = this.footprint;
    const [x1, z1, x2, z2] = this.area;
    const ownBoxes = new Set(this.buildSite.colliders); // a obra antiga será desmontada

    let reason = '';
    if (w > x2 - x1 || d > z2 - z1) {
      reason = 'A planta não cabe na área de construção nesta posição — aperte R para girar';
    } else if (this.collision.boxes.some((box) => !ownBoxes.has(box) && blocksBody(box) && overlaps(this.rect(CLEARANCE), box))) {
      reason = 'Muito perto de um objeto — deixe espaço para passar';
    } else if (this.dropped.piles.some((pile) => contains(this.rect(0.2), pile.object.position))) {
      reason = 'Tem material largado no chão aqui — recolha ou escolha outro lugar';
    }

    this.reason = reason;
    const valid = !reason;
    if (valid !== this.valid) {
      this.valid = valid;
      this.applyColors();
    }
  }

  buildPreview({ steps, size: [w, d] }) {
    this.preview.clear();
    const inner = new THREE.Group();
    inner.position.set(-w / 2, 0, -d / 2);

    const fill = new THREE.Mesh(new THREE.PlaneGeometry(w, d), materials.valid.fill);
    fill.rotation.x = -Math.PI / 2;
    fill.position.set(w / 2, 0.012, d / 2);
    fill.userData.role = 'fill';
    inner.add(fill);

    for (const slot of steps[0].slots) {
      const brick = new THREE.Mesh(boxGeometry(slot.size), materials.valid.brick);
      brick.position.set(...slot.position);
      brick.userData.role = 'brick';
      inner.add(brick);
    }
    this.preview.add(inner);
    this.valid = true;
    this.applyColors();
  }

  applyColors() {
    const set = materials[this.valid ? 'valid' : 'invalid'];
    this.preview.traverse((child) => {
      if (child.userData.role) child.material = set[child.userData.role];
    });
  }
}

function createAreaMarker([x1, z1, x2, z2]) {
  const group = new THREE.Group();
  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(x2 - x1, z2 - z1),
    new THREE.MeshBasicMaterial({ color: COLORS.valid, transparent: true, opacity: 0.1, depthWrite: false }),
  );
  fill.rotation.x = -Math.PI / 2;
  fill.position.set((x1 + x2) / 2, 0.008, (z1 + z2) / 2);
  group.add(fill, floorRect([x1, z1, x2, z2], COLORS.valid, 0.06));
  return group;
}

function snap(value) {
  return Math.round(value / GRID) * GRID;
}

function blocksBody(box) {
  return box.max.y > 0.15 && box.min.y < 1.8;
}

function overlaps([x1, z1, x2, z2], box) {
  return x1 < box.max.x && x2 > box.min.x && z1 < box.max.z && z2 > box.min.z;
}

function contains([x1, z1, x2, z2], { x, z }) {
  return x > x1 && x < x2 && z > z1 && z < z2;
}
