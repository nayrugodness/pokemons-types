const pokemonRoutes = require("./pokemon/pokemon.routes");

const registerModules = (app) => {
  app.use("/api/pokemons", pokemonRoutes);
};

module.exports = { registerModules };
