import app from './app.js';
import { config } from './config/env.js';

app.listen(config.port, config.host, () => {
  console.log(`[INFO] Servidor backend iniciado en http://${config.host}:${config.port}`);
  console.log(`[INFO] Ruta de verificacion disponible en http://${config.host}:${config.port}/api/status`);
});
