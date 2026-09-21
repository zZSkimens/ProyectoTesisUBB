import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.PASSWORD || 'postgres',
  database: process.env.DATABASE || 'tesis',
});

pool.on('error', (err) => {
  console.error('[ERROR] Problema inesperado en el pool de PostgreSQL:', err);
});

export const db = drizzle(pool, { schema });
export default db;
