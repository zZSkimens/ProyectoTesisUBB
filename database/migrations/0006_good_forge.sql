CREATE TABLE "tokens_revocados" (
	"hash" varchar(64) PRIMARY KEY NOT NULL,
	"expira_en" timestamp with time zone NOT NULL
);
