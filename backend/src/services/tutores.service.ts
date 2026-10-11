import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import {
  estudiantes,
  centrosAtencion,
  misiones,
  observacionesTutoria,
  progresoEstudiantes,
} from '../../db/schema.js';
import { normalizarRut } from '../utils/rut.js';

const UMBRAL_ESTUDIANTE_EN_RIESGO = 35;
const UMBRAL_ESTUDIANTE_AL_DIA = 50;

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
      const completadas = progresosGrupo.filter(
        (p) => p.estudianteId === alumno.id && p.estado === 'completada'
      ).length;

      let porcentaje = 0;
      if (totalMisiones > 0) {
        porcentaje = Math.round((completadas / totalMisiones) * 100);
      }
      sumaPorcentajes += porcentaje;

      if (porcentaje < UMBRAL_ESTUDIANTE_EN_RIESGO) {
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
      } else if (porcentaje >= UMBRAL_ESTUDIANTE_AL_DIA) {
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

    const studentIds = alumnos.map((a) => a.id);
    let progresosGrupo: typeof progresoEstudiantes.$inferSelect[] = [];
    if (studentIds.length > 0) {
      progresosGrupo = await db
        .select()
        .from(progresoEstudiantes)
        .where(inArray(progresoEstudiantes.estudianteId, studentIds));
    }

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

  async listarEstudiantes(tutorId: number, filtros?: { busqueda?: string; estado?: string }) {
    const alumnos = await db
      .select()
      .from(estudiantes)
      .where(eq(estudiantes.tutorId, tutorId));

    const misionesActivas = await db
      .select()
      .from(misiones)
      .where(eq(misiones.activo, true));
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
      const completadas = misProgresos.filter((p) => p.estado === 'completada').length;
      const enProgreso = misProgresos.filter((p) => p.estado === 'en_progreso').length;
      const puntajeTotal = misProgresos.reduce((sum, p) => sum + p.puntajeObtenido, 0);

      let porcentajeAvance = 0;
      if (totalMisiones > 0) {
        porcentajeAvance = Math.round((completadas / totalMisiones) * 100);
      }

      let estadoAtencion = 'Al dia';
      if (porcentajeAvance < UMBRAL_ESTUDIANTE_EN_RIESGO) {
        estadoAtencion = 'En riesgo';
      } else if (porcentajeAvance < UMBRAL_ESTUDIANTE_AL_DIA) {
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
      throw new Error('Ya existe un estudiante registrado con este RUT');
    }

    const emailNormalizado = data.email.trim().toLowerCase();
    const emailExistente = existentes.find(
      (estudiante) => estudiante.email.trim().toLowerCase() === emailNormalizado
    );

    if (emailExistente) {
      throw new Error('Ya existe un estudiante registrado con este correo institucional');
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
    } catch (error: any) {
      if (error.code === '23505') {
        if (typeof error.constraint === 'string' && error.constraint.includes('rut')) {
          throw new Error('Ya existe un estudiante registrado con este RUT');
        }
        if (typeof error.constraint === 'string' && error.constraint.includes('email')) {
          throw new Error('Ya existe un estudiante registrado con este correo institucional');
        }
        throw new Error('Ya existe otro estudiante con ese RUT o correo institucional');
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
      throw new Error('Estudiante no encontrado o no asignado a este tutor');
    }

    return eliminado;
  },

  async crearObservacion(
    tutorId: number,
    estudianteId: number,
    data: { tipo?: string; titulo: string; contenido: string; compromiso?: string }
  ) {
    const [alumno] = await db
      .select()
      .from(estudiantes)
      .where(and(eq(estudiantes.id, estudianteId), eq(estudiantes.tutorId, tutorId)));

    if (!alumno) {
      throw new Error('Estudiante no encontrado o no asignado a este tutor');
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

  async obtenerObservaciones(tutorId: number, estudianteId: number) {
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
