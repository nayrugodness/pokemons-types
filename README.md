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
  -d '{
    "name": "Pikachu",
    "height": 4,
    "weight": 60,
    "types": ["Electric"]
  }'
```

Get all pokemons:

```bash
curl http://localhost:3000/api/pokemons
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

## Next Steps

1. Add request validation with `class-validator`
2. Add error handling middleware
3. Implement JWT authentication
4. Add pagination and filtering
5. Implement caching strategy
6. Add API documentation with Swagger
7. Set up integration tests
8. Add logging system

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
