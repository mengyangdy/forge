ALTER TABLE "permissions" ADD COLUMN "route_name" text;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "route_path" text;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "component" text;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "path_param" text;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "i18n_key" text;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "icon_type" text DEFAULT 'iconify' NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_parent_id_permissions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;