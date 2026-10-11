import 'dotenv/config';

export interface AppConfig {
  host: string;
  port: number;
  jwtSecret: string;
  cookieKey: string;
  nodeEnv: string;
  corsOrigins: string[];
}

const nodeEnv = process.env.NODE_ENV || 'development';
let jwtSecret = process.env.ACCESS_TOKEN_SECRET;

if (!jwtSecret && nodeEnv === 'production') {
  throw new Error('ACCESS_TOKEN_SECRET es obligatorio en produccion');
}

if (!jwtSecret) {
  jwtSecret = 'secreto_por_defecto_jwt';
}

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

if (nodeEnv !== 'production' && corsOrigins.length === 0) {
  corsOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

export const config: AppConfig = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT) || 3000,
  jwtSecret,
  cookieKey: process.env.cookieKey || 'llave_por_defecto_cookie',
  nodeEnv,
  corsOrigins,
};

export default config;
