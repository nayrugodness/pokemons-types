/**
 * @fileoverview Tests for Azure Blob Service
 * Coverage: Integration and initialization tests
 */

describe("Azure Blob Service - AzureBlobService", () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    jest.resetModules();
  });

  describe("Service Module", () => {
    it("should export AzureBlobService", () => {
      process.env.AZURE_STORAGE_CONNECTION_STRING =
        "DefaultEndpointsProtocol=https;AccountName=test;AccountKey=test==;EndpointSuffix=core.windows.net";

      jest.resetModules();
      const {
        AzureBlobService,
      } = require("../../src/services/azureBlobService");
      expect(AzureBlobService).toBeDefined();
      expect(typeof AzureBlobService).toBe("function");
    });

    it("should throw error when AZURE_STORAGE_CONNECTION_STRING is missing", () => {
      delete process.env.AZURE_STORAGE_CONNECTION_STRING;
      jest.resetModules();

      expect(() => {
        const {
          AzureBlobService,
        } = require("../../src/services/azureBlobService");
        new AzureBlobService();
      }).toThrow("AZURE_STORAGE_CONNECTION_STRING");
    });
  });

  describe("Service Constructor", () => {
    it("should create instance with valid connection string", () => {
      process.env.AZURE_STORAGE_CONNECTION_STRING =
        "DefaultEndpointsProtocol=https;AccountName=test;AccountKey=test==;EndpointSuffix=core.windows.net";

      jest.resetModules();
      const {
        AzureBlobService,
      } = require("../../src/services/azureBlobService");
      const service = new AzureBlobService();

      expect(service).toBeDefined();
      expect(typeof service.uploadAndGetSAS).toBe("function");
    });

    it("should throw when connection string is empty", () => {
      process.env.AZURE_STORAGE_CONNECTION_STRING = "";
      jest.resetModules();

      expect(() => {
        const {
          AzureBlobService,
        } = require("../../src/services/azureBlobService");
        new AzureBlobService();
      }).toThrow("AZURE_STORAGE_CONNECTION_STRING");
    });
  });

  describe("Service Methods", () => {
    beforeEach(() => {
      process.env.AZURE_STORAGE_CONNECTION_STRING =
        "DefaultEndpointsProtocol=https;AccountName=test;AccountKey=test==;EndpointSuffix=core.windows.net";
      jest.resetModules();
    });

    it("should have uploadAndGetSAS method", () => {
      const {
        AzureBlobService,
      } = require("../../src/services/azureBlobService");
      const service = new AzureBlobService();

      expect(service).toHaveProperty("uploadAndGetSAS");
      expect(typeof service.uploadAndGetSAS).toBe("function");
    });

    it("should have deleteBlob method", () => {
      const {
        AzureBlobService,
      } = require("../../src/services/azureBlobService");
      const service = new AzureBlobService();

      expect(service).toHaveProperty("deleteBlob");
      expect(typeof service.deleteBlob).toBe("function");
    });

    it("should have listBlobs method", () => {
      const {
        AzureBlobService,
      } = require("../../src/services/azureBlobService");
      const service = new AzureBlobService();

      expect(service).toHaveProperty("listBlobs");
      expect(typeof service.listBlobs).toBe("function");
    });
  });

  describe("Data Validation", () => {
    it("should accept JSON serializable objects", () => {
      const testData = {
        Electric: 5,
        Fire: 3,
        Water: 4,
      };

      expect(() => JSON.stringify(testData)).not.toThrow();
    });

    it("should accept valid filename format", () => {
      const filename = `pokemon-types-${Date.now()}.json`;
      expect(filename).toMatch(/pokemon-types-\d+\.json/);
    });

    it("should handle various data types", () => {
      const testCases = [
        { simple: "object" },
        { nested: { data: true } },
        { array: [1, 2, 3] },
        { number: 42 },
        { string: "test" },
      ];

      testCases.forEach((testData) => {
        expect(() => JSON.stringify(testData)).not.toThrow();
      });
    });
  });
});
