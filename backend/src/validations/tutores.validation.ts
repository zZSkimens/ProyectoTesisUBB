import type { Request, Response, NextFunction } from 'express';
import { formatearRut, rutChilenoValido } from '../utils/rut.js';

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

  if (!rut || typeof rut !== 'string' || !rutChilenoValido(rut)) {
    return res.status(400).json({ error: 'El RUT del estudiante no es valido' });
  }

  if (!nombre || typeof nombre !== 'string' || nombre.trim().split(/\s+/).length < 2) {
    return res.status(400).json({ error: 'Debe ingresar el nombre y apellido del estudiante' });
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@alumnos\.ubiobio\.cl$/i.test(email.trim())) {
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

  const configuracionSalas: Record<string, { pisos: number[]; salasPorPiso: number }> = {
    AA: { pisos: [1], salasPorPiso: 8 },
    AB: { pisos: [1, 2, 3], salasPorPiso: 2 },
    AC: { pisos: [1, 2, 3], salasPorPiso: 8 },
    AD: { pisos: [2, 3], salasPorPiso: 2 },
  };

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

    if (centro.modalidad !== 'presencial' && centro.modalidad !== 'online') {
      return res.status(400).json({ error: `La modalidad del centro ${indice + 1} no es valida` });
    }

    const camposTexto = ['oficina', 'horarioConsultas', 'canalContacto', 'urlContacto'];
    for (const campo of camposTexto) {
      if (typeof centro[campo] !== 'string') {
        return res.status(400).json({ error: `El campo ${campo} del centro ${indice + 1} debe ser texto` });
      }
      centro[campo] = centro[campo].trim();
    }

    if (centro.horarioConsultas.length < 3) {
      return res.status(400).json({ error: `Debe indicar un horario para el centro ${indice + 1}` });
    }

    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const diasIncluidos = diasSemana.filter((dia) => centro.horarioConsultas.toLowerCase().includes(dia));
    if (diasIncluidos.length < 1 || diasIncluidos.length > 2) {
      return res.status(400).json({ error: 'Cada centro debe tener disponibilidad entre 1 y 2 días por semana' });
    }

    if (centro.modalidad === 'presencial') {
      const codigoSala = /^A([1-3])(\d{2})(AA|AB|AC|AD)$/.exec(centro.oficina);
      if (!codigoSala) {
        return res.status(400).json({ error: `La sala del centro ${indice + 1} no es valida` });
      }

      const piso = Number(codigoSala[1]);
      const numeroSala = Number(codigoSala[2]);
      const edificio = codigoSala[3];
      const configuracion = configuracionSalas[edificio];
      if (!configuracion.pisos.includes(piso) || numeroSala < 1 || numeroSala > configuracion.salasPorPiso) {
        return res.status(400).json({ error: `La sala del centro ${indice + 1} no esta disponible` });
      }

      if (centro.canalContacto.length > 0 || centro.urlContacto.length > 0) {
        return res.status(400).json({ error: 'Un centro presencial no puede tener canal ni URL online' });
      }
    }

    if (centro.modalidad === 'online') {
      if (centro.oficina.length > 0) {
        return res.status(400).json({ error: 'Un centro online no puede tener una sala presencial' });
      }
      if (centro.canalContacto !== 'Discord' && centro.canalContacto !== 'Meet') {
        return res.status(400).json({ error: `La plataforma online del centro ${indice + 1} no es valida` });
      }
      if (centro.urlContacto.length > 0) {
        try {
          const url = new URL(centro.urlContacto);
          if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            return res.status(400).json({ error: 'La URL de contacto debe comenzar con http o https' });
          }
        } catch {
          return res.status(400).json({ error: `La URL del centro ${indice + 1} no es valida` });
        }
      }
    }
  }

  next();
};
