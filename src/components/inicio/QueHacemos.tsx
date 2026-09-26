"use client";

import { motion } from "motion/react";
import { digitalHero } from "@/lib/digital";
import { servicios } from "../od/data";
import { Indice } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * "WHAT WE DO" de hobro: la serif itálica hueca choca con la grotesca
 * negra gigante; a la derecha, la frase corta; abajo, la tabla de cuatro
 * columnas en mayúsculas separada por líneas finas.
 */
export default function QueHacemos() {
  return (
    <section className="od-que od-claro" aria-labelledby="od-que-titulo">
      <div className="od-que__cabeza">
        <h2 id="od-que-titulo" className="od-que__titulo">
          <span className="sr-only">Lo que hacemos</span>
          <motion.span
            aria-hidden
            className="od-que__serif"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            Lo que
          </motion.span>
          <motion.span
            aria-hidden
            className="od-que__negra od-que__negra--1"
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          >
            HACE
          </motion.span>
          <motion.span
            aria-hidden
            className="od-que__negra od-que__negra--2"
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          >
            MOS
          </motion.span>
        </h2>
        <p className="od-que__frase">{digitalHero.lead}</p>
      </div>

      <div className="od-que__tabla">
        {servicios.map((s) => (
          <div key={s.id} className="od-que__col">
            <p className="od-que__col-titulo">
              <Indice n={s.n} /> {s.label}
            </p>
            <ul>
              {s.piezas.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
