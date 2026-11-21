import { afterAll, beforeAll, describe, it } from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import { crearContextoTutorTest, type TutorTestContext } from './contextoTutor.js';

describe.skipIf(process.env.RUN_INTEGRATION_TESTS !== 'true')('fotos de perfil', () => {
  let contexto: TutorTestContext;

  beforeAll(async () => { contexto = await crearContextoTutorTest(); }, 30_000);
  afterAll(async () => { if (contexto) await contexto.cerrar(); }, 30_000);

  it.each(['png', 'jpeg', 'webp'] as const)('rechaza una foto %s incompleta y conserva la anterior', async (formato) => {
    const ruta = '/api/auth/perfil/foto';
    const tipo = `image/${formato}`;
    const autorizacion = `Bearer ${contexto.token}`;
    const api = request(contexto.app);
    const imagen = await sharp({ create: { width: 32, height: 32, channels: 3, background: '#153451' } })
      .toFormat(formato).toBuffer();
    const fotoGuardada = { foto: `data:${tipo};base64,${imagen.toString('base64')}` };
    const imagenIncompleta = imagen.subarray(0, Math.floor(imagen.length / 2));

    await api.put(ruta).set('Authorization', autorizacion).type(tipo).send(imagen).expect(200, fotoGuardada);
    await api.put(ruta).set('Authorization', autorizacion).type(tipo).send(imagenIncompleta).expect(400);
    await api.put(ruta).set('Authorization', autorizacion).type(tipo).send(imagen.subarray(0, 4)).expect(400);
    await api.get(ruta).set('Authorization', autorizacion).expect(200, fotoGuardada);
  });

  it('reserva el 415 para formatos incompatibles', async () => {
    const ruta = '/api/auth/perfil/foto';
    const autorizacion = `Bearer ${contexto.token}`;
    const api = request(contexto.app);
    const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#153451' } })
      .png().toBuffer();

    await api.put(ruta).set('Authorization', autorizacion).type('image/gif').send(png).expect(415);
    await api.put(ruta).set('Authorization', autorizacion).type('image/jpeg').send(png).expect(415);
  });
});
