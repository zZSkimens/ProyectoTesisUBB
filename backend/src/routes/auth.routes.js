import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { validarLogin } from '../validations/auth.validation.js';

const router = Router();

router.post('/login', validarLogin, authController.login);

router.get('/perfil', verificarToken, authController.perfil);

export default router;
