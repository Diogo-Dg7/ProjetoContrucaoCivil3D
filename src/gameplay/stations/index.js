/**
 * REGISTRO DE ESTAÇÕES
 * Liga o `type` de um objeto do layout à FUNÇÃO dele no jogo.
 * Todo objeto desse tipo ganha a função automaticamente
 * (ex.: todos os `brickPallet` viram estoque de tijolos).
 */
import { CUTTING_RECIPES } from '../../config/items.js';
import { CutterStation } from './CutterStation.js';
import { MixerStation } from './MixerStation.js';
import { PlanBoardStation } from './PlanBoardStation.js';
import { SourceStation } from './SourceStation.js';
import { TroughStation } from './TroughStation.js';

const source = (itemId) => (object, services) => new SourceStation(object, services, itemId);
const cutter = (recipe) => (object, services) => new CutterStation(object, services, recipe);

export const STATION_BINDINGS = {
  // Estoques de material
  brickPallet: source('tijolo'),
  tileStack: source('piso'),
  sandPile: source('areia'),
  cementBags: source('cimento'),
  lumberStack: source('tabua'),
  roofSheetStack: source('telha'),
  // Máquinas
  concreteMixer: (object, services) => new MixerStation(object, services),
  tileSaw: cutter(CUTTING_RECIPES.tileSaw),
  miterSaw: cutter(CUTTING_RECIPES.miterSaw),
  // Obra
  mortarTrough: (object, services) => new TroughStation(object, services),
  planBoard: (object, services) => new PlanBoardStation(object, services),
};

/** Cria as estações para os objetos já colocados pelo World */
export function createStations(placedObjects, services) {
  return placedObjects.flatMap(({ type, object }) => {
    const bind = STATION_BINDINGS[type];
    if (!bind) return [];
    const station = bind(object, services);
    object.userData.interactable = station;
    return [station];
  });
}
