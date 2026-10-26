import * as THREE from 'three';

// Só colidem caixas que estão na faixa de altura do corpo (ignora vergas de porta, luminárias...)
const BODY_MIN_Y = 0.15;
const BODY_MAX_Y = 1.8;

/**
 * Colisão simples e leve: o personagem é um círculo no plano XZ e
 * cada parede/objeto é uma caixa alinhada aos eixos (Box3).
 * O movimento é testado em X e em Z separadamente, o que faz o personagem
 * "deslizar" pelas paredes em vez de travar.
 */
export class CollisionWorld {
  constructor() {
    this.boxes = [];
  }

  /** Círculo (personagem) encostando numa caixa que está na altura do corpo? */
  static circleHitsBox(x, z, radius, box) {
    if (box.max.y < BODY_MIN_Y || box.min.y > BODY_MAX_Y) return false;
    const cx = Math.max(box.min.x, Math.min(x, box.max.x));
    const cz = Math.max(box.min.z, Math.min(z, box.max.z));
    return (x - cx) ** 2 + (z - cz) ** 2 < radius * radius;
  }

  /** Adiciona a caixa envolvente de um objeto 3D (mesh ou group). Retorna a caixa criada. */
  addObject(object) {
    object.updateWorldMatrix(true, true); // inclui os "pais", caso o objeto esteja dentro de um grupo
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return null;
    this.boxes.push(box);
    return box;
  }

  /** Remove caixas criadas por addObject (ex.: ao desmontar uma obra) */
  remove(boxes) {
    const toRemove = new Set(boxes);
    this.boxes = this.boxes.filter((box) => !toRemove.has(box));
  }

  /** Move `position` (Vector3) em dx/dz respeitando as colisões */
  moveCircle(position, dx, dz, radius) {
    position.x += dx;
    if (this.hits(position.x, position.z, radius)) position.x -= dx;

    position.z += dz;
    if (this.hits(position.x, position.z, radius)) position.z -= dz;
  }

  hits(x, z, radius) {
    return this.boxes.some((box) => CollisionWorld.circleHitsBox(x, z, radius, box));
  }
}
