"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { webOutro } from "@/lib/web";
import { ConPunto, Eyebrow, Flecha } from "../od/ui";

const FILA_1 = ["Sitios web", "Tiendas", "Software", "Apps móviles", "Onvi IA", "Hosting"];
/** Los rubros del portafolio real. */
const FILA_2 = ["Clínicas", "Inmobiliarias", "Costa Rica ✦", "Legal", "Educación", "Vehículos", "Retail", "Música"];

function Fila({ palabras, hueca }: { palabras: string[]; hueca: number }) {
  return (
    <>
      {palabras.map((p, i) => (
        <span key={`${p}-${i}`} className={`od-cine__palabra${i % 2 === hueca ? " od-cine__palabra--hueca" : ""}`}>
          {p.includes("✦") ? (
            <>
              {p.replace(" ✦", "")}
              <i className="od-cine__estrella">✦</i>
            </>
          ) : (
            p
          )}
        </span>
      ))}
    </>
  );
}

/**
 * La tipografía cinética de nordpixel: dos renglones de palabras enormes,
 * macizas y huecas, un poco inclinados, que se deslizan en sentidos
 * opuestos con el scroll. Debajo, el cierre del sitio oficial.
 */
export default function Cinetica() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["4%", "-38%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-40%", "2%"]);

  return (
    <section ref={ref} className="od-cine od-claro" aria-labelledby="od-cine-titulo">
      <div className="od-cine__renglones" aria-hidden>
        <motion.p className="od-cine__renglon od-cine__renglon--1" style={{ x: x1 }}>
          <Fila palabras={[...FILA_1, ...FILA_1]} hueca={1} />
        </motion.p>
        <motion.p className="od-cine__renglon od-cine__renglon--2" style={{ x: x2 }}>
          <Fila palabras={[...FILA_2, ...FILA_2]} hueca={0} />
        </motion.p>
      </div>

      <div className="od-cine__texto">
        <Eyebrow rayas>Marcas en movimiento</Eyebrow>
        <h2 id="od-cine-titulo" className="od-h2">
          <ConPunto>{webOutro.title}</ConPunto>
        </h2>
        <p className="od-lede">{webOutro.lead}</p>
        <div className="od-cine__botones">
          <Link href={webOutro.primaryCta.href} className="od-boton od-boton--negro">
            {webOutro.primaryCta.label} <Flecha />
          </Link>
          <Link href="/digital#planes" className="od-boton od-boton--linea">
            {webOutro.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
