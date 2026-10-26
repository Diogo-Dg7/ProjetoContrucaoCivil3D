/**
 * REGISTRO DE OBJETOS
 * Liga o `type` usado em layout.js à função que cria o objeto 3D.
 *
 * Para criar um objeto novo:
 *  1. Crie o arquivo na categoria certa (ex.: machines/Furadeira.js)
 *     exportando uma função `createAlgo(options) → THREE.Group`
 *  2. Registre aqui embaixo
 *  3. Posicione em src/config/layout.js → objects
 */
import { createPipeRack } from './furniture/PipeRack.js';
import { createPlanBoard } from './furniture/PlanBoard.js';
import { createShelf } from './furniture/Shelf.js';

import { createConcreteMixer } from './machines/ConcreteMixer.js';
import { createMiterSaw } from './machines/MiterSaw.js';
import { createTileSaw } from './machines/TileSaw.js';

import { createMortarTrough } from './construction/MortarTrough.js';

import { createBrickPallet } from './supplies/BrickPallet.js';
import { createCementBags } from './supplies/CementBags.js';
import { createLumberStack } from './supplies/LumberStack.js';
import { createPallet } from './supplies/Pallet.js';
import { createRoofSheetStack } from './supplies/RoofSheetStack.js';
import { createSandPile } from './supplies/SandPile.js';
import { createTileStack } from './supplies/TileStack.js';

import { createFireExtinguisher } from './safety/FireExtinguisher.js';

export const OBJECT_FACTORIES = {
  // Móveis
  shelf: createShelf,
  pipeRack: createPipeRack,
  planBoard: createPlanBoard,
  // Máquinas
  concreteMixer: createConcreteMixer,
  tileSaw: createTileSaw,
  miterSaw: createMiterSaw,
  // Construção
  mortarTrough: createMortarTrough,
  // Materiais / suprimentos
  pallet: createPallet,
  brickPallet: createBrickPallet,
  sandPile: createSandPile,
  tileStack: createTileStack,
  cementBags: createCementBags,
  lumberStack: createLumberStack,
  roofSheetStack: createRoofSheetStack,
  // Segurança
  fireExtinguisher: createFireExtinguisher,
};
