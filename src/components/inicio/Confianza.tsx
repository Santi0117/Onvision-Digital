"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { companyWalkthrough } from "@/lib/company";
import { digitalShowreel } from "@/lib/digital";
import { empresaProjects } from "@/lib/empresas";
import { herramientas } from "../od/Herramientas";
import { iniciales } from "../od/data";
import { ConPunto, Flecha } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const MUESTRA = empresaProjects.slice(0, 5);

/**
 * La franja oscura de nordpixel: "programas con los que trabajamos",
 * el título centrado con punto de color, el botón blanco y la prueba social
 * (acá, las marcas reales del portafolio). Cierra con el arco convexo.
 */
export default function Confianza() {
  return (
    <section id="confianza" className="od-confianza" aria-labelledby="od-confianza-titulo">
      <p className="od-confianza__rotulo">Herramientas con las que construimos</p>
      <div className="od-confianza__cinta" aria-label="Stack de Onvision Digital">
        <div className="od-confianza__pista">
          {[0, 1].map((vuelta) => (
            <ul key={vuelta} className="od-confianza__fila" aria-hidden={vuelta === 1 || undefined}>
              {herramientas.map(({ name, mark: Mark }) => (
                <li key={name}>
                  <Mark />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <motion.div
        className="od-confianza__centro"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <h2 id="od-confianza-titulo" className="od-h2 od-confianza__h2">
          <ConPunto>{companyWalkthrough.title}</ConPunto>
        </h2>
        <p className="od-lede od-confianza__lede">{digitalShowreel.lead}</p>
        <ul className="od-confianza__puntos">
          {companyWalkthrough.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <Link href={companyWalkthrough.cta.href} className="od-boton od-boton--blanco">
          {companyWalkthrough.cta.label} <Flecha />
        </Link>
        <Link href="/empresas" className="od-confianza__prueba">
          <span className="od-confianza__caras" aria-hidden>
            {MUESTRA.map((p) => (
              <i key={p.id}>{iniciales(p.name)}</i>
            ))}
          </span>
          <span>
            <b>{empresaProjects.length} marcas y proyectos</b> ya corriendo con Onvision
          </span>
        </Link>
      </motion.div>

      <svg className="od-confianza__arco" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path d="M0 120 L0 40 Q720 -40 1440 40 L1440 120 Z" />
      </svg>
    </section>
  );
}
