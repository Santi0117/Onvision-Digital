"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { toDateKey } from "@/lib/booking";
import { countryDials, defaultCountryIso } from "@/lib/country-dials";
import { digitalMeeting } from "@/lib/digital";
import { ConPunto, Flecha } from "../od/ui";

type Hora = (typeof digitalMeeting.times)[number];
const EASE = [0.16, 1, 0.3, 1] as const;

const diaCero = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const largo = (d: Date) => d.toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" });

function celdas(vista: Date) {
  const año = vista.getFullYear();
  const mes = vista.getMonth();
  const inicio = new Date(año, mes, 1).getDay();
  const dias = new Date(año, mes + 1, 0).getDate();
  const previos = new Date(año, mes, 0).getDate();
  const out: { fecha: Date; delMes: boolean }[] = [];
  for (let i = 0; i < inicio; i++) out.push({ fecha: new Date(año, mes - 1, previos - inicio + 1 + i), delMes: false });
  for (let d = 1; d <= dias; d++) out.push({ fecha: new Date(año, mes, d), delMes: true });
  let sig = 1;
  while (out.length < 42) out.push({ fecha: new Date(año, mes + 1, sig++), delMes: false });
  return out;
}

/** "Hoy" solo existe en el navegador: la página se prerenderiza y el día cambia. */
const nada = () => () => {};
function useMontado() {
  return useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
}

function Paso({ visible, n, titulo, children }: { visible: boolean; n: number; titulo: string; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          className="od-agenda__paso"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="od-agenda__rotulo">
            <span className="od-mono">{String(n).padStart(2, "0")}</span> {titulo}
          </p>
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Calendario({ hoy, elegido, alElegir }: { hoy: Date; elegido: Date | null; alElegir: (d: Date) => void }) {
  const [vista, setVista] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const lista = useMemo(() => celdas(vista), [vista]);
  const mover = (delta: number) => setVista((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  return (
    <>
      <div className="od-cal__cabeza">
        <p className="od-cal__mes">
          {digitalMeeting.months[vista.getMonth()]} {vista.getFullYear()}
        </p>
        <div className="od-cal__nav">
          <button type="button" aria-label="Mes anterior" onClick={() => mover(-1)}>
            <Flecha dir="izquierda" />
          </button>
          <button type="button" aria-label="Mes siguiente" onClick={() => mover(1)}>
            <Flecha />
          </button>
        </div>
      </div>
      <div className="od-cal__semana" aria-hidden>
        {digitalMeeting.weekdays.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="od-cal__grilla">
        {lista.map(({ fecha, delMes }) => {
          const pasado = diaCero(fecha) < hoy;
          const sel = elegido ? mismoDia(fecha, elegido) : false;
          return (
            <button
              key={fecha.toISOString()}
              type="button"
              disabled={pasado}
              aria-pressed={sel}
              aria-label={largo(fecha)}
              className={["od-cal__dia", delMes ? "" : "is-fuera", sel ? "is-sel" : "", mismoDia(fecha, hoy) && !sel ? "is-hoy" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (pasado) return;
                if (!delMes) setVista(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
                alElegir(diaCero(fecha));
              }}
            >
              {fecha.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
}

/**
 * "02 — Agendar" con la tarjeta de demo de nordpixel: el calendario a la
 * izquierda y los pasos que aparecen uno tras otro (hora, servicio y
 * datos). Guarda la cita con POST /api/booking, como el sitio oficial.
 */
export default function Agenda() {
  const montado = useMontado();
  const hoy = useMemo(() => (montado ? diaCero(new Date()) : null), [montado]);
  const [elegido, setElegido] = useState<Date | null>(null);
  const [hora, setHora] = useState<Hora | null>(null);
  const [servicio, setServicio] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [pais, setPais] = useState(defaultCountryIso);
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState<string | null>(null);

  const dial = countryDials.find((c) => c.iso === pais)?.dial ?? "+506";
  const completo =
    elegido &&
    hora &&
    servicio &&
    nombre.trim().length > 1 &&
    telefono.replace(/\D/g, "").length >= 6 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!completo || !elegido || !hora || !servicio || enviando) return;
    setEnviando(true);
    setError(null);
    setListo(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: correo.trim(),
          name: nombre.trim(),
          phoneCountryCode: dial,
          phoneNumber: telefono.trim(),
          date: toDateKey(elegido),
          hour: hora.hour,
          minute: hora.minute,
          service: servicio,
          notes: nota.trim(),
          modality: "virtual",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo agendar. Intenta de nuevo.");
        setEnviando(false);
        return;
      }
      setListo(data.message || "¡Cita agendada!");
      setEnviando(false);
    } catch {
      setError("No se pudo agendar. Intenta de nuevo.");
      setEnviando(false);
    }
  };

  return (
    <section id="agendar" className="od-agenda od-claro" aria-labelledby="od-agenda-titulo">
      <div className="od-agenda__cabeza">
        <p className="od-eyebrow">{digitalMeeting.label}</p>
        <h2 id="od-agenda-titulo" className="od-h2">
          <ConPunto>{digitalMeeting.title}</ConPunto>
        </h2>
        <p className="od-lede">{digitalMeeting.lead}</p>
      </div>

      <div className="od-agenda__tarjeta">
        <div className="od-agenda__cal">
          <div className="od-cal" aria-label="Calendario">
            {hoy ? <Calendario hoy={hoy} elegido={elegido} alElegir={(d) => { setElegido(d); setHora(null); setServicio(null); }} /> : <div className="od-cal__cargando" aria-hidden />}
          </div>
          <p className="od-mono od-agenda__hint">{digitalMeeting.hint}</p>
        </div>

        <div className="od-agenda__flujo">
          {!elegido ? (
            <div className="od-agenda__vacio">
              <p className="od-agenda__vacio-titulo">¿Cuándo te queda bien?</p>
              <p>Elige un día en el calendario para empezar.</p>
              <ol className="od-agenda__pasos">
                {Object.values(digitalMeeting.steps).map((s, i) => (
                  <li key={s}>
                    <span className="od-mono">{String(i + 1).padStart(2, "0")}</span> {s}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <Paso visible={!!elegido} n={2} titulo={digitalMeeting.timeLabel}>
            {elegido ? <p className="od-agenda__fecha">{largo(elegido)}</p> : null}
            <div className="od-agenda__chips">
              {digitalMeeting.times.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  aria-pressed={hora?.label === t.label}
                  onClick={() => {
                    setHora(t);
                    setServicio(null);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Paso>

          <Paso visible={!!hora} n={3} titulo={digitalMeeting.serviceLabel}>
            <div className="od-agenda__chips">
              {digitalMeeting.services.map((s) => (
                <button key={s} type="button" aria-pressed={servicio === s} onClick={() => setServicio(s)}>
                  {s}
                </button>
              ))}
            </div>
          </Paso>

          <Paso visible={!!servicio} n={4} titulo={digitalMeeting.detailsLabel}>
            <form className="od-agenda__form" onSubmit={enviar}>
              <label className="od-campo">
                <span>{digitalMeeting.fields.name}</span>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={digitalMeeting.fields.namePlaceholder} autoComplete="name" required />
              </label>
              <label className="od-campo">
                <span>{digitalMeeting.fields.phone}</span>
                <span className="od-agenda__tel">
                  <select value={pais} onChange={(e) => setPais(e.target.value)} aria-label="Código de país">
                    {countryDials.map((c) => (
                      <option key={c.iso} value={c.iso}>
                        {c.name} ({c.dial})
                      </option>
                    ))}
                  </select>
                  <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/[^\d\s()-]/g, ""))}
                    placeholder={digitalMeeting.fields.phonePlaceholder}
                    inputMode="tel"
                    autoComplete="tel-national"
                    required
                  />
                </span>
              </label>
              <label className="od-campo">
                <span>{digitalMeeting.fields.email}</span>
                <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder={digitalMeeting.fields.emailPlaceholder} autoComplete="email" required />
              </label>
              <label className="od-campo">
                <span>{digitalMeeting.fields.note}</span>
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder={digitalMeeting.fields.notePlaceholder} rows={3} />
              </label>
              <button type="submit" className="od-boton od-boton--negro" disabled={!completo || enviando}>
                {enviando ? "Agendando…" : digitalMeeting.submit} {enviando ? null : <Flecha />}
              </button>
              {error ? (
                <p role="alert" className="od-agenda__aviso od-agenda__aviso--error">
                  {error}
                </p>
              ) : null}
              {listo ? (
                <p role="status" className="od-agenda__aviso od-agenda__aviso--ok">
                  {listo}
                </p>
              ) : null}
            </form>
          </Paso>
        </div>
      </div>
    </section>
  );
}
