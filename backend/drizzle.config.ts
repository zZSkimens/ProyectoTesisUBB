import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`La variable de entorno ${name} es obligatoria para las migraciones`);
  }
  return value;
}

export default defineConfig({
  schema: './db/schema.ts',
  out: '../database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: requiredEnvironmentVariable('DB_HOST'),
    port: Number(process.env.DB_PORT) || 5432,
    user: requiredEnvironmentVariable('DB_USERNAME'),
    password: requiredEnvironmentVariable('PASSWORD'),
    database: requiredEnvironmentVariable('DATABASE'),
    ssl: false,
  },
});
