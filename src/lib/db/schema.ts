import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const budgetStatusEnum = pgEnum("budget_status", [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "expired",
]);

export const planEnum = pgEnum("plan", ["free", "pro", "studio"]);

export const planStatusEnum = pgEnum("plan_status", [
  "active",
  "past_due",
  "canceled",
  "paused",
]);

/** De dónde vino un registro nuevo. Base del coeficiente viral k (Fase 3). */
export const signupSourceEnum = pgEnum("signup_source", [
  "direct",
  "shared_link",
  "referral",
  "template_gallery",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  locale: text("locale").notNull().default("es"),
  plan: planEnum("plan").notNull().default("free"),
  planStatus: planStatusEnum("plan_status").notNull().default("active"),
  paddleCustomerId: text("paddle_customer_id"),
  paddleSubscriptionId: text("paddle_subscription_id"),
  planRenewsAt: timestamp("plan_renews_at", { withTimezone: true }),
  /** Código corto único para el link de referido de este usuario (ej: presuly.com.ar/?ref=XXXX). */
  referralCode: text("referral_code").notNull().unique(),
  /** Quién lo trajo, si vino por un link de referido. */
  referredByUserId: uuid("referred_by_user_id"),
  signupSource: signupSourceEnum("signup_source").notNull().default("direct"),
  /** Si ya se otorgó el mes de Pro gratis por este referido (evita duplicar el premio). */
  referralRewardGranted: boolean("referral_reward_granted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type BudgetItem = {
  id: string;
  description: string;
  price: number;
  optional: boolean;
  selected: boolean;
};

export const budgetKindEnum = pgEnum("budget_kind", ["service", "product"]);

export const deliveryModeEnum = pgEnum("delivery_mode", [
  "online",
  "in_person",
  "hybrid",
]);

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  status: budgetStatusEnum("status").notNull().default("draft"),
  locale: text("locale").notNull().default("es"),
  title: text("title").notNull(),
  kind: budgetKindEnum("kind").notNull().default("service"),
  deliveryMode: deliveryModeEnum("delivery_mode").notNull().default("online"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  intro: text("intro"),
  scope: text("scope"),
  items: jsonb("items").notNull().$type<BudgetItem[]>().default([]),
  conditions: text("conditions"),
  currency: text("currency").notNull().default("ARS"),
  /** Link de pago externo (Mercado Pago, Stripe, PayPal...) que pega el propio
   * emisor. Presuly nunca cobra ni gira esta plata — es responsabilidad del emisor. */
  paymentLink: text("payment_link"),
  validityDays: integer("validity_days").notNull().default(15),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  viewCount: integer("view_count").notNull().default(0),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const acceptances = pgTable("acceptances", {
  id: uuid("id").defaultRandom().primaryKey(),
  budgetId: uuid("budget_id")
    .notNull()
    .references(() => budgets.id, { onDelete: "cascade" })
    .unique(),
  signerName: text("signer_name").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Un registro liviano por cada email transaccional enviado, solo para medir volumen contra
 * el límite diario del plan free de Resend (ver src/lib/email/quota.ts). Se poda solo. */
export const emailSends = pgTable("email_sends", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Key-value chico para flags operativos (ej: cuándo se mandó el último aviso de cuota). */
export const systemState = pgTable("system_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Acceptance = typeof acceptances.$inferSelect;
