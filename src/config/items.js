/**
 * CATÁLOGO DE ITENS E RECEITAS (dados puros).
 *
 * capacity   = quantos o personagem consegue carregar de uma vez
 * ghostColor = cor do "bloco fantasma" que pede esse item na obra
 */

export const ITEMS = {
  tijolo: { name: 'Tijolo', singular: 'tijolo', plural: 'tijolos', capacity: 24, ghostColor: '#4fc3f7' },
  meioTijolo: { name: 'Meio tijolo', singular: 'meio tijolo', plural: 'meios tijolos', capacity: 48, ghostColor: '#ffa726' },
  piso: { name: 'Piso cerâmico', singular: 'piso', plural: 'pisos', capacity: 16, ghostColor: '#9ccc65' },
  tabua: { name: 'Tábua', singular: 'tábua', plural: 'tábuas', capacity: 6 },
  caibro: { name: 'Caibro', singular: 'caibro', plural: 'caibros', capacity: 6, ghostColor: '#ce93d8' },
  telha: { name: 'Telha', singular: 'telha', plural: 'telhas', capacity: 2, ghostColor: '#b0bec5' },
  cimento: { name: 'Saco de cimento', singular: 'saco de cimento', plural: 'sacos de cimento', capacity: 1 },
  areia: { name: 'Balde de areia', singular: 'balde de areia', plural: 'baldes de areia', capacity: 3 },
  argamassa: { name: 'Argamassa', singular: 'balde de argamassa', plural: 'baldes de argamassa', capacity: 1 },
};

/** Betoneira: ingredientes → argamassa (traço 1:3 = 1 de cimento para 3 de areia) */
export const MIXER_RECIPE = {
  inputs: { cimento: 1, areia: 3 },
  output: 'argamassa',
  time: 5, // segundos misturando
  label: '1:3',
};

/** Máquinas de corte: o tipo do objeto no layout → o que ela corta (time = segundos por peça) */
export const CUTTING_RECIPES = {
  tileSaw: { machineName: 'Cortadora', input: 'tijolo', output: 'meioTijolo', ratio: 2, time: 0.8, verb: 'Cortar ao meio' },
  miterSaw: { machineName: 'Serra de esquadria', input: 'tabua', output: 'caibro', ratio: 1, time: 1.2, verb: 'Cortar no tamanho' },
};

/** Estoques (paletes, monte de areia...): quando acabam, chega reposição depois de um tempo */
export const STOCK = {
  restockTime: 15, // segundos até chegar material novo num estoque vazio
};

/** Cocho (masseira) da obra: cada bloco/piso assentado gasta 1 porção */
export const MORTAR = {
  portionsPerBatch: 40,
  troughCapacity: 80,
};

/** "24 tijolos", "1 saco de cimento"... */
export function formatAmount(id, count) {
  const item = ITEMS[id];
  return `${count} ${count === 1 ? item.singular : item.plural}`;
}
