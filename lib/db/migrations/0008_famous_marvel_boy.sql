ALTER TABLE "User" ADD COLUMN "credits" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "plan_type" varchar DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "last_credit_reset" timestamp DEFAULT now();