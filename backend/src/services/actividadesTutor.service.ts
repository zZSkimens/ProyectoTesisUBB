import { eq, inArray } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { estudiantes, progresoEstudiantes } from '../../db/schema.js';
import { misionesService } from './misiones.service.js';

export const actividadesTutorService = {
  async obtenerResumenActividades(tutorId: number) {
    const alumnos = await db
      .select()
      .from(estudiantes)
      .where(eq(estudiantes.tutorId, tutorId));

    const totalEstudiantes = alumnos.length;

    const asignaciones = await misionesService.listarAsignadas(tutorId);
    const listaMisiones = asignaciones.filter(({ activa }) => activa).map(({ mision }) => mision);
    const misionesDesactivadas = asignaciones.filter(({ activa }) => !activa)
      .map(({ mision: { id, titulo, modulo } }) => ({ id, titulo, modulo }));

    const studentIds = alumnos.map((a) => a.id);
    let progresosGrupo: typeof progresoEstudiantes.$inferSelect[] = [];
    if (studentIds.length > 0) {
      progresosGrupo = await db
        .select()
        .from(progresoEstudiantes)
        .where(inArray(progresoEstudiantes.estudianteId, studentIds));
    }

    const actividades = listaMisiones.map((mision) => {
      const progresosMision = progresosGrupo.filter((p) => p.misionId === mision.id);
      const completaron = new Set(progresosMision.filter((p) => p.estado === 'completada').map((p) => p.estudianteId));
      const completadas = completaron.size;
      const enProgreso = new Set(progresosMision.filter((p) => p.estado === 'en_progreso' && !completaron.has(p.estudianteId)).map((p) => p.estudianteId)).size;
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
          return !completaron.has(alumno.id);
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
        condicionCumplimiento: mision.condicionCumplimiento,
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
    return { actividades, misionesDesactivadas };
  },
};
