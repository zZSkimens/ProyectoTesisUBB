import type { NextFunction, Request, Response } from 'express';
import { ErrorAplicacion, type CodigoErrorAplicacion } from '../utils/errorAplicacion.js';

const estadoPorCodigo: Record<CodigoErrorAplicacion, number> = {
  CREDENCIALES_INVALIDAS: 401,
  CUENTA_DESHABILITADA: 403,
  SESION_INVALIDA: 401,
  USUARIO_NO_ENCONTRADO: 404,
  ESTUDIANTE_NO_ENCONTRADO: 404,
  ESTUDIANTE_DUPLICADO: 409,
};

const mensajesHttp: Partial<Record<number, string>> = {
  400: 'Cuerpo de la solicitud no válido',
  403: 'Acceso denegado',
  404: 'Recurso no encontrado',
  413: 'El cuerpo de la solicitud supera el tamaño permitido',
  415: 'El formato de la solicitud no es compatible',
};

function obtenerEstadoDeCliente(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return;

  const estado = ('status' in error ? error.status : undefined)
    ?? ('statusCode' in error ? error.statusCode : undefined);
  if (typeof estado === 'number' && Number.isInteger(estado) && estado >= 400 && estado < 500) {
    return estado;
  }
}

export const manejadorErrores = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ErrorAplicacion) {
    res.status(estadoPorCodigo[error.codigo]).json({ error: error.message });
    return;
  }

  const estado = obtenerEstadoDeCliente(error);
  if (estado !== undefined) {
    res.status(estado).json({ error: mensajesHttp[estado] ?? 'Solicitud no válida' });
    return;
  }

  console.error('[ERROR NO CONTROLADO]:', {
    metodo: req.method,
    ruta: req.path,
    tipo: error instanceof Error ? error.name : typeof error,
  });
  res.status(500).json({ error: 'Ocurrio un error interno en el servidor' });
};
