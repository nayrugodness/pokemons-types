# Pokemon Search API

Node.js API built with Express and PostgreSQL. Features a modular architecture with Controllers, Services, and Entities.

## Prerequisites

- Node.js 20+
- npm or yarn (package manager)
- PostgreSQL 14+ (or Docker)
- Docker & Docker Compose (optional, for containerized database)

## Quick Start

### 1. Install Dependencies

```bash
cd newJob
npm install
# or
yarn install
```

### 2. Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Or use Docker Compose (includes PostgreSQL):

```bash
docker-compose up
```

### 3. Development

With local PostgreSQL:

```bash
npm run dev
# or
yarn dev
```

With Docker:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3000`

## Project Structure

```
src/
├── modules/              # Feature modules
│   └── pokemon/         # Pokemon module
│       ├── pokemon.controller.js
│       ├── pokemon.service.js
│       └── pokemon.routes.js
├── database/
│   ├── entities/        # TypeORM entities
│   │   └── PokemonEntity.js
│   └── dataSource.js    # Database configuration
└── index.js             # Application entry point
```

## Scripts

- `npm start` - Run production build
- `npm run dev` - Start in development mode with hot reload
- `npm test` - Run tests

## API Endpoints

### Health & Info

- `GET /` - API information
- `GET /health` - Health check

### Pokemon Module

- `POST /api/pokemons` - Save pokemon search
- `GET /api/pokemons` - Get all saved pokemons
- `GET /api/pokemons/id/:id` - Get pokemon by ID
- `GET /api/pokemons/name/:name` - Get pokemon by name
- `PUT /api/pokemons/:id` - Update pokemon
- `DELETE /api/pokemons/:id` - Delete pokemon

### Example Request

Save a pokemon search:

```bash
curl -X POST http://localhost:3000/api/pokemons \
  -H "Content-Type: application/json" \
  -H "x-api-key: mi_super_clave_secreta_123" \
  -d '{
    "name": "Pikachu",
    "height": 4,
    "weight": 60,
    "types": ["Electric"]
  }'
```

**Response (201 Created):**

```json
{
  "message": "Pokemon search saved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Pikachu",
    "height": 4,
    "weight": 60,
    "types": ["Electric"],
    "createdAt": "2024-04-16T10:30:00.000Z"
  },
  "typesSummary": {
    "Electric": 1
  }
}
```

Get all pokemons:

```bash
curl -X GET http://localhost:3000/api/pokemons \
  -H "x-api-key: mi_super_clave_secreta_123"
```

**Response (200 OK):**

```json
{
  "message": "Pokemons retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Pikachu",
      "height": 4,
      "weight": 60,
      "types": ["Electric"],
      "createdAt": "2024-04-16T10:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Charizard",
      "height": 17,
      "weight": 905,
      "types": ["Fire", "Flying"],
      "createdAt": "2024-04-16T10:31:00.000Z"
    }
  ],
  "typesSummary": {
    "Electric": 1,
    "Fire": 1,
    "Flying": 1
  }
}
```

Get pokemon by ID:

```bash
curl -X GET http://localhost:3000/api/pokemons/id/550e8400-e29b-41d4-a716-446655440000 \
  -H "x-api-key: mi_super_clave_secreta_123"
```

**Response (200 OK):**

```json
{
  "message": "Pokemon retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Pikachu",
    "height": 4,
    "weight": 60,
    "types": ["Electric"],
    "createdAt": "2024-04-16T10:30:00.000Z"
  },
  "typesSummary": {
    "Electric": 1
  }
}
```

Update pokemon:

```bash
curl -X PUT http://localhost:3000/api/pokemons/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "x-api-key: mi_super_clave_secreta_123" \
  -d '{
    "height": 5,
    "weight": 65
  }'
```

**Response (200 OK):**

```json
{
  "message": "Pokemon updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Pikachu",
    "height": 5,
    "weight": 65,
    "types": ["Electric"],
    "createdAt": "2024-04-16T10:30:00.000Z"
  },
  "typesSummary": {
    "Electric": 1
  }
}
```

Delete pokemon:

```bash
curl -X DELETE http://localhost:3000/api/pokemons/550e8400-e29b-41d4-a716-446655440000 \
  -H "x-api-key: mi_super_clave_secreta_123"
```

**Response (200 OK):**

```json
{
  "message": "Pokemon deleted successfully"
}
```

### Error Responses

Missing API Key (401):

```json
{
  "error": "Unauthorized",
  "message": "Missing x-api-key header"
}
```

Invalid API Key (401):

```json
{
  "error": "Unauthorized",
  "message": "Invalid x-api-key"
}
```

Invalid Request Body (400):

```json
{
  "error": "Invalid request body",
  "required": ["name", "height", "weight"]
}
```

Pokemon Not Found (404):

```json
{
  "error": "Pokemon not found"
}
```

Internal Server Error (500):

```json
{
  "error": {
    "status": 500,
    "message": "Internal server error",
    "timestamp": "2024-04-16T10:32:00.000Z",
    "path": "/api/pokemons"
  }
}
```

Route Not Found (404):

```json
{
  "error": "Route not found",
  "path": "/api/invalid",
  "method": "GET"
}
```

## Database

### PostgreSQL Configuration

The application uses TypeORM with PostgreSQL. Database configuration is loaded from `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=pokemon_user
DB_PASSWORD=pokemon_password
DB_NAME=pokemon_db
```

### PokemonEntity Schema

```typescript
- id (UUID) - Primary key
- name (varchar) - Pokemon name with index
- height (integer) - Pokemon height
- weight (integer) - Pokemon weight
- types (text[]) - Array of pokemon types
- createdAt (timestamp) - Auto-generated creation timestamp
```

### With Docker Compose

PostgreSQL runs automatically:

```bash
docker-compose up

# Connect to database
docker exec -it pokemon-postgres psql -U pokemon_user -d pokemon_db
```

## Architecture

This project follows a modular architecture inspired by NestJS:

### Controllers

Handle HTTP requests and responses, delegate business logic to services.

### Services

Contain business logic and interact with the database through repositories.

### Entities

Define database schema using TypeORM decorators.

### Routes

Define HTTP routes and connect them to controller methods.

## Docker

### Build Image

```bash
docker build -t pokemon-api .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  pokemon-api
```

### Using Docker Compose

```bash
# Start all services
docker-compose up --build

# Rebuild images
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
```

## GitHub Actions

Two automated workflows are included:

### 1. CI Workflow (`ci.yml`)

- Runs on push and pull requests to `main` and `develop`
- Tests with Node.js 18.x and 20.x
- Installs dependencies, builds, and runs tests

### 2. Docker Build Workflow (`docker.yml`)

- Builds Docker image on main branch
- Uses GitHub Actions cache for optimization

## Development Workflow

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes:**
   - Edit files in `src/modules`
   - TypeScript will provide type checking

3. **Test locally:**

   ```bash
   yarn dev
   # or
   docker-compose up
   ```

4. **Build for production:**

   ```bash
   yarn build
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/new-feature
   ```

## Required Features Implementation ✅

### 1. Error Handling Middleware ✅

- Global error handler for uncaught exceptions
- Consistent JSON error responses with status codes and timestamps
- Request context logging (path, method, body)
- Centralized error processing in `src/middleware/errorHandler.js`

### 2. Logging System ✅

- Request logging middleware that tracks all incoming requests
- Error logging with timestamps and stack traces
- Info and warning logs throughout the application lifecycle
- Visual indicators (✅, ❌, ⚠️, ℹ️) for easy log parsing

### 3. API Documentation ✅

- Complete README with all endpoints documented
- Request/response examples for all operations
- Error response examples (400, 401, 404, 500)
- Database schema documentation
- Configuration and setup instructions

## Technology Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **TypeORM** - Object-relational mapper
- **PostgreSQL** - Relational database
- **Docker** - Containerization
- **Yarn** - Package manager
- **GitHub Actions** - CI/CD

## License

ISC
