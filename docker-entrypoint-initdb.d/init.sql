-- Create database if not exists
SELECT 'CREATE DATABASE pokemon_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pokemon_db')\gexec
