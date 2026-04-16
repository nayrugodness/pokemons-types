const { DataSource } = require("typeorm");
const { PokemonEntity } = require("./entities/PokemonEntity");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "pokemon_db",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [PokemonEntity],
  subscribers: [],
  migrations: ["src/database/migrations/*.js"],
});

module.exports = { AppDataSource };
