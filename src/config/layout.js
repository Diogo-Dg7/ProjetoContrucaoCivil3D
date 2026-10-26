/**
 * PLANTA DA SALA (dados puros — nada de Three.js aqui).
 *
 * Sistema de coordenadas, em METROS, olhando a planta de cima:
 *   x → para a direita    z → para baixo (em direção ao corredor)
 *   Origem (0, 0) = canto superior esquerdo do "Depósito de areia e tijolos".
 *
 * Para mudar a sala basta editar este arquivo:
 *  - walls:   paredes de `from` até `to`. `openings` = portas/janelas
 *             (offset = distância a partir do `from`; sill = altura do peitoril).
 *  - zones:   áreas com nome (aparecem no HUD e nas placas).
 *  - objects: móveis/máquinas. `type` precisa existir em src/world/objects/index.js.
 */

export const LAYOUT = {
  height: 5,          // pé-direito (m)
  wallThickness: 0.2,

  // Retângulos [x1, z1, x2, z2] que recebem piso e teto
  areas: [
    [0, 0, 26, 5.5],       // faixa superior (depósito de areia + área externa)
    [3, 5.5, 23, 15.5],    // sala principal + depósitos 1 e 2
    [12, 15.5, 16.5, 25],  // corredor
    [16.5, 15.5, 23, 25],  // depósito de canos
  ],

  walls: [
    // ---------- Paredes externas ----------
    { from: [0, 0], to: [26, 0], openings: [{ offset: 11, width: 14, sill: 3.2, height: 1.4, glass: true }] },
    { from: [26, 0], to: [26, 5.5] },
    {
      from: [23, 5.5], to: [23, 25],
      openings: [
        { offset: 1.5, width: 7, sill: 1.1, height: 1.5, glass: true },
        { offset: 11, width: 7.5, sill: 1.1, height: 1.5, glass: true },
      ],
    },
    { from: [23, 25], to: [12, 25] },
    { from: [12, 25], to: [12, 15.5] },
    { from: [12, 15.5], to: [3, 15.5] },
    { from: [3, 15.5], to: [3, 5.5] },
    { from: [0, 5.5], to: [0, 0] },

    // ---------- Paredes internas ----------
    // Divisa entre a faixa superior e a sala (portão largo em x = 10.5..13.5)
    { from: [0, 5.5], to: [26, 5.5], openings: [{ offset: 10.5, width: 3, height: 3.2 }] },
    // Depósito de areia ↔ área externa
    { from: [10, 0], to: [10, 5.5], openings: [{ offset: 1.5, width: 2.5, height: 3 }] },
    // Depósitos 1 e 2: abertos para a sala, só uma parede separando um do outro
    { from: [3, 10.5], to: [8.5, 10.5] },
    // Depósito de canos: fechado para o corredor; porta + vitrine para dentro da sala
    { from: [16.5, 15.5], to: [16.5, 25] },
    {
      from: [16.5, 15.5], to: [23, 15.5],
      openings: [
        { offset: 0.8, width: 1.6, height: 2.2 },
        { offset: 3.2, width: 2.6, sill: 1.1, height: 1.2, glass: true },
      ],
    },
  ],

  // Área onde o aluno pode posicionar a obra [x1, z1, x2, z2].
  // Fica um pouco para dentro da faixa amarela para sempre sobrar passagem em volta.
  buildSite: { area: [14.6, 6.8, 21.8, 13.8] },

  // Pilares de concreto [x, z]
  pillars: [
    [0, 0], [26, 0], [10, 5.5], [16.5, 5.5], [23, 5.5],
    [3, 15.5], [12, 15.5], [16.5, 15.5], [23, 15.5], [11.5, 12.5],
  ],

  // Faixas amarelas pintadas no piso
  floorLines: [
    { from: [15.9, 16], to: [15.9, 24.7] },
    { from: [12.4, 16], to: [12.4, 18.8] },
  ],

  zones: [
    { id: 'deposito-areia', name: 'Depósito de Areia e Tijolos', rect: [0, 0, 10, 5.5], color: '#2fa84f' },
    { id: 'area-externa', name: 'Área Externa da Sala', rect: [10, 0, 26, 5.5], showLabel: false },
    { id: 'area-maquinas', name: 'Área de Máquinas', rect: [16, 0.4, 25.6, 5.1], color: '#f2c200', outline: true },
    { id: 'deposito-1', name: 'Depósito 1', rect: [3, 5.5, 8.5, 10.5], color: '#2fa84f' },
    { id: 'deposito-2', name: 'Depósito 2', rect: [3, 10.5, 8.5, 15.5], color: '#2fa84f' },
    { id: 'sala-principal', name: 'Sala Principal', rect: [8.5, 5.5, 23, 15.5], labelAt: [11, 9] },
    {
      id: 'area-construcao', name: 'Área de Construção', rect: [14, 6.2, 22.4, 15], color: '#e53935',
      outline: true, outlineColor: '#f2c200', // faixa amarela colada no chão
    },
    { id: 'corredor', name: 'Corredor de Entrada', rect: [12, 15.5, 16.5, 25] },
    { id: 'deposito-canos', name: 'Depósito de Canos, Estruturas e Telhas', rect: [16.5, 15.5, 23, 25], color: '#2fa84f' },
  ],

  /**
   * position: [x, z]   rotation: graus em torno do eixo vertical
   * options: repassado para a função que cria o objeto
   * solid: false → o personagem atravessa (padrão: true)
   */
  objects: [
    // Só ficam objetos com FUNÇÃO no jogo (estoques, máquinas, obra) e alguns de segurança/ambientação.

    // ---------- Depósito de areia e tijolos ----------
    { type: 'sandPile', position: [2.3, 3], options: { radius: 1.7, height: 1.1 } },

    // ---------- Área de máquinas ----------
    { type: 'concreteMixer', position: [18.4, 2.6], rotation: -30 },
    { type: 'concreteMixer', position: [20.9, 2.6], rotation: -30 },
    { type: 'tileSaw', position: [24, 2.6], rotation: -90 },

    // ---------- Depósito 1 ----------
    { type: 'shelf', position: [3.4, 8], rotation: 90, options: { width: 4 } },
    { type: 'cementBags', position: [6.2, 8] },

    // ---------- Depósito 2 ----------
    { type: 'shelf', position: [3.4, 13], rotation: 90, options: { width: 4, seed: 11 } },
    { type: 'tileStack', position: [6.2, 11.6] },
    { type: 'brickPallet', position: [6.2, 14.2] },

    // ---------- Sala principal / área de construção ----------
    { type: 'planBoard', position: [15.2, 5.6] }, // na parede, de frente para a obra
    { type: 'mortarTrough', position: [15.2, 14.6] }, // fora da área de obra, para não atrapalhar
    { type: 'fireExtinguisher', position: [11.5, 12.73] },

    // ---------- Depósito de canos, estruturas e telhas ----------
    { type: 'pipeRack', position: [22.85, 20.2], rotation: -90, options: { length: 8 } },
    { type: 'lumberStack', position: [19.8, 21.6] },
    { type: 'roofSheetStack', position: [17.4, 20.6] },
    { type: 'tileStack', position: [18, 23.9] },

    // ---------- Corredor ----------
    { type: 'miterSaw', position: [15.5, 21.5], rotation: -90 },
    { type: 'fireExtinguisher', position: [12.1, 23.5], rotation: 90 },
  ],
};
