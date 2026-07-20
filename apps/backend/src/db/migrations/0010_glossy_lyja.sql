ALTER TABLE "sys_dict_data" ADD COLUMN "is_default" text DEFAULT 'N' NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_dict_data" ADD COLUMN "css_class" text;--> statement-breakpoint
ALTER TABLE "sys_dict_type" ADD COLUMN "is_system" text DEFAULT 'N' NOT NULL;