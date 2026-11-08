import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { validarLogin } from '../validations/auth.validation.js';
import { sesionesService } from '../services/sesiones.service.js';

const router = Router();

router.post('/login', validarLogin as any, authController.login);

router.get('/perfil', verificarToken as any, authController.perfil);

router.post('/logout', verificarToken, async (req, res, next) => {
  try {
    const { token, expiracion } = req.sesionAutenticada!;
    await sesionesService.revocar(token, expiracion);
    res.json({ mensaje: 'Sesion cerrada correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;
