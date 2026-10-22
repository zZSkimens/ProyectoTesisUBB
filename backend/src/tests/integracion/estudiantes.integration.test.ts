import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { crearContextoTutorTest, type TutorTestContext } from './contextoTutor.js';

const ejecutarIntegracion = process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!ejecutarIntegracion)('GET /api/tutores/estudiantes', () => {
  let contexto: TutorTestContext;

  beforeAll(async () => { contexto = await crearContextoTutorTest(); }, 30_000);
  afterAll(async () => { if (contexto) await contexto.cerrar(); }, 30_000);

  it('lista solo los estudiantes asignados al tutor', async () => {
    const respuesta = await request(contexto.app)
      .get('/api/tutores/estudiantes')
      .set('Authorization', `Bearer ${contexto.token}`)
      .expect(200);

    expect(respuesta.body.estudiantes).toHaveLength(1);
    expect(respuesta.body.estudiantes[0]).toMatchObject({
      id: contexto.estudianteId,
      nombre: 'Estudiante de Integracion',
    });
  });
});
