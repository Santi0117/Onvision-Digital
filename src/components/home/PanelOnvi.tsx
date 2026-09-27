"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { scrollA } from "./data";
import "./panel-onvi.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type Tono = "ok" | "cian" | "wa" | "neutro";
type Chip = { texto: string; detalle?: string; tono: Tono };

/** Las tres pantallas del Panel, con lo que se ve en cada captura. */
const PANTALLAS: readonly { id: string; nombre: string; src: string; texto: string; chips: readonly Chip[] }[] = [
  {
    id: "reservas",
    nombre: "Reservas",
    src: "/web/panel/reservas.png",
    texto: "Las citas que hacen tus clientes desde el sitio. Confirmalas, marcá quién llegó y escribiles en un toque.",
    chips: [
      { texto: "Karla Cordero", detalle: "Atendida · 8:45 a. m.", tono: "ok" },
      { texto: "7 por confirmar", detalle: "Próximos 30 días", tono: "cian" },
      { texto: "Escribir por WhatsApp", tono: "wa" },
    ],
  },
  {
    id: "registros",
    nombre: "Registros",
    src: "/web/panel/registros.png",
    texto: "Todo lo que pasa detrás de tu sitio: formularios, correos, pagos y el monitor que lo revisa cada 10 minutos.",
    chips: [
      { texto: "Todo en línea", detalle: "99,91 % en 90 días", tono: "ok" },
      { texto: "180 ms", detalle: "Respuesta media", tono: "cian" },
      { texto: "Revisado cada 10 minutos", tono: "neutro" },
    ],
  },
  {
    id: "soporte",
    nombre: "Soporte",
    src: "/web/panel/soporte.png",
    texto: "Pedí un cambio y seguí el avance: textos, fotos, precios o una sección nueva, con tus capturas.",
    chips: [
      { texto: "Nueva solicitud", detalle: "Cambio en el sitio", tono: "ok" },
      { texto: "Prioridad normal", detalle: "Baja · Normal · Alta · Urgente", tono: "cian" },
      { texto: "Adjuntá capturas", tono: "neutro" },
    ],
  },
];

const N = PANTALLAS.length;

function Icono({ tono }: { tono: Tono }) {
  if (tono === "wa") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden>
        <path
          d="M8 1.6a6.3 6.3 0 0 0-5.4 9.5L1.7 14.4l3.4-.9A6.3 6.3 0 1 0 8 1.6Zm3.2 8.9c-.1.4-.8.8-1.1.8-.3 0-.6.2-2.1-.4a7 7 0 0 1-2.8-2.5c-.3-.4-.7-1-.7-1.7s.4-1.1.5-1.3c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .4.3l.6 1.4c0 .1 0 .2 0 .3l-.3.4c-.1.1-.2.3-.1.4.2.3.6.9 1.2 1.4.7.6 1.3.8 1.5.9.2.1.3 0 .4-.1l.5-.6c.1-.2.3-.2.4-.1l1.3.6c.2.1.3.2.3.2.1.1.1.5-.1.9Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (tono === "ok") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden>
        <path d="M4 8.4l2.6 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tono === "cian") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden>
        <path d="M2 11.5 6 7.5l2.6 2.6L14 4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 5v3.2l2 1.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * "Panel Onvi": el panel que viene con todos los planes, como una
 * presentación de producto. La pantalla entra acostada en 3D y se endereza
 * mientras la sección sube; ya fija, el scroll la pasa por Reservas,
 * Registros y Soporte (la captura nueva sube como una cortina), con las
 * pestañas, la explicación y los datos de cada captura flotando alrededor.
 * Tocándola se abre en grande.
 */
export default function PanelOnvi() {
  const pista = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();
  const [activa, setActiva] = useState(0);
  const [visor, setVisor] = useState<number | null>(null);

  // Entrada: desde que el tope asoma abajo hasta que llega arriba.
  const { scrollYProgress: entrada } = useScroll({ target: pista, offset: ["start end", "start start"] });
  // Ya fija: el recorrido que pasa por las tres pantallas.
  const { scrollYProgress: recorrido } = useScroll({ target: pista, offset: ["start start", "end end"] });

  const giroX = useTransform(entrada, [0, 0.9], [30, 0]);
  const escala = useTransform(entrada, [0, 0.9], [0.84, 1]);
  const bajada = useTransform(entrada, [0, 0.9], [90, 0]);
  const luz = useTransform(entrada, [0.2, 1], [0, 1]);
  const giroY = useSpring(0, { stiffness: 120, damping: 22 });

  useMotionValueEvent(recorrido, "change", (q) => {
    const k = Math.min(N - 1, Math.max(0, Math.floor(q * N)));
    setActiva((a) => (a === k ? a : k));
  });

  useEffect(() => {
    if (visor === null) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisor(null);
    };
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTecla);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", alTecla);
    };
  }, [visor]);

  /** Ir a la pantalla k: el centro de su tramo. */
  const irA = (k: number) => {
    const el = pista.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const tramo = el.offsetHeight - window.innerHeight;
    scrollA(top + tramo * ((k + 0.5) / N));
  };

  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || quieto) return;
    const r = e.currentTarget.getBoundingClientRect();
    giroY.set(((e.clientX - r.left) / r.width - 0.5) * 8);
  };

  const pantalla = PANTALLAS[activa]!;
  const grande = visor === null ? null : PANTALLAS[visor]!;

  return (
    <section id="panel" className="oh-pnl" data-tema="oscuro" aria-labelledby="oh-pnl-titulo">
      <div ref={pista} className="oh-pnl__pista">
        <div className="oh-pnl__escena" onPointerMove={alMover} onPointerLeave={() => giroY.set(0)}>
          <div className="oh-pnl__fondo" aria-hidden>
            <motion.span className="oh-pnl__luz" style={quieto ? undefined : { opacity: luz }} />
            <span className="oh-pnl__piso" />
          </div>

          <div className="oh-pnl__cabeza">
            <p className="oh-pnl__ante">Incluido en todos los planes</p>
            <h2 id="oh-pnl-titulo" className="oh-pnl__h2">
              <span className="oh-pnl__linea">Panel</span>{" "}
              <span className="oh-pnl__linea">
                Onvi<span className="oh-pnl__punto" aria-hidden>.</span>
              </span>
            </h2>
            <div className="oh-pnl__tabs" role="group" aria-label="Pantallas del Panel">
              {PANTALLAS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-current={i === activa ? "true" : undefined}
                  className="oh-pnl__tab"
                  onClick={() => irA(i)}
                >
                  {i === activa ? (
                    <motion.span layoutId="oh-pnl-tab" className="oh-pnl__tab-fondo" transition={{ duration: 0.5, ease: EASE }} />
                  ) : null}
                  <span className="oh-pnl__tab-n">{String(i + 1).padStart(2, "0")}</span>
                  <span>{p.nombre}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={pantalla.id}
                className="oh-pnl__texto"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {pantalla.texto}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="oh-pnl__escenario">
            <motion.div
              className="oh-pnl__pantalla"
              style={quieto ? undefined : { rotateX: giroX, rotateY: giroY, scale: escala, y: bajada }}
            >
              <div className="oh-pnl__barra" aria-hidden>
                <i />
                <i />
                <i />
                <span className="oh-pnl__url">
                  <svg viewBox="0 0 16 16">
                    <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  panel.onvisiondigital.com/{pantalla.id}
                </span>
              </div>
              <button
                type="button"
                className="oh-pnl__vidrio"
                onClick={() => setVisor(activa)}
                aria-label={`Panel Onvi: ${pantalla.nombre}. Ver en grande`}
              >
                {PANTALLAS.map((p, i) => (
                  <span key={p.id} className="oh-pnl__captura" data-visible={i <= activa ? "true" : "false"} style={{ zIndex: i }}>
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 1000px, 96vw"
                      className="object-cover object-left-top"
                      priority={false}
                    />
                  </span>
                ))}
                <span key={`brillo-${activa}`} className="oh-pnl__brillo" aria-hidden />
                <span className="oh-pnl__lupa" aria-hidden>
                  <svg viewBox="0 0 16 16">
                    <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Ver en grande
                </span>
              </button>
            </motion.div>

            <div className="oh-pnl__chips" aria-hidden>
              <AnimatePresence mode="popLayout">
                {pantalla.chips.map((c, i) => (
                  <motion.span
                    key={`${pantalla.id}-${c.texto}`}
                    className={`oh-pnl__chip oh-pnl__chip--${i} oh-pnl__chip--${c.tono}`}
                    initial={{ opacity: 0, y: 16, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.94 }}
                    transition={{ duration: 0.55, ease: EASE, delay: 0.25 + i * 0.12 }}
                  >
                    <span className="oh-pnl__chip-icono">
                      <Icono tono={c.tono} />
                    </span>
                    <span className="oh-pnl__chip-txt">
                      <b>{c.texto}</b>
                      {c.detalle ? <small>{c.detalle}</small> : null}
                    </span>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="oh-pnl__avance" aria-hidden>
            {PANTALLAS.map((p, i) => (
              <i key={p.id} data-on={i === activa ? "true" : i < activa ? "hecho" : "false"} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {grande ? (
          <motion.div
            className="oh-visor"
            role="dialog"
            aria-modal="true"
            aria-label={`Panel Onvi: ${grande.nombre}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-lenis-prevent
          >
            <button type="button" className="oh-visor__velo" aria-label="Cerrar" onClick={() => setVisor(null)} />
            <motion.div
              className="oh-visor__caja"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="oh-pnl__grande">
                <Image src={grande.src} alt={`Panel Onvi: ${grande.nombre}`} fill sizes="92vw" className="object-contain" />
              </div>
              <button type="button" className="oh-visor__cerrar" onClick={() => setVisor(null)} autoFocus>
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
