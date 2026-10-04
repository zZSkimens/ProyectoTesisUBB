import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import type { UsuarioPayload } from '../types/express.js';

export const verificarToken = (req: Request, res: Response, next: NextFunction): void | Response => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acceso no autorizado: token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret) as UsuarioPayload;
    req.usuario = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesion ha expirado, inicie sesion nuevamente' });
    }
    return res.status(401).json({ error: 'Token de autenticacion invalido' });
  }
};

export const requiereRol = (rolRequerido: string) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.usuario || req.usuario.rol !== rolRequerido) {
      return res.status(403).json({
        error: `Acceso denegado: se requiere el rol de ${rolRequerido}`,
      });
    }
    next();
  };
};
