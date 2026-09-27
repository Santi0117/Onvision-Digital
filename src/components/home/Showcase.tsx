"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import { digitalShowreel } from "@/lib/digital";
import { Esquinas, Flecha, Mono, Tag } from "./ui";
import { SISTEMA, escenasServicio, irAPaso, pad, tinte, type EscenaServicio, type Linea } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;
const N = escenasServicio.length;
const [TITULO, LEDE = ""] = digitalShowreel.lead.split(" — ");
const LEDE_COMPLETO = `${LEDE.charAt(0).toUpperCase()}${LEDE.slice(1).replace(/\.$/, "")}. Elegí la línea y mirá qué trae cada una.`;

function Onvi({ e }: { e: EscenaServicio }) {
  return (
    <p className="oh-show__onvi">
      <span aria-hidden>◈</span>
      <b>ONVI</b>
      {e.linea === "sistema"
        ? "Tu agente de IA dentro del sistema: te avisa, recomienda y responde."
        : "Incluida en el proyecto: responde, agenda y recomienda."}
    </p>
  );
}

function Acciones({ e, alElegir, detalle }: { e: EscenaServicio; alElegir: (linea: Linea) => void; detalle: string }) {
  if (e.linea === "sistema") {
    return (
      <div className="oh-show__acciones">
        <a href={SISTEMA.activar} target="_blank" rel="noopener noreferrer" className="oh-pill oh-pill--blanca">
          Activar Onvision
          <span className="oh-pill__circ">
            <Flecha dir="diagonal" />
          </span>
        </a>
        <a href={SISTEMA.producto} target="_blank" rel="noopener noreferrer" className="oh-show__detalle">
          Ver el sistema
          <Flecha dir="diagonal" className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }
  const linea = e.linea;
  return (
    <div className="oh-show__acciones">
      <button type="button" className="oh-pill oh-pill--blanca" onClick={() => alElegir(linea)}>
        Elegir este plan
        <span className="oh-pill__circ">
          <Flecha dir="diagonal" />
        </span>
      </button>
      <Link href={detalle} className="oh-show__detalle">
        Ver detalle
        <Flecha className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/**
 * "Servicios" como el "Across industries" de jeffmilanes: escena fija en
 * negro; al bajar cambia el nombre gigante y su pantalla, que va en un
 * panel de HUD. Al final, el Sistema Onvision. En el celular es un
 * carrusel que se desliza. Abre la página de Servicios: su título es el h1.
 */
export default function Showcase({
  alElegir,
  detalle = "#trabajo",
}: {
  alElegir: (linea: Linea) => void;
  /** A dónde lleva "Ver detalle". */
  detalle?: string;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
    setI((prev) => (prev === n ? prev : n));
  });

  const e = escenasServicio[i]!;

  return (
    <section className="oh-show" aria-label="Servicios">
      <div ref={pista} className="oh-show__pista" style={{ "--n": N } as CSSProperties}>
        <div className="oh-show__stage" style={tinte(e.linea)}>
          <div className="oh-show__izq">
            <Mono>Servicios · Onvision Digital</Mono>
            <h1 className="oh-show__h2">{TITULO}.</h1>
            <p className="oh-show__lede">{LEDE_COMPLETO}</p>

            <div className="oh-show__actual">
              <p className="oh-show__nombre" style={{ "--len": e.nombre.length } as CSSProperties}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={e.id}
                    className="inline-block"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-60%", opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {e.nombre}
                  </motion.span>
                </AnimatePresence>
              </p>
              <p className="oh-show__meta">
                <span>
                  {pad(i + 1)} / {pad(N)}
                </span>
                <span>{e.detalle}</span>
              </p>
              <p className="oh-show__body">{e.cuerpo}</p>
              <Acciones e={e} alElegir={alElegir} detalle={detalle} />
            </div>
          </div>

          <div className="oh-show__der">
            <div className="oh-panel oh-show__panel">
              <Tag derecha={`${pad(i + 1)} / ${pad(N)}`}>{e.nombre}</Tag>
              <div className="oh-show__pantalla">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={e.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <Image
                      src={e.imagen}
                      alt={e.alt}
                      fill
                      sizes="(min-width: 1024px) 720px, 92vw"
                      className={e.ajuste === "cover" ? "oh-img-sistema object-cover object-left-top" : "object-contain"}
                    />
                  </motion.div>
                </AnimatePresence>
                <Esquinas className="oh-show__esquinas" />
              </div>
              <ul className="oh-terminal">
                {e.lineas.map((l) => (
                  <li key={l}>
                    <span aria-hidden>›</span>
                    <b>{l}</b>
                  </li>
                ))}
              </ul>
              <Onvi e={e} />
            </div>

            <div className="oh-show__indices" role="group" aria-label="Ir a un servicio">
              {escenasServicio.map((x, k) => (
                <button
                  key={x.id}
                  type="button"
                  aria-label={x.nombre}
                  aria-current={k === i ? "true" : undefined}
                  onClick={() => irAPaso(pista.current, k, N)}
                >
                  {pad(k + 1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="oh-show__movil">
        {/* Solo una de las dos cabeceras se ve (escritorio o celular): cada una lleva el h1. */}
        <div className="oh-show__movil-head">
          <Mono>Servicios · Onvision Digital</Mono>
          <h1 className="oh-show__h2">{TITULO}.</h1>
          <p className="oh-show__lede">{LEDE_COMPLETO}</p>
        </div>
        <ul className="oh-show__carrusel">
          {escenasServicio.map((x, k) => (
            <li key={x.id} className="oh-show__tarjeta" style={tinte(x.linea)}>
              <p className="oh-show__meta">
                <span>
                  {pad(k + 1)} / {pad(N)}
                </span>
                <span>{x.detalle}</span>
              </p>
              <p className="oh-show__nombre" style={{ "--len": x.nombre.length } as CSSProperties}>
                {x.nombre}
              </p>
              <div className="oh-show__pantalla">
                <Image
                  src={x.imagen}
                  alt={x.alt}
                  fill
                  sizes="88vw"
                  className={x.ajuste === "cover" ? "oh-img-sistema object-cover object-left-top" : "object-contain"}
                />
              </div>
              <p className="oh-show__body">{x.cuerpo}</p>
              <ul className="oh-terminal">
                {x.lineas.map((l) => (
                  <li key={l}>
                    <span aria-hidden>›</span>
                    <b>{l}</b>
                  </li>
                ))}
              </ul>
              <Onvi e={x} />
              <Acciones e={x} alElegir={alElegir} detalle={detalle} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
