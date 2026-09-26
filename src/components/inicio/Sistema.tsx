"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { companySistema } from "@/lib/company";
import { SISTEMA_URL } from "../od/data";
import { Flecha } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const PANTALLAS = [
  { src: "/product/retail-pos-hq2.webp", alt: "Onvision Retail: punto de venta" },
  { src: "/product/talleres-panel-hq.webp", alt: "Onvision Taller: órdenes de trabajo" },
  { src: "/product/clinicas-panel-hq.webp", alt: "Onvision Salud: agenda de la clínica" },
];

/**
 * El Sistema Onvision como la tarjeta final de driveberry: campo de color
 * difuso, el aro de vidrio con el precio y las pantallas reales abiertas en
 * abanico.
 */
export default function Sistema() {
  return (
    <section className="od-sistema" aria-labelledby="od-sistema-titulo">
      <div className="od-sistema__tarjeta">
        <i className="od-sistema__mancha od-sistema__mancha--a" aria-hidden />
        <i className="od-sistema__mancha od-sistema__mancha--b" aria-hidden />

        <div className="od-sistema__copy">
          <p className="od-eyebrow">(05) Sistema Onvision · SaaS</p>
          <h2 id="od-sistema-titulo" className="od-sistema__h2">
            {companySistema.title}
          </h2>
          <ul className="od-sistema__puntos">
            {companySistema.points.map((p) => (
              <li key={p}>
                <i aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <div className="od-sistema__botones">
            <a href={`${SISTEMA_URL}/activar`} className="od-boton od-boton--cian" target="_blank" rel="noopener noreferrer">
              {companySistema.cta.label} <Flecha dir="diagonal" />
            </a>
            <a href={`${SISTEMA_URL}/producto`} className="od-boton od-boton--linea-d" target="_blank" rel="noopener noreferrer">
              Ver el sistema <Flecha dir="diagonal" />
            </a>
          </div>
        </div>

        <div className="od-sistema__visual">
          <div className="od-sistema__abanico">
            {PANTALLAS.map((p, i) => (
              <motion.figure
                key={p.src}
                className={`od-sistema__pantalla od-sistema__pantalla--${i}`}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: [-7, 0, 6][i] }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, ease: EASE, delay: i * 0.12 }}
              >
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 900px) 34vw, 70vw" className="object-cover object-left-top" />
              </motion.figure>
            ))}
          </div>
          <div className="od-sistema__aro" aria-hidden>
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" className="od-aro-fondo" />
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                className="od-aro-valor"
                pathLength={100}
                initial={{ strokeDashoffset: 100 }}
                whileInView={{ strokeDashoffset: 18 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: EASE }}
              />
            </svg>
            <p>
              <b>₡10.500</b>
              <span>al mes</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
