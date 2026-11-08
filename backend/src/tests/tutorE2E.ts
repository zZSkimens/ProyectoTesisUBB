import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { db, pool } from '../../db/connection.js';
import { estudiantes, usuarios } from '../../db/schema.js';

try {
  const [accion, idTexto, email] = process.argv.slice(2);
  if (accion === 'crear') {
    const correo = `tutor.e2e.${randomUUID()}@alumnos.ubiobio.cl`;
    const password = randomUUID();
    const [tutor] = await db.insert(usuarios).values({
      nombre: 'Tutor temporal E2E', email: correo, passwordHash: await bcrypt.hash(password, 10), rol: 'tutor',
    }).returning({ id: usuarios.id });
    console.log(JSON.stringify({ id: tutor.id, email: correo, password }));
  } else if (accion === 'quitar') {
    const id = Number(idTexto);
    if (!Number.isInteger(id) || id < 1 || id > 2147483647 ||
        !email || !/^tutor\.e2e\.[a-f0-9-]{36}@alumnos\.ubiobio\.cl$/.test(email)) {
      throw new Error('La limpieza E2E requiere el ID y correo del tutor temporal');
    }
    await db.transaction(async (tx) => {
      const filtro = and(eq(usuarios.id, id), eq(usuarios.email, email));
      const [tutor] = await tx.select({ id: usuarios.id }).from(usuarios).where(filtro).for('update');
      if (!tutor) return;

      await tx.delete(estudiantes).where(eq(estudiantes.tutorId, tutor.id));
      await tx.delete(usuarios).where(filtro);
    });
  } else {
    throw new Error('Acción de preparación E2E no reconocida');
  }
} finally {
  await pool.end();
}
