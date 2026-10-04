import type { Request, Response, NextFunction } from 'express';

export const validarIdEstudiante = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { id } = req.params;
  const idNumero = Number(id);

  if (!Number.isInteger(idNumero) || idNumero <= 0) {
    return res.status(400).json({ error: 'El ID de estudiante debe ser un numero entero positivo' });
  }

  req.params.id = String(idNumero);
  next();
};
