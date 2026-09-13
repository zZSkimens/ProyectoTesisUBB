import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.js',
  out: '../database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.PASSWORD || 'postgres',
    database: process.env.DATABASE || 'tesis',
    ssl: false,
  },
});
