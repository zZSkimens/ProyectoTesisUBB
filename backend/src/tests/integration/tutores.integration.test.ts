import dotenv from 'dotenv';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

dotenv.config();

// Estas pruebas escriben fixtures temporales en la base indicada por backend/.env.
// Mantenerlas desactivadas por defecto evita ejecutarlas accidentalmente.
const ejecutarIntegracion = process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!ejecutarIntegracion)('API de tutores (integración)', () => {
  let app: import('express').Express;
  let pool: typeof import('../../../db/connection.js').pool;
  let db: typeof import('../../../db/connection.js').db;
  let schema: typeof import('../../../db/schema.js');
  let tutorId: number;
  let estudianteId: number;
  let token: string;
  let jwtSecret: string;

  beforeAll(async () => {
    const expressModule = await import('express');
    const tutoresRoutes = (await import('../../routes/tutores.routes.js')).default;
    const connection = await import('../../../db/connection.js');
    const databaseSchema = await import('../../../db/schema.js');
    const { config } = await import('../../config/env.js');
    const jwt = (await import('jsonwebtoken')).default;
    pool = connection.pool;
    db = connection.db;
    schema = databaseSchema;
    jwtSecret = config.jwtSecret;

    const testTag = `${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
    const [tutor] = await db.insert(schema.usuarios).values({
      nombre: 'Tutor de integracion',
      email: `tutor.integration.${testTag}@alumnos.ubiobio.cl`,
      passwordHash: 'hash-no-utilizado-en-pruebas',
      rol: 'tutor',
      activo: true,
    }).returning({ id: schema.usuarios.id });
    tutorId = tutor.id;

    const rut = crearRutValidoUnico();
    const [estudiante] = await db.insert(schema.estudiantes).values({
      rut,
      nombre: 'Estudiante de Integracion',
      email: `estudiante.integration.${testTag}@alumnos.ubiobio.cl`,
      carrera: 'Ingeniería Civil Informática',
      anioIngreso: new Date().getFullYear(),
      tutorId,
    }).returning({ id: schema.estudiantes.id });
    estudianteId = estudiante.id;

    token = jwt.sign({ id: tutorId, nombre: 'Tutor de integracion', email: `tutor.integration.${testTag}@alumnos.ubiobio.cl`, rol: 'tutor' }, jwtSecret);

    app = expressModule.default();
    app.use(expressModule.default.json());
    app.use('/api/tutores', tutoresRoutes);

  }, 30_000);

  afterAll(async () => {
    if (pool) {
      try {
        if (tutorId) {
          // Todo lo creado usa un tutor temporal; al borrarlo se limpian también sus
          // centros y observaciones por las reglas de cascada del esquema.
          await pool.query('DELETE FROM estudiantes WHERE tutor_id = $1', [tutorId]);
          await pool.query('DELETE FROM usuarios WHERE id = $1', [tutorId]);
        }
      } finally {
        await pool.end();
      }
    }
  }, 30_000);

  it('GET /dashboard responde métricas para el tutor autenticado', async () => {
    const respuesta = await request(app)
      .get('/api/tutores/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(respuesta.body.metricas).toMatchObject({ totalEstudiantes: 1 });
    expect(respuesta.body.metricas).toHaveProperty('totalMisiones');
    expect(respuesta.body.metricas).toHaveProperty('alertas');
  });

  it('GET /estudiantes lista solo datos asignados al tutor', async () => {
    const respuesta = await request(app)
      .get('/api/tutores/estudiantes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(respuesta.body.estudiantes).toHaveLength(1);
    expect(respuesta.body.estudiantes[0]).toMatchObject({
      id: estudianteId,
      nombre: 'Estudiante de Integracion',
    });
  });

  it('POST /estudiantes/:id/observaciones registra y devuelve la bitácora', async () => {
    const respuesta = await request(app)
      .post(`/api/tutores/estudiantes/${estudianteId}/observaciones`)
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'consulta', titulo: 'Prueba de integración', contenido: 'Observación creada por la suite de integración.' })
      .expect(201);

    expect(respuesta.body.observacion).toMatchObject({
      estudianteId,
      tutorId,
      tipo: 'consulta',
      titulo: 'Prueba de integración',
    });
  });

  it('PUT /centros-atencion guarda los centros del tutor', async () => {
    const respuesta = await request(app)
      .put('/api/tutores/centros-atencion')
      .set('Authorization', `Bearer ${token}`)
      .send({
        centros: [{
          numeroCentro: 1,
          modalidad: 'online',
          oficina: '',
          horarioConsultas: 'Miércoles de 20:00 a 20:45',
          canalContacto: 'Meet',
          urlContacto: 'https://meet.google.com/test-room',
        }],
      })
      .expect(200);

    expect(respuesta.body.centros).toHaveLength(1);
    expect(respuesta.body.centros[0]).toMatchObject({
      tutorId,
      numeroCentro: 1,
      modalidad: 'online',
      canalContacto: 'Meet',
    });
  });
});

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
