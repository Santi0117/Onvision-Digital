"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { aboutPage } from "@/lib/about";
import Streaks from "./Streaks";
import { Esquinas, Flecha, Seccion, Tag } from "./ui";

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

/** Mercado vs. Onvision, fila por fila (los precios de /sobre-nosotros). */
const FILAS = [
  ...aboutPage.prices.market.map((m) => ({ opcion: m.label, precio: m.value, quien: "Mercado", nuestra: false })),
  ...aboutPage.prices.ours.map((m) => ({ opcion: m.label, precio: m.value, quien: "Onvision", nuestra: true })),
];

/**
 * Onvision vs el mercado en el lenguaje de sibaldesign: bloque verde-noche
 * con rayado, puntos y estelas; encabezado con índice y regla, y los
 * precios como su registro.
 */
export default function Hud() {
  const bloque = useRef<HTMLDivElement>(null);

  return (
    <div ref={bloque} className="oh-hud" data-tema="oscuro">
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

      <section id="comparativa" className="oh-hud__sec" aria-labelledby="oh-comp-titulo">
        <Seccion indice="06">Precios</Seccion>
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
    </div>
  );
}
