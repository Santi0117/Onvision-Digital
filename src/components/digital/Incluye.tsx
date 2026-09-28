"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { digitalIncludes } from "@/lib/digital";
import Pixel, { type FiguraPixel } from "../od/Pixel";
import { ConPunto, Sello } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const FIGURAS: FiguraPixel[] = ["web", "tienda", "software", "movil"];

/** "Desde $35/mes o $550" → la cifra grande y lo demás chico. */
function partirPrecio(p: string) {
  const m = p.match(/^Desde\s+(\S+)(.*)$/i);
  return m ? { cifra: m[1]!, resto: m[2]!.trim() } : { cifra: p, resto: "" };
}

/**
 * "01 — Qué incluye" como "Was eine gute Website bringt" de nordpixel: la
 * lista numerada a la izquierda con su barra de avance y a la derecha la
 * tarjeta grande con el número hueco y el sello que gira.
 */
export default function Incluye() {
  const [activo, setActivo] = useState(0);
  const item = digitalIncludes.items[activo]!;
  const precio = partirPrecio(item.price);

  return (
    <section id="incluye" className="od-incl od-claro" aria-labelledby="od-incl-titulo">
      <div className="od-incl__izq">
        <p className="od-eyebrow">01 — Qué incluye</p>
        <h2 id="od-incl-titulo" className="od-h2">
          <ConPunto>{digitalIncludes.title}</ConPunto>
        </h2>
        <p className="od-lede">{digitalIncludes.lead}</p>

        <ol className="od-incl__lista" role="tablist" aria-label="Servicios">
          {digitalIncludes.items.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                role="tab"
                id={`od-incl-tab-${it.id}`}
                aria-selected={activo === i}
                aria-controls="od-incl-panel"
                className={activo === i ? "is-on" : undefined}
                onClick={() => setActivo(i)}
              >
                <span className="od-incl__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="od-incl__nombre">{it.title}</span>
                <span className="od-incl__barra" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div id="od-incl-panel" role="tabpanel" aria-labelledby={`od-incl-tab-${item.id}`} className="od-incl__tarjeta">
        <Sello texto="AGENDAR REUNIÓN · SIN COMPROMISO · " href="/planes#agendar" etiqueta="Agendar una reunión" className="od-incl__sello" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            className="od-incl__contenido"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Pixel figura={FIGURAS[activo]!} className="od-incl__pixel" />
            <h3 className="od-incl__titulo">
              {item.title.split(" ")[0]} <span>{item.title.split(" ").slice(1).join(" ")}</span>
            </h3>
            <p className="od-incl__desc">{item.description}</p>
            <p className="od-incl__precio">
              <span className="od-mono">Desde</span>
              <b>{precio.cifra}</b>
              {precio.resto ? <span>{precio.resto}</span> : null}
            </p>
            <p className="od-incl__hueco" aria-hidden>
              {String(activo + 1).padStart(2, "0")}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
