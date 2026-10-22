import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { crearContextoTutorTest, type TutorTestContext } from './contextoTutor.js';

const ejecutarIntegracion = process.env.RUN_INTEGRATION_TESTS === 'true';

describe.skipIf(!ejecutarIntegracion)('PUT /api/tutores/centros-atencion', () => {
  let contexto: TutorTestContext;

  beforeAll(async () => { contexto = await crearContextoTutorTest(); }, 30_000);
  afterAll(async () => { if (contexto) await contexto.cerrar(); }, 30_000);

  it('guarda los centros de atención del tutor', async () => {
    const respuesta = await request(contexto.app)
      .put('/api/tutores/centros-atencion')
      .set('Authorization', `Bearer ${contexto.token}`)
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
      tutorId: contexto.tutorId,
      numeroCentro: 1,
      modalidad: 'online',
      canalContacto: 'Meet',
    });

    const consulta = await request(contexto.app)
      .get('/api/tutores/centros-atencion')
      .set('Authorization', `Bearer ${contexto.token}`)
      .expect(200);

    expect(consulta.body.centros).toEqual(expect.arrayContaining([
      expect.objectContaining({
        tutorId: contexto.tutorId,
        numeroCentro: 1,
        modalidad: 'online',
        horarioConsultas: 'Miércoles de 20:00 a 20:45',
        canalContacto: 'Meet',
        urlContacto: 'https://meet.google.com/test-room',
        guardado: true,
      }),
    ]));
  });
});
