CREATE TABLE "centros_atencion" (
	"tutor_id" integer NOT NULL,
	"numero_centro" integer NOT NULL,
	"modalidad" varchar(20) NOT NULL,
	"oficina" text DEFAULT '' NOT NULL,
	"horario_consultas" text DEFAULT '' NOT NULL,
	"canal_contacto" text DEFAULT '' NOT NULL,
	"url_contacto" text DEFAULT '' NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "centros_atencion_tutor_id_numero_centro_pk" PRIMARY KEY("tutor_id","numero_centro")
);
--> statement-breakpoint
ALTER TABLE "centros_atencion" ADD CONSTRAINT "centros_atencion_tutor_id_usuarios_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "centros_atencion" (
	"tutor_id", "numero_centro", "modalidad", "oficina", "horario_consultas",
	"canal_contacto", "url_contacto", "actualizado_en"
)
SELECT
	"tutor_id",
	1,
	CASE
		WHEN "canal_contacto" ILIKE '%discord%' OR "canal_contacto" ILIKE '%meet%' THEN 'online'
		ELSE 'presencial'
	END,
	CASE
		WHEN "canal_contacto" ILIKE '%discord%' OR "canal_contacto" ILIKE '%meet%' THEN ''
		ELSE COALESCE(substring("oficina" FROM '(A[1-3][0-9]{2}(AA|AB|AC|AD))'), 'A101AA')
	END,
	"horario_consultas",
	CASE
		WHEN "canal_contacto" ILIKE '%meet%' THEN 'Meet'
		WHEN "canal_contacto" ILIKE '%discord%' THEN 'Discord'
		ELSE ''
	END,
	CASE
		WHEN position(' | URL: ' IN "canal_contacto") > 0
			THEN substring("canal_contacto" FROM position(' | URL: ' IN "canal_contacto") + 8)
		ELSE ''
	END,
	"actualizado_en"
FROM "horarios_consultas";
