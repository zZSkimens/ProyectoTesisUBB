import type { Express } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import request from 'supertest';

dotenv.config();

export interface TutorTestContext {
  app: Express;
  estudianteId: number;
  tutorId: number;
  token: string;
  cerrar: () => Promise<void>;
}

export async function crearContextoTutorTest(): Promise<TutorTestContext> {
  const express = (await import('express')).default;
  const apiRoutes = (await import('../../routes/index.js')).default;
  const connection = await import('../../../db/connection.js');
  const schema = await import('../../../db/schema.js');

  const etiqueta = `${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  const emailTutor = `tutor.integration.${etiqueta}@alumnos.ubiobio.cl`;
  const passwordTutor = `ClaveTemporal-${etiqueta}`;

  const [tutor] = await connection.db.insert(schema.usuarios).values({
    nombre: 'Tutor de integracion',
    email: emailTutor,
    passwordHash: await bcrypt.hash(passwordTutor, 10),
    rol: 'tutor',
    activo: true,
  }).returning({ id: schema.usuarios.id });

  try {
    const [estudiante] = await connection.db.insert(schema.estudiantes).values({
      rut: crearRutValidoUnico(),
      nombre: 'Estudiante de Integracion',
      email: `estudiante.integration.${etiqueta}@alumnos.ubiobio.cl`,
      carrera: 'Ingeniería Civil Informática',
      anioIngreso: new Date().getFullYear(),
      tutorId: tutor.id,
    }).returning({ id: schema.estudiantes.id });

    const app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);

    // El token se obtiene pasando por el endpoint real de inicio de sesión.
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: emailTutor, password: passwordTutor })
      .expect(200);
    if (!login.body.token) {
      throw new Error('El inicio de sesión no devolvió un token');
    }

    return {
      app,
      estudianteId: estudiante.id,
      tutorId: tutor.id,
      token: login.body.token as string,
      cerrar: async () => {
        try {
          await connection.pool.query('DELETE FROM estudiantes WHERE tutor_id = $1', [tutor.id]);
          await connection.pool.query('DELETE FROM usuarios WHERE id = $1', [tutor.id]);
        } finally {
          await connection.pool.end();
        }
      },
    };
  } catch (error) {
    try {
      await connection.pool.query('DELETE FROM estudiantes WHERE tutor_id = $1', [tutor.id]);
      await connection.pool.query('DELETE FROM usuarios WHERE id = $1', [tutor.id]);
    } finally {
      await connection.pool.end();
    }
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
