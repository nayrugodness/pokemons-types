/**
 * Global Error Handling Middleware
 * Catches all errors and returns consistent JSON error responses
 */

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Log error with context
  const timestamp = new Date().toISOString();
  console.error(`❌ [${timestamp}] Error: ${message}`);
  console.error(`   Status: ${statusCode}`);
  console.error(`   Method: ${req.method}`);
  console.error(`   Path: ${req.path}`);
  if (process.env.NODE_ENV === "development") {
    console.error(`   Stack: ${err.stack}`);
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      timestamp,
      path: req.path,
    },
  });
};

module.exports = { errorHandler };
