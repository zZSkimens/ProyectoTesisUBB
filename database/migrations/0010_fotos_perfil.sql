CREATE TABLE "fotos_perfil" (
	"usuario_id" integer PRIMARY KEY NOT NULL,
	"tipo_mime" varchar(20) NOT NULL,
	"contenido" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fotos_perfil" ADD CONSTRAINT "fotos_perfil_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;