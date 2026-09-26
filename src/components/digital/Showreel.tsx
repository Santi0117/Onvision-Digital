"use client";

import { motion } from "motion/react";
import { digitalShowreel } from "@/lib/digital";
import Pantalla from "../od/Pantalla";
import { servicios } from "../od/data";
import { Flecha } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * El showreel "onvision" como "Proof, not promises" de jeffmilanes: el
 * número hueco gigante, el nombre enorme con su flecha, el texto y el video
 * del servicio a todo lo ancho.
 */
export default function Showreel() {
  return (
    <section id="trabajo" className="od-reel" aria-labelledby="od-reel-titulo">
      <div className="od-reel__cabeza">
        <h2 id="od-reel-titulo" className="od-reel__marca">
          {digitalShowreel.title}
          <span className="od-punto">.</span>
        </h2>
        <p className="od-reel__lead">{digitalShowreel.lead}</p>
      </div>

      <ol className="od-reel__lista">
        {servicios.map((s, i) => (
          <motion.li
            key={s.id}
            className={`od-reel__fila${i % 2 ? " od-reel__fila--der" : ""}`}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <div className="od-reel__texto">
              <p className="od-reel__num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="od-reel__nombre">
                {s.label}
                <Flecha dir="diagonal" className="od-reel__flecha" />
              </h3>
              <p className="od-reel__cuerpo">{s.body}</p>
              <p className="od-mono od-reel__precio">{s.precio}</p>
              <a href={digitalShowreel.cta.href} target="_blank" rel="noopener noreferrer" className="od-pastilla od-pastilla--clara">
                <Flecha dir="diagonal" /> {digitalShowreel.cta.label}
              </a>
            </div>
            <Pantalla video={s.video} poster={s.poster} titulo={s.label} className="od-reel__pantalla" />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
