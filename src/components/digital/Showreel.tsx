"use client";

import { motion } from "motion/react";
import { digitalShowreel } from "@/lib/digital";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * El "onvision." gigante que abre Servicios: es el h1 de la página. Las
 * letras suben una por una y el punto cian aparece al final.
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
        <motion.p
          className="od-reel__lead"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
        >
          {digitalShowreel.lead}
        </motion.p>
      </div>
    </section>
  );
}
