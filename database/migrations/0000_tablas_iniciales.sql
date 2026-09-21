CREATE TABLE "estudiantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"rut" varchar(12) NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"carrera" text NOT NULL,
	"anio_ingreso" integer DEFAULT 2026 NOT NULL,
	"tutor_id" integer,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "estudiantes_rut_unique" UNIQUE("rut"),
	CONSTRAINT "estudiantes_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "misiones" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(50) NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"modulo" varchar(100) NOT NULL,
	"tipo" varchar(50) DEFAULT 'exploracion' NOT NULL,
	"puntos_recompensa" integer DEFAULT 100 NOT NULL,
	"orden" integer DEFAULT 1 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "misiones_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "progreso_estudiantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer NOT NULL,
	"mision_id" integer NOT NULL,
	"estado" varchar(20) DEFAULT 'pendiente' NOT NULL,
	"puntaje_obtenido" integer DEFAULT 0 NOT NULL,
	"intentos" integer DEFAULT 0 NOT NULL,
	"fecha_completado" timestamp with time zone,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"rol" varchar(20) DEFAULT 'tutor' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_tutor_id_usuarios_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_estudiantes" ADD CONSTRAINT "progreso_estudiantes_estudiante_id_estudiantes_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progreso_estudiantes" ADD CONSTRAINT "progreso_estudiantes_mision_id_misiones_id_fk" FOREIGN KEY ("mision_id") REFERENCES "public"."misiones"("id") ON DELETE cascade ON UPDATE no action;