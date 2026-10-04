import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const resultado = await authService.login(email, password);

      res.json({
        mensaje: 'Inicio de sesion exitoso',
        token: resultado.token,
        usuario: resultado.usuario,
      });
    } catch (error: any) {
      let statusCode = 400;
      if (error.message === 'Credenciales invalidas') {
        statusCode = 401;
      }
      res.status(statusCode).json({ error: error.message });
    }
  },

  async perfil(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const usuario = await authService.obtenerPerfil(req.usuario.id);
      res.json({ usuario });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },
};
