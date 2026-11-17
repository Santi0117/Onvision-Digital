"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { webHero } from "@/lib/web";
import SplitFlapText from "./SplitFlapText";

const EASE = [0.22, 1, 0.36, 1] as const;

/** La palabra que rota debajo del titular, en las fichas de la preview. */
const PALABRAS = ["TU SITIO", "TU TIENDA", "TU SOFTWARE", "TU APP", "TU SISTEMA"];

/**
 * El titular en renglones de cartel (jeffmilanes): arriba macizo, abajo hueco,
 * con el precio en cian. Cada renglón cabe entero desde un celular de 360
 * ("Tu página web" es el más largo); juntos se leen como una sola frase.
 */
const RENGLONES: readonly { texto: string; hueco: boolean; acento?: string }[] = [
  { texto: "Tu página web", hueco: false },
  { texto: "lista para", hueco: false },
  { texto: "vender,", hueco: false },
  { texto: "desde $35", hueco: true, acento: "$35" },
  { texto: "al mes.", hueco: true },
];

/** El renglón, con su parte en cian si la tiene. */
function Renglon({ texto, acento }: { texto: string; acento?: string }) {
  if (!acento || !texto.includes(acento)) return texto;
  const [antes, despues] = texto.split(acento);
  return (
    <>
      {antes}
      <span className="oh-vh__acento">{acento}</span>
      {despues}
    </>
  );
}

/** Lo que nos diferencia, en una línea debajo de los botones (solo en compu). */
const ETIQUETAS = ["Hecho en Costa Rica", "Hosting incluido", "Onvi IA incluida", "Respuesta en menos de 24 h"];

/**
 * Portada: la laptop 3D de la preview oficial a la derecha (la escena fija
 * detrás) y a la izquierda el titular gigante — "TU PÁGINA WEB LISTA PARA
 * VENDER, DESDE $35 AL MES." — con la palabra que rota en las fichas de la
 * preview. Los botones son las tarjetas de la preview.
 */
export default function Portada({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const go = ready || Boolean(reduce);

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

        {/* El h1 es solo el titular, para que Google lo lea tal cual; las fichas
            que cambian de palabra van aparte, con la misma letra. */}
        <h1 id="oh-vh-titulo" className="oh-vh__h1">
          {RENGLONES.map((r, i) => (
            <span key={r.texto} className={`oh-vh__linea${r.hueco ? " oh-vh__linea--hueca" : ""}`}>
              <motion.span className="inline-block" {...linea(0.12 + i * 0.07)}>
                <Renglon texto={r.texto} acento={r.acento} />
              </motion.span>{" "}
            </span>
          ))}
        </h1>
        <motion.span aria-hidden className="oh-vh__h1 oh-vh__flap" {...entra(0.5, 12)}>
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

        <motion.p className="vision-hero__lead oh-vh__lead" {...entra(0.62, 12)}>
          {webHero.lead}
        </motion.p>

        <div className="vision-hero__actions">
          <motion.span className="vision-hero-card vision-hero-card--price" {...entra(0.72, 18)}>
            <span className="vision-hero-card__kicker">{webHero.price.kicker}</span>
            <span className="vision-hero-card__value">{webHero.price.value}</span>
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
        <motion.p className="oh-vh__pago" {...entra(0.94, 8)}>
          {webHero.price.note}
        </motion.p>

        <motion.ul className="oh-vh__meta" {...entra(1, 8)}>
          {ETIQUETAS.map((parte, i) => (
            <li key={parte}>
              {i > 0 ? <em aria-hidden>/</em> : null}
              {parte}
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="vision-hero__visual" aria-hidden />
    </section>
  );
}
