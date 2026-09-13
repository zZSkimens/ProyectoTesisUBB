import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
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
  anioIngreso: integer('anio_ingreso').default(2026).notNull(),
  tutorId: integer('tutor_id').references(() => usuarios.id, { onDelete: 'set null' }),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow().notNull(),
});

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

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  estudiantes: many(estudiantes),
}));

export const estudiantesRelations = relations(estudiantes, ({ one, many }) => ({
  tutor: one(usuarios, {
    fields: [estudiantes.tutorId],
    references: [usuarios.id],
  }),
  progresos: many(progresoEstudiantes),
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
