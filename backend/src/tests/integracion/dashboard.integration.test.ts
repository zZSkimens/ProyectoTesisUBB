import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { crearContextoTutorTest, type TutorTestContext } from './contextoTutor.js';

const ejecutarIntegracion = process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!ejecutarIntegracion)('GET /api/tutores/dashboard', () => {
  let contexto: TutorTestContext;

  beforeAll(async () => { contexto = await crearContextoTutorTest(); }, 30_000);
  afterAll(async () => { if (contexto) await contexto.cerrar(); }, 30_000);

  it('responde métricas para el tutor autenticado', async () => {
    const respuesta = await request(contexto.app)
      .get('/api/tutores/dashboard')
      .set('Authorization', `Bearer ${contexto.token}`)
      .expect(200);

    expect(respuesta.body.metricas).toMatchObject({ totalEstudiantes: 1 });
    expect(respuesta.body.metricas).toHaveProperty('totalMisiones');
    expect(respuesta.body.metricas).toHaveProperty('alertas');
  });
});
