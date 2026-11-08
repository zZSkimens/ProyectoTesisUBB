import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { misiones, misionesPorTutor, progresoEstudiantes } from '../../../db/schema.js';
import { crearContextoTutorTest, type TutorTestContext } from './contextoTutor.js';

const borrador = {
  titulo: 'Recorre la facultad', objetivo: 'Orientarse en la facultad',
  descripcion: 'Identifica tres lugares del edificio', lugar: 'FACE',
  modulo: 'Descubre la UBB', puntosRecompensa: 150, orden: 1,
};
const condicion = { condicionCumplimiento: 'Identificar tres lugares de la facultad' };

describe.skipIf(process.env.RUN_INTEGRATION_TESTS !== 'true')('misiones por grupo', () => {
  let contexto: TutorTestContext;

  beforeAll(async () => { contexto = await crearContextoTutorTest(); }, 30_000);
  afterAll(async () => { if (contexto) await contexto.cerrar(); }, 30_000);

  it('publica el mismo borrador y permite desactivar, reactivar y quitar solo para el grupo propio', async () => {
    const otroTutor = await contexto.crearOtroTutor();
    const { db } = await import('../../../db/connection.js');
    const api = request(contexto.app);
    const propia = `Bearer ${contexto.token}`;
    const ajena = `Bearer ${otroTutor.token}`;
    const actividades = async (autorizacion = propia) => (await api.get('/api/tutores/actividades')
      .set('Authorization', autorizacion).expect(200)).body;
    const ficha = async () => (await api.get(`/api/tutores/estudiantes/${contexto.estudianteId}`)
      .set('Authorization', propia).expect(200)).body;

    const { body: { mision } } = await api.post('/api/misiones/borradores').set('Authorization', propia)
      .send(borrador).expect(201);
    const ruta = `/api/misiones/${mision.id}`;
    const publicar = `/api/misiones/borradores/${mision.id}/publicar`;

    expect((await actividades()).actividades).toEqual([]);
    await api.post(publicar).set('Authorization', ajena).send(condicion).expect(404);
    await api.post(publicar).set('Authorization', propia).send(condicion).expect(200);
    const { body: { misiones } } = await api.get('/api/misiones/borradores').set('Authorization', propia).expect(200);
    expect(misiones).toEqual([]);
    expect((await actividades()).actividades).toMatchObject([{ id: mision.id, ...condicion }]);
    expect((await actividades(ajena)).actividades).toEqual([]);

    // Dos grupos comparten la misma misión para comprobar el alcance de cada cambio.
    await db.insert(misionesPorTutor).values({ tutorId: otroTutor.tutorId, misionId: mision.id });
    await db.insert(progresoEstudiantes).values({
      estudianteId: contexto.estudianteId, misionId: mision.id, estado: 'completada', puntajeObtenido: 150,
    });

    await api.patch(`${ruta}/desactivar`).set('Authorization', propia).expect(200);
    expect(await actividades()).toMatchObject({ actividades: [], misionesDesactivadas: [{ id: mision.id }] });
    expect((await actividades(ajena)).actividades).toMatchObject([{ id: mision.id }]);
    expect(await ficha()).toMatchObject({ misiones: [], estudiante: { puntajeTotal: 150 } });

    await api.patch(`${ruta}/reactivar`).set('Authorization', propia).expect(200);
    expect(await ficha()).toMatchObject({ misiones: [{ misionId: mision.id, estado: 'completada' }], estudiante: { puntajeTotal: 150 } });
    await api.delete(`${ruta}/asignacion`).set('Authorization', propia).expect(404);

    await api.patch(`${ruta}/desactivar`).set('Authorization', propia).expect(200);
    await api.delete(`${ruta}/asignacion`).set('Authorization', propia).expect(200);
    await api.patch(`${ruta}/reactivar`).set('Authorization', propia).expect(404);
    await api.post(publicar).set('Authorization', propia).send(condicion).expect(404);
    expect(await actividades()).toEqual({ actividades: [], misionesDesactivadas: [] });
    expect((await actividades(ajena)).actividades).toMatchObject([{ id: mision.id }]);
    expect(await ficha()).toMatchObject({ misiones: [], estudiante: { puntajeTotal: 150 } });
  }, 30_000);

  it('conserva el borrador si falta la condición y rechaza cambios de un tutor sin asignación', async () => {
    const dueño = await contexto.crearOtroTutor();
    const { db } = await import('../../../db/connection.js');
    const api = request(contexto.app);
    const propia = `Bearer ${dueño.token}`;
    const ajena = `Bearer ${contexto.token}`;
    const { body: { mision } } = await api.post('/api/misiones/borradores').set('Authorization', propia)
      .send(borrador).expect(201);
    const publicar = `/api/misiones/borradores/${mision.id}/publicar`;
    const ruta = `/api/misiones/${mision.id}`;
    const leerAsignaciones = () => db.select({ tutorId: misionesPorTutor.tutorId, activa: misionesPorTutor.activa })
      .from(misionesPorTutor).where(eq(misionesPorTutor.misionId, mision.id));

    await api.post(publicar).set('Authorization', propia).send({ condicionCumplimiento: ' ' }).expect(400);
    const [guardada] = await db.select().from(misiones).where(eq(misiones.id, mision.id));
    expect(guardada).toMatchObject({ estadoPublicacion: 'borrador', activo: false, condicionCumplimiento: null });
    expect(await leerAsignaciones()).toEqual([]);

    await api.post(publicar).set('Authorization', propia).send(condicion).expect(200);
    await api.patch(`${ruta}/desactivar`).set('Authorization', ajena).expect(404);
    expect(await leerAsignaciones()).toEqual([{ tutorId: dueño.tutorId, activa: true }]);

    await api.patch(`${ruta}/desactivar`).set('Authorization', propia).expect(200);
    await api.patch(`${ruta}/reactivar`).set('Authorization', ajena).expect(404);
    await api.delete(`${ruta}/asignacion`).set('Authorization', ajena).expect(404);
    expect(await leerAsignaciones()).toEqual([{ tutorId: dueño.tutorId, activa: false }]);
  }, 30_000);
});
