import { NextResponse } from "next/server";
import { getSupabaseAdmin, isDatabaseConfigured } from "@/lib/supabase";
import { localCostaRicaToISO, isValidBookingSlot } from "@/lib/booking";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60_000;

function getClientId(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
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

function normalizeDial(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "+506";
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

export async function GET(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ booked: [] });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Mes inválido." }, { status: 400 });
    }

    const [year, mon] = month.split("-").map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1, 6, 0, 0)).toISOString();
    const end = new Date(Date.UTC(year, mon, 1, 5, 59, 59)).toISOString();

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ booked: [] });
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("scheduled_at")
      .gte("scheduled_at", start)
      .lt("scheduled_at", end);

    if (error) {
      console.error("[booking] fetch error:", error.message);
      return NextResponse.json({ booked: [] });
    }

    const booked = (data ?? []).map((row) => row.scheduled_at as string);
    return NextResponse.json({ booked });
  } catch {
    return NextResponse.json({ booked: [] });
  }
}

export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "La agenda aún no está configurada. Escribinos por WhatsApp para coordinar.",
        },
        { status: 503 },
      );
    }

    const clientId = getClientId(request);
    if (isRateLimited(clientId)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Probá de nuevo en un minuto." },
        { status: 429 },
      );
    }

    const body = await request.json();

    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({
        ok: true,
        message: "Cita registrada. Te enviamos confirmación por correo.",
      });
    }

    const email =
      typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
    const phoneCountryCode =
      typeof body.phoneCountryCode === "string"
        ? body.phoneCountryCode.trim().slice(0, 12)
        : "+506";
    const phoneNumber =
      typeof body.phoneNumber === "string"
        ? body.phoneNumber.trim().slice(0, 20)
        : "";
    const dialCode = normalizeDial(phoneCountryCode);
    const localDigits = phoneNumber.replace(/\D/g, "");
    const phone =
      typeof body.phone === "string"
        ? body.phone.trim().slice(0, 40)
        : `${dialCode}${localDigits}`;
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const hour = Number(body.hour);
    const minute = Number(body.minute);
    const notes =
      typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "";
    const service =
      typeof body.service === "string" ? body.service.trim().slice(0, 120) : "";
    const modality = body.modality === "in_person" ? "in_person" : "virtual";
    const location =
      typeof body.location === "string" ? body.location.trim().slice(0, 300) : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Ingresá un correo válido." },
        { status: 400 },
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Ingresá tu nombre o el de tu empresa." },
        { status: 400 },
      );
    }

    if (!phone || phone.replace(/\D/g, "").length < 8) {
      return NextResponse.json(
        { error: "Ingresá un teléfono válido." },
        { status: 400 },
      );
    }

    if (modality === "in_person" && location.length < 3) {
      return NextResponse.json(
        { error: "Indicá dónde te gustaría la reunión presencial." },
        { status: 400 },
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Seleccioná una fecha válida." },
        { status: 400 },
      );
    }

    if (!isValidBookingSlot(hour, minute)) {
      return NextResponse.json(
        { error: "Seleccioná un horario válido." },
        { status: 400 },
      );
    }

    const scheduledAt = localCostaRicaToISO(date, hour, minute);
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Elegí una fecha y hora futuras." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración." },
        { status: 503 },
      );
    }

    const notesWithService = [service ? `Servicio: ${service}` : null, notes]
      .filter(Boolean)
      .join("\n");

    const appointmentRow = {
      email,
      name,
      phone_country_code: dialCode,
      phone_number: localDigits,
      phone,
      scheduled_at: scheduledAt,
      modality,
      location: modality === "in_person" ? location : null,
      notes: notesWithService || null,
    };

    let { error: dbError } = await supabase
      .from("appointments")
      .insert(appointmentRow);

    if (
      dbError?.message?.includes("phone_country_code") ||
      dbError?.message?.includes("phone_number")
    ) {
      const retry = await supabase.from("appointments").insert({
        email,
        name,
        phone,
        scheduled_at: scheduledAt,
        modality,
        location: modality === "in_person" ? location : null,
        notes: notesWithService || null,
      });
      dbError = retry.error;
    }

    if (
      dbError?.message?.includes("modality") ||
      dbError?.message?.includes("location") ||
      dbError?.message?.includes("phone")
    ) {
      const retry = await supabase.from("appointments").insert({
        email,
        name,
        scheduled_at: scheduledAt,
        notes: [
          `Modalidad: ${modality === "in_person" ? "Presencial" : "Virtual"}`,
          modality === "in_person" && location ? `Lugar: ${location}` : null,
          `Teléfono: ${phone}`,
          notesWithService,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      dbError = retry.error;
    }

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "Ese horario ya está ocupado. Elegí otro." },
          { status: 409 },
        );
      }
      console.error("[booking] insert error:", dbError.message);
      return NextResponse.json(
        { error: "No se pudo agendar la cita. Intentá de nuevo." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "¡Cita agendada! Te contactamos pronto para confirmar.",
    });
  } catch {
    return NextResponse.json(
      { error: "Error al agendar la cita." },
      { status: 500 },
    );
  }
}
