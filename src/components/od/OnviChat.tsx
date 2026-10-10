"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { cliWelcomeReply, replyForPrompt, type CliReply, type CliStep } from "@/lib/company";
import { Cerrar, Ojo } from "./ui";

/** Cualquier botón puede abrir a Onvi con este evento. */
export const ONVI_ABRIR = "od-onvi-abrir";
export const abrirOnvi = () => window.dispatchEvent(new Event(ONVI_ABRIR));

type Burbuja = { id: number; de: "yo" | "onvi"; texto: string; nota?: string };

let sec = 0;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Del guion de Onvi, lo que se muestra: textos y bloques de código. */
function partes(pasos: CliStep[]) {
  return pasos
    .filter((s) => s.kind === "text" || s.kind === "code")
    .map((s) => (s.kind === "code" ? { texto: "", nota: s.text } : { texto: s.text }))
    .filter((s) => s.texto || s.nota);
}

/** Solo se monta en el navegador (el chat se abre con un clic). */
const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Escribe({ texto }: { texto: string }) {
  const [quieto] = useState(reducido);
  const [visto, setVisto] = useState("");
  useEffect(() => {
    if (quieto) return;
    let i = 0;
    const paso = Math.max(1, Math.ceil(texto.length / 90));
    const id = window.setInterval(() => {
      i = Math.min(texto.length, i + paso);
      setVisto(texto.slice(0, i));
      if (i >= texto.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [texto, quieto]);
  return <>{quieto ? texto : visto}</>;
}

const SUGERENCIAS = ["Ver planes", "Cuéntame del sistema", "Quiero una tienda"];

/**
 * Onvi, la IA de Onvision (el mismo chat del sitio oficial): la pestaña
 * vertical al borde derecho de nordpixel abre un panel lateral negro.
 * Responde con /api/chat y, si no hay IA configurada, con sus respuestas
 * de siempre.
 */
export default function OnviChat() {
  const [abierto, setAbierto] = useState(false);
  const [burbujas, setBurbujas] = useState<Burbuja[]>([]);
  const [ocupada, setOcupada] = useState(false);
  const [borrador, setBorrador] = useState("");
  const [escribiendo, setEscribiendo] = useState<number | null>(null);
  const hilo = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const corrida = useRef(0);
  const historia = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const reproducir = async (r: CliReply, id: number) => {
    for (const p of partes(r.steps)) {
      if (corrida.current !== id) return;
      const b = ++sec;
      setBurbujas((prev) => [...prev, { id: b, de: "onvi", texto: p.texto, nota: p.nota }]);
      setEscribiendo(b);
      await esperar(p.nota && !p.texto ? 280 : Math.min(1400, 420 + p.texto.length * 8));
    }
    if (corrida.current !== id) return;
    if (r.ask) {
      const b = ++sec;
      setBurbujas((prev) => [...prev, { id: b, de: "onvi", texto: r.ask! }]);
      setEscribiendo(b);
      await esperar(520);
    }
    if (corrida.current !== id) return;
    setEscribiendo(null);
    setOcupada(false);
    window.setTimeout(() => entrada.current?.focus(), 80);
  };

  const abrir = () => {
    setAbierto(true);
    if (burbujas.length || ocupada) return;
    setOcupada(true);
    void reproducir(cliWelcomeReply, ++corrida.current);
  };

  const cerrar = () => {
    corrida.current += 1;
    setAbierto(false);
    setBurbujas([]);
    setOcupada(false);
    setBorrador("");
    setEscribiendo(null);
    historia.current = [];
  };

  // Abrir desde cualquier parte del sitio.
  const alPedir = useEffectEvent(() => abrir());
  useEffect(() => {
    const f = () => alPedir();
    window.addEventListener(ONVI_ABRIR, f);
    return () => window.removeEventListener(ONVI_ABRIR, f);
  }, []);

  useEffect(() => {
    hilo.current?.scrollTo({ top: hilo.current.scrollHeight, behavior: "smooth" });
  }, [burbujas, ocupada]);

  const alEscape = useEffectEvent(() => cerrar());
  useEffect(() => {
    if (!abierto) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") alEscape();
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [abierto]);

  const preguntar = async (texto: string) => {
    const id = ++corrida.current;
    setOcupada(true);
    setBurbujas((prev) => [...prev, { id: ++sec, de: "yo", texto }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto, history: historia.current.slice(-10) }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (corrida.current !== id) return;
      const respuesta = data.reply?.trim() || data.error || "No pude responder ahora. Prueba de nuevo o agenda una reunión.";
      historia.current = [
        ...historia.current,
        { role: "user" as const, content: texto },
        { role: "assistant" as const, content: respuesta },
      ].slice(-20);
      const b = ++sec;
      setBurbujas((prev) => [...prev, { id: b, de: "onvi", texto: respuesta }]);
      setEscribiendo(b);
      await esperar(Math.min(1600, 400 + respuesta.length * 7));
    } catch {
      if (corrida.current !== id) return;
      await reproducir(replyForPrompt(texto), id);
      return;
    }
    if (corrida.current !== id) return;
    setEscribiendo(null);
    setOcupada(false);
    window.setTimeout(() => entrada.current?.focus(), 80);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const t = borrador.trim();
    if (!t || ocupada) return;
    setBorrador("");
    void preguntar(t);
  };

  const ultima = burbujas[burbujas.length - 1];
  const puntos = ocupada && (!ultima || ultima.de === "yo" || escribiendo === null);

  return (
    <>
      <button type="button" className="od-onvi-tab" onClick={abrir} aria-haspopup="dialog" aria-expanded={abierto}>
        <span className="od-onvi-tab__vivo" aria-hidden />
        <span className="od-onvi-tab__txt">Onvi IA</span>
        <Ojo className="od-onvi-tab__ojo" />
      </button>

      <AnimatePresence>
        {abierto ? (
          <motion.div className="od-onvi-capa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="od-onvi-velo" aria-label="Cerrar Onvi" onClick={cerrar} />
            <motion.aside
              className="od-onvi"
              role="dialog"
              aria-modal="true"
              aria-label="Onvi, la IA de Onvision"
              initial={{ x: "105%" }}
              animate={{ x: "0%" }}
              exit={{ x: "105%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              data-lenis-prevent
            >
              <header className="od-onvi__cabeza">
                <span className="od-onvi__avatar">
                  <Ojo className="h-4 w-7" />
                  <i aria-hidden />
                </span>
                <div>
                  <p className="od-onvi__nombre">Onvi</p>
                  <p className="od-onvi__estado">{ocupada ? "escribiendo…" : "lista para ayudarte"}</p>
                </div>
                <button type="button" className="od-onvi__cerrar" aria-label="Cerrar" onClick={cerrar}>
                  <Cerrar className="h-4 w-4" />
                </button>
              </header>

              <p className="od-onvi__rotulo">ONVI · IA DE ONVISION DIGITAL</p>

              <div ref={hilo} className="od-onvi__hilo" aria-live="polite">
                {burbujas.map((b) => (
                  <div key={b.id} className={`od-onvi__fila od-onvi__fila--${b.de}`}>
                    {b.nota && !b.texto ? (
                      <pre className="od-onvi__nota">{b.nota}</pre>
                    ) : (
                      <p className="od-onvi__burbuja">{b.de === "onvi" && escribiendo === b.id ? <Escribe texto={b.texto} /> : b.texto}</p>
                    )}
                  </div>
                ))}
                {puntos ? (
                  <div className="od-onvi__fila od-onvi__fila--onvi" aria-hidden>
                    <span className="od-onvi__puntos">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                ) : null}
              </div>

              {!ocupada ? (
                <div className="od-onvi__chips">
                  {SUGERENCIAS.map((s) => (
                    <button key={s} type="button" onClick={() => void preguntar(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}

              <form className="od-onvi__form" onSubmit={enviar}>
                <span className="od-onvi__prompt" aria-hidden>
                  ›
                </span>
                <input
                  ref={entrada}
                  value={borrador}
                  onChange={(e) => setBorrador(e.target.value)}
                  disabled={ocupada}
                  placeholder="Escríbele a Onvi…"
                  aria-label="Mensaje para Onvi"
                  maxLength={500}
                />
                <button type="submit" disabled={ocupada || !borrador.trim()}>
                  Enviar
                </button>
              </form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
