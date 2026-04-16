/**
 * Azure Blob Storage Service (JavaScript version)
 * Handles uploading typesSummary JSON and generating SAS URLs
 * Uses generateBlobSASQueryParameters for modern SAS token generation
 */

const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

class AzureBlobService {
  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "reportes";

    if (!connectionString) {
      throw new Error(
        "Missing AZURE_STORAGE_CONNECTION_STRING in environment variables",
      );
    }

    // Initialize Blob Service Client from connection string
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  /**
   * Upload typesSummary JSON to Azure Blob Storage and generate SAS URL
   * @param {Object} typesSummary The types summary object to upload
   * @param {string} [fileName] Optional custom file name (defaults to timestamp-based name)
   * @returns {Promise<string>} The public SAS URL for the uploaded file
   */
  async uploadAndGetSAS(typesSummary, fileName) {
    try {
      // Get container client
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );

      // Generate file name if not provided
      const blobName = fileName || `reporte-tipos-${Date.now()}.json`;

      // Convert typesSummary to JSON string
      const jsonContent = JSON.stringify(typesSummary, null, 2);

      // Get blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // 1. Upload the blob
      await blockBlobClient.upload(jsonContent, jsonContent.length, {
        blobHTTPHeaders: {
          blobContentType: "application/json",
        },
      });

      console.log(`✅ Successfully uploaded ${blobName} to Azure Blob Storage`);

      // 2. Generate SAS Token (Valid for 1 hour)
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + 1);

      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName,
          permissions: BlobSASPermissions.parse("r"), // Read-only permission
          expiresOn,
        },
        this.blobServiceClient.credential,
      ).toString();

      // Return complete SAS URL
      const sasUrl = `${blockBlobClient.url}?${sasToken}`;

      console.log(
        `✅ Generated SAS URL (expires at ${expiresOn.toISOString()})`,
      );

      return sasUrl;
    } catch (error) {
      console.error("❌ Error uploading to Azure Blob Storage:", error);
      throw error;
    }
  }

  /**
   * Delete a blob from storage
   * @param {string} blobName The name of the blob to delete
   * @returns {Promise<void>}
   */
  async deleteBlob(blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      console.log(`✅ Successfully deleted ${blobName}`);
    } catch (error) {
      console.error("❌ Error deleting blob:", error);
      throw error;
    }
  }

  /**
   * List all blobs in the container
   * @returns {Promise<string[]>} Array of blob names
   */
  async listBlobs() {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      const blobs = [];
      for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob.name);
      }
      console.log(`✅ Found ${blobs.length} blobs in container`);
      return blobs;
    } catch (error) {
      console.error("❌ Error listing blobs:", error);
      throw error;
    }
  }
}

module.exports = { AzureBlobService };
