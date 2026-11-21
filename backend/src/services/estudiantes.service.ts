import { and, DrizzleQueryError, eq, inArray } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { estudiantes, misiones, progresoEstudiantes } from '../../db/schema.js';
import { ErrorAplicacion } from '../utils/errorAplicacion.js';
import { resumirPuntos } from '../utils/puntos.js';
import { resumirProgreso } from '../utils/progreso.js';
import { normalizarRut } from '../utils/rut.js';
import { misionesService } from './misiones.service.js';

export const estudiantesService = {
  async listarEstudiantes(tutorId: number, filtros?: { busqueda?: string; estado?: string }) {
    const alumnos = await db
      .select()
      .from(estudiantes)
      .where(eq(estudiantes.tutorId, tutorId));

    const [misionesActivas, misionesPublicadas] = await Promise.all([
      misionesService.listarActivas(tutorId),
      db.select({ id: misiones.id, puntosRecompensa: misiones.puntosRecompensa }).from(misiones)
        .where(eq(misiones.estadoPublicacion, 'publicada')),
    ]);
    const totalMisiones = misionesActivas.length;

    const studentIds = alumnos.map((alumno) => alumno.id);
    let progresosGrupo: typeof progresoEstudiantes.$inferSelect[] = [];
    if (studentIds.length > 0) {
      progresosGrupo = await db
        .select()
        .from(progresoEstudiantes)
        .where(inArray(progresoEstudiantes.estudianteId, studentIds));
    }

    let lista = alumnos.map((alumno) => {
      const misProgresos = progresosGrupo.filter((p) => p.estudianteId === alumno.id);
      const { completadas, enProgreso, porcentajeAvance, estadoAtencion } =
        resumirProgreso(misionesActivas.map((m) => m.id), misProgresos);

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
        ...resumirPuntos(misionesPublicadas, misProgresos),
        estadoAtencion,
      };
    });

    if (filtros && filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase().trim();
      lista = lista.filter(
        (est) =>
          est.nombre.toLowerCase().includes(termino) ||
          est.rut.toLowerCase().includes(termino) ||
          est.email.toLowerCase().includes(termino)
      );
    }

    if (filtros && filtros.estado) {
      const estadoFiltro = filtros.estado.toLowerCase().trim();
      if (estadoFiltro === 'riesgo') {
        lista = lista.filter((e) => e.estadoAtencion === 'En riesgo');
      } else if (estadoFiltro === 'progreso') {
        lista = lista.filter((e) => e.estadoAtencion === 'En progreso');
      } else if (estadoFiltro === 'al_dia' || estadoFiltro === 'al dia') {
        lista = lista.filter((e) => e.estadoAtencion === 'Al dia');
      }
    }

    return lista;
  },

  async crearEstudiante(
    tutorId: number,
    data: { rut: string; nombre: string; email: string; carrera: string }
  ) {
    const existentes = await db
      .select({ rut: estudiantes.rut, email: estudiantes.email })
      .from(estudiantes);
    const rutExistente = existentes.find(
      (estudiante) => normalizarRut(estudiante.rut) === normalizarRut(data.rut)
    );

    if (rutExistente) {
      throw new ErrorAplicacion('ESTUDIANTE_DUPLICADO', 'Ya existe un estudiante registrado con este RUT');
    }

    const emailNormalizado = data.email.trim().toLowerCase();
    const emailExistente = existentes.find(
      (estudiante) => estudiante.email.trim().toLowerCase() === emailNormalizado
    );

    if (emailExistente) {
      throw new ErrorAplicacion('ESTUDIANTE_DUPLICADO', 'Ya existe un estudiante registrado con este correo institucional');
    }

    try {
      const [nuevo] = await db
        .insert(estudiantes)
        .values({
          rut: data.rut,
          nombre: data.nombre,
          email: emailNormalizado,
          carrera: data.carrera,
          anioIngreso: new Date().getFullYear(),
          tutorId,
        })
        .returning();

      return nuevo;
    } catch (error) {
      const causa = error instanceof DrizzleQueryError ? error.cause : error;
      if (typeof causa === 'object' && causa !== null && 'code' in causa && causa.code === '23505') {
        const restriccion = 'constraint' in causa ? causa.constraint : undefined;
        if (typeof restriccion === 'string' && restriccion.includes('rut')) {
          throw new ErrorAplicacion('ESTUDIANTE_DUPLICADO', 'Ya existe un estudiante registrado con este RUT');
        }
        if (typeof restriccion === 'string' && restriccion.includes('email')) {
          throw new ErrorAplicacion('ESTUDIANTE_DUPLICADO', 'Ya existe un estudiante registrado con este correo institucional');
        }
        throw new ErrorAplicacion('ESTUDIANTE_DUPLICADO', 'Ya existe otro estudiante con ese RUT o correo institucional');
      }
      throw error;
    }
  },

  async eliminarEstudiante(tutorId: number, estudianteId: number) {
    const [eliminado] = await db
      .delete(estudiantes)
      .where(and(eq(estudiantes.id, estudianteId), eq(estudiantes.tutorId, tutorId)))
      .returning({ id: estudiantes.id });

    if (!eliminado) {
      throw new ErrorAplicacion('ESTUDIANTE_NO_ENCONTRADO', 'Estudiante no encontrado o no asignado a este tutor');
    }

    return eliminado;
  },

  async obtenerDetalleEstudiante(tutorId: number, estudianteId: number | string) {
    const [alumno] = await db
      .select()
      .from(estudiantes)
      .where(and(eq(estudiantes.id, Number(estudianteId)), eq(estudiantes.tutorId, tutorId)));

    if (!alumno) {
      throw new ErrorAplicacion('ESTUDIANTE_NO_ENCONTRADO', 'Estudiante no encontrado o no asignado a este tutor');
    }

    const [listaMisiones, misionesPublicadas] = await Promise.all([
      misionesService.listarActivas(tutorId),
      db.select({ id: misiones.id, puntosRecompensa: misiones.puntosRecompensa }).from(misiones)
        .where(eq(misiones.estadoPublicacion, 'publicada')),
    ]);

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
        condicionCumplimiento: mision.condicionCumplimiento,
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
        ...resumirPuntos(misionesPublicadas, progresosAlumno),
      },
      misiones: detalleMisiones,
    };
  },
};
