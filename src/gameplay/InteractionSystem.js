import * as THREE from 'three';
import { GAMEPLAY } from '../config/settings.js';
import { HoldRepeater } from '../utils/HoldRepeater.js';

const SCREEN_CENTER = new THREE.Vector2(0, 0);

/**
 * Descobre para o que o personagem está olhando (raio saindo do centro da tela)
 * e executa a ação com a tecla E.
 *
 *   E          → ação de 1 unidade (pegar 1 tijolo, cortar 1, assentar 1...)
 *   segurar E  → repete de 1 em 1, cada vez mais rápido
 *   Shift + E  → versão "tudo de uma vez" (quando o alvo oferece)
 *
 * Um "interagível" é qualquer objeto com `userData.interactable` contendo:
 *   getPrompt(hit) → { text, enabled, bulkText? } | null
 *                    bulkText = o que o Shift+E faz (ex.: "pegar 24 tijolos")
 *   interact(hit, bulk)
 *   perMesh?           → cada mesh é um alvo diferente (blocos fantasmas)
 *   onHover/onUnhover? → destaque personalizado (senão, usa uma caixa amarela)
 */
export class InteractionSystem {
  constructor({ camera, input, hud, scene, targets, occluders }) {
    this.camera = camera;
    this.input = input;
    this.hud = hud;
    this.objects = [...targets, ...occluders]; // occluders: paredes "escondem" o que está atrás

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = GAMEPLAY.reach;
    this.repeater = new HoldRepeater();

    this.highlight = new THREE.Box3Helper(new THREE.Box3(), '#ffe066');
    this.highlight.visible = false;
    scene.add(this.highlight);

    this.current = null; // { interactable, hit, key }
  }

  update(delta) {
    this.raycaster.setFromCamera(SCREEN_CENTER, this.camera);
    const [first] = this.raycaster.intersectObjects(this.objects, true);
    this.setCurrent(first ? findInteractable(first.object) : null);

    const prompt = this.current?.interactable.getPrompt(this.current.hit) ?? null;
    this.hud.setPrompt(prompt && withHint(prompt));

    if (this.repeater.tick(delta, this.input.isAction('interact'))) this.trigger(false);
  }

  /** Chamado quando a tecla E é apertada */
  onPress() {
    this.trigger(this.input.isAction('bulk'));
    this.repeater.press();
  }

  trigger(bulk) {
    if (!this.current) return;
    const { interactable, hit } = this.current;
    const prompt = interactable.getPrompt(hit);
    if (prompt?.enabled) interactable.interact(hit, bulk && Boolean(prompt.bulkText));
  }

  setCurrent(target) {
    const key = target ? (target.interactable.perMesh ? target.hit : target.interactable) : null;
    if (key === this.current?.key) return;

    if (this.current) {
      this.current.interactable.onUnhover?.(this.current.hit);
      this.highlight.visible = false;
    }
    this.current = target ? { ...target, key } : null;
    if (!target) return;

    if (target.interactable.onHover) {
      target.interactable.onHover(target.hit);
    } else {
      this.highlight.box.setFromObject(target.hit);
      this.highlight.visible = true;
    }
  }

  clear() {
    this.setCurrent(null);
    this.hud.setPrompt(null);
  }
}

function withHint(prompt) {
  if (!prompt.enabled || !prompt.bulkText) return prompt;
  return { ...prompt, hint: `segure E: 1 de cada vez · Shift+E: ${prompt.bulkText}` };
}

function findInteractable(object) {
  for (let node = object; node; node = node.parent) {
    if (node.userData.interactable) return { interactable: node.userData.interactable, hit: node };
  }
  return null;
}
