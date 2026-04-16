const { EntitySchema } = require("typeorm");

const PokemonEntity = new EntitySchema({
  name: "PokemonEntity",
  tableName: "pokemons",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    height: {
      type: "integer",
      nullable: false,
    },
    weight: {
      type: "integer",
      nullable: false,
    },
    types: {
      type: "text",
      array: true,
      default: "{}",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  indices: [
    {
      name: "idx_pokemon_name",
      columns: ["name"],
    },
  ],
});

module.exports = { PokemonEntity };
