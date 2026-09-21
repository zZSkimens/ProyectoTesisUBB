import { Router } from 'express';
import { tutoresController } from '../controllers/tutores.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { validarIdEstudiante } from '../validations/tutores.validation.js';

const router = Router();

router.use(verificarToken);

router.get('/dashboard', tutoresController.dashboard);
router.get('/estudiantes', tutoresController.listarEstudiantes);
router.get('/estudiantes/:id', validarIdEstudiante, tutoresController.detalleEstudiante);

export default router;
