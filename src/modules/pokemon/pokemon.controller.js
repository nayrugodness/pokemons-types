const { PokemonService } = require("./pokemon.service");
const { AzureBlobService } = require("../../services/azureBlobService");

class PokemonController {
  constructor() {
    this.pokemonService = new PokemonService();
    try {
      this.azureBlobService = new AzureBlobService();
      console.log("✅ Azure Blob Service initialized");
    } catch (error) {
      console.warn("⚠️ Azure Blob Service not available:", error.message);
      this.azureBlobService = null;
    }
  }

  /**
   * Save a new pokemon search
   */
  async createPokemon(req, res) {
    try {
      const { name, height, weight, types } = req.body;

      // Validation
      if (!name || typeof height !== "number" || typeof weight !== "number") {
        return res.status(400).json({
          error: "Invalid request body",
          required: ["name", "height", "weight"],
        });
      }

      const pokemon = await this.pokemonService.savePokemon(
        name,
        height,
        weight,
        types || [],
      );

      // Get types summary
      const typesSummary = await this.pokemonService.getTypesSummary();

      const response = {
        message: "Pokemon search saved successfully",
        data: pokemon,
        typesSummary,
      };

      // Upload to Azure if service is available
      if (this.azureBlobService) {
        try {
          const sasUrl = await this.azureBlobService.uploadAndGetSAS(
            typesSummary,
            `pokemon-types-${Date.now()}.json`,
          );
          response.azureBlobSASUrl = sasUrl;
          response.sasUrlExpires = "1 hour";
          console.log("✅ Uploaded to Azure Blob Storage");
        } catch (azureError) {
          console.warn("⚠️ Azure upload failed:", azureError.message);
        }
      }

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /**
   * Get all saved pokemons
   */
  async getAllPokemons(req, res) {
    try {
      const pokemons = await this.pokemonService.getAllPokemons();

      // Get types summary
      const typesSummary = await this.pokemonService.getTypesSummary();

      const response = {
        message: "Pokemons retrieved successfully",
        count: pokemons.length,
        data: pokemons,
        typesSummary,
      };

      // Upload to Azure if service is available
      if (this.azureBlobService) {
        try {
          const sasUrl = await this.azureBlobService.uploadAndGetSAS(
            typesSummary,
            `pokemon-types-all-${Date.now()}.json`,
          );
          response.azureBlobSASUrl = sasUrl;
          response.sasUrlExpires = "1 hour";
          console.log("✅ Uploaded to Azure Blob Storage");
        } catch (azureError) {
          console.warn("⚠️ Azure upload failed:", azureError.message);
        }
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /**
   * Get pokemon by ID
   */
  async getPokemonById(req, res) {
    try {
      const { id } = req.params;
      const pokemon = await this.pokemonService.getPokemonById(id);

      if (!pokemon) {
        return res.status(404).json({
          error: "Pokemon not found",
        });
      }

      // Get types summary
      const typesSummary = await this.pokemonService.getTypesSummary();

      const response = {
        message: "Pokemon retrieved successfully",
        data: pokemon,
        typesSummary,
      };

      // Upload to Azure if service is available
      if (this.azureBlobService) {
        try {
          const sasUrl = await this.azureBlobService.uploadAndGetSAS(
            typesSummary,
            `pokemon-types-id-${id}-${Date.now()}.json`,
          );
          response.azureBlobSASUrl = sasUrl;
          response.sasUrlExpires = "1 hour";
          console.log("✅ Uploaded to Azure Blob Storage");
        } catch (azureError) {
          console.warn("⚠️ Azure upload failed:", azureError.message);
        }
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /**
   * Get pokemon by name
   */
  async getPokemonByName(req, res) {
    try {
      const { name } = req.params;
      const pokemon = await this.pokemonService.getPokemonByName(name);

      if (!pokemon) {
        return res.status(404).json({
          error: "Pokemon not found",
        });
      }

      // Get types summary
      const typesSummary = await this.pokemonService.getTypesSummary();

      const response = {
        message: "Pokemon retrieved successfully",
        data: pokemon,
        typesSummary,
      };

      // Upload to Azure if service is available
      if (this.azureBlobService) {
        try {
          const sasUrl = await this.azureBlobService.uploadAndGetSAS(
            typesSummary,
            `pokemon-types-name-${name}-${Date.now()}.json`,
          );
          response.azureBlobSASUrl = sasUrl;
          response.sasUrlExpires = "1 hour";
          console.log("✅ Uploaded to Azure Blob Storage");
        } catch (azureError) {
          console.warn("⚠️ Azure upload failed:", azureError.message);
        }
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /**
   * Delete pokemon
   */
  async deletePokemon(req, res) {
    try {
      const { id } = req.params;
      const success = await this.pokemonService.deletePokemon(id);

      if (!success) {
        return res.status(404).json({
          error: "Pokemon not found",
        });
      }

      res.status(200).json({
        message: "Pokemon deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  /**
   * Update pokemon
   */
  async updatePokemon(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const pokemon = await this.pokemonService.updatePokemon(id, updateData);

      if (!pokemon) {
        return res.status(404).json({
          error: "Pokemon not found",
        });
      }

      // Get types summary
      const typesSummary = await this.pokemonService.getTypesSummary();

      const response = {
        message: "Pokemon updated successfully",
        data: pokemon,
        typesSummary,
      };

      // Upload to Azure if service is available
      if (this.azureBlobService) {
        try {
          const sasUrl = await this.azureBlobService.uploadAndGetSAS(
            typesSummary,
            `pokemon-types-updated-${Date.now()}.json`,
          );
          response.azureBlobSASUrl = sasUrl;
          response.sasUrlExpires = "1 hour";
          console.log("✅ Uploaded to Azure Blob Storage");
        } catch (azureError) {
          console.warn("⚠️ Azure upload failed:", azureError.message);
        }
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
}

module.exports = { PokemonController };
