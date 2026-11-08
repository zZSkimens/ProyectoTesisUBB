ALTER TABLE "misiones" ADD COLUMN "objetivo" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "misiones" ADD COLUMN "lugar" varchar(30);--> statement-breakpoint
ALTER TABLE "misiones" ADD COLUMN "estado_publicacion" varchar(20) DEFAULT 'publicada' NOT NULL;--> statement-breakpoint
ALTER TABLE "misiones" ADD COLUMN "condicion_cumplimiento" text;--> statement-breakpoint
ALTER TABLE "misiones" ADD COLUMN "creado_por" integer;--> statement-breakpoint
ALTER TABLE "misiones" ADD COLUMN "creado_en" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "misiones" ADD COLUMN "actualizado_en" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "misiones" ADD CONSTRAINT "misiones_creado_por_usuarios_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;