"use client";

import { motion } from "motion/react";
import { digitalHero } from "@/lib/digital";
import { irA } from "../od/data";
import { Flecha, Punto } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const TICKER = [
  "Facturación electrónica",
  "SaaS por industria",
  "E-commerce",
  "Onvi",
  "Apps web",
  "Apps móviles",
  "Software",
  "Páginas web",
];

/**
 * La portada de Servicios: el fondo atmosférico con el título centrado
 * y su punto de color (nordpixel), el mono de arriba y la cinta de
 * palabras que corre (la del sitio oficial).
 */
export default function Cabecera() {
  const titulo = digitalHero.headline.replace(/\.$/, "");
  return (
    <section className="od-dcab" aria-labelledby="od-dcab-titulo">
      <div className="od-dcab__tarjeta">
        <i className="od-dcab__mancha od-dcab__mancha--a" aria-hidden />
        <i className="od-dcab__mancha od-dcab__mancha--b" aria-hidden />
        <p className="od-eyebrow od-eyebrow--rayas">
          <i aria-hidden />
          <span>{digitalHero.eyebrow}</span>
          <i aria-hidden />
        </p>
        <h1 id="od-dcab-titulo" className="od-dcab__h1">
          {titulo.split(" ").map((w, i) => (
            <span key={`${w}-${i}`} className="od-dcab__palabra">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE, delay: 0.1 + i * 0.04 }}
              >
                {w}
              </motion.span>
            </span>
          ))}
          <Punto />
        </h1>
        <motion.p
          className="od-dcab__lead"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
        >
          {digitalHero.lead}
        </motion.p>
        <motion.div
          className="od-dcab__botones"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
        >
          <a
            href={digitalHero.primaryCta.href}
            className="od-boton od-boton--blanco"
            onClick={(e) => {
              e.preventDefault();
              irA("#agendar");
            }}
          >
            {digitalHero.primaryCta.label} <Flecha />
          </a>
          <a
            href="#planes"
            className="od-boton od-boton--linea-d"
            onClick={(e) => {
              e.preventDefault();
              irA("#planes");
            }}
          >
            Ver planes <Flecha dir="abajo" />
          </a>
        </motion.div>

        <div className="od-dcab__ticker" aria-hidden>
          <div className="od-dcab__pista">
            {[0, 1].map((v) => (
              <p key={v}>
                {TICKER.map((t) => (
                  <span key={t}>
                    {t}
                    <i>✦</i>
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
