const { AppDataSource } = require("../../database/dataSource");

class PokemonService {
  constructor() {
    this.pokemonRepository = AppDataSource.getRepository("PokemonEntity");
  }

  /**
   * Save a pokemon search record
   */
  async savePokemon(name, height, weight, types = []) {
    const pokemon = {
      name,
      height,
      weight,
      types,
    };

    return this.pokemonRepository.save(pokemon);
  }

  /**
   * Get all saved pokemon searches
   */
  async getAllPokemons() {
    return this.pokemonRepository.find({
      order: {
        createdAt: "DESC",
      },
    });
  }

  /**
   * Get pokemon by ID
   */
  async getPokemonById(id) {
    return this.pokemonRepository.findOne({
      where: { id },
    });
  }

  /**
   * Get pokemon by name, save if not exists
   */
  async getPokemonByName(name) {
    let pokemon = await this.pokemonRepository.findOne({
      where: { name },
    });

    // If pokemon doesn't exist, create a placeholder entry with the name and types
    if (!pokemon) {
      pokemon = await this.savePokemon(name, 0, 0, []);
    }

    return pokemon;
  }

  /**
   * Get summary of pokemon types from database
   * Returns object with type counts: { "Electric": 2, "Water": 1, ... }
   */
  async getTypesSummary() {
    try {
      const query = `
        SELECT unnest(types) as type, COUNT(*) as count
        FROM pokemons
        WHERE types IS NOT NULL AND array_length(types, 1) > 0
        GROUP BY type
        ORDER BY count DESC
      `;

      const results = await AppDataSource.query(query);

      // Transform results into object { type: count, ... }
      const summary = {};
      results.forEach((row) => {
        summary[row.type] = parseInt(row.count, 10);
      });

      return summary;
    } catch (error) {
      console.error("Error getting types summary:", error);
      return {};
    }
  }

  /**
   * Get pokemon with types summary
   * Returns pokemon data + types summary
   */
  async getPokemonWithSummary(pokemon) {
    if (!pokemon) {
      return null;
    }

    const typesSummary = await this.getTypesSummary();

    return {
      pokemon,
      typesSummary,
    };
  }

  /**
   * Delete pokemon record
   */
  async deletePokemon(id) {
    const result = await this.pokemonRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Update pokemon record
   */
  async updatePokemon(id, updateData) {
    await this.pokemonRepository.update(id, updateData);
    return this.getPokemonById(id);
  }
}

module.exports = { PokemonService };
