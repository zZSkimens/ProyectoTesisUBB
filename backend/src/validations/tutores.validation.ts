import type { Request, Response, NextFunction } from 'express';
import { formatearRut, rutValido } from '../utils/rut.js';
import { correoEstudiantilValido, validarCentroAtencion } from '../utils/validacionesTutor.js';

export const validarIdEstudiante = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { id } = req.params;
  const idNumero = Number(id);

  if (!Number.isInteger(idNumero) || idNumero <= 0) {
    return res.status(400).json({ error: 'El ID de estudiante debe ser un numero entero positivo' });
  }

  req.params.id = String(idNumero);
  next();
};

export const validarNuevaObservacion = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un objeto' });
  }

  const { tipo, titulo, contenido, compromiso } = req.body;

  if (tipo !== undefined && (typeof tipo !== 'string' || !['consulta', 'alerta', 'compromiso'].includes(tipo))) {
    return res.status(400).json({ error: 'El tipo de observacion no es valido' });
  }

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    return res.status(400).json({ error: 'El titulo de la observacion debe tener al menos 3 caracteres' });
  }

  if (!contenido || typeof contenido !== 'string' || contenido.trim().length < 5) {
    return res.status(400).json({ error: 'El contenido de la observacion debe tener al menos 5 caracteres' });
  }

  if (compromiso !== undefined && compromiso !== null && typeof compromiso !== 'string') {
    return res.status(400).json({ error: 'El compromiso debe ser texto' });
  }

  req.body.titulo = titulo.trim();
  req.body.contenido = contenido.trim();
  if (typeof compromiso === 'string') {
    req.body.compromiso = compromiso.trim();
  }

  next();
};

export const validarNuevoEstudiante = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un objeto' });
  }

  const { rut, nombre, email, carrera } = req.body;

  if (!rut || typeof rut !== 'string' || !rutValido(rut)) {
    return res.status(400).json({ error: 'El RUT del estudiante no es valido' });
  }

  if (!nombre || typeof nombre !== 'string' || nombre.trim().split(/\s+/).length < 2) {
    return res.status(400).json({ error: 'Debe ingresar el nombre y apellido del estudiante' });
  }

  if (!correoEstudiantilValido(email)) {
    return res.status(400).json({ error: 'El correo debe pertenecer al dominio @alumnos.ubiobio.cl' });
  }

  if (!carrera || typeof carrera !== 'string' || carrera.trim().length < 3) {
    return res.status(400).json({ error: 'La carrera del estudiante es obligatoria' });
  }

  req.body.rut = formatearRut(rut);
  req.body.nombre = nombre.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.carrera = carrera.trim();

  next();
};

export const validarHorarioConsultas = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un objeto' });
  }

  const { centros } = req.body;
  if (!Array.isArray(centros) || centros.length < 1 || centros.length > 2) {
    return res.status(400).json({ error: 'Debe proporcionar uno o dos centros de atencion' });
  }

  for (let indice = 0; indice < centros.length; indice++) {
    const centro = centros[indice];
    if (!centro || typeof centro !== 'object' || Array.isArray(centro)) {
      return res.status(400).json({ error: `El centro ${indice + 1} debe ser un objeto` });
    }

    if (centro.numeroCentro !== 1 && centro.numeroCentro !== 2) {
      return res.status(400).json({ error: 'El numero de centro debe ser 1 o 2' });
    }
    if (centros.some((otroCentro: any, otroIndice: number) => otroIndice !== indice && otroCentro.numeroCentro === centro.numeroCentro)) {
      return res.status(400).json({ error: 'No se puede enviar el mismo centro mas de una vez' });
    }

    const errorCentro = validarCentroAtencion(centro, indice + 1);
    if (errorCentro) return res.status(400).json({ error: errorCentro });

    centro.oficina = centro.oficina.trim();
    centro.horarioConsultas = centro.horarioConsultas.trim();
    centro.canalContacto = centro.canalContacto.trim();
    centro.urlContacto = centro.urlContacto.trim();
  }

  next();
};
