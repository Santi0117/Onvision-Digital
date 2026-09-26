"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { aboutPage } from "@/lib/about";
import { herramientas } from "../od/Herramientas";
import Streaks from "./Streaks";
import { Esquinas, Flecha, Seccion, Tag } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/** SCROLL 000 → 100 del bloque, en el riel derecho. */
function Riel({ objetivo }: { objetivo: React.RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({ target: objetivo, offset: ["start end", "end start"] });
  const [v, setV] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = Math.round(p * 100);
    setV((prev) => (prev === n ? prev : n));
  });
  return <>SCROLL {String(v).padStart(3, "0")}</>;
}

/** Los tres pilares del objetivo y las tres habilidades detrás, como la grilla de equipo de sibaldesign. */
const TARJETAS = [
  ...aboutPage.mission.pillars.map((p, i) => ({ cat: `PILAR.0${i + 1}`, titulo: p.label, desc: p.text })),
  ...aboutPage.skills.items.map((s) => ({ cat: `HABILIDAD.${s.code}`, titulo: s.label, desc: s.hint })),
];

/** Mercado vs. Onvision, fila por fila (los precios de /sobre-nosotros). */
const FILAS = [
  ...aboutPage.prices.market.map((m) => ({ opcion: m.label, precio: m.value, quien: "Mercado", nuestra: false })),
  ...aboutPage.prices.ours.map((m) => ({ opcion: m.label, precio: m.value, quien: "Onvision", nuestra: true })),
];

/**
 * "Por qué", "Precios" y "Stack" en el lenguaje de sibaldesign: bloque
 * verde-noche con rayado, puntos y estelas; encabezados con índice y
 * regla; los pilares como su grilla de equipo, los precios como su
 * registro y las herramientas como fichas.
 */
export default function Hud() {
  const bloque = useRef<HTMLDivElement>(null);
  const [antes, despues = ""] = aboutPage.mission.title.replace(/\.$/, "").split(" accesible ");
  const [stack1, stack2 = ""] = aboutPage.tools.title.replace(/\.$/, "").split(/ (?=con )/);

  return (
    <div ref={bloque} className="oh-hud">
      <div className="oh-fx" aria-hidden>
        <div className="oh-fx__rayado oh-fx__rayado--hud" />
        <div className="oh-fx__puntos oh-fx__puntos--bordes" />
        <div className="oh-fx__scan" />
        <div className="oh-fx__vineta" />
        <Streaks className="oh-fx__estelas" />
      </div>
      <p className="oh-riel oh-riel--izq" aria-hidden>
        ONVISION <b>{"//"}</b> EST. COSTA RICA
      </p>
      <p className="oh-riel oh-riel--der" aria-hidden>
        <Riel objetivo={bloque} />
      </p>
      <Esquinas className="oh-hud__esquinas" />

      <section id="por-que" className="oh-hud__sec" aria-labelledby="oh-porque-titulo">
        <Seccion indice="09">Por qué Onvision</Seccion>
        <h2 id="oh-porque-titulo" className="oh-hud__h2">
          <span>{antes} accesible</span>
          <span className="oh-hud__hueca">{despues}.</span>
        </h2>
        <p className="oh-hud__lede">{aboutPage.mission.body}</p>

        <div className="oh-equipo">
          {TARJETAS.map((v, i) => (
            <motion.article
              key={v.titulo}
              className="oh-equipo__card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.08 }}
            >
              <p className="oh-equipo__cat">{v.cat}</p>
              <h3 className="oh-equipo__titulo">{v.titulo}</h3>
              <span className="oh-equipo__barra" aria-hidden>
                <motion.i
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.25 + (i % 3) * 0.12 }}
                />
              </span>
              <p className="oh-equipo__desc">{v.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="comparativa" className="oh-hud__sec" aria-labelledby="oh-comp-titulo">
        <Seccion indice="10">Precios</Seccion>
        <h2 id="oh-comp-titulo" className="oh-hud__h2">
          <span>Onvision</span>
          <span className="oh-hud__hueca">vs el mercado</span>
        </h2>
        <p className="oh-hud__lede">
          {aboutPage.prices.title} {aboutPage.prices.emphasis}
        </p>

        <div className="oh-panel oh-log">
          <Tag derecha={`${FILAS.length} OPCIONES · USD`}>PRECIOS.LOG</Tag>
          <table className="oh-log__tabla">
            <thead>
              <tr>
                <th scope="col">Opción</th>
                <th scope="col">Precio</th>
                <th scope="col">Quién</th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map((r, i) => (
                <tr key={r.opcion} data-nuestra={r.nuestra ? "true" : "false"}>
                  <th scope="row">
                    <span className="oh-log__idx" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {r.opcion}
                  </th>
                  <td className={r.nuestra ? "oh-log__on" : "oh-log__tachado"} data-label="Precio">
                    {r.nuestra ? r.precio : <s>{r.precio}</s>}
                  </td>
                  <td data-label="Quién">{r.quien}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="#precios" className="oh-log__ver">
            Ver todos los planes
            <Flecha className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      <section id="stack" className="oh-hud__sec" aria-labelledby="oh-stack-titulo">
        <Seccion indice="11">Stack</Seccion>
        <h2 id="oh-stack-titulo" className="oh-hud__h2 oh-hud__h2--chico">
          <span>{stack1}</span>
          <span className="oh-hud__hueca">{stack2}.</span>
        </h2>
        <p className="oh-hud__lede">{aboutPage.tools.body}</p>

        <ul className="oh-stack">
          {herramientas.map(({ name, mark: Mark }, i) => (
            <motion.li
              key={name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, ease: EASE, delay: (i % 5) * 0.05 }}
            >
              <span className="oh-stack__idx">{String(i + 1).padStart(2, "0")}</span>
              <span className="oh-stack__marca">
                <Mark />
              </span>
              <span className="oh-stack__nombre">{name}</span>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
