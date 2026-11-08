import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { crearContextoTutorTest, type TutorTestContext } from './contextoTutor.js';

const ejecutarIntegracion = process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!ejecutarIntegracion)('POST /api/tutores/estudiantes/:id/observaciones', () => {
  let contexto: TutorTestContext;

  beforeAll(async () => { contexto = await crearContextoTutorTest(); }, 30_000);
  afterAll(async () => { if (contexto) await contexto.cerrar(); }, 30_000);

  it('registra y devuelve una observación del estudiante', async () => {
    const respuesta = await request(contexto.app)
      .post(`/api/tutores/estudiantes/${contexto.estudianteId}/observaciones`)
      .set('Authorization', `Bearer ${contexto.token}`)
      .send({ tipo: 'consulta', titulo: 'Prueba de integración', contenido: 'Observación creada por la suite de integración.' })
      .expect(201);

    const observacionCreada = respuesta.body.observacion;
    expect(observacionCreada).toMatchObject({
      estudianteId: contexto.estudianteId,
      tutorId: contexto.tutorId,
      tipo: 'consulta',
      titulo: 'Prueba de integración',
    });

    const consulta = await request(contexto.app)
      .get(`/api/tutores/estudiantes/${contexto.estudianteId}/observaciones`)
      .set('Authorization', `Bearer ${contexto.token}`)
      .expect(200);

    expect(consulta.body.observaciones).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: observacionCreada.id,
        estudianteId: contexto.estudianteId,
        tutorId: contexto.tutorId,
        titulo: 'Prueba de integración',
        contenido: 'Observación creada por la suite de integración.',
      }),
    ]));
  });
});
