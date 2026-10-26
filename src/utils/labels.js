import * as THREE from 'three';

/** Placa flutuante com texto (Sprite sempre virado para a câmera) */
export function createLabel(text, accent = '#e0672f') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.font = '600 64px system-ui, Segoe UI, sans-serif';
  const width = Math.min(canvas.width, ctx.measureText(text).width + 120);
  const x = (canvas.width - width) / 2;

  ctx.fillStyle = 'rgba(18, 20, 26, 0.82)';
  ctx.beginPath();
  ctx.roundRect(x, 20, width, 120, 28);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.fillRect(x + 30, 50, 12, 60);

  ctx.fillStyle = '#f5f3ee';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 66, 82);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(4, 0.625, 1);
  return sprite;
}
