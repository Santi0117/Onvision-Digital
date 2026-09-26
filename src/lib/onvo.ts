
const ONVO_API = "https://api.onvopay.com/v1";

/** Onvo usa unidad menor: ₡10.500 → 1_050_000 */
export const ONVO_PRECIO_MENSUAL_CRC = 10_500 * 100;

/** Meses mínimos cobrados en automático (1º en checkout + N−1 renovaciones). */
export const ONVO_MIN_BILLING_MONTHS = 4;

export function getOnvoSecretKey(): string {
  const key = process.env.ONVO_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Falta ONVO_SECRET_KEY. Agregala en .env.local (onvo_test_… o onvo_live_…).",
    );
  }
  return key;
}

export function onvoConfigured(): boolean {
  return Boolean(process.env.ONVO_SECRET_KEY);
}

export function getOnvoWebhookSecret(): string | undefined {
  return process.env.ONVO_WEBHOOK_SECRET?.trim() || undefined;
}

type OnvoErrorBody = {
  message?: string;
  error?: string | { message?: string };
};

async function onvoRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const secret = getOnvoSecretKey();
  const res = await fetch(`${ONVO_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as T & OnvoErrorBody;

  if (!res.ok) {
    const msg =
      (typeof data.error === "object" ? data.error?.message : data.error) ||
      data.message ||
      `Onvo respondió ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export type CreateOnvoOneTimeLinkInput = {
  unitAmount: number;
  currency: "CRC" | "USD";
  description: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  origin?: string;
  redirectUrl: string;
  cancelUrl: string;
};

export type OnvoOneTimeLinkResult = {
  url: string;
  id?: string;
};

/** Crea un link de Checkout de un solo uso. Docs: https://docs.onvopay.com/checkout/one-time-links */
export async function createOnvoOneTimeLink(
  input: CreateOnvoOneTimeLinkInput,
): Promise<OnvoOneTimeLinkResult> {
  const body: Record<string, unknown> = {
    lineItems: [
      {
        quantity: 1,
        unitAmount: input.unitAmount,
        currency: input.currency,
        description: input.description,
      },
    ],
    redirectUrl: input.redirectUrl,
    cancelUrl: input.cancelUrl,
  };

  if (input.customerEmail) {
    body.customerEmail = input.customerEmail;
  }
  if (input.metadata) {
    body.metadata = input.metadata;
  }

  const data = await onvoRequest<{ url?: string; id?: string }>(
    "/checkout/sessions/one-time-link",
    { method: "POST", body: JSON.stringify(body) },
  );

  if (!data.url) {
    throw new Error("Onvo no devolvió URL de checkout");
  }

  return { url: data.url, id: data.id };
}

export function checkoutOriginFromRequest(req: Request): string | undefined {
  return (
    req.headers.get("origin") ||
    (() => {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "http";
      return host ? `${proto}://${host}` : undefined;
    })()
  );
}

export type OnvoPaymentIntent = {
  id: string;
  status?: string;
  customerId?: string;
  paymentMethodId?: string;
  amount?: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  subscriptionId?: string | null;
};

export type OnvoSubscription = {
  id: string;
  status?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  cancelAtPeriodEnd?: boolean;
};

function addUtcMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function priceNickname(
  planId: string,
  currency: string,
  unitAmount: number,
): string {
  return `ov:${planId}:${currency}:${unitAmount}`;
}

type OnvoPrice = {
  id: string;
  nickname?: string | null;
  type?: string;
  isActive?: boolean;
};

type OnvoList<T> = { data?: T[] };

async function listAllPrices(): Promise<OnvoPrice[]> {
  const prices: OnvoPrice[] = [];
  let startingAfter: string | undefined;

  for (let page = 0; page < 20; page++) {
    const qs = new URLSearchParams({ limit: "100" });
    if (startingAfter) qs.set("startingAfter", startingAfter);
    const list = await onvoRequest<OnvoList<OnvoPrice>>(
      `/prices?${qs.toString()}`,
    );
    const batch = list.data ?? [];
    prices.push(...batch);
    if (batch.length < 100) break;
    startingAfter = batch[batch.length - 1]?.id;
    if (!startingAfter) break;
  }

  return prices;
}

export async function ensureRecurringPrice(input: {
  planId: string;
  unitAmount: number;
  currency: "CRC" | "USD";
  productName: string;
}): Promise<string> {
  const nickname = priceNickname(
    input.planId,
    input.currency,
    input.unitAmount,
  );

  const existing = (await listAllPrices()).find(
    (p) =>
      p.nickname === nickname &&
      p.type === "recurring" &&
      p.isActive !== false,
  );
  if (existing?.id) return existing.id;

  const price = await onvoRequest<OnvoPrice>("/prices", {
    method: "POST",
    body: JSON.stringify({
      unitAmount: input.unitAmount,
      currency: input.currency,
      type: "recurring",
      nickname,
      recurring: { interval: "month", intervalCount: 1 },
      productData: {
        name: input.productName,
        description: `Mensualidad Onvision · ${input.planId}`,
      },
    }),
  });

  if (!price.id) {
    throw new Error("Onvo no devolvió id de precio recurrente");
  }
  return price.id;
}

export async function getPaymentIntent(
  id: string,
): Promise<OnvoPaymentIntent> {
  return onvoRequest<OnvoPaymentIntent>(`/payment-intents/${id}`);
}

export async function listCustomerSubscriptions(
  customerId: string,
): Promise<OnvoSubscription[]> {
  const list = await onvoRequest<OnvoList<OnvoSubscription>>(
    `/customers/${encodeURIComponent(customerId)}/subscriptions?limit=100`,
  );
  return list.data ?? [];
}

export async function createFollowUpSubscription(input: {
  customerId: string;
  paymentMethodId: string;
  priceId: string;
  description: string;
  setupFromPaymentIntent: string;
  planId: string;
  followUpRenewals?: number;
}): Promise<OnvoSubscription> {
  const followUps =
    input.followUpRenewals ?? ONVO_MIN_BILLING_MONTHS - 1;
  const startDate = addUtcMonths(new Date(), 1).toISOString();

  return onvoRequest<OnvoSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customerId: input.customerId,
      paymentMethodId: input.paymentMethodId,
      description: input.description,
      startDate,
      items: [{ priceId: input.priceId, quantity: 1 }],
      metadata: {
        planId: input.planId,
        setupFromPaymentIntent: input.setupFromPaymentIntent,
        expectedRenewals: String(followUps),
        renewalsDone: "0",
        minMonths: String(ONVO_MIN_BILLING_MONTHS),
        source: "onvision-auto-4m",
      },
    }),
  });
}

export async function updateSubscriptionMetadata(
  subscriptionId: string,
  metadata: Record<string, string>,
): Promise<OnvoSubscription> {
  return onvoRequest<OnvoSubscription>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ metadata }),
    },
  );
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<OnvoSubscription> {
  return onvoRequest<OnvoSubscription>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { method: "DELETE" },
  );
}

export async function setupFourMonthRecurring(input: {
  paymentIntentId: string;
  customerId: string;
  paymentMethodId: string;
  planId: string;
  unitAmount: number;
  currency: "CRC" | "USD";
  description: string;
}): Promise<{ subscriptionId: string; created: boolean }> {
  const existing = await listCustomerSubscriptions(input.customerId);
  const already = existing.find(
    (s) =>
      s.metadata?.setupFromPaymentIntent === input.paymentIntentId &&
      s.status !== "canceled",
  );
  if (already?.id) {
    return { subscriptionId: already.id, created: false };
  }

  const priceId = await ensureRecurringPrice({
    planId: input.planId,
    unitAmount: input.unitAmount,
    currency: input.currency,
    productName: input.description.slice(0, 80) || `Onvision · ${input.planId}`,
  });

  const sub = await createFollowUpSubscription({
    customerId: input.customerId,
    paymentMethodId: input.paymentMethodId,
    priceId,
    description: `${input.description} (meses 2–${ONVO_MIN_BILLING_MONTHS})`,
    setupFromPaymentIntent: input.paymentIntentId,
    planId: input.planId,
  });

  if (!sub.id) {
    throw new Error("Onvo no devolvió id de suscripción");
  }

  return { subscriptionId: sub.id, created: true };
}

export async function trackRenewalAndMaybeCancel(input: {
  subscriptionId: string;
  metadata?: Record<string, string>;
}): Promise<{ renewalsDone: number; canceled: boolean }> {
  const sub = await onvoRequest<OnvoSubscription>(
    `/subscriptions/${encodeURIComponent(input.subscriptionId)}`,
  );
  const meta = { ...(input.metadata ?? {}), ...(sub.metadata ?? {}) };

  if (meta.source !== "onvision-auto-4m") {
    return { renewalsDone: 0, canceled: false };
  }

  const expected = Number(meta.expectedRenewals || ONVO_MIN_BILLING_MONTHS - 1);
  const done = Number(meta.renewalsDone || 0) + 1;

  await updateSubscriptionMetadata(input.subscriptionId, {
    ...meta,
    renewalsDone: String(done),
  });

  if (done >= expected) {
    await cancelSubscription(input.subscriptionId);
    return { renewalsDone: done, canceled: true };
  }

  return { renewalsDone: done, canceled: false };
}
