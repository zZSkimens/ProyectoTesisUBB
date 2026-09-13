import 'dotenv/config';

export const config = {
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.ACCESS_TOKEN_SECRET || 'secreto_por_defecto_jwt',
  cookieKey: process.env.cookieKey || 'llave_por_defecto_cookie',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
