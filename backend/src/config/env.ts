import 'dotenv/config';

export interface AppConfig {
  host: string;
  port: number;
  jwtSecret: string;
  cookieKey: string;
  nodeEnv: string;
}

export const config: AppConfig = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.ACCESS_TOKEN_SECRET || 'secreto_por_defecto_jwt',
  cookieKey: process.env.cookieKey || 'llave_por_defecto_cookie',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
