import { GAMEPLAY } from '../config/settings.js';

/**
 * "Segurar a tecla para repetir", acelerando aos poucos
 * (1 unidade → espera → 1, 1, 1... cada vez mais rápido).
 *
 *   repeater.press();                         // tecla acabou de ser apertada
 *   if (repeater.tick(delta, isHeld)) fazer(); // a cada frame
 */
export class HoldRepeater {
  constructor({ firstDelay, interval, minInterval, acceleration } = GAMEPLAY.repeat) {
    this.firstDelay = firstDelay;
    this.startInterval = interval;
    this.minInterval = minInterval;
    this.acceleration = acceleration;
    this.timer = 0;
    this.interval = interval;
  }

  press() {
    this.timer = this.firstDelay;
    this.interval = this.startInterval;
  }

  /** Retorna true quando é hora de repetir a ação */
  tick(delta, isHeld) {
    if (!isHeld) return false;
    this.timer -= delta;
    if (this.timer > 0) return false;
    this.timer = this.interval;
    this.interval = Math.max(this.minInterval, this.interval * this.acceleration);
    return true;
  }
}
