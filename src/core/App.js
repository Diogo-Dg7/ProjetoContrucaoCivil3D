import * as THREE from 'three';
import { RENDER } from '../config/settings.js';

/**
 * Núcleo da aplicação: renderer, cena, câmera e loop de animação.
 * Qualquer objeto com um método `update(deltaSeconds)` pode ser registrado com `add()`.
 */
export class App {
  constructor(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDER.maxPixelRatio));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = RENDER.exposure;
    this.renderer.shadowMap.enabled = RENDER.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(RENDER.background);

    // Cena desenhada POR CIMA da principal (ex.: item na mão do personagem),
    // assim ele nunca "entra" dentro das paredes.
    this.overlayScene = new THREE.Scene();
    this.renderer.autoClear = false;

    this.camera = new THREE.PerspectiveCamera(
      RENDER.fov,
      window.innerWidth / window.innerHeight,
      RENDER.near,
      RENDER.far,
    );

    this.clock = new THREE.Clock();
    this.updatables = [];

    window.addEventListener('resize', () => this.onResize());
  }

  add(updatable) {
    this.updatables.push(updatable);
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      // Limita o delta para evitar "teleportes" quando a aba fica em segundo plano
      const delta = Math.min(this.clock.getDelta(), 0.05);
      for (const item of this.updatables) item.update(delta);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.renderer.clearDepth();
      this.renderer.render(this.overlayScene, this.camera);
    });
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
