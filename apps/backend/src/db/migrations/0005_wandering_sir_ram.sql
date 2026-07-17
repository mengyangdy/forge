CREATE TABLE "sys_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"size" integer NOT NULL,
	"mime_type" text,
	"provider" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sys_files_hash_unique" UNIQUE("hash")
);
