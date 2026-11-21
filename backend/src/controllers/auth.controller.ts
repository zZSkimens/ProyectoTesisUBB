import type { NextFunction, Request, Response } from 'express';
import { ErrorAplicacion } from '../utils/errorAplicacion.js';
import { authService } from '../services/auth.service.js';
import { sesionesService } from '../services/sesiones.service.js';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const resultado = await authService.login(email, password);

      res.json({
        mensaje: 'Inicio de sesion exitoso',
        token: resultado.token,
        usuario: resultado.usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  async perfil(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorAplicacion('SESION_INVALIDA', 'No autenticado');
      }
      const usuario = await authService.obtenerPerfil(req.usuario.id);
      res.json({ usuario });
    } catch (error) {
      next(error);
    }
  },

  async cerrarSesion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, expiracion } = req.sesionAutenticada!;
      await sesionesService.revocar(token, expiracion);
      res.json({ mensaje: 'Sesion cerrada correctamente' });
    } catch (error) {
      next(error);
    }
  },
};
