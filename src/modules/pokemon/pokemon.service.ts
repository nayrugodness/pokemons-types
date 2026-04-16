import { Repository } from "typeorm";
import { PokemonEntity } from "../database/entities/PokemonEntity";
import { AppDataSource } from "../database/dataSource";

export class PokemonService {
  private pokemonRepository: Repository<PokemonEntity>;

  constructor() {
    this.pokemonRepository = AppDataSource.getRepository(PokemonEntity);
  }

  /**
   * Save a pokemon search record
   */
  async savePokemon(
    name: string,
    height: number,
    weight: number,
    types: string[],
  ): Promise<PokemonEntity> {
    const pokemon = new PokemonEntity({
      name,
      height,
      weight,
      types,
    });

    return this.pokemonRepository.save(pokemon);
  }

  /**
   * Get all saved pokemon searches
   */
  async getAllPokemons(): Promise<PokemonEntity[]> {
    return this.pokemonRepository.find({
      order: {
        createdAt: "DESC",
      },
    });
  }

  /**
   * Get pokemon by ID
   */
  async getPokemonById(id: string): Promise<PokemonEntity | null> {
    return this.pokemonRepository.findOne({
      where: { id },
    });
  }

  /**
   * Get pokemon by name
   */
  async getPokemonByName(name: string): Promise<PokemonEntity | null> {
    return this.pokemonRepository.findOne({
      where: { name },
    });
  }

  /**
   * Delete pokemon record
   */
  async deletePokemon(id: string): Promise<boolean> {
    const result = await this.pokemonRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Update pokemon record
   */
  async updatePokemon(
    id: string,
    updateData: Partial<PokemonEntity>,
  ): Promise<PokemonEntity | null> {
    await this.pokemonRepository.update(id, updateData);
    return this.getPokemonById(id);
  }
}
