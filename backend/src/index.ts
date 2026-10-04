import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { pool } from '../db/connection.js';
import apiRouter from './routes/index.js';
import { manejadorErrores } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaFrontend = path.resolve(__dirname, '../../tutor-panel/dist');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/status', async (req: Request, res: Response) => {
  try {
    const dbCheck = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'ok',
      mensaje: 'Servidor backend y base de datos operativos',
      horaServidor: dbCheck.rows[0].current_time,
      entorno: config.nodeEnv,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      mensaje: 'Error de conexion con la base de datos',
      detalle: error.message,
    });
  }
});

app.use('/api', apiRouter);

if (fs.existsSync(rutaFrontend)) {
  app.use(express.static(rutaFrontend));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(rutaFrontend, 'index.html'));
  });
}

app.use(manejadorErrores);

app.listen(config.port, config.host, () => {
  console.log(`[INFO] Servidor backend iniciado en http://${config.host}:${config.port}`);
  console.log(`[INFO] Ruta de verificacion disponible en http://${config.host}:${config.port}/api/status`);
});

export default app;
