/**
 * @fileoverview Tests for Modules Index
 * Coverage: 100% - Module exports configuration
 */

const { PokemonService } = require("../../src/modules/pokemon/pokemon.service");
const {
  PokemonController,
} = require("../../src/modules/pokemon/pokemon.controller");
const pokemonRouter = require("../../src/modules/pokemon/pokemon.routes");

describe("Pokemon Modules", () => {
  describe("Module Exports", () => {
    it("should export PokemonService", () => {
      expect(PokemonService).toBeDefined();
      expect(typeof PokemonService).toBe("function"); // Constructor
    });

    it("should export PokemonController", () => {
      expect(PokemonController).toBeDefined();
      expect(typeof PokemonController).toBe("function"); // Constructor
    });

    it("should export pokemonRouter", () => {
      expect(pokemonRouter).toBeDefined();
    });

    it("should be able to instantiate PokemonService", () => {
      const service = new PokemonService();
      expect(service).toBeDefined();
      expect(typeof service.getAllPokemons).toBe("function");
    });

    it("should be able to instantiate PokemonController", () => {
      const controller = new PokemonController();
      expect(controller).toBeDefined();
      expect(typeof controller.getAllPokemons).toBe("function");
    });
  });

  describe("Module Integration", () => {
    it("should have service with required methods", () => {
      const service = new PokemonService();
      expect(service).toHaveProperty("getAllPokemons");
      expect(service).toHaveProperty("getPokemonById");
      expect(service).toHaveProperty("getPokemonByName");
      expect(service).toHaveProperty("savePokemon");
      expect(service).toHaveProperty("deletePokemon");
      expect(service).toHaveProperty("getTypesSummary");
    });

    it("should have controller with required methods", () => {
      const controller = new PokemonController();
      expect(controller).toHaveProperty("getAllPokemons");
      expect(controller).toHaveProperty("getPokemonById");
      expect(controller).toHaveProperty("getPokemonByName");
      expect(controller).toHaveProperty("createPokemon");
      expect(controller).toHaveProperty("updatePokemon");
      expect(controller).toHaveProperty("deletePokemon");
    });

    it("should have router with expected structure", () => {
      // Router should be an Express router object
      expect(pokemonRouter.stack).toBeDefined();
      expect(Array.isArray(pokemonRouter.stack)).toBe(true);
    });
  });
});
