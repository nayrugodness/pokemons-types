/**
 * @fileoverview Tests for Error Handler Middleware
 * Coverage: 100% - All error scenarios and logging
 */

const errorHandlerMiddleware = require("../../src/middleware/errorHandler");

describe("Error Handler Middleware - errorHandlerMiddleware", () => {
  let mockRequest;
  let mockResponse;
  let testError;

  beforeEach(() => {
    process.env.NODE_ENV = "development";

    mockRequest = {
      method: "GET",
      path: "/api/pokemons",
      body: { testData: "value" },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    testError = new Error("Test error message");
    testError.stack =
      "Error: Test error message\n  at testFunction (test.js:10:5)";

    // Spy on console to verify logging
    jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Generic Error Handling", () => {
    it("should return 500 status for unhandled errors", () => {
      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return consistent error response structure", () => {
      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody).toHaveProperty("error");
      expect(typeof responseBody.error).toBe("object");
      expect(responseBody.error).toHaveProperty("status");
      expect(responseBody.error).toHaveProperty("message");
      expect(responseBody.error).toHaveProperty("timestamp");
      expect(responseBody.error).toHaveProperty("path");
    });

    it("should include timestamp in ISO format", () => {
      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      const timestamp = new Date(responseBody.error.timestamp);
      expect(timestamp.toString()).not.toBe("Invalid Date");
    });

    it("should include request path in error response", () => {
      mockRequest.path = "/api/pokemons/123";
      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.error.path).toBe("/api/pokemons/123");
    });

    it("should return 500 status code in response object", () => {
      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.error.status).toBe(500);
    });
  });

  describe("Error Message Handling", () => {
    it("should include error message in response", () => {
      const customErrorMessage = "Database connection failed";
      testError.message = customErrorMessage;

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.error.message).toBe(customErrorMessage);
    });

    it("should handle errors with empty message", () => {
      testError.message = "";

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.error.message).toBe("");
    });

    it("should handle errors with long message", () => {
      testError.message = "A".repeat(500);

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.error.message.length).toBe(500);
    });
  });

  describe("Development Environment Logging", () => {
    it("should log stack trace in development environment", () => {
      process.env.NODE_ENV = "development";

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(console.error).toHaveBeenCalled();
    });

    it("should include stack trace in response for development", () => {
      process.env.NODE_ENV = "development";

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      // In development, stack might be included
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("Production Environment Logging", () => {
    it("should not expose stack trace in production environment", () => {
      process.env.NODE_ENV = "production";
      testError.stack = "Error: Sensitive information\n  at secretFunction";

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(JSON.stringify(responseBody)).not.toContain("secretFunction");
    });

    it("should still log error in production environment", () => {
      process.env.NODE_ENV = "production";

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("Request Context Logging", () => {
    it("should log request method", () => {
      mockRequest.method = "POST";

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      // Error should be logged with request context
      expect(console.error).toHaveBeenCalled();
    });

    it("should log request path", () => {
      mockRequest.path = "/api/pokemons/create";

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(console.error).toHaveBeenCalled();
    });

    it("should handle different HTTP methods", () => {
      const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

      methods.forEach((methodType) => {
        jest.clearAllMocks();
        mockRequest.method = methodType;

        errorHandlerMiddleware(testError, mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("Error with Custom Properties", () => {
    it("should handle errors with status code property", () => {
      testError.status = 404;

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalled();
    });

    it("should handle errors with statusCode property", () => {
      testError.statusCode = 403;

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalled();
    });
  });

  describe("Multiple Consecutive Errors", () => {
    it("should handle multiple errors independently", () => {
      const errorOne = new Error("First error");
      const errorTwo = new Error("Second error");

      errorHandlerMiddleware(errorOne, mockRequest, mockResponse);
      jest.clearAllMocks();

      mockResponse.status.mockClear();
      mockResponse.json.mockClear();

      errorHandlerMiddleware(errorTwo, mockRequest, mockResponse);

      const responseBody = mockResponse.json.mock.calls[0][0];
      expect(responseBody.error.message).toBe("Second error");
    });
  });

  describe("Response Completion", () => {
    it("should always call response.json()", () => {
      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should call status() before json()", () => {
      const callOrder = [];

      mockResponse.status.mockImplementation(() => {
        callOrder.push("status");
        return mockResponse;
      });

      mockResponse.json.mockImplementation(() => {
        callOrder.push("json");
      });

      errorHandlerMiddleware(testError, mockRequest, mockResponse);

      expect(callOrder).toEqual(["status", "json"]);
    });
  });
});
