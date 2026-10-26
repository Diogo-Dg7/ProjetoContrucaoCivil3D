/**
 * PLANTAS QUE O ALUNO PODE CONSTRUIR (dados puros).
 * O gerador (src/gameplay/building/PlanGenerator.js) transforma isso em
 * blocos fantasmas, fiada por fiada.
 *
 * Medidas em metros, sempre múltiplas de 0,2 (meio tijolo):
 *   tijolo = 0,4 m de comprimento (com junta) × 0,2 m de altura × 0,2 m de espessura
 *
 * shape 'wall' → um muro reto de `length`
 * shape 'room' → um cômodo de `width` × `depth` (medidas externas)
 *
 * openings: aberturas (portas/janelas)
 *   wall   = 'front' | 'back' | 'left' | 'right'
 *   offset = distância desde o canto (no eixo da parede)
 *   fromRow/toRow = fiadas sem tijolo (toRow não incluso)
 */
export const HOUSE_PLANS = [
  {
    id: 'mureta',
    name: 'Mureta de Tijolos',
    difficulty: 'Iniciante',
    description: 'Um muro simples para aprender o básico: argamassa, 1ª fiada e juntas desencontradas.',
    shape: 'wall',
    length: 2.4,
    rows: 5,
  },
  {
    id: 'casinha',
    name: 'Casinha de Ferramentas',
    difficulty: 'Intermediário',
    description: 'Um cômodo pequeno com porta: amarração nos cantos, verga, piso e telhado.',
    shape: 'room',
    width: 2.4,
    depth: 2.0,
    rows: 8,
    openings: [{ wall: 'front', offset: 0.8, width: 0.8, fromRow: 0, toRow: 7 }],
    floor: true,
    roof: true,
  },
  {
    id: 'casa',
    name: 'Casa de 1 Cômodo',
    difficulty: 'Avançado',
    description: 'Casa com porta e janela. Exige bastante argamassa e organização da obra!',
    shape: 'room',
    width: 3.2,
    depth: 2.8,
    rows: 10,
    openings: [
      { wall: 'front', offset: 1.2, width: 0.8, fromRow: 0, toRow: 9 },
      { wall: 'right', offset: 0.8, width: 1.2, fromRow: 4, toRow: 8 },
    ],
    floor: true,
    roof: true,
  },
];
