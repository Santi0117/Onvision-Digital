"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import { digitalMeeting, digitalPlans } from "@/lib/digital";
import { webOutro } from "@/lib/web";
import Particulas from "./Particulas";
import { Flecha, Mono } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

/** De la pregunta frecuente "¿Cuánto tarda desde que pago?". */
const TIEMPO = "El tiempo promedio es de una semana";

/** Los tres pasos de "nos contás el negocio, elegimos las piezas y en días tenés tu sitio publicado". */
const PASOS = [
  {
    step: "01",
    palabra: "Contá",
    titulo: "Nos contás el negocio",
    desc: digitalMeeting.lead,
    consola: "agenda.reservar({ servicio: 'Sitio web' })",
  },
  {
    step: "02",
    palabra: "Elegí",
    titulo: "Elegimos las piezas",
    desc: digitalPlans.description.split(". ").slice(1).join(". "),
    consola: "piezas.elegir(['portada', 'agenda', 'onvi'])",
  },
  {
    step: "03",
    palabra: "Publicá",
    titulo: "Tu sitio, publicado en días",
    desc: `${TIEMPO}: la idea es entregar de forma eficiente, sin bajarle a la calidad. Dominio, hosting y Onvi incluidos.`,
    consola: "sitio.publicar('tudominio.com') // en días",
  },
];
const N = PASOS.length;

/**
 * "Cómo funciona" como "At the machine" de jeffmilanes: el dibujo de puntos
 * que cambia de figura, la consola que se llena y la palabra gigante de
 * cada paso.
 */
export default function Pasos() {
  const pista = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
    setI((prev) => (prev === n ? prev : n));
  });

  const paso = PASOS[i]!;

  return (
    <section id="como-funciona" className="oh-pasos" aria-labelledby="oh-pasos-titulo">
      <div className="oh-pasos__intro-movil">
        <Mono>Cómo funciona</Mono>
        <h2 className="oh-pasos__h2">{webOutro.title}</h2>
        <p className="oh-pasos__lede">{webOutro.lead}</p>
      </div>

      <div ref={pista} className="oh-pasos__pista">
        <div className="oh-pasos__stage">
          <div className="oh-pasos__izq">
            <Particulas forma={i} className="oh-pasos__lienzo" />
            <div className="oh-pasos__intro">
              <Mono className="oh-pasos__kicker">Cómo funciona</Mono>
              <h2 id="oh-pasos-titulo" className="oh-pasos__h2">
                {webOutro.title}
              </h2>
              <p className="oh-pasos__lede">{webOutro.lead}</p>
            </div>
            <ul className="oh-pasos__consola" aria-hidden>
              {PASOS.slice(0, i + 1).map((s, k) => (
                <li key={s.step} data-nueva={k === i ? "true" : "false"}>
                  <span>›</span> {s.consola}
                </li>
              ))}
            </ul>
          </div>

          <div className="oh-pasos__der">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={paso.step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Mono className="oh-pasos__num">{paso.step}</Mono>
                <h3 className="oh-pasos__palabra" style={{ "--len": paso.palabra.length } as CSSProperties}>
                  <span className="sr-only">{paso.titulo}</span>
                  <motion.span
                    aria-hidden
                    className="inline-block"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    {paso.palabra}
                  </motion.span>
                </h3>
                <p className="oh-pasos__titulo" aria-hidden>
                  {paso.titulo}
                </p>
                <p className="oh-pasos__desc">{paso.desc}</p>
              </motion.div>
            </AnimatePresence>

            <ol className="oh-pasos__marcas" aria-hidden>
              {PASOS.map((s, k) => (
                <li key={s.step} data-on={k <= i ? "true" : "false"}>
                  <i />
                  {s.step}
                </li>
              ))}
            </ol>

            <div className="oh-pasos__ctas">
              <Link href={webOutro.primaryCta.href} className="oh-pill oh-pill--blanca oh-pill--chica">
                {webOutro.primaryCta.label}
                <span className="oh-pill__circ">
                  <Flecha dir="diagonal" />
                </span>
              </Link>
              <a href="#precios" className="oh-show__detalle">
                {webOutro.secondaryCta.label}
                <Flecha className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
