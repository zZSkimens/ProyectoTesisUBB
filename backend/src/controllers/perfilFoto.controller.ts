import type { NextFunction, Request, Response } from 'express';
import { perfilFotoService, type FotoPerfil } from '../services/perfilFoto.service.js';

interface RespuestaFotoPerfil {
  foto: string | null;
}

export const perfilFotoController = {
  async obtener(req: Request, res: Response<RespuestaFotoPerfil>, next: NextFunction): Promise<void> {
    try {
      const foto = await perfilFotoService.obtener(req.usuario!.id);
      res.set('Cache-Control', 'no-store').json({ foto });
    } catch (error) {
      next(error);
    }
  },

  async guardar(
    req: Request,
    res: Response<RespuestaFotoPerfil, { fotoPerfil: FotoPerfil }>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const foto = await perfilFotoService.guardar(req.usuario!.id, res.locals.fotoPerfil);
      res.set('Cache-Control', 'no-store').json({ foto });
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response<RespuestaFotoPerfil>, next: NextFunction): Promise<void> {
    try {
      await perfilFotoService.eliminar(req.usuario!.id);
      res.set('Cache-Control', 'no-store').json({ foto: null });
    } catch (error) {
      next(error);
    }
  },
};
