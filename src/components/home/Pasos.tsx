"use client";

import { useEffect, useRef } from "react";
import "./pasos.css";

/**
 * Los textos son los del documento de Daniel. Donde él dejó un dato por
 * confirmar (cuánto dura la reunión, si es gratis, si se muestra el diseño
 * antes de construir, los días exactos), va solo lo que el sitio ya dice: las
 * páginas tardan una semana en promedio (preguntas frecuentes de Servicios).
 */
const PASOS = [
  {
    titulo: "Reunión",
    texto: "Nos cuentas de tu negocio y qué necesitas vender.",
    icono: "M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM9 14.5l2 2 4-4",
  },
  {
    titulo: "Propuesta y diseño",
    texto: "Armamos la propuesta y el diseño a la medida de tu marca.",
    icono: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4",
  },
  {
    titulo: "Construcción",
    texto: "Páginas en una semana en promedio; tiendas y software, según el proyecto.",
    icono: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  },
  {
    titulo: "En línea y con soporte",
    texto: "Lanzamos, te enseñamos a usar el Panel Onvi y seguimos contigo cada mes.",
    icono: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  },
] as const;

/**
 * Cómo trabajamos: los 4 pasos de la reunión a la web en línea, en una línea
 * que se llena al verla. Va justo antes de "Cuéntanos tu idea", para que nadie
 * tenga que preguntar "¿y esto cómo funciona?".
 */
export default function Pasos() {
  const raiz = useRef<HTMLElement>(null);

  // La línea se llena cuando se ve. Sin JavaScript, ya está llena.
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    el.setAttribute("data-listo", "");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.setAttribute("data-visto", "");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={raiz} id="como-trabajamos" className="op" aria-labelledby="op-titulo">
      <div className="op-cabeza">
        <p className="oh-eyebrow">Cómo trabajamos</p>
        <h2 id="op-titulo" className="op-titulo">
          De la reunión a tu web en línea, <em>en 4 pasos.</em>
        </h2>
      </div>

      <ol className="op-pasos">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="op-paso" style={{ "--i": i } as React.CSSProperties}>
            <span className="op-paso__marca" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d={p.icono} />
              </svg>
              <b>{String(i + 1).padStart(2, "0")}</b>
            </span>
            <h3 className="op-paso__titulo">{p.titulo}</h3>
            <p className="op-paso__texto">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
