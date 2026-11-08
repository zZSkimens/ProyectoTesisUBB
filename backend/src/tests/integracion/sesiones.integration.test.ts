import { createHash } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { tokensRevocados, usuarios } from '../../../db/schema.js';
import { crearContextoTutorTest, type TutorTestContext } from './contextoTutor.js';

describe.skipIf(process.env.RUN_INTEGRATION_TESTS !== 'true')('cierre de sesión por token', () => {
  let contexto: TutorTestContext;

  beforeAll(async () => { contexto = await crearContextoTutorTest(); }, 30_000);
  afterAll(async () => { if (contexto) await contexto.cerrar(); }, 30_000);

  it('distingue sesiones del mismo segundo y revoca solo la que se cerró correctamente', async () => {
    const reloj = vi.spyOn(Date, 'now').mockReturnValue(Date.now());
    const [primera, segunda] = await Promise.all([contexto.iniciarSesion(), contexto.iniciarSesion()])
      .finally(() => reloj.mockRestore());
    expect(primera).not.toBe(segunda);

    const { db } = await import('../../../db/connection.js');
    const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
    const hashPrimera = hashToken(primera);
    const leerRevocaciones = () => db.select().from(tokensRevocados).where(inArray(tokensRevocados.hash, [
      hashPrimera, hashToken(segunda), hashToken(`${primera} extra`),
    ]));
    const api = request(contexto.app);
    await api.post('/api/auth/logout').set('Authorization', `Bearer ${primera} extra`).expect(401);
    expect(await leerRevocaciones()).toEqual([]);
    await api.get('/api/auth/perfil').set('Authorization', `Bearer ${primera}`).expect(200);

    await api.post('/api/auth/logout').set('Authorization', `Bearer ${primera}`).expect(200);
    const expiracion = jwt.decode(primera, { json: true })?.exp;
    if (typeof expiracion !== 'number') throw new Error('El token de sesión no tiene fecha de expiración');
    expect(await leerRevocaciones()).toEqual([
      { hash: hashPrimera, expiraEn: new Date(expiracion * 1000) },
    ]);
    await api.get('/api/auth/perfil').set('Authorization', `Bearer ${primera}`).expect(401);
    const perfil = await api.get('/api/auth/perfil').set('Authorization', `Bearer ${segunda}`).expect(200);
    expect(perfil.body.usuario.id).toBe(contexto.tutorId);
  });

  it('bloquea un token vigente cuando se deshabilita la cuenta del tutor', async () => {
    const tutor = await contexto.crearOtroTutor();
    const { db } = await import('../../../db/connection.js');
    const api = request(contexto.app);
    const consultarDashboard = () => api.get('/api/tutores/dashboard').set('Authorization', `Bearer ${tutor.token}`);
    await consultarDashboard().expect(200);

    await db.update(usuarios).set({ activo: false }).where(eq(usuarios.id, tutor.tutorId));

    await consultarDashboard().expect(401, { error: 'Esta cuenta ha sido deshabilitada' });
  });
});
