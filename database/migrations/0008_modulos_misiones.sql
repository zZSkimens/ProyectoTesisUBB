UPDATE "misiones" SET "modulo" = 'Descubre la UBB'
WHERE "modulo" = 'Presentemos la UBB';
--> statement-breakpoint
UPDATE "misiones" SET "modulo" = 'Descubre la UBB'
WHERE "estado_publicacion" = 'borrador' AND btrim("modulo") = '';
--> statement-breakpoint
UPDATE "misiones" SET "puntos_recompensa" = LEAST(200, GREATEST(100, "puntos_recompensa"))
WHERE "estado_publicacion" = 'borrador';
