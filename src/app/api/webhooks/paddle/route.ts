import { NextRequest, NextResponse } from "next/server";
import { EventName, type SubscriptionNotification } from "@paddle/paddle-node-sdk";
import { eq } from "drizzle-orm";
import { getPaddleClient, getPaddleWebhookSecret, getPriceIds } from "@/lib/paddle/server";
import { db } from "@/lib/db";
import { users, type planStatusEnum } from "@/lib/db/schema";

type PlanStatus = (typeof planStatusEnum.enumValues)[number];

function mapStatus(status: SubscriptionNotification["status"]): PlanStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due") return "past_due";
  if (status === "paused") return "paused";
  return "canceled";
}

function planForPriceId(priceId: string | undefined): "pro" | "studio" {
  const priceIds = getPriceIds();
  return priceId === priceIds.studioMonthly ? "studio" : "pro";
}

const SUBSCRIPTION_EVENTS = new Set<string>([
  EventName.SubscriptionCreated,
  EventName.SubscriptionUpdated,
  EventName.SubscriptionActivated,
  EventName.SubscriptionResumed,
  EventName.SubscriptionCanceled,
  EventName.SubscriptionPaused,
  EventName.SubscriptionPastDue,
  EventName.SubscriptionTrialing,
]);

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const paddle = getPaddleClient();
  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, getPaddleWebhookSecret(), signature);
  } catch (err) {
    console.error("Paddle webhook: firma inválida", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (!event || !SUBSCRIPTION_EVENTS.has(event.eventType)) {
    return NextResponse.json({ received: true });
  }

  const sub = event.data as SubscriptionNotification;
  const priceId = sub.items[0]?.price?.id;
  const patch = {
    planStatus: mapStatus(sub.status),
    paddleCustomerId: sub.customerId,
    paddleSubscriptionId: sub.id,
    planRenewsAt: sub.nextBilledAt ? new Date(sub.nextBilledAt) : null,
  };

  // Al crear la suscripción todavía no guardamos paddleSubscriptionId, así que
  // identificamos al usuario por customData (seteado al abrir el checkout).
  // En eventos posteriores (updated/canceled/etc.) buscamos por paddleSubscriptionId,
  // más robusto porque no depende de que Paddle reenvíe customData.
  const userIdFromCustomData =
    typeof sub.customData?.userId === "string" ? sub.customData.userId : undefined;

  if (event.eventType === EventName.SubscriptionCreated && userIdFromCustomData) {
    await db
      .update(users)
      .set({ ...patch, plan: planForPriceId(priceId) })
      .where(eq(users.id, userIdFromCustomData));
    return NextResponse.json({ received: true });
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.paddleSubscriptionId, sub.id))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ ...patch, plan: planForPriceId(priceId) })
      .where(eq(users.id, existing.id));
  } else if (userIdFromCustomData) {
    await db
      .update(users)
      .set({ ...patch, plan: planForPriceId(priceId) })
      .where(eq(users.id, userIdFromCustomData));
  } else {
    console.error("Paddle webhook: no pude asociar la suscripción a un usuario", sub.id);
  }

  return NextResponse.json({ received: true });
}
