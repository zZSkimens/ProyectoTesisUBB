import { Router } from 'express';
import { misionesController } from '../controllers/misiones.controller.js';
import { verificarToken, requiereRol } from '../middlewares/auth.middleware.js';
import {
  validarBorrador,
  validarIdMision,
  validarPublicacionMision,
} from '../validations/misiones.validation.js';

const router = Router();
router.use(verificarToken, requiereRol('tutor', 'admin'));

router.get('/borradores', misionesController.listarBorradores);
router.post('/borradores', validarBorrador, misionesController.crearBorrador);
router.put('/borradores/:id', validarBorrador, validarIdMision, misionesController.editarBorrador);
router.post('/borradores/:id/publicar', validarIdMision, validarPublicacionMision, misionesController.publicar);

router.patch('/:id/desactivar', validarIdMision, misionesController.desactivar);
router.patch('/:id/reactivar', validarIdMision, misionesController.reactivar);
router.delete('/:id/asignacion', validarIdMision, misionesController.quitarAsignacion);

export default router;
