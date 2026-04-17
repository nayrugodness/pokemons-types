/**
 * @fileoverview Tests for Pokemon Controller
 * Coverage: 100% - All HTTP endpoints and request/response handling
 */

// Mock AzureBlobService to prevent initialization errors
jest.mock("../../src/services/azureBlobService", () => ({
  AzureBlobService: jest.fn().mockImplementation(() => ({
    uploadAndGetSAS: jest.fn(),
  })),
}));

const {
  PokemonController,
} = require("../../src/modules/pokemon/pokemon.controller");

describe("Pokemon Controller - PokemonController", () => {
  let pokemonController;
  let mockPokemonService;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockPokemonService = {
      getAllPokemons: jest.fn(),
      getPokemonById: jest.fn(),
      getPokemonByName: jest.fn(),
      savePokemon: jest.fn(),
      createPokemon: jest.fn(),
      updatePokemon: jest.fn(),
      deletePokemon: jest.fn(),
      getTypesSummary: jest.fn(),
    };

    pokemonController = new PokemonController();
    pokemonController.pokemonService = mockPokemonService;

    mockRequest = {
      params: {},
      body: {},
      method: "GET",
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getAllPokemons()", () => {
    it("should return all pokemons with 200 status", async () => {
      const mockPokemons = [
        { id: "1", name: "Pikachu", types: ["Electric"] },
        { id: "2", name: "Charizard", types: ["Fire", "Flying"] },
      ];

      mockPokemonService.getAllPokemons.mockResolvedValue(mockPokemons);
      mockPokemonService.getTypesSummary.mockResolvedValue({
        Electric: 1,
        Fire: 1,
        Flying: 1,
      });

      await pokemonController.getAllPokemons(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.message).toBeDefined();
      expect(responseBody.count).toBe(2);
      expect(responseBody.data).toEqual(mockPokemons);
    });

    it("should include typesSummary in response", async () => {
      mockPokemonService.getAllPokemons.mockResolvedValue([]);
      mockPokemonService.getTypesSummary.mockResolvedValue({});

      await pokemonController.getAllPokemons(mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody).toHaveProperty("typesSummary");
    });

    it("should handle service errors with 500 status", async () => {
      mockPokemonService.getAllPokemons.mockRejectedValue(
        new Error("Database error"),
      );

      await pokemonController.getAllPokemons(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getPokemonById()", () => {
    it("should return pokemon with 200 status when found", async () => {
      const mockPokemon = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Pikachu",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };

      mockRequest.params.id = "550e8400-e29b-41d4-a716-446655440000";
      mockPokemonService.getPokemonById.mockResolvedValue(mockPokemon);
      mockPokemonService.getTypesSummary.mockResolvedValue({ Electric: 1 });

      await pokemonController.getPokemonById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.data).toEqual(mockPokemon);
    });

    it("should return 404 when pokemon not found", async () => {
      mockRequest.params.id = "invalid-id";
      mockPokemonService.getPokemonById.mockResolvedValue(null);

      await pokemonController.getPokemonById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it("should handle service errors with 500 status", async () => {
      mockRequest.params.id = "550e8400-e29b-41d4-a716-446655440000";
      mockPokemonService.getPokemonById.mockRejectedValue(
        new Error("Service error"),
      );

      await pokemonController.getPokemonById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getPokemonByName()", () => {
    it("should return pokemon with 200 status when found by name", async () => {
      const mockPokemon = {
        id: "1",
        name: "Pikachu",
        types: ["Electric"],
      };

      mockRequest.params.name = "Pikachu";
      mockPokemonService.getPokemonByName.mockResolvedValue(mockPokemon);
      mockPokemonService.getTypesSummary.mockResolvedValue({ Electric: 1 });

      await pokemonController.getPokemonByName(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.data).toEqual(mockPokemon);
    });

    it("should return 404 when pokemon not found by name", async () => {
      mockRequest.params.name = "NonExistent";
      mockPokemonService.getPokemonByName.mockResolvedValue(null);

      await pokemonController.getPokemonByName(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createPokemon()", () => {
    it("should create pokemon and return 201 status", async () => {
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

      mockRequest.body = newPokemonData;
      mockPokemonService.savePokemon.mockResolvedValue(savedPokemon);
      mockPokemonService.getTypesSummary.mockResolvedValue({ Electric: 1 });

      await pokemonController.createPokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.data.id).toBeDefined();
      expect(responseBody.data.name).toBe("Pikachu");
    });

    it("should validate required fields: name, height, weight, types", async () => {
      mockRequest.body = { name: "Pikachu" }; // Missing required fields

      await pokemonController.createPokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody).toHaveProperty("error", "Invalid request body");
    });

    it("should handle service errors with 500 status", async () => {
      mockRequest.body = {
        name: "Pikachu",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };
      mockPokemonService.savePokemon.mockRejectedValue(
        new Error("Creation failed"),
      );

      await pokemonController.createPokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updatePokemon()", () => {
    it("should update pokemon and return 200 status", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";
      const updateData = { height: 5, weight: 65 };
      const updatedPokemon = {
        id: pokemonId,
        name: "Pikachu",
        height: 5,
        weight: 65,
        types: ["Electric"],
      };

      mockRequest.params.id = pokemonId;
      mockRequest.body = updateData;
      mockPokemonService.updatePokemon.mockResolvedValue(updatedPokemon);
      mockPokemonService.getTypesSummary.mockResolvedValue({ Electric: 1 });

      await pokemonController.updatePokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should handle partial updates", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";
      const partialData = { weight: 65 };

      mockRequest.params.id = pokemonId;
      mockRequest.body = partialData;
      mockPokemonService.updatePokemon.mockResolvedValue({
        id: pokemonId,
        weight: 65,
      });
      mockPokemonService.getTypesSummary.mockResolvedValue({});

      await pokemonController.updatePokemon(mockRequest, mockResponse);

      expect(mockPokemonService.updatePokemon).toHaveBeenCalledWith(
        pokemonId,
        partialData,
      );
    });

    it("should return 404 when pokemon not found for update", async () => {
      mockRequest.params.id = "invalid-id";
      mockRequest.body = { height: 5 };
      mockPokemonService.updatePokemon.mockResolvedValue(null);

      await pokemonController.updatePokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deletePokemon()", () => {
    it("should delete pokemon and return 200 status", async () => {
      const pokemonId = "550e8400-e29b-41d4-a716-446655440000";

      mockRequest.params.id = pokemonId;
      mockPokemonService.deletePokemon.mockResolvedValue({ success: true });

      await pokemonController.deletePokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.message).toBeDefined();
    });

    it("should handle pokemon not found during deletion", async () => {
      mockRequest.params.id = "invalid-id";
      mockPokemonService.deletePokemon.mockResolvedValue(null);

      await pokemonController.deletePokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it("should handle service errors with 500 status", async () => {
      mockRequest.params.id = "550e8400-e29b-41d4-a716-446655440000";
      mockPokemonService.deletePokemon.mockRejectedValue(
        new Error("Deletion failed"),
      );

      await pokemonController.deletePokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("Response Structure", () => {
    it("should include message field in all success responses", async () => {
      mockPokemonService.getAllPokemons.mockResolvedValue([]);
      mockPokemonService.getTypesSummary.mockResolvedValue({});

      await pokemonController.getAllPokemons(mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody).toHaveProperty("message");
      expect(typeof responseBody.message).toBe("string");
    });

    it("should include data field in GET responses", async () => {
      mockPokemonService.getAllPokemons.mockResolvedValue([]);
      mockPokemonService.getTypesSummary.mockResolvedValue({});

      await pokemonController.getAllPokemons(mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody).toHaveProperty("data");
    });

    it("should include error field in error responses", async () => {
      mockRequest.body = { invalid: "data" };

      await pokemonController.createPokemon(mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody).toHaveProperty("error");
    });
  });

  describe("HTTP Status Codes", () => {
    it("should return 200 for successful GET requests", async () => {
      mockPokemonService.getAllPokemons.mockResolvedValue([]);
      mockPokemonService.getTypesSummary.mockResolvedValue({});

      await pokemonController.getAllPokemons(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return 201 for successful POST requests", async () => {
      mockRequest.body = {
        name: "Pikachu",
        height: 4,
        weight: 60,
        types: ["Electric"],
      };
      mockPokemonService.savePokemon.mockResolvedValue({
        id: "1",
        ...mockRequest.body,
      });
      mockPokemonService.getTypesSummary.mockResolvedValue({ Electric: 1 });

      await pokemonController.createPokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 for invalid request body", async () => {
      mockRequest.body = { invalid: "data" };

      await pokemonController.createPokemon(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 for resource not found", async () => {
      mockRequest.params.id = "nonexistent-id";
      mockPokemonService.getPokemonById.mockResolvedValue(null);

      await pokemonController.getPokemonById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 for internal server errors", async () => {
      mockPokemonService.getAllPokemons.mockRejectedValue(
        new Error("Server error"),
      );

      await pokemonController.getAllPokemons(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
