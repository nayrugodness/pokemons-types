#!/bin/bash
# TESTING GUIDE: Azure Blob Service Integration

echo "================================"
echo "Pokemon API - Quick Test Guide"
echo "================================"

# 1. Install dependencies
echo ""
echo "📦 Step 1: Installing @azure/storage-blob..."
npm install @azure/storage-blob

# 2. Start Docker
echo ""
echo "🐳 Step 2: Starting Docker Compose..."
docker-compose up --build

# In another terminal, run these tests:

echo ""
echo "================================"
echo "API Tests (Run in separate terminal)"
echo "================================"

# Test 1: Get all pokemons WITHOUT API Key (should fail with 401)
echo ""
echo "❌ Test 1: GET /api/pokemons WITHOUT x-api-key (expect 401)"
curl -X GET http://localhost:3000/api/pokemons

# Test 2: Get all pokemons WITH INVALID API Key (should fail with 401)
echo ""
echo ""
echo "❌ Test 2: GET /api/pokemons WITH INVALID x-api-key (expect 401)"
curl -X GET http://localhost:3000/api/pokemons \
  -H "x-api-key: wrong_key"

# Test 3: Get all pokemons WITH VALID API Key (should succeed)
echo ""
echo ""
echo "✅ Test 3: GET /api/pokemons WITH VALID x-api-key (expect 200)"
curl -X GET http://localhost:3000/api/pokemons \
  -H "x-api-key: mi_super_clave_secreta_123"

# Test 4: Create a new pokemon
echo ""
echo ""
echo "✅ Test 4: POST /api/pokemons (create new)"
curl -X POST http://localhost:3000/api/pokemons \
  -H "Content-Type: application/json" \
  -H "x-api-key: mi_super_clave_secreta_123" \
  -d '{
    "name": "Charizard",
    "height": 17,
    "weight": 905,
    "types": ["Fire", "Flying"]
  }'

# Test 5: Get typesSummary (should include Azure URL if configured)
echo ""
echo ""
echo "✅ Test 5: GET /api/pokemons - Check response structure"
echo "Expected fields in response:"
echo "  - message"
echo "  - count"
echo "  - data (array of pokemons)"
echo "  - typesSummary (object with type counts)"
echo "  - azureBlobSASUrl (if Azure is configured)"
echo "  - sasUrlExpires: '1 hour'"

# Test 6: Download the file from Azure using the SAS URL
echo ""
echo ""
echo "✅ Test 6: Download from Azure SAS URL"
echo "Copy the azureBlobSASUrl from Test 5 response and paste:"
echo "  curl -X GET '<PASTE_SAS_URL_HERE>'"

# Verify .env configuration
echo ""
echo ""
echo "================================"
echo "Configuration Check"
echo "================================"
echo ""
echo "Checking .env file..."
grep -E "PROCESS_API_KEY|AZURE_STORAGE" .env

# Status check
echo ""
echo ""
echo "================================"
echo "Status Summary"
echo "================================"
echo ""
echo "✅ API Key Middleware:       Implemented in src/middleware/apiKeyMiddleware.js"
echo "✅ Pokemon Service:          Updated with getTypesSummary() method"
echo "✅ Azure Blob Service:       Implemented with uploadAndGetSAS() method"
echo "✅ Documentation:            AZURE_BLOB_SETUP.md and AZURE_INTEGRATION_EXAMPLE.js"
echo ""
echo "🔄 Next Steps:"
echo "1. npm install @azure/storage-blob"
echo "2. docker-compose up --build"
echo "3. Run tests in another terminal"
echo "4. Check Azure Portal for uploaded files"

# Azure Deployed API Testing
echo ""
echo ""
echo "================================"
echo "Azure Production API Tests"
echo "================================"
echo "API URL: https://reportespokemons-cnd2eycsdqc6dacu.canadacentral-01.azurewebsites.net/"
echo ""

# Test 1: Get all pokemons from Azure (WITH API Key)
echo "✅ Test 1: GET /api/pokemons FROM AZURE (expect 200)"
curl -X GET https://reportespokemons-cnd2eycsdqc6dacu.canadacentral-01.azurewebsites.net/api/pokemons \
  -H "x-api-key: mi_super_clave_secreta_123"

# Test 2: Health check from Azure
echo ""
echo ""
echo "✅ Test 2: Health Check from Azure"
curl -X GET https://reportespokemons-cnd2eycsdqc6dacu.canadacentral-01.azurewebsites.net/health

# Test 3: Root endpoint from Azure
echo ""
echo ""
echo "✅ Test 3: Root Endpoint from Azure"
curl -X GET https://reportespokemons-cnd2eycsdqc6dacu.canadacentral-01.azurewebsites.net/

# Test 4: Create pokemon in Azure
echo ""
echo ""
echo "✅ Test 4: POST /api/pokemons TO AZURE (create new)"
curl -X POST https://reportespokemons-cnd2eycsdqc6dacu.canadacentral-01.azurewebsites.net/api/pokemons \
  -H "Content-Type: application/json" \
  -H "x-api-key: mi_super_clave_secreta_123" \
  -d '{
    "name": "Pikachu",
    "height": 4,
    "weight": 60,
    "types": ["Electric"]
  }'

# Test 5: Missing API Key (should return 401)
echo ""
echo ""
echo "❌ Test 5: GET /api/pokemons FROM AZURE WITHOUT x-api-key (expect 401)"
curl -X GET https://reportespokemons-cnd2eycsdqc6dacu.canadacentral-01.azurewebsites.net/api/pokemons

echo ""
echo ""
echo "================================"
echo "Azure API Testing Complete"
echo "================================"
echo "If all tests returned valid responses, your API is running successfully on Azure! 🚀"
