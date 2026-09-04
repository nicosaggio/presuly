CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'studio');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'past_due', 'canceled', 'paused');--> statement-breakpoint
CREATE TYPE "public"."signup_source" AS ENUM('direct', 'shared_link', 'referral', 'template_gallery');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" "plan" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_status" "plan_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paddle_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paddle_subscription_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_renews_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referred_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "signup_source" "signup_source" DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_reward_granted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code");