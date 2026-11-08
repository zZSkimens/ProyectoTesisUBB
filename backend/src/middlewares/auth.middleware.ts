import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import type { UsuarioPayload } from '../types/express.js';
import { authService } from '../services/auth.service.js';
import { sesionesService } from '../services/sesiones.service.js';

export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Acceso no autorizado: token no proporcionado',
    });
    return;
  }

  const token = /^Bearer (\S+)$/i.exec(authHeader)?.[1];
  if (!token) {
    res.status(401).json({ error: 'Formato de autorización inválido' });
    return;
  }

  let payload: UsuarioPayload;
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || !Number.isInteger(decoded.id) ||
        typeof decoded.exp !== 'number') {
      throw new Error('Payload invalido');
    }
    payload = decoded as UsuarioPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'La sesion ha expirado, inicie sesion nuevamente' });
      return;
    }
    res.status(401).json({ error: 'Token de autenticacion invalido' });
    return;
  }

  try {
    if (await sesionesService.estaRevocado(token)) {
      res.status(401).json({ error: 'La sesion ha sido cerrada' });
      return;
    }
    const usuario = await authService.obtenerPerfil(payload.id);
    if (!usuario.activo) {
      res.status(401).json({ error: 'Esta cuenta ha sido deshabilitada' });
      return;
    }
    req.usuario = { ...payload, ...usuario };
    req.sesionAutenticada = { token, expiracion: payload.exp };
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'Usuario no encontrado') {
      res.status(401).json({ error: 'La cuenta ya no existe' });
      return;
    }
    next(error);
  }
};

export const requiereRol = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Acceso no autorizado: sesion no valida',
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: `Acceso denegado: se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
      });
    }

    next();
  };
};

