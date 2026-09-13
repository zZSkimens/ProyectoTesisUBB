import bcrypt from 'bcryptjs';
import { db, pool } from './connection.js';
import { estudiantes, misiones, progresoEstudiantes, usuarios } from './schema.js';

async function seed() {
  console.log('[INFO] Iniciando carga de datos iniciales...');

  try {
    const passwordHash = await bcrypt.hash('tutor123', 10);
    const [tutor] = await db
      .insert(usuarios)
      .values({
        nombre: 'Rodrigo Fuentes Morales',
        email: 'rfuentes@ubiobio.cl',
        passwordHash,
        rol: 'tutor',
        activo: true,
      })
      .onConflictDoNothing()
      .returning();

    const tutorId = tutor ? tutor.id : 1;
    console.log(`[INFO] Tutor registrado: Rodrigo Fuentes Morales (ID: ${tutorId})`);

    const estudiantesData = [
      {
        rut: '21.111.222-3',
        nombre: 'Constanza Morales Valenzuela',
        email: 'cmorales@alumnos.ubiobio.cl',
        carrera: 'Ingeniería de Ejecución en Computación e Informática',
        anioIngreso: 2026,
        tutorId,
      },
      {
        rut: '21.333.444-5',
        nombre: 'Matías Ignacio San Martín',
        email: 'msanmartin@alumnos.ubiobio.cl',
        carrera: 'Ingeniería de Ejecución en Computación e Informática',
        anioIngreso: 2026,
        tutorId,
      },
      {
        rut: '21.555.666-7',
        nombre: 'Valentina Paz Riquelme',
        email: 'vriquelme@alumnos.ubiobio.cl',
        carrera: 'Ingeniería Civil Informática',
        anioIngreso: 2026,
        tutorId,
      },
      {
        rut: '21.777.888-9',
        nombre: 'Diego Alejandro Araya',
        email: 'daraya@alumnos.ubiobio.cl',
        carrera: 'Ingeniería de Ejecución en Computación e Informática',
        anioIngreso: 2026,
        tutorId,
      },
    ];

    const insertedEstudiantes = await db
      .insert(estudiantes)
      .values(estudiantesData)
      .onConflictDoNothing()
      .returning();

    console.log(`[INFO] Estudiantes registrados: ${insertedEstudiantes.length}`);

    const misionesData = [
      {
        codigo: 'UBB_PRES_01',
        titulo: 'Conoce los servicios estudiantiles (DDE)',
        descripcion: 'Visita la Direccion de Desarrollo Estudiantil y habla con el encargado.',
        modulo: 'Presentemos la UBB',
        tipo: 'exploracion',
        puntosRecompensa: 100,
        orden: 1,
      },
      {
        codigo: 'UBB_PRES_02',
        titulo: 'Trivia: Historia y Facultades UBB',
        descripcion: 'Responde correctamente al menos 3 preguntas sobre el Campus Concepcion.',
        modulo: 'Presentemos la UBB',
        tipo: 'trivia',
        puntosRecompensa: 150,
        orden: 2,
      },
      {
        codigo: 'UBB_CAJA_01',
        titulo: 'Gestion del tiempo y habitos de estudio',
        descripcion: 'Supera el desafio interactivo sobre organizacion academica y calendario semestral.',
        modulo: 'Caja de herramientas',
        tipo: 'npc_dialogo',
        puntosRecompensa: 120,
        orden: 3,
      },
      {
        codigo: 'UBB_CAJA_02',
        titulo: 'Recursos digitales y biblioteca UBB',
        descripcion: 'Localiza la biblioteca virtual y aprende a solicitar libros y salas de estudio.',
        modulo: 'Caja de herramientas',
        tipo: 'exploracion',
        puntosRecompensa: 100,
        orden: 4,
      },
    ];

    const insertedMisiones = await db
      .insert(misiones)
      .values(misionesData)
      .onConflictDoNothing()
      .returning();

    console.log(`[INFO] Misiones base creadas: ${insertedMisiones.length}`);

    if (insertedEstudiantes.length > 0 && insertedMisiones.length > 0) {
      const e1 = insertedEstudiantes[0].id;
      const e2 = insertedEstudiantes[1].id;
      const m1 = insertedMisiones[0].id;
      const m2 = insertedMisiones[1].id;

      await db
        .insert(progresoEstudiantes)
        .values([
          {
            estudianteId: e1,
            misionId: m1,
            estado: 'completada',
            puntajeObtenido: 100,
            intentos: 1,
            fechaCompletado: new Date(),
          },
          {
            estudianteId: e1,
            misionId: m2,
            estado: 'en_progreso',
            puntajeObtenido: 50,
            intentos: 1,
          },
          {
            estudianteId: e2,
            misionId: m1,
            estado: 'pendiente',
            puntajeObtenido: 0,
            intentos: 0,
          },
        ])
        .onConflictDoNothing();

      console.log('[INFO] Registros de progreso de ejemplo asignados');
    }

    console.log('[INFO] Proceso de seed finalizado con exito.');
  } catch (error) {
    console.error('[ERROR] Error ejecutando seed:', error);
  } finally {
    await pool.end();
  }
}

seed();
