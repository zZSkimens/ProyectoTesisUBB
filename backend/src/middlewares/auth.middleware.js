import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acceso no autorizado: token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.usuario = payload; 
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesion ha expirado, inicie sesion nuevamente' });
    }
    return res.status(401).json({ error: 'Token de autenticacion invalido' });
  }
};

export const requiereRol = (rolRequerido) => {
  return (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== rolRequerido) {
      return res.status(403).json({
        error: `Acceso denegado: se requiere el rol de ${rolRequerido}`,
      });
    }
    next();
  };
};
