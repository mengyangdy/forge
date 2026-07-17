CREATE TABLE "operation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"username" text,
	"nickname" text,
	"ip" text,
	"method" text NOT NULL,
	"url" text NOT NULL,
	"module" text,
	"action" text,
	"request_params" text,
	"status" integer NOT NULL,
	"duration" integer NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operation_logs" ADD CONSTRAINT "operation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;