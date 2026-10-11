import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

function registrarError(operacion: string, error: unknown): void {
  console.error(`[ERROR] Fallo en ${operacion}:`, error);
}

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
    } catch (error) {
      registrarError('inicio de sesion', error);
      let statusCode = 500;
      let mensaje = 'Ocurrio un error interno en el servidor';
      if (error instanceof Error && error.message === 'Credenciales invalidas') {
        statusCode = 401;
        mensaje = error.message;
      } else if (error instanceof Error && error.message === 'Esta cuenta ha sido deshabilitada') {
        statusCode = 403;
        mensaje = error.message;
      }
      res.status(statusCode).json({ error: mensaje });
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
    } catch (error) {
      registrarError('consulta de perfil', error);
      if (error instanceof Error && error.message === 'Usuario no encontrado') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Ocurrio un error interno en el servidor' });
    }
  },
};
