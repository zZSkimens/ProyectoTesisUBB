import { Router } from 'express';
import { perfilFotoController } from '../controllers/perfilFoto.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';
import { leerFotoPerfil, validarFotoPerfil } from '../validations/perfilFoto.validation.js';

const router = Router();

router.use(verificarToken);
router.get('/', perfilFotoController.obtener);
router.put('/', leerFotoPerfil, validarFotoPerfil, perfilFotoController.guardar);
router.delete('/', perfilFotoController.eliminar);

export default router;
