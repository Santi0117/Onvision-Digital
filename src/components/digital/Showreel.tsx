"use client";

import { motion } from "motion/react";
import { digitalShowreel } from "@/lib/digital";
import { EYE_PUPIL_R } from "@/lib/ojo";
import { OJO_D } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * El "onvision." gigante que abre Servicios: es el h1 de la página. Las
 * letras suben una por una y el punto cian aparece al final; a la derecha,
 * el ojo de la marca con la pupila del mismo cian.
 */
export function ShowreelCabeza() {
  const letras = digitalShowreel.title.split("");
  return (
    <section className="od-reel od-reel--cabeza od-claro" aria-labelledby="od-reel-titulo">
      <div className="od-reel__cabeza">
        <h1 id="od-reel-titulo" className="od-reel__marca">
          <span className="sr-only">Onvision Digital: sitios, tiendas y software a medida</span>
          <span aria-hidden className="od-reel__letras">
            {letras.map((l, i) => (
              <motion.span
                key={`${l}-${i}`}
                className="od-reel__letra"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE, delay: 0.08 + i * 0.045 }}
              >
                {l}
              </motion.span>
            ))}
            <motion.span
              className="od-punto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 + letras.length * 0.045 + 0.2 }}
            >
              .
            </motion.span>
          </span>
        </h1>
        <motion.svg
          viewBox="0 0 100 56"
          className="od-reel__ojo"
          aria-hidden
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
        >
          <path d={OJO_D} fill="currentColor" fillRule="evenodd" />
          <circle cx="50" cy="28" r={(EYE_PUPIL_R * 49 * 0.5).toFixed(2)} className="od-reel__pupila" />
        </motion.svg>
      </div>
    </section>
  );
}
