CREATE TYPE "public"."budget_kind" AS ENUM('service', 'product');--> statement-breakpoint
CREATE TYPE "public"."delivery_mode" AS ENUM('online', 'in_person', 'hybrid');--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "kind" "budget_kind" DEFAULT 'service' NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "delivery_mode" "delivery_mode" DEFAULT 'online' NOT NULL;