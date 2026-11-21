import type { RequestHandler } from 'express';
import { LUGARES_MISION, MODULOS_MISION } from '../services/misiones.service.js';

export const validarIdMision: RequestHandler<{ id: string }> = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    res.status(400).json({ error: 'ID de misión inválido' });
    return;
  }
  next();
};

export const validarPublicacionMision: RequestHandler = (req, res, next) => {
  const condicion = req.body?.condicionCumplimiento;
  const condicionLimpia = typeof condicion === 'string' ? condicion.trim() : '';
  if (!condicionLimpia || condicionLimpia.length > 2000) {
    res.status(400).json({ error: 'Indica cómo se completa la misión en hasta 2000 caracteres' });
    return;
  }
  req.body.condicionCumplimiento = condicionLimpia;
  next();
};

export const validarBorrador: RequestHandler = (req, res, next) => {
  const datos = req.body;
  if (!datos || Array.isArray(datos) || typeof datos !== 'object') {
    res.status(400).json({ error: 'Debe proporcionar los datos del borrador' });
    return;
  }

  const limites = { titulo: 150, objetivo: 2000, descripcion: 5000, modulo: 100 };
  for (const [campo, maximo] of Object.entries(limites)) {
    const valor = datos[campo];
    const texto = typeof valor === 'string' ? valor.trim() : '';
    if (typeof valor !== 'string' || texto.length > maximo || (campo === 'titulo' && texto.length < 3)) {
      res.status(400).json({ error: `El campo ${campo} no es valido (maximo ${maximo} caracteres)` });
      return;
    }
    datos[campo] = texto;
  }

  if (!LUGARES_MISION.includes(datos.lugar) || !MODULOS_MISION.includes(datos.modulo) ||
      !Number.isInteger(datos.puntosRecompensa) || datos.puntosRecompensa < 100 || datos.puntosRecompensa > 200 ||
      !Number.isInteger(datos.orden) || datos.orden < 1 || datos.orden > 10000) {
    res.status(400).json({ error: 'Seleccione un modulo y lugar validos, puntos de 100 a 200 y orden de 1 a 10000' });
    return;
  }
  next();
};
