import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { getSupabaseAdmin, isDatabaseConfigured } from "@/lib/supabase";

/**
 * "Contanos tu idea": guarda la consulta en Supabase, en la misma tabla que
 * el formulario del sitio oficial ("contact_submissions"), así el equipo la
 * ve en el mismo lugar.
 */

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

const LIMITS = {
  email: 254,
  name: 200,
  phone: 40,
  service: 120,
  interest: 2000,
  budget: 100,
} as const;

const RECIBIDO = "Recibimos tu idea. Te escribimos en menos de 24 horas hábiles.";

function getClientId(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous";
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(clientId);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(clientId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function texto(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: `El formulario todavía no está conectado. Escribinos a ${site.email}.` },
        { status: 503 },
      );
    }

    if (isRateLimited(getClientId(request))) {
      return NextResponse.json({ error: "Demasiados envíos. Probá de nuevo en un minuto." }, { status: 429 });
    }

    const body = await request.json();

    // La trampa para robots: si viene llena, se contesta como si nada.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true, message: RECIBIDO });
    }

    const email = texto(body.email, LIMITS.email);
    const name = texto(body.name, LIMITS.name);
    const phone = texto(body.phone, LIMITS.phone);
    const service = texto(body.service, LIMITS.service);
    const interest = texto(body.interest, LIMITS.interest);
    const budget = texto(body.budget, LIMITS.budget);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Revisá el correo." }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Escribí tu nombre o el de tu empresa." }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      return NextResponse.json({ error: "Revisá el teléfono (mínimo 8 números)." }, { status: 400 });
    }
    if (!service) {
      return NextResponse.json({ error: "Elegí qué querés construir." }, { status: 400 });
    }
    if (!interest || interest.length < 10) {
      return NextResponse.json({ error: "Contanos un poco más de la idea (mínimo 10 caracteres)." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Error de configuración del servidor." }, { status: 503 });
    }

    let { error: dbError } = await supabase.from("contact_submissions").insert({
      email,
      name,
      phone,
      service,
      interest,
      budget: budget || "No indicado",
    });

    // Tablas viejas sin alguna columna: lo que falta va dentro del mensaje.
    if (dbError?.message?.includes("phone") && !dbError.message.includes("service")) {
      const retry = await supabase.from("contact_submissions").insert({
        email,
        name,
        service,
        interest: `[Teléfono: ${phone}]\n${interest}`,
        budget: budget || "No indicado",
      });
      dbError = retry.error;
    }

    if (dbError?.message?.includes("service")) {
      const retry = await supabase.from("contact_submissions").insert({
        email,
        name,
        interest: `[Servicio: ${service}]\n[Teléfono: ${phone}]\n${interest}`,
        budget: budget || "No indicado",
      });
      dbError = retry.error;
    }

    if (dbError) {
      console.error("[contacto] DB error:", dbError.message);
      return NextResponse.json(
        { error: `No se pudo guardar tu idea. Probá de nuevo o escribinos a ${site.email}.` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, message: RECIBIDO });
  } catch {
    return NextResponse.json({ error: "No se pudo enviar el formulario." }, { status: 500 });
  }
}
