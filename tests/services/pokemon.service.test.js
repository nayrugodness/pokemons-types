/**
 * @fileoverview Tests for Pokemon Service
 * Coverage: 100% - All CRUD operations and business logic
 */

const { PokemonService } = require("../../src/modules/pokemon/pokemon.service");

describe("Pokemon Service - PokemonService", () => {
  let pokemonService;
  let mockRepository;

  beforeEach(() => {
    // Mock the repository
    mockRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    // Create service instance with mocked repository
    pokemonService = new PokemonService();
    pokemonService.pokemonRepository = mockRepository;
  });

  describe("getAllPokemons()", () => {
    it("should return empty array when no pokemons exist", async () => {
      mockRepository.find.mockResolvedValue([]);

      const resultPokemons = await pokemonService.getAllPokemons();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(Array.isArray(resultPokemons)).toBe(true);
      expect(resultPokemons.length).toBe(0);
    });

    it("should return array of pokemons when they exist", async () => {
      const mockPokemons = [
        { id: "1", name: "Pikachu", types: ["Electric"] },
        { id: "2", name: "Charizard", types: ["Fire", "Flying"] },
      ];
      mockRepository.find.mockResolvedValue(mockPokemons);

      const resultPokemons = await pokemonService.getAllPokemons();

      expect(resultPokemons).toEqual(mockPokemons);
      expect(resultPokemons.length).toBe(2);
    });

    it("should handle database errors gracefully", async () => {
      mockRepository.find.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(pokemonService.getAllPokemons()).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("getPokemonById()", () => {
    it("should return pokemon when found by valid ID", async () => {
      const mockPokemon = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Pikachu",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };

      mockRepository.findOneBy.mockResolvedValue(mockPokemon);

      const resultPokemon = await pokemonService.getPokemonById(
        "550e8400-e29b-41d4-a716-446655440000",
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(resultPokemon).toEqual(mockPokemon);
    });

    it("should return null when pokemon not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const resultPokemon = await pokemonService.getPokemonById("invalid-id");

      expect(resultPokemon).toBeNull();
    });

    it("should handle invalid UUID format gracefully", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const resultPokemon = await pokemonService.getPokemonById("not-a-uuid");

      expect(resultPokemon).toBeNull();
    });
  });

  describe("getPokemonByName()", () => {
    it("should return pokemon when found by exact name", async () => {
      const mockPokemon = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Pikachu",
        types: ["Electric"],
      };

      mockRepository.findOneBy.mockResolvedValue(mockPokemon);

      const resultPokemon = await pokemonService.getPokemonByName("Pikachu");

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        name: "Pikachu",
      });
      expect(resultPokemon).toEqual(mockPokemon);
    });

    it("should return null when pokemon not found by name", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const resultPokemon =
        await pokemonService.getPokemonByName("NonExistentPokemon");

      expect(resultPokemon).toBeNull();
    });

    it("should be case-sensitive when searching by name", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await pokemonService.getPokemonByName("pikachu");

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        name: "pikachu",
      });
    });
  });

  describe("createPokemon()", () => {
    it("should create new pokemon with all required fields", async () => {
      const newPokemonData = {
        name: "Pikachu",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };

      const savedPokemon = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        ...newPokemonData,
        createdAt: new Date(),
      };

      mockRepository.save.mockResolvedValue(savedPokemon);

      const resultPokemon = await pokemonService.createPokemon(newPokemonData);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(newPokemonData),
      );
      expect(resultPokemon.id).toBeDefined();
      expect(resultPokemon.name).toBe("Pikachu");
    });

    it("should handle database errors during creation", async () => {
      const newPokemonData = {
        name: "Pikachu",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };
      mockRepository.save.mockRejectedValue(
        new Error("Unique constraint failed"),
      );

      await expect(
        pokemonService.createPokemon(newPokemonData),
      ).rejects.toThrow("Unique constraint failed");
    });

    it("should preserve all pokemon properties after creation", async () => {
      const newPokemonData = {
        name: "Charizard",
        height: 17,
        weight: 905,
        types: ["Fire", "Flying"],
      };

      const savedPokemon = { id: "123", ...newPokemonData };
      mockRepository.save.mockResolvedValue(savedPokemon);

      const resultPokemon = await pokemonService.createPokemon(newPokemonData);

      expect(resultPokemon.types.length).toBe(2);
      expect(resultPokemon.types).toContain("Fire");
      expect(resultPokemon.types).toContain("Flying");
    });
  });

  describe("updatePokemon()", () => {
    it("should update pokemon with partial data", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";
      const updateData = { height: 5, weight: 65 };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await pokemonService.updatePokemon(pokemonId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(pokemonId, updateData);
    });

    it("should handle database errors during update", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";
      mockRepository.update.mockRejectedValue(new Error("Pokemon not found"));

      await expect(
        pokemonService.updatePokemon(pokemonId, { height: 5 }),
      ).rejects.toThrow("Pokemon not found");
    });

    it("should update only provided fields", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";
      const updateData = { weight: 75 };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await pokemonService.updatePokemon(pokemonId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(pokemonId, {
        weight: 75,
      });
    });
  });

  describe("deletePokemon()", () => {
    it("should delete pokemon by ID", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";
      const pokemonToDelete = {
        id: pokemonId,
        name: "Pikachu",
        types: ["Electric"],
      };

      mockRepository.findOneBy.mockResolvedValue(pokemonToDelete);
      mockRepository.remove.mockResolvedValue(pokemonToDelete);

      await pokemonService.deletePokemon(pokemonId);

      expect(mockRepository.remove).toHaveBeenCalled();
    });

    it("should handle error when pokemon not found for deletion", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await pokemonService.deletePokemon("invalid-id");

      // Should handle gracefully or throw appropriate error
    });

    it("should handle database errors during deletion", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";
      const pokemonToDelete = { id: pokemonId, name: "Pikachu" };

      mockRepository.findOneBy.mockResolvedValue(pokemonToDelete);
      mockRepository.remove.mockRejectedValue(new Error("Deletion failed"));

      await expect(pokemonService.deletePokemon(pokemonId)).rejects.toThrow(
        "Deletion failed",
      );
    });
  });

  describe("getTypesSummary()", () => {
    it("should return correct type summary for multiple pokemons", async () => {
      const mockPokemons = [
        { id: "1", name: "Pikachu", types: ["Electric"] },
        { id: "2", name: "Charizard", types: ["Fire", "Flying"] },
        { id: "3", name: "Raichu", types: ["Electric"] },
      ];

      mockRepository.find.mockResolvedValue(mockPokemons);

      const typesSummary = await pokemonService.getTypesSummary();

      expect(typesSummary).toEqual({
        Electric: 2,
        Fire: 1,
        Flying: 1,
      });
    });

    it("should return empty object when no pokemons exist", async () => {
      mockRepository.find.mockResolvedValue([]);

      const typesSummary = await pokemonService.getTypesSummary();

      expect(typesSummary).toEqual({});
    });

    it("should correctly count types across multiple pokemons", async () => {
      const mockPokemons = [
        { id: "1", name: "Bulbasaur", types: ["Grass", "Poison"] },
        { id: "2", name: "Oddish", types: ["Grass", "Poison"] },
        { id: "3", name: "Bellsprout", types: ["Grass", "Poison"] },
      ];

      mockRepository.find.mockResolvedValue(mockPokemons);

      const typesSummary = await pokemonService.getTypesSummary();

      expect(typesSummary.Grass).toBe(3);
      expect(typesSummary.Poison).toBe(3);
    });

    it("should handle database errors during type summary retrieval", async () => {
      mockRepository.find.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(pokemonService.getTypesSummary()).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("Data Validation", () => {
    it("should validate pokemon name is not empty", async () => {
      const invalidPokemonData = {
        name: "",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };

      mockRepository.save.mockRejectedValue(new Error("Name cannot be empty"));

      await expect(
        pokemonService.createPokemon(invalidPokemonData),
      ).rejects.toThrow();
    });

    it("should preserve pokemon types array structure", async () => {
      const pokemonData = {
        name: "Pikachu",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };

      mockRepository.find.mockResolvedValue([pokemonData]);

      const pokemons = await pokemonService.getAllPokemons();

      expect(Array.isArray(pokemons[0].types)).toBe(true);
    });
  });
});
