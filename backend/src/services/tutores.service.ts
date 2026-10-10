import { and, eq } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { estudiantes, misiones, progresoEstudiantes } from '../../db/schema.js';

export const tutoresService = {
  async obtenerDashboard(tutorId: number) {
    const alumnos = await db
      .select()
      .from(estudiantes)
      .where(eq(estudiantes.tutorId, tutorId));

    const totalEstudiantes = alumnos.length;

    const misionesActivas = await db
      .select()
      .from(misiones)
      .where(eq(misiones.activo, true));

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
    const todosProgresos = await db.select().from(progresoEstudiantes);

    const progresosGrupo = todosProgresos.filter((p) =>
      studentIds.includes(p.estudianteId)
    );

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
      const completadas = progresosGrupo.filter(
        (p) => p.estudianteId === alumno.id && p.estado === 'completada'
      ).length;

      let porcentaje = 0;
      if (totalMisiones > 0) {
        porcentaje = Math.round((completadas / totalMisiones) * 100);
      }
      sumaPorcentajes += porcentaje;

      if (porcentaje < 25) {
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
      } else if (porcentaje >= 50) {
        alDiaCount++;
      }
    }

    for (const mision of misionesActivas) {
      const completadasMision = progresosGrupo.filter(
        (p) => p.misionId === mision.id && p.estado === 'completada'
      ).length;

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

  async obtenerResumenActividades(tutorId: number) {
    const alumnos = await db
      .select()
      .from(estudiantes)
      .where(eq(estudiantes.tutorId, tutorId));

    const totalEstudiantes = alumnos.length;

    const listaMisiones = await db
      .select()
      .from(misiones)
      .where(eq(misiones.activo, true))
      .orderBy(misiones.orden);

    const todosProgresos = await db.select().from(progresoEstudiantes);
    const studentIds = alumnos.map((a) => a.id);
    const progresosGrupo = todosProgresos.filter((p) =>
      studentIds.includes(p.estudianteId)
    );

    return listaMisiones.map((mision) => {
      const progresosMision = progresosGrupo.filter((p) => p.misionId === mision.id);
      const completadas = progresosMision.filter((p) => p.estado === 'completada').length;
      const enProgreso = progresosMision.filter((p) => p.estado === 'en_progreso').length;
      let noIniciadas = totalEstudiantes - completadas - enProgreso;
      if (noIniciadas < 0) {
        noIniciadas = 0;
      }

      let porcentajeCompletitud = 0;
      if (totalEstudiantes > 0) {
        porcentajeCompletitud = Math.round((completadas / totalEstudiantes) * 100);
      }

      const estudiantesPendientes = alumnos
        .filter((alumno) => {
          const prog = progresosMision.find((p) => p.estudianteId === alumno.id);
          if (!prog || prog.estado !== 'completada') {
            return true;
          }
          return false;
        })
        .map((alumno) => {
          const prog = progresosMision.find((p) => p.estudianteId === alumno.id);
          let estado = 'pendiente';
          if (prog) {
            estado = prog.estado;
          }
          return {
            id: alumno.id,
            nombre: alumno.nombre,
            rut: alumno.rut,
            email: alumno.email,
            estado,
          };
        });

      return {
        id: mision.id,
        codigo: mision.codigo,
        titulo: mision.titulo,
        descripcion: mision.descripcion,
        modulo: mision.modulo,
        tipo: mision.tipo,
        puntosRecompensa: mision.puntosRecompensa,
        orden: mision.orden,
        totalEstudiantes,
        completadas,
        enProgreso,
        noIniciadas,
        porcentajeCompletitud,
        estudiantesPendientes,
      };
    });
  },

  async listarEstudiantes(tutorId: number) {
    const alumnos = await db
      .select()
      .from(estudiantes)
      .where(eq(estudiantes.tutorId, tutorId));

    const misionesActivas = await db
      .select()
      .from(misiones)
      .where(eq(misiones.activo, true));
    const totalMisiones = misionesActivas.length;

    const todosProgresos = await db.select().from(progresoEstudiantes);

    return alumnos.map((alumno) => {
      const misProgresos = todosProgresos.filter((p) => p.estudianteId === alumno.id);
      const completadas = misProgresos.filter((p) => p.estado === 'completada').length;
      const enProgreso = misProgresos.filter((p) => p.estado === 'en_progreso').length;
      const puntajeTotal = misProgresos.reduce((sum, p) => sum + p.puntajeObtenido, 0);

      let porcentajeAvance = 0;
      if (totalMisiones > 0) {
        porcentajeAvance = Math.round((completadas / totalMisiones) * 100);
      }

      let estadoAtencion = 'Al dia';
      if (porcentajeAvance < 25) {
        estadoAtencion = 'En riesgo';
      } else if (porcentajeAvance < 50) {
        estadoAtencion = 'En progreso';
      }

      return {
        id: alumno.id,
        rut: alumno.rut,
        nombre: alumno.nombre,
        email: alumno.email,
        carrera: alumno.carrera,
        anioIngreso: alumno.anioIngreso,
        totalMisiones,
        misionesCompletadas: completadas,
        misionesEnProgreso: enProgreso,
        porcentajeAvance,
        puntajeTotal,
        estadoAtencion,
      };
    });
  },

  async obtenerDetalleEstudiante(tutorId: number, estudianteId: number | string) {
    const [alumno] = await db
      .select()
      .from(estudiantes)
      .where(and(eq(estudiantes.id, Number(estudianteId)), eq(estudiantes.tutorId, tutorId)));

    if (!alumno) {
      throw new Error('Estudiante no encontrado o no asignado a este tutor');
    }

    const listaMisiones = await db.select().from(misiones).orderBy(misiones.orden);

    const progresosAlumno = await db
      .select()
      .from(progresoEstudiantes)
      .where(eq(progresoEstudiantes.estudianteId, alumno.id));

    const detalleMisiones = listaMisiones.map((mision) => {
      const registroProgreso = progresosAlumno.find((p) => p.misionId === mision.id);

      let estado = 'pendiente';
      let puntajeObtenido = 0;
      let intentos = 0;
      let fechaCompletado: Date | null = null;

      if (registroProgreso) {
        estado = registroProgreso.estado;
        puntajeObtenido = registroProgreso.puntajeObtenido;
        intentos = registroProgreso.intentos;
        fechaCompletado = registroProgreso.fechaCompletado;
      }

      return {
        misionId: mision.id,
        codigo: mision.codigo,
        titulo: mision.titulo,
        descripcion: mision.descripcion,
        modulo: mision.modulo,
        tipo: mision.tipo,
        puntosMaximos: mision.puntosRecompensa,
        orden: mision.orden,
        estado,
        puntajeObtenido,
        intentos,
        fechaCompletado,
      };
    });

    return {
      estudiante: {
        id: alumno.id,
        rut: alumno.rut,
        nombre: alumno.nombre,
        email: alumno.email,
        carrera: alumno.carrera,
        añoIngreso: alumno.anioIngreso,
      },
      misiones: detalleMisiones,
    };
  },
};
