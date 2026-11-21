import { and, desc, eq } from 'drizzle-orm';
import { ErrorAplicacion } from '../utils/errorAplicacion.js';
import { db } from '../../db/connection.js';
import { estudiantes, observacionesTutoria } from '../../db/schema.js';

export interface ObservacionItem {
  id: number;
  estudianteId: number;
  estudianteNombre?: string;
  tutorId: number;
  tipo: string;
  titulo: string;
  contenido: string;
  compromiso: string | null;
  creadoEn: string;
}

export const bitacoraService = {
  async crearObservacion(
    tutorId: number,
    estudianteId: number,
    data: { tipo?: string; titulo: string; contenido: string; compromiso?: string }
  ): Promise<ObservacionItem> {
    const [alumno] = await db
      .select()
      .from(estudiantes)
      .where(and(eq(estudiantes.id, estudianteId), eq(estudiantes.tutorId, tutorId)));

    if (!alumno) {
      throw new ErrorAplicacion('ESTUDIANTE_NO_ENCONTRADO', 'Estudiante no encontrado o no asignado a este tutor');
    }

    const [nuevaObservacion] = await db
      .insert(observacionesTutoria)
      .values({
        estudianteId,
        tutorId,
        tipo: data.tipo || 'consulta',
        titulo: data.titulo,
        contenido: data.contenido,
        compromiso: data.compromiso || null,
      })
      .returning();

    return {
      ...nuevaObservacion,
      estudianteNombre: alumno.nombre,
      creadoEn: nuevaObservacion.creadoEn.toISOString(),
    };
  },

  async obtenerObservaciones(tutorId: number, estudianteId: number): Promise<ObservacionItem[]> {
    const resultados = await db
      .select({
        id: observacionesTutoria.id,
        estudianteId: observacionesTutoria.estudianteId,
        estudianteNombre: estudiantes.nombre,
        tutorId: observacionesTutoria.tutorId,
        tipo: observacionesTutoria.tipo,
        titulo: observacionesTutoria.titulo,
        contenido: observacionesTutoria.contenido,
        compromiso: observacionesTutoria.compromiso,
        creadoEn: observacionesTutoria.creadoEn,
      })
      .from(observacionesTutoria)
      .innerJoin(estudiantes, eq(observacionesTutoria.estudianteId, estudiantes.id))
      .where(
        and(
          eq(observacionesTutoria.estudianteId, Number(estudianteId)),
          eq(observacionesTutoria.tutorId, tutorId),
          eq(estudiantes.tutorId, tutorId)
        )
      )
      .orderBy(desc(observacionesTutoria.creadoEn));

    return resultados.map((observacion) => ({
      ...observacion,
      creadoEn: observacion.creadoEn.toISOString(),
    }));
  },
};
