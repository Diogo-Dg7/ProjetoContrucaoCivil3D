/**
 * Gerador de números aleatórios com "semente" (mulberry32).
 * Mesma semente = mesmo resultado, então a sala fica igual para todo mundo
 * do grupo a cada recarregamento.
 */
export function createRng(seed = 1) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escolhe um item aleatório da lista */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
