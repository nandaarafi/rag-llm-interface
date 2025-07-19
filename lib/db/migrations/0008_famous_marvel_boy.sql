DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "credits" integer DEFAULT 30 NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "plan_type" varchar DEFAULT 'free' NOT NULL;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "last_credit_reset" timestamp DEFAULT now();
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;