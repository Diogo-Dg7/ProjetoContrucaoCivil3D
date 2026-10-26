import * as THREE from 'three';
import { PLAYER } from '../config/settings.js';
import { EventEmitter } from '../utils/EventEmitter.js';

const MAX_PITCH = Math.PI / 2 - 0.05; // não deixa "virar a cabeça" para trás
const SPIKE_LIMIT = 300;              // px num único evento: acima disso é bug do navegador
const IGNORE_AFTER_LOCK = 3;          // eventos descartados logo após prender o mouse

/**
 * Olhar com o mouse (substitui o PointerLockControls do Three.js).
 *
 * Corrige o "teletransporte" da câmera: alguns navegadores (Chrome/Windows)
 * às vezes mandam um movimento gigante num único evento. Aqui:
 *  1. pedimos o movimento "cru" do mouse (unadjustedMovement), sem a aceleração do sistema;
 *  2. ignoramos movimentos absurdos;
 *  3. ignoramos os primeiros eventos logo após prender o mouse.
 *
 * Eventos: 'lock', 'unlock'
 */
export class MouseLook extends EventEmitter {
  constructor(camera, domElement) {
    super();
    this.camera = camera;
    this.domElement = domElement;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.isLocked = false;
    this.skipEvents = 0;

    document.addEventListener('pointerlockchange', () => this.onLockChange());
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
  }

  lock() {
    const request = this.domElement.requestPointerLock({ unadjustedMovement: true });
    // Navegador sem suporte ao modo "cru": tenta o modo normal
    request?.catch?.((error) => {
      if (error.name === 'NotSupportedError') this.domElement.requestPointerLock();
    });
  }

  unlock() {
    document.exitPointerLock();
  }

  onLockChange() {
    const locked = document.pointerLockElement === this.domElement;
    if (locked === this.isLocked) return;
    this.isLocked = locked;
    this.skipEvents = IGNORE_AFTER_LOCK;
    this.emit(locked ? 'lock' : 'unlock');
  }

  onMouseMove({ movementX, movementY }) {
    if (!this.isLocked) return;
    if (this.skipEvents > 0) {
      this.skipEvents--;
      return;
    }
    if (Math.abs(movementX) > SPIKE_LIMIT || Math.abs(movementY) > SPIKE_LIMIT) return;

    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * PLAYER.mouseSensitivity;
    this.euler.x -= movementY * PLAYER.mouseSensitivity;
    this.euler.x = THREE.MathUtils.clamp(this.euler.x, -MAX_PITCH, MAX_PITCH);
    this.camera.quaternion.setFromEuler(this.euler);
  }
}
