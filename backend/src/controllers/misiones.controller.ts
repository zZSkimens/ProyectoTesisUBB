import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { misionesService, type BorradorInput } from '../services/misiones.service.js';

const actualizarActivacion = (activa: boolean): RequestHandler<{ id: string }> => async (req, res, next) => {
  try {
    const id = Number(req.params.id);
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

export const misionesController = {
  async listarBorradores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const misiones = await misionesService.listarBorradores(req.usuario!.id);
      res.json({ misiones });
    } catch (error) {
      next(error);
    }
  },

  async crearBorrador(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mision = await misionesService.guardarBorrador(req.usuario!.id, req.body as BorradorInput);
      res.status(201).json({ mision });
    } catch (error) {
      next(error);
    }
  },

  async editarBorrador(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const mision = await misionesService.guardarBorrador(req.usuario!.id, req.body as BorradorInput, id);
      if (!mision) {
        res.status(404).json({ error: 'Borrador no encontrado' });
        return;
      }
      res.json({ mision });
    } catch (error) {
      next(error);
    }
  },

  async publicar(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { condicionCumplimiento } = req.body;
      const resultado = await misionesService.publicarParaTutor(req.usuario!.id, id, condicionCumplimiento);
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
  },

  desactivar: actualizarActivacion(false),
  reactivar: actualizarActivacion(true),

  async quitarAsignacion(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const quitada = await misionesService.quitarDesactivadaParaTutor(req.usuario!.id, id);
      if (!quitada) {
        res.status(404).json({ error: 'La misión no está desactivada en tu lista. Sincroniza las actividades y vuelve a intentarlo.' });
        return;
      }
      res.json({ mensaje: 'Misión quitada de tu lista' });
    } catch (error) {
      next(error);
    }
  },
};
