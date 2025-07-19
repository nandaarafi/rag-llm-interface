DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "reset_token" varchar(255);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "reset_token_expiry" timestamp;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "email_verified" boolean DEFAULT false;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD COLUMN "email_verification_token" varchar(255);
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;