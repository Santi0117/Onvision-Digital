import { NextResponse } from "next/server";
import {
  checkoutOriginFromRequest,
  createOnvoOneTimeLink,
  onvoConfigured,
} from "@/lib/onvo";
import { getMonthlyCheckoutPlan } from "@/lib/plans-checkout";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

type Body = {
  planId?: string;
  planName?: string;
  categoryLabel?: string;
  companyName?: string;
};

export async function POST(req: Request) {
  if (!onvoConfigured()) {
    return NextResponse.json(
      {
        error:
          "Onvo no está configurado. Agregá ONVO_SECRET_KEY en .env.local / Vercel.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const planId = body.planId?.trim();
  if (!planId) {
    return NextResponse.json({ error: "Falta planId" }, { status: 400 });
  }

  const plan = getMonthlyCheckoutPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  const planName = body.planName?.trim();
  const categoryLabel = body.categoryLabel?.trim();
  const companyName = body.companyName?.trim();

  const descriptionParts = ["Mensualidad"];
  if (companyName) descriptionParts.push(companyName);
  if (categoryLabel && planName) {
    descriptionParts.push(`${categoryLabel} · ${planName}`);
  } else if (planName) {
    descriptionParts.push(planName);
  }
  descriptionParts.push("Onvision Digital");

  try {
    const origin = (checkoutOriginFromRequest(req) ?? getSiteUrl()).replace(
      /\/$/,
      "",
    );

    const session = await createOnvoOneTimeLink({
      unitAmount: plan.unitAmount,
      currency: plan.currency,
      description: descriptionParts.join(" · "),
      metadata: {
        planId: plan.id,
        planName: planName || plan.id,
        categoryLabel: categoryLabel || "",
        companyName: companyName || "",
        source: "digital-planes",
        site: "onvisiondigital.com",
      },
      redirectUrl: `${origin}/pago/exito`,
      cancelUrl: `${origin}/pago/cancelado`,
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo crear el pago";
    console.error("[onvo/checkout]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
