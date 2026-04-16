/**
 * API Key Middleware
 * Validates x-api-key header against PROCESS_API_KEY environment variable
 */
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const expectedApiKey = process.env.PROCESS_API_KEY;

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing x-api-key header",
    });
  }

  // Check if API key matches
  if (apiKey !== expectedApiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid x-api-key",
    });
  }

  // API key is valid, proceed to next middleware/route
  next();
};

module.exports = { apiKeyMiddleware };
