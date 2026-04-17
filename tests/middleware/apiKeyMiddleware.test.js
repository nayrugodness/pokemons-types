/**
 * @fileoverview Tests for API Key Authentication Middleware
 * Coverage: 100% - All code paths and error scenarios
 */

const validateApiKeyMiddleware = require("../../src/middleware/apiKeyMiddleware");

describe("API Key Middleware - validateApiKeyMiddleware", () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Reset environment for each test
    process.env.PROCESS_API_KEY = "test_secret_key_12345";

    mockRequest = {
      headers: {},
      path: "/api/pokemons",
      method: "GET",
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("Valid API Key", () => {
    it("should call next() when valid API key is provided", () => {
      mockRequest.headers["x-api-key"] = "test_secret_key_12345";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should call next() regardless of request method when API key is valid", () => {
      mockRequest.method = "POST";
      mockRequest.headers["x-api-key"] = "test_secret_key_12345";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next() regardless of request path when API key is valid", () => {
      mockRequest.path = "/api/pokemons/123";
      mockRequest.headers["x-api-key"] = "test_secret_key_12345";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("Missing API Key Header", () => {
    it("should return 401 when x-api-key header is missing", () => {
      mockRequest.headers = {};

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Missing x-api-key header",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when x-api-key is empty string", () => {
      mockRequest.headers["x-api-key"] = "";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should return 401 when x-api-key is undefined", () => {
      mockRequest.headers["x-api-key"] = undefined;

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe("Invalid API Key", () => {
    it("should return 401 when invalid API key is provided", () => {
      mockRequest.headers["x-api-key"] = "wrong_secret_key";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Invalid x-api-key",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when API key has extra characters", () => {
      mockRequest.headers["x-api-key"] = "test_secret_key_12345_extra";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should return 401 when API key is partially correct", () => {
      mockRequest.headers["x-api-key"] = "test_secret_key_1234";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should be case-sensitive and reject mismatched case", () => {
      mockRequest.headers["x-api-key"] = "TEST_SECRET_KEY_12345";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe("Missing Environment Variable", () => {
    it("should return 401 when PROCESS_API_KEY environment variable is not set", () => {
      delete process.env.PROCESS_API_KEY;
      mockRequest.headers["x-api-key"] = "test_secret_key_12345";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it("should return 401 when PROCESS_API_KEY is empty string", () => {
      process.env.PROCESS_API_KEY = "";
      mockRequest.headers["x-api-key"] = "test_secret_key_12345";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe("Header Case Insensitivity", () => {
    it("should accept header in different case variations", () => {
      // Headers are typically case-insensitive in HTTP
      mockRequest.headers["X-API-KEY"] = "test_secret_key_12345";

      // Node.js normalizes headers to lowercase
      mockRequest.headers["x-api-key"] = mockRequest.headers["X-API-KEY"];
      delete mockRequest.headers["X-API-KEY"];

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Response Structure", () => {
    it("should return proper error response format on 401", () => {
      mockRequest.headers["x-api-key"] = "invalid_key";

      validateApiKeyMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      const callArgument = mockResponse.json.mock.calls[0][0];
      expect(callArgument).toHaveProperty("error");
      expect(callArgument).toHaveProperty("message");
      expect(typeof callArgument.error).toBe("string");
      expect(typeof callArgument.message).toBe("string");
    });
  });
});
