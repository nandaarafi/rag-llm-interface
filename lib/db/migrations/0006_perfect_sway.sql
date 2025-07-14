ALTER TABLE "User" ADD COLUMN "customerId" varchar(64);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "variant_id" varchar(64);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "has_access" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "updated_at" timestamp DEFAULT now();