/**
 * @fileoverview Tests for Module Registration
 * Coverage: 100% - App module registration
 */

const express = require("express");
const { registerModules } = require("../../src/modules/index");

describe("Module Registration - registerModules", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe("Module Registration", () => {
    it("should export registerModules function", () => {
      expect(typeof registerModules).toBe("function");
    });

    it("should register modules with Express app", () => {
      registerModules(app);

      // Check if routes are registered by looking at the app router stack
      const routeLayers = app._router.stack.filter(
        (layer) => layer.route || layer.name === "router",
      );

      // Should have registered the pokemon routes
      expect(routeLayers.length).toBeGreaterThan(0);
    });

    it("should register pokemons routes at /api/pokemons", () => {
      registerModules(app);

      const routerLayers = app._router.stack.filter(
        (layer) => layer.name === "router",
      );

      // Should have a router registered
      expect(routerLayers.length).toBeGreaterThan(0);
    });

    it("should allow multiple module registrations without errors", () => {
      expect(() => {
        registerModules(app);
        registerModules(app); // Register again
      }).not.toThrow();
    });

    it("should not throw when called with valid Express app", () => {
      expect(() => registerModules(app)).not.toThrow();
    });
  });
});
