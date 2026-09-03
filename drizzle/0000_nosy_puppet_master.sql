CREATE TYPE "public"."budget_status" AS ENUM('draft', 'sent', 'viewed', 'accepted', 'expired');--> statement-breakpoint
CREATE TABLE "acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_id" uuid NOT NULL,
	"signer_name" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "acceptances_budget_id_unique" UNIQUE("budget_id")
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"status" "budget_status" DEFAULT 'draft' NOT NULL,
	"locale" text DEFAULT 'es' NOT NULL,
	"title" text NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text,
	"intro" text,
	"scope" text,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"conditions" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"validity_days" integer DEFAULT 15 NOT NULL,
	"published_at" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"viewed_at" timestamp with time zone,
	"view_count" integer DEFAULT 0 NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budgets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"locale" text DEFAULT 'es' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "acceptances" ADD CONSTRAINT "acceptances_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;