import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  rol: varchar('rol', { length: 20 }).default('tutor').notNull(),
  activo: boolean('activo').default(true).notNull(),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).defaultNow().notNull(),
});

export const estudiantes = pgTable('estudiantes', {
  id: serial('id').primaryKey(),
  rut: varchar('rut', { length: 12 }).notNull().unique(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  carrera: text('carrera').notNull(),
  anioIngreso: integer('anio_ingreso')
    .default(sql`EXTRACT(YEAR FROM CURRENT_DATE)::integer`)
    .notNull(),
  tutorId: integer('tutor_id').references(() => usuarios.id, { onDelete: 'set null' }),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('estudiantes_rut_canonico_unique').on(
    sql`regexp_replace(upper(${table.rut}), '[^0-9K]', '', 'g')`
  ),
  uniqueIndex('estudiantes_email_normalizado_unique').on(sql`lower(btrim(${table.email}))`),
]);

export const misiones = pgTable('misiones', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 50 }).notNull().unique(),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion').notNull(),
  modulo: varchar('modulo', { length: 100 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).default('exploracion').notNull(),
  puntosRecompensa: integer('puntos_recompensa').default(100).notNull(),
  orden: integer('orden').default(1).notNull(),
  activo: boolean('activo').default(true).notNull(),
});

export const progresoEstudiantes = pgTable('progreso_estudiantes', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id')
    .references(() => estudiantes.id, { onDelete: 'cascade' })
    .notNull(),
  misionId: integer('mision_id')
    .references(() => misiones.id, { onDelete: 'cascade' })
    .notNull(),
  estado: varchar('estado', { length: 20 }).default('pendiente').notNull(),
  puntajeObtenido: integer('puntaje_obtenido').default(0).notNull(),
  intentos: integer('intentos').default(0).notNull(),
  fechaCompletado: timestamp('fecha_completado', { withTimezone: true }),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).defaultNow().notNull(),
});

export const observacionesTutoria = pgTable('observaciones_tutoria', {
  id: serial('id').primaryKey(),
  estudianteId: integer('estudiante_id')
    .references(() => estudiantes.id, { onDelete: 'cascade' })
    .notNull(),
  tutorId: integer('tutor_id')
    .references(() => usuarios.id, { onDelete: 'cascade' })
    .notNull(),
  tipo: varchar('tipo', { length: 50 }).default('consulta').notNull(),
  titulo: text('titulo').notNull(),
  contenido: text('contenido').notNull(),
  compromiso: text('compromiso'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
});

export const centrosAtencion = pgTable('centros_atencion', {
  tutorId: integer('tutor_id')
    .references(() => usuarios.id, { onDelete: 'cascade' })
    .notNull(),
  numeroCentro: integer('numero_centro').notNull(),
  modalidad: varchar('modalidad', { length: 20 }).notNull(),
  oficina: text('oficina').notNull().default(''),
  horarioConsultas: text('horario_consultas').notNull().default(''),
  canalContacto: text('canal_contacto').notNull().default(''),
  urlContacto: text('url_contacto').notNull().default(''),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tutorId, table.numeroCentro] }),
}));

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  estudiantes: many(estudiantes),
  observaciones: many(observacionesTutoria),
  centrosAtencion: many(centrosAtencion),
}));

export const estudiantesRelations = relations(estudiantes, ({ one, many }) => ({
  tutor: one(usuarios, {
    fields: [estudiantes.tutorId],
    references: [usuarios.id],
  }),
  progresos: many(progresoEstudiantes),
  observaciones: many(observacionesTutoria),
}));

export const misionesRelations = relations(misiones, ({ many }) => ({
  progresos: many(progresoEstudiantes),
}));

export const progresoEstudiantesRelations = relations(progresoEstudiantes, ({ one }) => ({
  estudiante: one(estudiantes, {
    fields: [progresoEstudiantes.estudianteId],
    references: [estudiantes.id],
  }),
  mision: one(misiones, {
    fields: [progresoEstudiantes.misionId],
    references: [misiones.id],
  }),
}));

export const observacionesTutoriaRelations = relations(observacionesTutoria, ({ one }) => ({
  estudiante: one(estudiantes, {
    fields: [observacionesTutoria.estudianteId],
    references: [estudiantes.id],
  }),
  tutor: one(usuarios, {
    fields: [observacionesTutoria.tutorId],
    references: [usuarios.id],
  }),
}));

export const centrosAtencionRelations = relations(centrosAtencion, ({ one }) => ({
  tutor: one(usuarios, {
    fields: [centrosAtencion.tutorId],
    references: [usuarios.id],
  }),
}));

export type Usuario = typeof usuarios.$inferSelect;
export type NuevoUsuario = typeof usuarios.$inferInsert;
export type Estudiante = typeof estudiantes.$inferSelect;
export type NuevoEstudiante = typeof estudiantes.$inferInsert;
export type Mision = typeof misiones.$inferSelect;
export type NuevaMision = typeof misiones.$inferInsert;
export type ProgresoEstudiante = typeof progresoEstudiantes.$inferSelect;
export type NuevoProgresoEstudiante = typeof progresoEstudiantes.$inferInsert;
export type ObservacionTutoria = typeof observacionesTutoria.$inferSelect;
export type NuevaObservacionTutoria = typeof observacionesTutoria.$inferInsert;
export type CentroAtencion = typeof centrosAtencion.$inferSelect;
export type NuevoCentroAtencion = typeof centrosAtencion.$inferInsert;
