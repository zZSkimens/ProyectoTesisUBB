import type { Request, Response, NextFunction } from 'express';

export const manejadorErrores = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[ERROR NO CONTROLADO]:', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Ocurrio un error interno en el servidor',
  });
};
