import * as THREE from 'three';
import { PLAYER } from '../config/settings.js';
import { MouseLook } from './MouseLook.js';

const _right = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _move = new THREE.Vector3();

/**
 * Personagem em primeira pessoa: a câmera é a "cabeça".
 * - Mouse: MouseLook (olhar ao redor, com correção dos "pulos" de câmera)
 * - Teclado: InputManager (andar/correr)
 * - Colisão: CollisionWorld (não atravessa paredes nem objetos)
 */
export class Player {
  constructor(camera, domElement, input, collision) {
    this.camera = camera;
    this.input = input;
    this.collision = collision;
    this.look = new MouseLook(camera, domElement);
    this.bobTime = 0;

    const [x, z] = PLAYER.start.position;
    camera.position.set(x, PLAYER.height, z);
    camera.rotation.set(0, PLAYER.start.yaw, 0, 'YXZ');

    // Evita teclas "presas" ao pausar
    this.look.on('unlock', () => input.reset());
  }

  get isLocked() {
    return this.look.isLocked;
  }

  lock() {
    this.look.lock();
  }

  unlock() {
    this.look.unlock();
  }

  update(delta) {
    if (!this.look.isLocked) return;

    const forward = Number(this.input.isAction('forward')) - Number(this.input.isAction('backward'));
    const strafe = Number(this.input.isAction('right')) - Number(this.input.isAction('left'));
    const position = this.camera.position;

    if (forward === 0 && strafe === 0) {
      // Volta suavemente à altura normal quando para
      position.y += (PLAYER.height - position.y) * Math.min(1, delta * 10);
      return;
    }

    const speed = this.input.isAction('run') ? PLAYER.runSpeed : PLAYER.walkSpeed;

    // Direções no plano do chão (ignora se está olhando para cima/baixo)
    _right.setFromMatrixColumn(this.camera.matrix, 0).setY(0).normalize();
    _forward.crossVectors(this.camera.up, _right);
    _move.set(0, 0, 0)
      .addScaledVector(_forward, forward)
      .addScaledVector(_right, strafe)
      .normalize()
      .multiplyScalar(speed * delta);

    this.collision.moveCircle(position, _move.x, _move.z, PLAYER.radius);

    // Balanço leve da cabeça ao andar
    this.bobTime += delta * speed * PLAYER.bobFrequency;
    position.y = PLAYER.height + Math.sin(this.bobTime) * PLAYER.bobAmplitude;
  }
}
