import { eq, inArray } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { estudiantes, progresoEstudiantes } from '../../db/schema.js';
import { resumirProgreso } from '../utils/progreso.js';
import { misionesService } from './misiones.service.js';

export const dashboardTutorService = {
  async obtenerDashboard(tutorId: number) {
    const alumnos = await db
      .select()
      .from(estudiantes)
      .where(eq(estudiantes.tutorId, tutorId));

    const totalEstudiantes = alumnos.length;

    const misionesActivas = await misionesService.listarActivas(tutorId);

    const totalMisiones = misionesActivas.length;

    if (totalEstudiantes === 0) {
      return {
        totalEstudiantes: 0,
        totalMisiones,
        promedioAvanceGrupal: 0,
        estudiantesEnRiesgo: 0,
        estudiantesAlDia: 0,
      };
    }

    const studentIds = alumnos.map((a) => a.id);
    const progresosGrupo = await db
      .select()
      .from(progresoEstudiantes)
      .where(inArray(progresoEstudiantes.estudianteId, studentIds));

    let sumaPorcentajes = 0;
    let enRiesgoCount = 0;
    let alDiaCount = 0;
    const alertas: Array<{
      id: string;
      tipo: 'estudiante_riesgo' | 'actividad_critica';
      titulo: string;
      descripcion: string;
      nivel: 'critico' | 'advertencia';
      estudianteId?: number;
      estudianteNombre?: string;
      misionId?: number;
      porcentaje?: number;
    }> = [];

    for (const alumno of alumnos) {
      const resumen = resumirProgreso(misionesActivas.map((m) => m.id),
        progresosGrupo.filter((p) => p.estudianteId === alumno.id));
      const completadas = resumen.completadas;
      const porcentaje = resumen.porcentajeAvance;
      sumaPorcentajes += porcentaje;

      if (resumen.estadoAtencion === 'En riesgo') {
        enRiesgoCount++;
        alertas.push({
          id: `riesgo-${alumno.id}`,
          tipo: 'estudiante_riesgo',
          titulo: `${alumno.nombre} requiere apoyo temprano`,
          descripcion: `Ha completado solo un ${porcentaje}% de las actividades de inducción (${completadas} de ${totalMisiones}).`,
          nivel: 'critico',
          estudianteId: alumno.id,
          estudianteNombre: alumno.nombre,
          porcentaje,
        });
      } else if (resumen.estadoAtencion === 'Al dia') {
        alDiaCount++;
      }
    }

    for (const mision of misionesActivas) {
      const completadasMision = new Set(progresosGrupo.filter(
        (p) => p.misionId === mision.id && p.estado === 'completada'
      ).map((p) => p.estudianteId)).size;

      let porcentajeMision = 0;
      if (totalEstudiantes > 0) {
        porcentajeMision = Math.round((completadasMision / totalEstudiantes) * 100);
      }

      if (totalEstudiantes > 0 && porcentajeMision < 40) {
        alertas.push({
          id: `actividad-${mision.id}`,
          tipo: 'actividad_critica',
          titulo: `Baja participación en "${mision.titulo}"`,
          descripcion: `Solo el ${porcentajeMision}% de la cohorte (${completadasMision}/${totalEstudiantes}) ha completado esta actividad del módulo ${mision.modulo}.`,
          nivel: 'advertencia',
          misionId: mision.id,
          porcentaje: porcentajeMision,
        });
      }
    }

    const promedioAvanceGrupal = Math.round(sumaPorcentajes / totalEstudiantes);

    return {
      totalEstudiantes,
      totalMisiones,
      promedioAvanceGrupal,
      estudiantesEnRiesgo: enRiesgoCount,
      estudiantesAlDia: alDiaCount,
      alertas,
    };
  },
};
