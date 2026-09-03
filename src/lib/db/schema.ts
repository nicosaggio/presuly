import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const budgetStatusEnum = pgEnum("budget_status", [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "expired",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  locale: text("locale").notNull().default("es"),
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

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  status: budgetStatusEnum("status").notNull().default("draft"),
  locale: text("locale").notNull().default("es"),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  intro: text("intro"),
  scope: text("scope"),
  items: jsonb("items").notNull().$type<BudgetItem[]>().default([]),
  conditions: text("conditions"),
  currency: text("currency").notNull().default("USD"),
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

export type User = typeof users.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Acceptance = typeof acceptances.$inferSelect;
