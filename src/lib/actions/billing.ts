"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getPaddleClient } from "@/lib/paddle/server";

export async function openBillingPortal() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user?.paddleCustomerId || !user.paddleSubscriptionId) {
    redirect("/dashboard/billing?error=no_subscription");
  }

  const paddle = getPaddleClient();
  const portalSession = await paddle.customerPortalSessions.create(user.paddleCustomerId, [
    user.paddleSubscriptionId,
  ]);

  redirect(portalSession.urls.general.overview);
}
