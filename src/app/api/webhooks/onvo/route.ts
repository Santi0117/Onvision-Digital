import { NextResponse } from "next/server";
import {
  getOnvoWebhookSecret,
  getPaymentIntent,
  onvoConfigured,
  setupFourMonthRecurring,
  trackRenewalAndMaybeCancel,
  type OnvoPaymentIntent,
} from "@/lib/onvo";

/**
 * Aviso de pago de Onvo: el mismo del sitio oficial (`onvision-landing`), así
 * el cobro recurrente sigue igual con la llave de Onvo de este proyecto.
 */

export const runtime = "nodejs";

type WebhookBody = {
  type?: string;
  data?: Record<string, unknown>;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asMetadata(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

function wantsFourMonthSetup(metadata: Record<string, string>): boolean {
  return (
    metadata.setupRecurring === "1" ||
    metadata.recurringMonths === "4" ||
    metadata.minMonths === "4"
  );
}

async function handleFirstPayment(pi: OnvoPaymentIntent) {
  if (pi.subscriptionId) {
    return { skipped: "subscription_renewal" as const };
  }

  const metadata = pi.metadata ?? {};
  if (!wantsFourMonthSetup(metadata)) {
    return { skipped: "not_recurring_checkout" as const };
  }

  const customerId = pi.customerId;
  const paymentMethodId = pi.paymentMethodId;
  if (!customerId || !paymentMethodId) {
    console.warn(
      "[onvo/webhook] Falta customerId o paymentMethodId; el cobro recurrente requiere tarjeta guardada.",
      { paymentIntentId: pi.id },
    );
    return { skipped: "missing_payment_method" as const };
  }

  const planId = metadata.planId || metadata.verticalId || "unico";
  const currency = (metadata.currency === "USD" ? "USD" : "CRC") as
    | "CRC"
    | "USD";
  const unitAmount = Number(metadata.unitAmount || pi.amount || 0);
  if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
    throw new Error("unitAmount inválido en metadata del pago");
  }

  const description =
    pi.description ||
    metadata.verticalName ||
    `Onvision · ${planId}`;

  const result = await setupFourMonthRecurring({
    paymentIntentId: pi.id,
    customerId,
    paymentMethodId,
    planId,
    unitAmount,
    currency,
    description,
  });

  console.info("[onvo/webhook] Suscripción 4 meses", result);
  return result;
}

export async function POST(req: Request) {
  if (!onvoConfigured()) {
    return NextResponse.json(
      { error: "Onvo no configurado" },
      { status: 503 },
    );
  }

  const expectedSecret = getOnvoWebhookSecret();
  if (expectedSecret) {
    const received = req.headers.get("x-webhook-secret");
    if (received !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "[onvo/webhook] ONVO_WEBHOOK_SECRET no está configurado; el endpoint acepta cualquier POST.",
    );
  }

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const type = asString(body.type);
  const data = body.data ?? {};

  try {
    if (type === "payment-intent.succeeded") {
      const pi = data as unknown as OnvoPaymentIntent;
      if (!pi.id) {
        return NextResponse.json({ ok: true, skipped: "no_id" });
      }
      const full =
        pi.paymentMethodId && pi.customerId
          ? pi
          : await getPaymentIntent(pi.id);
      const result = await handleFirstPayment({
        ...full,
        metadata: { ...asMetadata(full.metadata), ...asMetadata(pi.metadata) },
      });
      return NextResponse.json({ ok: true, type, result });
    }

    if (type === "checkout-session.succeeded") {
      const paymentIntentId = asString(data.paymentIntentId);
      const sessionMeta = asMetadata(data.metadata);
      if (!paymentIntentId) {
        return NextResponse.json({ ok: true, skipped: "no_payment_intent" });
      }
      if (!wantsFourMonthSetup(sessionMeta)) {
        return NextResponse.json({
          ok: true,
          skipped: "not_recurring_checkout",
        });
      }
      const pi = await getPaymentIntent(paymentIntentId);
      const result = await handleFirstPayment({
        ...pi,
        metadata: { ...asMetadata(pi.metadata), ...sessionMeta },
        description:
          pi.description ||
          asString(data.description) ||
          sessionMeta.verticalName,
      });
      return NextResponse.json({ ok: true, type, result });
    }

    if (type === "subscription.renewal.succeeded") {
      const subscriptionId = asString(data.subscriptionId);
      if (!subscriptionId) {
        return NextResponse.json({ ok: true, skipped: "no_subscription" });
      }
      const result = await trackRenewalAndMaybeCancel({
        subscriptionId,
        metadata: asMetadata(data.metadata),
      });
      console.info("[onvo/webhook] Renovación", { subscriptionId, result });
      return NextResponse.json({ ok: true, type, result });
    }

    return NextResponse.json({ ok: true, ignored: type ?? "unknown" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    console.error("[onvo/webhook]", type, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
