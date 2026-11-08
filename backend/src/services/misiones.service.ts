import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { misiones, misionesPorTutor } from '../../db/schema.js';

export const LUGARES_MISION = ['Biblioteca', 'Casino', 'FACE', 'Apoyo estudiantil', 'DDE'] as const;
export const MODULOS_MISION = ['Descubre la UBB', 'Caja de herramientas'] as const;
export interface BorradorInput {
  titulo: string;
  objetivo: string;
  descripcion: string;
  lugar: typeof LUGARES_MISION[number];
  modulo: string;
  puntosRecompensa: number;
  orden: number;
}

const misionDisponible = and(eq(misiones.activo, true), eq(misiones.estadoPublicacion, 'publicada'));

function listarAsignaciones(tutorId: number, activa?: boolean) {
  return db.select({ mision: misiones, activa: misionesPorTutor.activa })
    .from(misionesPorTutor)
    .innerJoin(misiones, eq(misionesPorTutor.misionId, misiones.id))
    .where(and(
      eq(misionesPorTutor.tutorId, tutorId),
      activa === undefined ? undefined : eq(misionesPorTutor.activa, activa),
      misionDisponible,
    ))
    .orderBy(misiones.orden);
}

export const misionesService = {
  async listarActivas(tutorId: number) {
    const asignaciones = await listarAsignaciones(tutorId, true);
    return asignaciones.map(({ mision }) => mision);
  },
  listarAsignadas(tutorId: number) {
    return listarAsignaciones(tutorId);
  },
  async actualizarActivacionParaTutor(tutorId: number, misionId: number, activa: boolean) {
    const [asignacion] = await db.update(misionesPorTutor).set({ activa })
      .from(misiones)
      .where(and(
        eq(misionesPorTutor.tutorId, tutorId),
        eq(misionesPorTutor.misionId, misionId),
        eq(misiones.id, misionesPorTutor.misionId),
        activa ? misionDisponible : undefined,
      ))
      .returning({ misionId: misionesPorTutor.misionId });
    return Boolean(asignacion);
  },
  async quitarDesactivadaParaTutor(tutorId: number, misionId: number) {
    const [asignacion] = await db.delete(misionesPorTutor)
      .where(and(
        eq(misionesPorTutor.tutorId, tutorId),
        eq(misionesPorTutor.misionId, misionId),
        eq(misionesPorTutor.activa, false),
      ))
      .returning({ misionId: misionesPorTutor.misionId });
    return Boolean(asignacion);
  },
  listarBorradores(tutorId: number) {
    return db.select().from(misiones).where(and(
      eq(misiones.creadoPor, tutorId), eq(misiones.estadoPublicacion, 'borrador'),
    )).orderBy(desc(misiones.actualizadoEn));
  },
  publicarParaTutor(tutorId: number, misionId: number, condicionCumplimiento: string) {
    return db.transaction(async (tx) => {
      const misionPropia = and(eq(misiones.id, misionId), eq(misiones.creadoPor, tutorId));
      const [mision] = await tx.select().from(misiones).where(misionPropia).for('update');
      if (mision?.estadoPublicacion === 'publicada') {
        const [asignacion] = await tx.select({ misionId: misionesPorTutor.misionId }).from(misionesPorTutor)
          .where(and(eq(misionesPorTutor.tutorId, tutorId), eq(misionesPorTutor.misionId, misionId)));
        return asignacion ? 'publicada' : 'no_encontrada';
      }
      if (mision?.estadoPublicacion !== 'borrador') return 'no_encontrada';

      if (!mision.objetivo.trim() || !mision.descripcion.trim() ||
          !LUGARES_MISION.some((lugar) => lugar === mision.lugar) ||
          !MODULOS_MISION.some((modulo) => modulo === mision.modulo) ||
          mision.puntosRecompensa < 100 || mision.puntosRecompensa > 200) {
        return 'incompleta';
      }

      await tx.update(misiones).set({
        estadoPublicacion: 'publicada',
        activo: true,
        tipo: 'guiada',
        condicionCumplimiento,
        actualizadoEn: new Date(),
      }).where(misionPropia);
      await tx.insert(misionesPorTutor).values({ tutorId, misionId });
      return 'publicada';
    });
  },
  async guardarBorrador(tutorId: number, datos: BorradorInput, id?: number) {
    // Los campos de publicacion no se toman de la peticion.
    const valores = {
      titulo: datos.titulo, objetivo: datos.objetivo, descripcion: datos.descripcion,
      lugar: datos.lugar, modulo: datos.modulo, puntosRecompensa: datos.puntosRecompensa,
      orden: datos.orden, tipo: 'pendiente', activo: false,
      estadoPublicacion: 'borrador', condicionCumplimiento: null, actualizadoEn: new Date(),
    };
    if (id !== undefined) {
      const [mision] = await db.update(misiones).set(valores).where(and(
        eq(misiones.id, id), eq(misiones.creadoPor, tutorId),
        eq(misiones.estadoPublicacion, 'borrador'),
      )).returning();
      return mision;
    }
    const [mision] = await db.insert(misiones).values({
      ...valores, codigo: `MIS-${randomUUID()}`, creadoPor: tutorId,
    }).returning();
    return mision;
  },
};
