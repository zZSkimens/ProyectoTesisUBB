import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { validarLogin } from '../validations/auth.validation.js';
import perfilFotoRoutes from './perfilFoto.routes.js';

const router = Router();

router.post('/login', validarLogin as any, authController.login);

router.get('/perfil', verificarToken as any, authController.perfil);
router.use('/perfil/foto', perfilFotoRoutes);

router.post('/logout', verificarToken, authController.cerrarSesion);

export default router;
