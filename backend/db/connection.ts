import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`La variable de entorno ${name} es obligatoria para conectar con PostgreSQL`);
  }
  return value;
}

const { Pool } = pg;

export const pool = new Pool({
  host: requiredEnvironmentVariable('DB_HOST'),
  port: Number(process.env.DB_PORT) || 5432,
  user: requiredEnvironmentVariable('DB_USERNAME'),
  password: requiredEnvironmentVariable('PASSWORD'),
  database: requiredEnvironmentVariable('DATABASE'),
});

pool.on('error', (err: Error) => {
  console.error('[ERROR] Problema inesperado en el pool de PostgreSQL:', err);
});

export const db = drizzle(pool, { schema });
export default db;
