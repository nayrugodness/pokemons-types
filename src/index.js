require("reflect-metadata");
require("dotenv").config();

// Environment Diagnostics
console.log("🛠️ ENV_CHECK:", {
  port: process.env.PORT || "8080",
  host: process.env.DB_HOST?.split("@").pop(),
  apiKey: process.env.PROCESS_API_KEY ? "DEFINED" : "MISSING",
  node: process.version,
  dir: __dirname,
});

const express = require("express");
const { AppDataSource } = require("./database/dataSource");
const { registerModules } = require("./modules");
const { errorHandler } = require("./middleware/errorHandler");

// Logging utilities
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
};

const app = express();
const PORT = process.env.PORT || 8080;

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
    logger.success("Database initialized successfully");

    // Register modules
    registerModules(app);
    logger.success("Modules registered successfully");

    // Request logging middleware
    app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      logger.info(`[${timestamp}] ${req.method} ${req.path}`);
      next();
    });

    // 404 handler - MUST be after module routes
    app.use((req, res) => {
      res.status(404).json({
        error: "Route not found",
        path: req.path,
        method: req.method,
      });
    });

    // Global error handling middleware - MUST be last
    app.use(errorHandler);

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      logger.success(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Pokemon API: http://localhost:${PORT}/api/pokemons`);
      logger.info(
        `Database: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}`,
      );
    });
  } catch (error) {
    logger.error("Application initialization failed");
    logger.error(error.message);
    process.exit(1);
  }
};

initializeApp();
