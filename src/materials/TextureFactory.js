import * as THREE from 'three';
import { createRng } from '../utils/random.js';

/**
 * Texturas geradas em <canvas> (não precisa baixar imagens).
 * Quando o grupo tiver fotos de textura reais, basta colocá-las em
 * assets/textures/ e trocar a criação em Materials.js por um TextureLoader.
 */

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d')];
}

function toTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function shade(hex, rng, amount) {
  const color = new THREE.Color(hex);
  color.offsetHSL(0, 0, (rng() - 0.5) * amount);
  return `#${color.getHexString()}`;
}

/** Pontinhos claros/escuros para dar textura de material poroso */
function speckle(ctx, width, height, rng, alpha) {
  for (let i = 0; i < (width * height) / 40; i++) {
    ctx.fillStyle = rng() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(rng() * width, rng() * height, 1.5, 1.5);
  }
}

export const TextureFactory = {
  /** Tijolos em amarração (fileiras desencontradas) */
  bricks({ brickColor = '#b8613f', mortarColor = '#d8cbbd', cols = 4, rows = 8, mortar = 4, seed = 1 } = {}) {
    const [canvas, ctx] = createCanvas(512, 256);
    const rng = createRng(seed);
    const bw = canvas.width / cols;
    const bh = canvas.height / rows;

    ctx.fillStyle = mortarColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row++) {
      const offset = (row % 2) * (bw / 2);
      for (let col = -1; col <= cols; col++) {
        ctx.fillStyle = shade(brickColor, rng, 0.1);
        ctx.fillRect(col * bw + offset + mortar / 2, row * bh + mortar / 2, bw - mortar, bh - mortar);
      }
    }
    return toTexture(canvas);
  },

  /** Concreto/areia: cor base com manchas e granulado */
  concrete({ base = '#8a8a86', blotches = 90, grain = 18, seed = 2 } = {}) {
    const [canvas, ctx] = createCanvas(512, 512);
    const rng = createRng(seed);

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < blotches; i++) {
      ctx.fillStyle = shade(base, rng, 0.12);
      ctx.globalAlpha = 0.15 + rng() * 0.2;
      ctx.beginPath();
      ctx.arc(rng() * 512, rng() * 512, 10 + rng() * 60, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const image = ctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < image.data.length; i += 4) {
      const n = (rng() - 0.5) * grain;
      image.data[i] += n;
      image.data[i + 1] += n;
      image.data[i + 2] += n;
    }
    ctx.putImageData(image, 0, 0);
    return toTexture(canvas);
  },

  /** Ponta do tijolo cerâmico: os furos (tijolo "baiano" de 8 furos) */
  brickEnd({ color = '#c4552e', holeColor = '#5a2312', seed = 8 } = {}) {
    const [canvas, ctx] = createCanvas(128, 64);
    const rng = createRng(seed);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = holeColor;
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 2; row++) {
        ctx.beginPath();
        ctx.roundRect(9 + col * 29, 9 + row * 25, 23, 20, 4);
        ctx.fill();
      }
    }
    speckle(ctx, 128, 64, rng, 0.08);
    return toTexture(canvas);
  },

  /** Lateral do tijolo cerâmico: frisos horizontais e manchas de queima */
  brickSide({ color = '#c4552e', seed = 9 } = {}) {
    const [canvas, ctx] = createCanvas(256, 128);
    const rng = createRng(seed);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = shade(color, rng, 0.2);
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.ellipse(rng() * 256, rng() * 128, 30 + rng() * 50, 10 + rng() * 25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#7a3018';
    for (let y = 16; y < 128; y += 22) ctx.fillRect(0, y, 256, 2); // frisos
    ctx.globalAlpha = 1;
    speckle(ctx, 256, 128, rng, 0.1);
    return toTexture(canvas);
  },

  /** Piso cerâmico esmaltado: base clara com veios suaves e rejunte na borda */
  ceramicTile({ base = '#e3d4b6', vein = '#b9a37c', seed = 10 } = {}) {
    const [canvas, ctx] = createCanvas(256, 256);
    const rng = createRng(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = vein;
    for (let i = 0; i < 7; i++) {
      ctx.globalAlpha = 0.12 + rng() * 0.15;
      ctx.lineWidth = 1 + rng() * 3;
      ctx.beginPath();
      ctx.moveTo(rng() * 256, 0);
      ctx.bezierCurveTo(rng() * 256, 85, rng() * 256, 170, rng() * 256, 256);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#a89a86';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 256, 256);
    return toTexture(canvas);
  },

  /** Planta azul (blueprint) para o Quadro de Projetos */
  blueprint() {
    const [canvas, ctx] = createCanvas(512, 352);
    ctx.fillStyle = '#1d4f91';
    ctx.fillRect(0, 0, 512, 352);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i <= 512; i += 16) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 352); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(96, 120, 320, 180);           // paredes externas
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(256, 120); ctx.lineTo(256, 230); ctx.stroke(); // parede interna
    ctx.fillStyle = '#1d4f91';                    // vão da porta
    ctx.fillRect(180, 296, 48, 10);
    ctx.beginPath(); ctx.arc(180, 300, 48, -Math.PI / 2, 0); ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLANTAS', 256, 70);
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText('aperte E para escolher', 256, 100);
    return toTexture(canvas);
  },
};
