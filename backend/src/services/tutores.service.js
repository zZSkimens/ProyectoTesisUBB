import { and, eq } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { estudiantes, misiones, progresoEstudiantes } from '../../db/schema.js';

export const tutoresService = {
  async obtenerDashboard(tutorId) {
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

    for (const alumno of alumnos) {
      const completadas = progresosGrupo.filter(
        (p) => p.estudianteId === alumno.id && p.estado === 'completada'
      ).length;

      const porcentaje = totalMisiones > 0 ? Math.round((completadas / totalMisiones) * 100) : 0;
      sumaPorcentajes += porcentaje;

      if (porcentaje < 25) {
        enRiesgoCount++;
      } else if (porcentaje >= 50) {
        alDiaCount++;
      }
    }

    const promedioAvanceGrupal = Math.round(sumaPorcentajes / totalEstudiantes);

    return {
      totalEstudiantes,
      totalMisiones,
      promedioAvanceGrupal,
      estudiantesEnRiesgo: enRiesgoCount,
      estudiantesAlDia: alDiaCount,
    };
  },

  async listarEstudiantes(tutorId) {
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

      const porcentajeAvance = totalMisiones > 0 ? Math.round((completadas / totalMisiones) * 100) : 0;

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
        añoIngreso: alumno.anioIngreso,
        misionesCompletadas: completadas,
        misionesEnProgreso: enProgreso,
        totalMisiones,
        porcentajeAvance,
        puntajeTotal,
        estadoAtencion,
      };
    });
  },

  async obtenerDetalleEstudiante(tutorId, estudianteId) {
    const [alumno] = await db
      .select()
      .from(estudiantes)
      .where(and(eq(estudiantes.id, estudianteId), eq(estudiantes.tutorId, tutorId)))
      .limit(1);

    if (!alumno) {
      throw new Error('Estudiante no encontrado o no asignado a este tutor');
    }

    const listaMisiones = await db
      .select()
      .from(misiones)
      .where(eq(misiones.activo, true));

    const progresosAlumno = await db
      .select()
      .from(progresoEstudiantes)
      .where(eq(progresoEstudiantes.estudianteId, estudianteId));

    const detalleMisiones = listaMisiones.map((mision) => {
      const registroProgreso = progresosAlumno.find((p) => p.misionId === mision.id);

      return {
        misionId: mision.id,
        codigo: mision.codigo,
        titulo: mision.titulo,
        descripcion: mision.descripcion,
        modulo: mision.modulo,
        tipo: mision.tipo,
        puntosMaximos: mision.puntosRecompensa,
        orden: mision.orden,
        estado: registroProgreso ? registroProgreso.estado : 'pendiente',
        puntajeObtenido: registroProgreso ? registroProgreso.puntajeObtenido : 0,
        intentos: registroProgreso ? registroProgreso.intentos : 0,
        fechaCompletado: registroProgreso ? registroProgreso.fechaCompletado : null,
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
