"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { companyHero } from "@/lib/company";
import { webHero } from "@/lib/web";
import SplitFlapText from "./SplitFlapText";
import { smoothstep, visionStore } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** "…hecho a tu marca: TU SITIO." La palabra que rota, en las fichas de la preview. */
const PALABRAS = ["TU SITIO", "TU TIENDA", "TU SOFTWARE", "TU APP", "TU SISTEMA"];

/** El titular en cuatro renglones de cartel (jeffmilanes), el final hueco. */
const RENGLONES = [
  { texto: "Pieza por", hueco: false },
  { texto: "pieza,", hueco: false },
  { texto: "hecho a tu", hueco: true },
  { texto: "marca:", hueco: true },
];

/** Las tarjetas de vidrio que flotan alrededor de la laptop (driveberry). */
const VIDRIOS = [
  { clase: "a", icono: "⚡", titulo: "Onvi activa", texto: "Atiende 24/7 en español" },
  { clase: "b", icono: "✓", titulo: "Reserva confirmada", texto: "Consulta · mañana 9:00" },
  { clase: "c", icono: "98", titulo: "Rendimiento 98 · SEO 100", texto: "Carga en menos de 1 s" },
];

/**
 * Portada: la laptop 3D de la preview oficial a la derecha (la escena fija
 * detrás) y a la izquierda el titular gigante de nuestro inicio —
 * "PIEZA POR PIEZA, / HECHO A TU MARCA:" — con la palabra que rota en las
 * fichas de la preview. Los botones son las tarjetas de la preview y las
 * notificaciones de vidrio de driveberry flotan alrededor de la laptop.
 */
export default function Portada({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const go = ready || Boolean(reduce);
  const vidriosRef = useRef<HTMLDivElement>(null);

  // Las notificaciones se van cuando la laptop empieza a abrirse.
  useEffect(() => {
    let last = "";
    return visionStore.subscribe((frame) => {
      const el = vidriosRef.current;
      if (!el) return;
      const o = (1 - smoothstep(-0.34, -0.1, frame.raw)).toFixed(3);
      if (o !== last) {
        last = o;
        el.style.opacity = o;
      }
    });
  }, []);

  const entra = (delay: number, y = 16) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y, filter: "blur(6px)" },
          animate: go ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y, filter: "blur(6px)" },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  const linea = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { y: "105%" },
          animate: go ? { y: "0%" } : { y: "105%" },
          transition: { duration: 1, delay, ease: EASE },
        };

  return (
    <section id="inicio" className="vision-hero vision-hero--scene oh-vh" data-tema="oscuro" aria-labelledby="oh-vh-titulo">
      <p className="oh-riel oh-riel--izq oh-vh__riel" aria-hidden>
        ONVISION <b>{"//"}</b> COSTA RICA
      </p>

      <div className="vision-hero__copy oh-vh__copy">
        <motion.p className="vision-hero__eyebrow" {...entra(0.04, 10)}>
          <i className="vision-hero__dot" aria-hidden />
          {webHero.eyebrow}
          <span className="oh-vh__eyebrow-mas">· Sitios · Tiendas · Software · Apps</span>
        </motion.p>

        <h1 id="oh-vh-titulo" className="oh-vh__h1">
          <span className="sr-only">{webHero.title.join(" ")}</span>
          {RENGLONES.map((r, i) => (
            <span key={r.texto} aria-hidden className={`oh-vh__linea${r.hueco ? " oh-vh__linea--hueca" : ""}`}>
              <motion.span className="inline-block" {...linea(0.12 + i * 0.08)}>
                {r.texto}
              </motion.span>
            </span>
          ))}
          <motion.span aria-hidden className="oh-vh__flap" {...entra(0.5, 12)}>
            <SplitFlapText
              words={PALABRAS}
              flipDuration={0.12}
              stagger={0.05}
              cycleDelay={2600}
              charset="alpha"
              flipsPerChar={8}
              tileColor="#101820"
              textColor="#34d3ee"
              tileRadius={6}
              gap={3}
              fontSize={30}
              loop
              padTo={11}
              className="vision-hero__flap oh-vh__fichas"
            />
          </motion.span>
        </h1>

        <motion.p className="vision-hero__lead oh-vh__lead" {...entra(0.62, 12)}>
          {webHero.lead}
        </motion.p>

        <div className="vision-hero__actions">
          <motion.span className="vision-hero-card vision-hero-card--price" {...entra(0.72, 18)}>
            <span className="vision-hero-card__kicker">desde</span>
            <span className="vision-hero-card__value">$35/mes · Onvi IA</span>
          </motion.span>
          <motion.a href={webHero.secondaryCta.href} className="vision-hero-card vision-hero-card--ghost" {...entra(0.8, 18)}>
            {webHero.secondaryCta.label}
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
              <path d="M5 1v10M1 7l4 4 4-4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </motion.a>
          <motion.div className="oh-vh__primario" {...entra(0.88, 18)}>
            <Link href={webHero.primaryCta.href} className="vision-hero-card vision-hero-card--primary">
              {webHero.primaryCta.label}
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>

        <motion.ul className="oh-vh__meta" {...entra(1, 8)}>
          {[companyHero.headline.replace(/\.$/, ""), "Onvi IA incluida", "Costa Rica"].map((parte, i) => (
            <li key={parte}>
              {i > 0 ? <em aria-hidden>/</em> : null}
              {parte}
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="vision-hero__visual" aria-hidden />

      <div ref={vidriosRef} className={`oh-vidrios${go ? " is-on" : ""}`} aria-hidden>
        {VIDRIOS.map((v) => (
          <div key={v.clase} className={`oh-vidrio oh-vidrio--${v.clase}`}>
            <span className="oh-vidrio__ico">{v.icono}</span>
            <span className="oh-vidrio__txt">
              <b>{v.titulo}</b>
              {v.texto}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
