import { createHash, randomUUID } from 'node:crypto';
import type { Express } from 'express';
import bcrypt from 'bcryptjs';
import request from 'supertest';

interface TutorDePrueba {
  estudianteId: number;
  tutorId: number;
  token: string;
  iniciarSesion: () => Promise<string>;
}

export interface TutorTestContext extends TutorDePrueba {
  app: Express;
  crearOtroTutor: () => Promise<TutorDePrueba>;
  cerrar: () => Promise<void>;
}

export async function crearContextoTutorTest(): Promise<TutorTestContext> {
  const express = (await import('express')).default;
  const apiRoutes = (await import('../../routes/index.js')).default;
  const connection = await import('../../../db/connection.js');
  const schema = await import('../../../db/schema.js');

  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);
  const idsTutores: number[] = [];
  const hashesDeSesion = new Set<string>();

  const crearTutor = async (): Promise<TutorDePrueba> => {
    const etiqueta = randomUUID();
    const emailTutor = `tutor.integration.${etiqueta}@alumnos.ubiobio.cl`;
    const passwordTutor = `ClaveTemporal-${etiqueta}`;
    const [tutor] = await connection.db.insert(schema.usuarios).values({
      nombre: 'Tutor de integracion',
      email: emailTutor,
      passwordHash: await bcrypt.hash(passwordTutor, 10),
      rol: 'tutor',
      activo: true,
    }).returning({ id: schema.usuarios.id });
    idsTutores.push(tutor.id);

    const [estudiante] = await connection.db.insert(schema.estudiantes).values({
      rut: crearRutValidoUnico(),
      nombre: 'Estudiante de Integracion',
      email: `estudiante.integration.${etiqueta}@alumnos.ubiobio.cl`,
      carrera: 'Ingeniería Civil Informática',
      anioIngreso: new Date().getFullYear(),
      tutorId: tutor.id,
    }).returning({ id: schema.estudiantes.id });

    const iniciarSesion = async () => {
      const { body } = await request(app).post('/api/auth/login')
        .send({ email: emailTutor, password: passwordTutor }).expect(200);
      if (typeof body.token !== 'string' || !body.token) throw new Error('El inicio de sesión no devolvió un token');
      hashesDeSesion.add(createHash('sha256').update(body.token).digest('hex'));
      return body.token;
    };
    return {
      estudianteId: estudiante.id,
      tutorId: tutor.id,
      token: await iniciarSesion(),
      iniciarSesion,
    };
  };

  const cerrar = async () => {
    try {
      await connection.pool.query('DELETE FROM tokens_revocados WHERE hash = ANY($1::text[])', [[...hashesDeSesion]]);
      await connection.pool.query('DELETE FROM estudiantes WHERE tutor_id = ANY($1::int[])', [idsTutores]);
      await connection.pool.query('DELETE FROM misiones WHERE creado_por = ANY($1::int[])', [idsTutores]);
      await connection.pool.query('DELETE FROM usuarios WHERE id = ANY($1::int[])', [idsTutores]);
    } finally {
      await connection.pool.end();
    }
  };

  try {
    const tutor = await crearTutor();
    return { app, ...tutor, crearOtroTutor: crearTutor, cerrar };
  } catch (error) {
    await cerrar();
    throw error;
  }
}

function crearRutValidoUnico(): string {
  const cuerpo = String(20_000_000 + Math.floor(Math.random() * 9_000_000));
  let suma = 0;
  let multiplicador = 2;
  for (let indice = cuerpo.length - 1; indice >= 0; indice--) {
    suma += Number(cuerpo[indice]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resultado = 11 - (suma % 11);
  const digito = resultado === 11 ? '0' : resultado === 10 ? 'K' : String(resultado);
  return `${cuerpo.slice(0, 2)}.${cuerpo.slice(2, 5)}.${cuerpo.slice(5)}-${digito}`;
}
