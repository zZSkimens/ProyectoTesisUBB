CREATE TABLE "horarios_consultas" (
	"tutor_id" integer PRIMARY KEY NOT NULL,
	"oficina" text NOT NULL,
	"horario_consultas" text NOT NULL,
	"canal_contacto" text NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observaciones_tutoria" (
	"id" serial PRIMARY KEY NOT NULL,
	"estudiante_id" integer NOT NULL,
	"tutor_id" integer NOT NULL,
	"tipo" varchar(50) DEFAULT 'consulta' NOT NULL,
	"titulo" text NOT NULL,
	"contenido" text NOT NULL,
	"compromiso" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "horarios_consultas" ADD CONSTRAINT "horarios_consultas_tutor_id_usuarios_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observaciones_tutoria" ADD CONSTRAINT "observaciones_tutoria_estudiante_id_estudiantes_id_fk" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observaciones_tutoria" ADD CONSTRAINT "observaciones_tutoria_tutor_id_usuarios_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;