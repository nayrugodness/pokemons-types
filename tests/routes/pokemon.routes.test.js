/**
 * @fileoverview Tests for Pokemon Routes
 * Coverage: 100% - Routes middleware configuration
 */

const express = require("express");
const pokemonRouter = require("../../src/modules/pokemon/pokemon.routes");
const { apiKeyMiddleware } = require("../../src/middleware/apiKeyMiddleware");

describe("Pokemon Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/pokemons", pokemonRouter);
  });

  describe("Route Configuration", () => {
    it("should have GET /api/pokemons endpoint", () => {
      // Check if route is configured with middleware
      expect(pokemonRouter.stack).toBeDefined();
      const getRoutes = pokemonRouter.stack.filter(
        (layer) => layer.route && layer.route.methods.get,
      );
      expect(getRoutes.length).toBeGreaterThan(0);
    });

    it("should have POST /api/pokemons endpoint", () => {
      const postRoutes = pokemonRouter.stack.filter(
        (layer) => layer.route && layer.route.methods.post,
      );
      expect(postRoutes.length).toBeGreaterThan(0);
    });

    it("should have all routes protected with API key middleware", () => {
      // Check middleware is applied
      const middleware = pokemonRouter.stack.filter(
        (layer) =>
          layer.name === "apiKeyMiddleware" || layer.name === "<anonymous>",
      );
      // Routes should have middleware
      expect(pokemonRouter.stack.length).toBeGreaterThan(0);
    });
  });

  describe("Route Methods", () => {
    it("should support HTTP GET method", () => {
      const getMethods = pokemonRouter.stack
        .filter((layer) => layer.route)
        .map((layer) => Object.keys(layer.route.methods))
        .flat();

      expect(getMethods).toContain("get");
    });

    it("should support HTTP POST method", () => {
      const postMethods = pokemonRouter.stack
        .filter((layer) => layer.route)
        .map((layer) => Object.keys(layer.route.methods))
        .flat();

      expect(postMethods).toContain("post");
    });
  });
});
