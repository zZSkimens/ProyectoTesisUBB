CREATE TABLE "misiones_por_tutor" (
	"tutor_id" integer NOT NULL,
	"mision_id" integer NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	CONSTRAINT "misiones_por_tutor_tutor_id_mision_id_pk" PRIMARY KEY("tutor_id","mision_id")
);
--> statement-breakpoint
ALTER TABLE "misiones_por_tutor" ADD CONSTRAINT "misiones_por_tutor_tutor_id_usuarios_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "misiones_por_tutor" ADD CONSTRAINT "misiones_por_tutor_mision_id_misiones_id_fk" FOREIGN KEY ("mision_id") REFERENCES "public"."misiones"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "misiones_por_tutor" ("tutor_id", "mision_id")
SELECT u."id", m."id"
FROM "usuarios" AS u
CROSS JOIN "misiones" AS m
WHERE u."rol" IN ('tutor', 'admin')
  AND m."estado_publicacion" = 'publicada'
  AND m."activo" = true;
