require("reflect-metadata");
require("dotenv").config();

const express = require("express");
const { AppDataSource } = require("./database/dataSource");
const { registerModules } = require("./modules");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Pokemon Search API",
    status: "OK",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      pokemons: "/api/pokemons",
    },
  });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log("✅ Database initialized successfully");

    // Register modules
    registerModules(app);
    console.log("✅ Modules registered successfully");

    // 404 handler - MUST be after module routes
    app.use((req, res) => {
      res.status(404).json({
        error: "Route not found",
        path: req.path,
        method: req.method,
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(
        `📊 Health check available at http://localhost:${PORT}/health`,
      );
      console.log(
        `🎮 Pokemon API available at http://localhost:${PORT}/api/pokemons`,
      );
    });
  } catch (error) {
    console.error("❌ Error initializing application:", error);
    process.exit(1);
  }
};

initializeApp();
