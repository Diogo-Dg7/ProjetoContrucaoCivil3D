# Réplica 3D — Sala de Construção Civil (SENAI)

Passeio virtual **e jogo didático** em primeira pessoa na sala de aula de construção civil do SENAI,
feito com **HTML + CSS + JavaScript** e **[Three.js](https://threejs.org/)** (r160, via CDN — sem build).

O aluno escolhe uma **planta de casa**, busca os materiais nos depósitos, prepara a argamassa na
**betoneira**, corta peças nas **máquinas** e assenta tudo nos **blocos fantasmas**, fiada por fiada,
seguindo um tutorial que explica cada etapa.

## Como rodar

Como o projeto usa *ES Modules*, ele **não abre com duplo clique** (`file://`). Use um servidor local:

- **VS Code:** extensão **Live Server** → botão direito no `index.html` → *Open with Live Server*
- **Node:** `npx serve .`
- **Python:** `python -m http.server 5500` e acesse `http://localhost:5500`

## Controles

| Tecla | Ação |
|---|---|
| `W A S D` / setas | andar (`Shift` corre) |
| Mouse | olhar / mirar |
| `E` | pegar, cortar, assentar — **1 unidade por toque**; **segure** para continuar (vai acelerando) |
| `Q` | deixar **1 unidade** no chão (vira uma pilha); segure para continuar · olhando para o estoque do mesmo item: devolve |
| `Shift` + `E` / `Shift` + `Q` | pegar/cortar **tudo** de uma vez / largar **tudo** |
| `P` | escolher planta de casa (ou use o Quadro de Projetos na parede) |
| `R` | girar o molde ao escolher o local da obra |
| `L` | mostrar/ocultar os nomes das áreas |
| `Esc` | pausar (libera o mouse) |

## Como funciona a obra

1. **Escolha uma planta** no Quadro de Projetos (ou `P`) e **posicione o molde**: ele segue a mira dentro da área verde
   (`R` gira, `E` confirma). Fica vermelho se encostar em objetos ou material largado. Depois os blocos fantasmas
   aparecem no local escolhido.
2. **Argamassa:** pegue 1 saco de cimento (Depósito 1) e 3 baldes de areia (Depósito de Areia), coloque na betoneira
   (traço 1:3), ligue, espere misturar, pegue a argamassa e despeje no **cocho** da obra.
3. **Assente:** pegue tijolos e assente nos fantasmas. Cada bloco gasta 1 porção de argamassa do cocho.
4. **Cortes:** fantasmas laranja são **meios tijolos** → corte tijolos na **cortadora** (Área de Máquinas).
   Cada `E` coloca 1 tijolo na fila da máquina; as peças prontas ficam nela até você recolher.
   Ex.: com 5 tijolos, corte só 1, largue os outros 4 no chão (`Q`) e pegue os 2 meios tijolos.
   Caibros do telhado → corte **tábuas** na **serra de esquadria** (corredor).
5. **Estoques são limitados:** cada tijolo, piso, saco, tábua ou telha pego **some da pilha** (o monte de areia vai baixando).
   Mirando no estoque aparece *"Estoque: 63 / 90"*. Quando acaba, a reposição chega sozinha depois de alguns segundos
   (`STOCK.restockTime` em `config/items.js`). O tamanho de cada estoque vem do próprio objeto (ex.: palete 3×5×6 = 90 tijolos).
6. **Sobrou material?** Aperte `Q` para deixar no chão: nada some, então meios tijolos e caibros já cortados
   ficam guardados. O tutorial lembra de usar as pilhas antes de cortar mais.
7. Etapas: fiadas → piso → estrutura do telhado → telhas. A **seta amarela** e o painel **"Próximo passo"** sempre
   mostram o que fazer.

| Fantasma | Material | Onde pegar |
|---|---|---|
| 🟦 azul | Tijolo | Depósito de Areia e Tijolos, Depósito 2 |
| 🟧 laranja | Meio tijolo | Cortadora (corta tijolos) |
| 🟩 verde | Piso | Depósito 2, Depósito de Canos |
| 🟪 lilás | Caibro | Serra de esquadria (corta tábuas do Depósito de Canos) |
| ⬜ cinza | Telha | Depósito de Canos |

## Estrutura de pastas

```
ProjetoReplica/
├── index.html                  # Página: canvas, HUD, tutorial, seletor de plantas, tela inicial
├── css/
│   ├── main.css                # Importa os outros arquivos CSS
│   ├── base.css                # Variáveis (cores, fontes) e reset
│   └── components/             # start-screen, hud (+ painel do tutorial), plan-selector
├── src/
│   ├── main.js                 # Ponto de entrada: liga todas as peças
│   ├── config/                 # ★ DADOS — edite aqui sem mexer na lógica
│   │   ├── settings.js         # Velocidade, teclas, alcance da mira, qualidade gráfica
│   │   ├── layout.js           # A sala: paredes, portas, áreas, objetos, local da obra
│   │   ├── items.js            # Itens, capacidade, receitas da betoneira e das máquinas
│   │   └── housePlans.js       # Plantas de casa que o aluno pode construir
│   ├── core/App.js             # Renderer, cenas, câmera e loop
│   ├── controls/               # Teclado, MouseLook (câmera sem "pulos") e personagem
│   ├── physics/                # Colisão
│   ├── materials/              # Texturas (canvas) e materiais
│   ├── world/                  # VISUAL da sala (montada a partir do layout)
│   │   └── objects/            # Um arquivo por objeto, por categoria
│   ├── gameplay/               # FUNÇÃO das coisas
│   │   ├── Game.js             # Liga tudo da jogabilidade
│   │   ├── Inventory.js        # O que o personagem carrega
│   │   ├── InteractionSystem.js# Mira + tecla E
│   │   ├── HeldItemView.js     # Item aparecendo na mão
│   │   ├── DroppedItems.js     # Pilhas de itens largadas no chão
│   │   ├── items/              # Aparência dos itens (assentados, fantasmas, na mão)
│   │   ├── stations/           # Estoques, betoneira, cortadoras, cocho, quadro, pilhas no chão
│   │   ├── building/           # PlanGenerator (planta → fiadas), PlacementMode (molde) e BuildSite (obra)
│   │   └── tutorial/           # TutorialGuide (próximo passo + seta amarela)
│   ├── ui/                     # StartScreen, HUD, TutorialPanel, PlanSelector
│   └── utils/                  # Formas, paredes, placas, aleatório, eventos
└── assets/
    ├── reference/              # Planta baixa e fotos reais da sala
    ├── textures/               # Texturas reais (futuro)
    └── models/                 # Modelos .glb/.gltf (futuro)
```

### Regras da arquitetura

- **Dados × código:** tudo que é "conteúdo" (sala, itens, receitas, plantas) fica em `src/config/`.
- **Visual × função:** `world/` só desenha; `gameplay/` dá função aos objetos pelo `type` deles.
- **Um objeto/estação por arquivo**, registrado num `index.js`.
- **Materiais sempre via `Materials`** — assim são reaproveitados.
- **`main.js` não tem lógica**, só conecta os módulos.

## Receitas rápidas para o grupo

### Nova planta de casa
Adicione em `src/config/housePlans.js` (medidas múltiplas de 0,2 m):
```js
{
  id: 'garagem', name: 'Garagem', difficulty: 'Intermediário', description: '...',
  shape: 'room', width: 3.2, depth: 4.0, rows: 10,
  openings: [{ wall: 'front', offset: 0.4, width: 2.4, fromRow: 0, toRow: 9 }],
  floor: true, roof: true,
}
```
Ela aparece sozinha no Quadro de Projetos, com lista de materiais e desenho.

### Novo material para buscar
1. Item em `config/items.js` → `ITEMS`
2. Objeto visual em `world/objects/` + registro em `world/objects/index.js`
3. Em `gameplay/stations/index.js`: `meuObjeto: source('meuItem')`
4. Posicione em `config/layout.js`

### Nova máquina de corte
Adicione uma receita em `CUTTING_RECIPES` (`config/items.js`) com o `type` da máquina e
registre `cutter(CUTTING_RECIPES.minhaMaquina)` em `gameplay/stations/index.js`.
Para a lâmina girar, dê `name = 'blade'` a ela no arquivo do objeto.

### Novo objeto decorativo
1. Crie `src/world/objects/<categoria>/MeuObjeto.js` exportando `createMeuObjeto(options) → THREE.Group`
2. Registre em `src/world/objects/index.js`
3. Posicione em `src/config/layout.js → objects`: `{ type: 'meuObjeto', position: [x, z], rotation: 90 }`

## Coordenadas da planta

Metros, vistas de cima, origem no canto superior esquerdo do depósito de areia:
`x` cresce para a direita e `z` cresce em direção ao corredor de entrada.
As medidas foram estimadas a partir da planta desenhada — com uma trena, é só corrigir o `layout.js`.

## Próximos passos (ideias)

- Salvar o progresso da obra (localStorage)
- Sons (betoneira, serra, tijolo sendo assentado)
- Ferramentas: prumo e nível como itens para "conferir" a parede
- Modo professor: escolher plantas e ver o tempo de cada aluno
- Trocar texturas geradas por fotos reais e importar modelos `.glb`
