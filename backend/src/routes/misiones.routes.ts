import { Router } from 'express';
import type { RequestHandler } from 'express';
import { verificarToken, requiereRol } from '../middlewares/auth.middleware.js';
import { LUGARES_MISION, MODULOS_MISION, misionesService } from '../services/misiones.service.js';
import type { BorradorInput } from '../services/misiones.service.js';

const router = Router();
router.use(verificarToken, requiereRol('tutor', 'admin') as any);

const actualizarActivacion = (activa: boolean): RequestHandler<{ id: string }> => async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    res.status(400).json({ error: 'ID de misión inválido' });
    return;
  }
  try {
    const actualizada = await misionesService.actualizarActivacionParaTutor(req.usuario!.id, id, activa);
    if (!actualizada) {
      res.status(404).json({ error: 'La misión no está disponible en tu lista' });
      return;
    }
    res.json({ mensaje: activa ? 'Misión reactivada para tus estudiantes' : 'Misión desactivada para tus estudiantes' });
  } catch (error) {
    next(error);
  }
};

router.patch('/:id/desactivar', actualizarActivacion(false));
router.patch('/:id/reactivar', actualizarActivacion(true));

router.delete('/:id/asignacion', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    res.status(400).json({ error: 'ID de misión inválido' });
    return;
  }
  try {
    const quitada = await misionesService.quitarDesactivadaParaTutor(req.usuario!.id, id);
    if (!quitada) {
      res.status(404).json({ error: 'La misión no está desactivada en tu lista. Sincroniza las actividades y vuelve a intentarlo.' });
      return;
    }
    res.json({ mensaje: 'Misión quitada de tu lista' });
  } catch (error) {
    next(error);
  }
});

router.get('/borradores', async (req, res, next) => {
  try {
    res.json({ misiones: await misionesService.listarBorradores(req.usuario!.id) });
  } catch (error) { next(error); }
});

router.post('/borradores/:id/publicar', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    res.status(400).json({ error: 'ID de misión inválido' });
    return;
  }
  const condicion = req.body?.condicionCumplimiento;
  if (typeof condicion !== 'string' || !condicion.trim() || condicion.trim().length > 2000) {
    res.status(400).json({ error: 'Indica cómo se completa la misión en hasta 2000 caracteres' });
    return;
  }
  try {
    const resultado = await misionesService.publicarParaTutor(req.usuario!.id, id, condicion.trim());
    if (resultado === 'no_encontrada') {
      res.status(404).json({ error: 'Borrador no encontrado' });
      return;
    }
    if (resultado === 'incompleta') {
      res.status(400).json({ error: 'Revisa el objetivo, la descripción, el lugar, el módulo y la recompensa del borrador' });
      return;
    }
    res.json({ mensaje: 'Misión publicada para tu grupo' });
  } catch (error) {
    next(error);
  }
});

router.use((req, res, next) => {
  if (!['POST', 'PUT'].includes(req.method)) { next(); return; }
  const datos = req.body;
  if (!datos || Array.isArray(datos) || typeof datos !== 'object') {
    res.status(400).json({ error: 'Debe proporcionar los datos del borrador' }); return;
  }
  for (const [campo, maximo] of Object.entries({ titulo: 150, objetivo: 2000, descripcion: 5000, modulo: 100 })) {
    if (typeof datos[campo] !== 'string' || datos[campo].trim().length > maximo ||
        (campo === 'titulo' && datos[campo].trim().length < 3)) {
      res.status(400).json({ error: `El campo ${campo} no es valido (maximo ${maximo} caracteres)` }); return;
    }
    datos[campo] = datos[campo].trim();
  }
  if (!LUGARES_MISION.includes(datos.lugar) || !MODULOS_MISION.includes(datos.modulo) ||
      !Number.isInteger(datos.puntosRecompensa) || datos.puntosRecompensa < 100 || datos.puntosRecompensa > 200 ||
      !Number.isInteger(datos.orden) || datos.orden < 1 || datos.orden > 10000) {
    res.status(400).json({ error: 'Seleccione un modulo y lugar validos, puntos de 100 a 200 y orden de 1 a 10000' }); return;
  }
  next();
});

router.post('/borradores', async (req, res, next) => {
  try {
    const mision = await misionesService.guardarBorrador(req.usuario!.id, req.body as BorradorInput);
    res.status(201).json({ mision });
  } catch (error) { next(error); }
});
router.put('/borradores/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(400).json({ error: 'ID invalido' }); return; }
  try {
    const mision = await misionesService.guardarBorrador(req.usuario!.id, req.body as BorradorInput, id);
    if (!mision) { res.status(404).json({ error: 'Borrador no encontrado' }); return; }
    res.json({ mision });
  } catch (error) { next(error); }
});
export default router;
