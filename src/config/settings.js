/**
 * Configurações gerais do projeto.
 * Ajuste aqui velocidade, altura do personagem, qualidade gráfica e teclas
 * sem precisar mexer no resto do código.
 */

export const PLAYER = {
  height: 1.65,     // altura dos olhos (m)
  radius: 0.3,      // "largura" do personagem para colisão (m)
  walkSpeed: 3,     // m/s
  runSpeed: 6,      // m/s
  mouseSensitivity: 0.0022,
  bobAmplitude: 0.03,
  bobFrequency: 2.2,
  // Ponto de partida: no corredor, olhando para dentro da sala (planta: "Iniciamos aqui!")
  start: { position: [14.25, 24], yaw: 0 },
};

export const RENDER = {
  fov: 72,
  near: 0.05,
  far: 120,
  maxPixelRatio: 2,
  shadows: true,
  shadowMapSize: 2048,
  exposure: 1.1,
  background: '#cfd8e0', // cor vista pelas janelas
};

export const LABELS = {
  height: 3.3,          // altura das placas com o nome das áreas
  visibleOnStart: true,
};

/** Teclas por ação (usa KeyboardEvent.code, independe do layout do teclado). */
export const KEY_BINDINGS = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  run: ['ShiftLeft', 'ShiftRight'],
  toggleLabels: ['KeyL'],
  interact: ['KeyE'],
  drop: ['KeyQ'],
  plans: ['KeyP'],
  rotate: ['KeyR'], // girar o molde da obra
  bulk: ['ShiftLeft', 'ShiftRight'], // Shift+E pega/corta tudo · Shift+Q larga tudo
};

export const GAMEPLAY = {
  reach: 3.5,             // distância máxima para interagir (m)
  // Segurar E ou Q repete a ação de 1 em 1, acelerando aos poucos (segundos)
  repeat: { firstDelay: 0.35, interval: 0.18, minInterval: 0.06, acceleration: 0.88 },
  hintInterval: 0.2,      // a cada quanto tempo o tutorial recalcula a dica (s)
};
