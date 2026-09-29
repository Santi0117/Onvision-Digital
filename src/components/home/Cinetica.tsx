"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Fragment, useRef } from "react";
import { servicios } from "../od/data";
import { Ojo } from "../od/ui";
import { empresas } from "./data";

/** Lo que hacemos: las cuatro líneas y lo que va incluido en todas. */
const HACEMOS = [...servicios.map((s) => s.label), "Onvi IA", "Hosting"];

/** Para quién: el rubro de cada empresa que ya está corriendo (en grande, Software en vez de Estudio musical). */
const PARA = [...new Set(empresas.map((e) => e.sector.split(" · ")[0]!))].map((s) => (s === "Estudio musical" ? "Software" : s));

function Palabras({ palabras, desfase }: { palabras: readonly string[]; desfase: number }) {
  // Una vuelta alcanza: la fila se corre menos de media pantalla.
  return (
    <>
      {palabras.map((p, i) => (
        <Fragment key={`${p}-${i}`}>
          <span className={(i + desfase) % 2 ? "oh-cinetica__hueca" : undefined}>{p}</span>
          <Ojo className="oh-cinetica__ojo" />
        </Fragment>
      ))}
    </>
  );
}

/**
 * "Marca en movimiento" de nordpixel: dos filas de palabras gigantes, una
 * llena y otra hueca, apenas giradas, que se deslizan en sentidos
 * contrarios con el scroll. Arriba lo que hacemos; abajo, para quién.
 */
export default function Cinetica() {
  const ref = useRef<HTMLElement>(null);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const haciaIzq = useTransform(scrollYProgress, [0, 1], ["0vw", "-46vw"]);
  const haciaDer = useTransform(scrollYProgress, [0, 1], ["-46vw", "0vw"]);

  return (
    <section ref={ref} className="oh-cinetica" aria-labelledby="oh-cinetica-titulo">
      <p id="oh-cinetica-titulo" className="oh-cinetica__eyebrow">
        <i aria-hidden />
        Tu marca en movimiento
        <i aria-hidden />
      </p>
      <p className="sr-only">
        {HACEMOS.join(", ")}. Para {PARA.join(", ").toLocaleLowerCase("es")}.
      </p>
      <div className="oh-cinetica__filas" aria-hidden>
        <motion.div className="oh-cinetica__fila oh-cinetica__fila--a" style={quieto ? undefined : { x: haciaIzq }}>
          <Palabras palabras={HACEMOS} desfase={0} />
        </motion.div>
        <motion.div className="oh-cinetica__fila oh-cinetica__fila--b" style={quieto ? undefined : { x: haciaDer }}>
          <Palabras palabras={PARA} desfase={1} />
        </motion.div>
      </div>
    </section>
  );
}
