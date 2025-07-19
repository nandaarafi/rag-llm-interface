DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "customerId" varchar(64);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "image" text;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "variant_id" varchar(64);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "has_access" boolean DEFAULT false;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "created_at" timestamp DEFAULT now();
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "updated_at" timestamp DEFAULT now();
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;