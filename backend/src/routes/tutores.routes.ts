import { Router } from 'express';
import { tutoresController } from '../controllers/tutores.controller.js';
import { verificarToken, requiereRol } from '../middlewares/auth.middleware.js';
import {
  validarIdEstudiante,
  validarNuevaObservacion,
  validarNuevoEstudiante,
  validarHorarioConsultas,
} from '../validations/tutores.validation.js';

const router = Router();

router.use(verificarToken as any);
router.use(requiereRol('tutor', 'admin') as any);

router.get('/dashboard', tutoresController.dashboard);
router.get('/actividades', tutoresController.listarActividades);

// Estudiantes (Listar con filtros dinamicos y crear)
router.get('/estudiantes', tutoresController.listarEstudiantes);
router.post('/estudiantes', validarNuevoEstudiante as any, tutoresController.crearEstudiante);
router.delete('/estudiantes/:id', validarIdEstudiante as any, tutoresController.eliminarEstudiante);
router.get('/estudiantes/:id', validarIdEstudiante as any, tutoresController.detalleEstudiante);

// Observaciones de tutoria
router.get('/estudiantes/:id/observaciones', validarIdEstudiante as any, tutoresController.obtenerObservaciones);
router.post(
  '/estudiantes/:id/observaciones',
  validarIdEstudiante as any,
  validarNuevaObservacion as any,
  tutoresController.crearObservacion
);

// Horario de atencion para consultas del tutor
router.get('/centros-atencion', tutoresController.obtenerHorarioConsultas);
router.put('/centros-atencion', validarHorarioConsultas as any, tutoresController.actualizarHorarioConsultas);

export default router;
