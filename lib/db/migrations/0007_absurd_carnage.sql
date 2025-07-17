ALTER TABLE "User" ADD COLUMN "reset_token" varchar(255);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "reset_token_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "email_verification_token" varchar(255);