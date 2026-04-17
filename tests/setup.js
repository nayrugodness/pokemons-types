/**
 * Jest setup file
 * Runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PROCESS_API_KEY = "test_secret_key_12345";

// Suppress console output during tests unless VERBOSE is set
if (!process.env.VERBOSE) {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };
}
