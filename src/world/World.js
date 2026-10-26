import { createLighting } from './Lighting.js';
import { buildStructure } from './Structure.js';
import { Zones } from './Zones.js';
import { OBJECT_FACTORIES } from './objects/index.js';

/**
 * Monta a sala inteira a partir do LAYOUT (src/config/layout.js).
 * Não tem nenhuma medida "fixa" aqui: tudo vem dos dados.
 * O World só cuida do VISUAL — a jogabilidade (src/gameplay) usa `objects`
 * para dar função a cada objeto.
 */
export class World {
  constructor(scene, collision) {
    this.scene = scene;
    this.collision = collision;
    this.zones = null;
    this.structure = null;
    this.objects = []; // [{ type, object }]
  }

  build(layout) {
    this.scene.add(createLighting(layout));

    const structure = buildStructure(layout);
    this.structure = structure.group;
    this.scene.add(structure.group);
    structure.colliders.forEach((piece) => this.collision.addObject(piece));

    this.zones = new Zones(layout.zones);
    this.scene.add(this.zones.group);

    for (const definition of layout.objects) this.placeObject(definition);
  }

  placeObject({ type, position, rotation = 0, options = {}, solid = true }) {
    const factory = OBJECT_FACTORIES[type];
    if (!factory) {
      console.warn(`[World] Tipo de objeto desconhecido: "${type}". Registre-o em src/world/objects/index.js`);
      return null;
    }

    const object = factory(options);
    object.name = type;
    if (position) object.position.set(position[0], 0, position[1]);
    object.rotation.y = (rotation * Math.PI) / 180;

    this.scene.add(object);
    if (solid) this.collision.addObject(object);
    this.objects.push({ type, object });
    return object;
  }
}
