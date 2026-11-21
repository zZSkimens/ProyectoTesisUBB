import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { centrosAtencion } from '../../db/schema.js';

export interface CentroAtencionItem {
  tutorId: number;
  numeroCentro: number;
  modalidad: 'presencial' | 'online';
  oficina: string;
  horarioConsultas: string;
  canalContacto: string;
  urlContacto: string;
  actualizadoEn: string;
  guardado?: boolean;
}

const centroAtencionPorDefecto = (tutorId: number, numeroCentro: number): CentroAtencionItem => ({
  tutorId,
  numeroCentro,
  modalidad: 'presencial',
  oficina: numeroCentro === 1 ? 'A101AA' : '',
  horarioConsultas: numeroCentro === 1 ? 'Martes y Jueves de 15:00 a 17:00 hrs' : '',
  canalContacto: '',
  urlContacto: '',
  actualizadoEn: new Date().toISOString(),
});

export const centrosAtencionService = {
  async obtenerHorarioConsultas(tutorId: number) {
    const centrosGuardados = await db
      .select()
      .from(centrosAtencion)
      .where(eq(centrosAtencion.tutorId, tutorId));

    const centros: CentroAtencionItem[] = [];
    for (const numeroCentro of [1, 2]) {
      const centroGuardado = centrosGuardados.find((centro) => centro.numeroCentro === numeroCentro);
      if (centroGuardado) {
        centros.push({
          ...centroGuardado,
          modalidad: centroGuardado.modalidad as 'presencial' | 'online',
          actualizadoEn: centroGuardado.actualizadoEn.toISOString(),
          guardado: true,
        });
      } else {
        centros.push(centroAtencionPorDefecto(tutorId, numeroCentro));
      }
    }

    return centros;
  },

  async actualizarHorarioConsultas(
    tutorId: number,
    data: { centros: Array<Omit<CentroAtencionItem, 'tutorId' | 'actualizadoEn'>> }
  ) {
    const valores = data.centros.map((centro) => ({
      ...centro,
      tutorId,
      oficina: centro.oficina.trim(),
      horarioConsultas: centro.horarioConsultas.trim(),
      canalContacto: centro.canalContacto.trim(),
      urlContacto: centro.urlContacto.trim(),
      actualizadoEn: new Date(),
    }));

    const actualizados = await db
      .insert(centrosAtencion)
      .values(valores)
      .onConflictDoUpdate({
        target: [centrosAtencion.tutorId, centrosAtencion.numeroCentro],
        set: {
          modalidad: sql`excluded.modalidad`,
          oficina: sql`excluded.oficina`,
          horarioConsultas: sql`excluded.horario_consultas`,
          canalContacto: sql`excluded.canal_contacto`,
          urlContacto: sql`excluded.url_contacto`,
          actualizadoEn: new Date(),
        },
      })
      .returning();

    return actualizados
      .sort((centroA, centroB) => centroA.numeroCentro - centroB.numeroCentro)
      .map((centro) => ({
        ...centro,
        modalidad: centro.modalidad as 'presencial' | 'online',
        actualizadoEn: centro.actualizadoEn.toISOString(),
        guardado: true,
      }));
  },
};
