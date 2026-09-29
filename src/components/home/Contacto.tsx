"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { Ojo } from "../od/ui";
import { scrollA } from "./data";
import "./contacto.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const SERVICIOS = ["Página web", "Tienda online", "Software a medida", "App móvil", "Onvi, asistente con IA", "Tu marca desde cero", "Todavía no sé"];
const PRESUPUESTOS = ["Menos de $500", "$500 – $1.500", "$1.500 – $5.000", "Más de $5.000", "Prefiero conversarlo"];
const EMPUJONES = ["Quiero vender en línea", "Necesito que me reserven citas", "Quiero ordenar inventario y facturas", "Quiero una app para mis clientes"];

const PASOS = [
  { corto: "Qué", pregunta: "¿Qué querés construir?", ayuda: "Elegí lo que más se parezca. Si todavía no sabés, también vale." },
  { corto: "Idea", pregunta: "Contanos la idea.", ayuda: "Qué hace tu negocio, qué te gustaría resolver y para cuándo." },
  { corto: "Contacto", pregunta: "¿Cómo te contactamos?", ayuda: "Te escribimos en menos de 24 horas hábiles." },
];

const esCorreo = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** El campo con problema, con el mismo nombre que en el envío. */
type Campo = "service" | "interest" | "name" | "email" | "phone";

/**
 * "Contanos tu idea", en tres pasos: qué querés construir, la idea y cómo te
 * contactamos. A la izquierda la pregunta y lo que ya contaste; a la
 * derecha los campos. Se envía como cualquier formulario (POST
 * /api/contact) y queda guardado para el equipo.
 */
export default function Contacto() {
  const [paso, setPaso] = useState(0);
  const [dir, setDir] = useState(1);
  const [servicio, setServicio] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [idea, setIdea] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [trampa, setTrampa] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mal, setMal] = useState<Campo | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<string | null>(null);
  const tarjeta = useRef<HTMLDivElement>(null);
  const cuerpo = useRef<HTMLDivElement>(null);
  const movido = useRef(false);

  // Al pasar de paso, si la tarjeta quedó arriba (en el celular, después de
  // bajar hasta el botón), vuelve a la pregunta.
  useEffect(() => {
    if (movido.current && tarjeta.current && tarjeta.current.getBoundingClientRect().top < 80) scrollA(tarjeta.current, -90);
  }, [paso, listo]);

  // Cuando entra el paso nuevo, el foco va a su primer campo. En el celular
  // no: abriría el teclado encima de la pregunta.
  const alEntrar = useCallback((nodo: HTMLDivElement | null) => {
    if (!nodo || !movido.current || !window.matchMedia("(pointer: fine)").matches) return;
    nodo.querySelector<HTMLElement>("button, input, textarea")?.focus({ preventScroll: true });
  }, []);

  const validar = (k: number): [string, Campo] | null => {
    if (k === 0 && !servicio) return ["Elegí qué querés construir.", "service"];
    if (k === 1 && idea.trim().length < 10) return ["Contanos un poco más (mínimo 10 caracteres).", "interest"];
    if (k === 2) {
      if (nombre.trim().length < 2) return ["Escribí tu nombre o el de tu empresa.", "name"];
      if (!esCorreo(correo.trim())) return ["Revisá el correo.", "email"];
      if (telefono.replace(/\D/g, "").length < 8) return ["Revisá el teléfono (mínimo 8 números).", "phone"];
    }
    return null;
  };

  const ir = (k: number) => {
    movido.current = true;
    setDir(k > paso ? 1 : -1);
    setError(null);
    setMal(null);
    setPaso(k);
  };

  /** Escribir en un campo borra el aviso. */
  const escribir = (poner: (v: string) => void) => (e: { target: { value: string } }) => {
    poner(e.target.value);
    setError(null);
    setMal(null);
  };

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: servicio,
          budget: presupuesto,
          interest: idea.trim(),
          name: nombre.trim(),
          email: correo.trim(),
          phone: telefono.trim(),
          website: trampa,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || `No se pudo enviar. Probá de nuevo o escribinos a ${site.email}.`);
        return;
      }
      setListo(data.message || "Recibimos tu idea. Te escribimos en menos de 24 horas hábiles.");
    } catch {
      setError("No se pudo enviar. Revisá tu conexión y probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    const problema = validar(paso);
    if (problema) {
      const [texto, campo] = problema;
      setError(texto);
      setMal(campo);
      cuerpo.current?.querySelector<HTMLElement>(campo === "service" ? ".oc-chips button" : `[name="${campo}"]`)?.focus();
      return;
    }
    if (paso < PASOS.length - 1) ir(paso + 1);
    else void enviar();
  };

  const empujar = (t: string) => {
    setIdea((v) => (v.trim() ? `${v.trim().replace(/[.\s]*$/, "")}. ${t}` : t));
    setError(null);
    setMal(null);
  };

  const avance = listo ? 1 : paso / PASOS.length;
  const primerNombre = nombre.trim().split(/\s+/)[0] ?? "";

  return (
    <section id="contacto" className="oc" aria-labelledby="oc-titulo">
      <div className="oc-cabeza">
        <p className="oh-eyebrow">Empezá hoy</p>
        <h2 id="oc-titulo" className="oh-serif-h2">
          Contanos tu idea. <em>Te respondemos en menos de 24 horas.</em>
        </h2>
      </div>

      <div ref={tarjeta} className="oc-tarjeta">
        <aside className="oc-lado">
          <Ojo className="oc-lado__ojo" />
          <ol className="oc-pasos">
            {PASOS.map((p, i) => {
              const estado = listo || i < paso ? "hecho" : i === paso ? "ahora" : "falta";
              return (
                <li key={p.corto} data-estado={estado} aria-current={estado === "ahora" ? "step" : undefined}>
                  <span className="oc-pasos__n">{estado === "hecho" ? "✓" : String(i + 1).padStart(2, "0")}</span>
                  {p.corto}
                </li>
              );
            })}
          </ol>
          <div className="oc-barra" aria-hidden>
            <i style={{ transform: `scaleX(${avance})` }} />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={listo ? "listo" : paso}
              className="oc-lado__texto"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="oc-pregunta" aria-live="polite">
                {listo ? "¡Listo! Ya la tenemos." : PASOS[paso]!.pregunta}
              </p>
              <p className="oc-ayuda">{listo ? "Mientras tanto, podés mirar los planes o agendar una reunión." : PASOS[paso]!.ayuda}</p>
            </motion.div>
          </AnimatePresence>

          {servicio || presupuesto || (paso > 1 && idea.trim()) ? (
            <dl className="oc-resumen">
              {servicio ? (
                <div>
                  <dt>Quiero</dt>
                  <dd>{servicio}</dd>
                </div>
              ) : null}
              {presupuesto ? (
                <div>
                  <dt>Presupuesto</dt>
                  <dd>{presupuesto}</dd>
                </div>
              ) : null}
              {paso > 1 && idea.trim() ? (
                <div>
                  <dt>La idea</dt>
                  <dd>“{idea.trim().length > 110 ? `${idea.trim().slice(0, 110)}…` : idea.trim()}”</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </aside>

        {listo ? (
          <motion.div
            className="oc-listo"
            role="status"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <svg viewBox="0 0 64 64" className="oc-listo__check" aria-hidden>
              <circle cx="32" cy="32" r="29" />
              <path d="M19 33.5l9 9 17-19" />
            </svg>
            <p className="oc-listo__titulo">{primerNombre ? `¡Gracias, ${primerNombre}!` : "¡Gracias!"}</p>
            <p className="oc-listo__texto">{listo}</p>
            <div className="oc-listo__botones">
              <Link href="/planes" className="oc-boton oc-boton--lleno">
                Ver los planes <span aria-hidden>→</span>
              </Link>
              <Link href="/planes#agendar" className="oc-boton">
                Agendar una reunión
              </Link>
            </div>
          </motion.div>
        ) : (
          <form className="oc-form" noValidate onSubmit={alEnviar}>
            <div ref={cuerpo} className="oc-cuerpo">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={paso}
                  ref={alEntrar}
                  className="oc-paso"
                  initial={{ opacity: 0, x: 26 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 * dir }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {paso === 0 ? (
                    <>
                      <fieldset className="oc-grupo">
                        {/* La pregunta ya está grande al lado (o arriba, en el celular). */}
                        <legend className="sr-only">Qué querés construir</legend>
                        <div className="oc-chips">
                          {SERVICIOS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              aria-pressed={servicio === s}
                              onClick={() => {
                                setServicio(s);
                                setError(null);
                                setMal(null);
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className="oc-grupo">
                        <legend>
                          ¿Tenés un presupuesto en mente? <small>Opcional</small>
                        </legend>
                        <div className="oc-chips oc-chips--chicas">
                          {PRESUPUESTOS.map((p) => (
                            <button key={p} type="button" aria-pressed={presupuesto === p} onClick={() => setPresupuesto((v) => (v === p ? "" : p))}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  ) : paso === 1 ? (
                    <>
                      <label className="oc-campo">
                        <span>Tu idea</span>
                        <textarea
                          name="interest"
                          rows={6}
                          value={idea}
                          maxLength={2000}
                          aria-invalid={mal === "interest" || undefined}
                          placeholder="Ej.: tengo una panadería y quiero recibir pedidos por la web y cobrar con SINPE…"
                          onChange={escribir(setIdea)}
                        />
                      </label>
                      <p className="oc-cuenta" data-ok={idea.trim().length >= 10 ? "true" : undefined}>
                        {idea.trim().length >= 10 ? "✓ Perfecto" : `${idea.trim().length} / mínimo 10 caracteres`}
                      </p>
                      <div className="oc-empujones">
                        <span>¿Te ayudamos a empezar?</span>
                        {EMPUJONES.map((t) => (
                          <button key={t} type="button" onClick={() => empujar(t)}>
                            + {t}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="oc-campo">
                        <span>Nombre o empresa</span>
                        <input
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={nombre}
                          placeholder="Tu nombre"
                          aria-invalid={mal === "name" || undefined}
                          onChange={escribir(setNombre)}
                        />
                      </label>
                      <label className="oc-campo">
                        <span>Correo</span>
                        <input
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={correo}
                          placeholder="hola@tuempresa.com"
                          aria-invalid={mal === "email" || undefined}
                          onChange={escribir(setCorreo)}
                        />
                      </label>
                      <label className="oc-campo">
                        <span>Teléfono</span>
                        <input
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          value={telefono}
                          placeholder="+506 8888 8888"
                          aria-invalid={mal === "phone" || undefined}
                          onChange={escribir(setTelefono)}
                        />
                      </label>
                      {/* Para robots: las personas no lo ven. */}
                      <input
                        className="oc-trampa"
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden
                        value={trampa}
                        onChange={(e) => setTrampa(e.target.value)}
                      />
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {error ? (
              <p className="oc-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="oc-botones">
              {paso > 0 ? (
                <button type="button" className="oc-boton" disabled={enviando} onClick={() => ir(paso - 1)}>
                  <span aria-hidden>←</span> Atrás
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="oc-boton oc-boton--lleno" disabled={enviando}>
                {paso < PASOS.length - 1 ? "Siguiente" : enviando ? "Enviando…" : "Enviar mi idea"} <span aria-hidden>→</span>
              </button>
            </div>
            <p className="oc-privado">Tus datos solo los usamos para responderte.</p>
          </form>
        )}
      </div>
    </section>
  );
}
