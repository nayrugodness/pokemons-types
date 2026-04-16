const { Router } = require("express");
const { PokemonController } = require("./pokemon.controller");
const { apiKeyMiddleware } = require("../../middleware/apiKeyMiddleware");

const router = Router();
const pokemonController = new PokemonController();

// Apply API Key middleware to all routes
router.use(apiKeyMiddleware);

// Routes - specific routes first, dynamic routes last
router.post("/", (req, res) => pokemonController.createPokemon(req, res));
router.get("/id/:id", (req, res) => pokemonController.getPokemonById(req, res));
router.get("/name/:name", (req, res) =>
  pokemonController.getPokemonByName(req, res),
);
router.get("/", (req, res) => pokemonController.getAllPokemons(req, res));
router.put("/:id", (req, res) => pokemonController.updatePokemon(req, res));
router.delete("/:id", (req, res) => pokemonController.deletePokemon(req, res));

module.exports = router;
