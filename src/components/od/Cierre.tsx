"use client";

import { useInView } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { site } from "@/lib/site";
import { wa } from "./data";
import { Flecha, IconoWhatsApp } from "./ui";

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Las letras giran al azar y se acomodan (el "PING US" de hobro). */
function Revuelta({ palabra }: { palabra: string }) {
  const [txt, setTxt] = useState(palabra);
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!visto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let f = 0;
    const id = window.setInterval(() => {
      f += 1;
      setTxt(
        palabra
          .split("")
          .map((c, i) => (c === " " || f > 6 + i * 2 ? c : LETRAS[Math.floor(Math.random() * LETRAS.length)]))
          .join(""),
      );
      if (f > 6 + palabra.length * 2) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [visto, palabra]);

  return (
    <span ref={ref} className="od-cierre__palabra" aria-hidden>
      {txt}
    </span>
  );
}

/**
 * El cierre de cada página: "Got Project? PING US" de hobro (paréntesis
 * gigantes y letras que se acomodan) con el contacto en mono de jeffmilanes.
 */
export default function Cierre({
  pregunta = "¿Tienes un proyecto?",
  palabra = "HABLEMOS",
  lead = "Agenda una reunión y vemos qué vale la pena construir primero.",
  primario = { label: "Agendar reunión", href: "/planes#agendar" },
  secundario,
}: {
  pregunta?: string;
  palabra?: string;
  /** `null`: sin frase debajo de la palabra gigante. */
  lead?: string | null;
  primario?: { label: string; href: string };
  secundario?: { label: string; href: string };
}) {
  return (
    <section className="od-cierre" aria-labelledby="od-cierre-titulo">
      <h2 id="od-cierre-titulo" className="od-cierre__pregunta">
        {pregunta}
        <span className="sr-only"> {palabra.toLowerCase()}.</span>
      </h2>
      <p className="od-cierre__gigante" aria-hidden style={{ "--len": palabra.length } as CSSProperties}>
        <span className="od-cierre__par">(</span>
        <Revuelta palabra={palabra} />
        <span className="od-cierre__par">)</span>
      </p>
      {lead ? <p className="od-cierre__lead">{lead}</p> : null}
      <div className="od-cierre__botones">
        <Link href={primario.href} className="od-boton od-boton--cian">
          {primario.label} <Flecha />
        </Link>
        {secundario ? (
          <Link href={secundario.href} className="od-boton od-boton--linea-d">
            {secundario.label}
          </Link>
        ) : null}
        <a href={wa("Hola, quiero hablar de un proyecto con Onvision Digital.")} target="_blank" rel="noopener noreferrer" className="od-boton od-boton--linea-d">
          <IconoWhatsApp className="h-4 w-4" /> WhatsApp
        </a>
      </div>
      <a href={`mailto:${site.email}`} className="od-cierre__correo">
        {site.email}
      </a>
    </section>
  );
}
