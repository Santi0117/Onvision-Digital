"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { visionStore } from "../vision/store";
import Puntos from "./Puntos";
import "./lo-que-hacemos.css";

/** Las piezas de Onvision, con su figura de puntos (en el mismo orden). */
const PIEZAS = [
  {
    n: "01",
    nombre: "Páginas web",
    grande: "Páginas web",
    texto: "Sitios y tiendas diseñados desde cero: rápidos, claros y listos para vender desde el celular.",
    log: "diseñamos tu sitio desde cero, sin plantillas",
  },
  {
    n: "02",
    nombre: "Onvi, tu asistente con IA",
    grande: "Onvi",
    texto: "Atiende a tus clientes por chat las 24 horas, agenda citas y te pasa los contactos listos.",
    log: "Onvi responde por vos, de día y de noche",
  },
  {
    n: "03",
    nombre: "Software a medida",
    grande: "Software",
    texto: "Paneles, sistemas y automatizaciones que ordenan ventas, inventario, reportes y clientes.",
    log: "tu operación entera en un solo sistema",
  },
  {
    n: "04",
    nombre: "Componentes personalizados",
    grande: "Componentes",
    texto: "Calculadoras, cotizadores y reservas para que el cliente decida sin tener que llamarte.",
    log: "piezas hechas solo para tu negocio",
  },
  {
    n: "05",
    nombre: "Tu marca desde cero",
    grande: "Tu marca",
    texto: "Logo, colores, tipografía y tu presencia en Google e Instagram, todo conectado.",
    log: "una marca que se reconoce a la primera",
  },
  {
    n: "06",
    nombre: "Panel Onvi",
    grande: "Panel Onvi",
    texto: "Reservas, formularios, analítica y soporte en un solo lugar. Viene con todos los planes.",
    log: "todo tu negocio en un panel, incluido",
  },
] as const;

function Cabeza({ className }: { className: string }) {
  return (
    <div className={className}>
      <p className="lq__ante">(03) Lo que hacemos</p>
      <h2 className="lq__h2">
        Seis piezas.
        <span>Una sola marca.</span>
      </h2>
    </div>
  );
}

/**
 * "Lo que hacemos", como "At the machine" de jeffmilanes: a la izquierda,
 * fija, la figura de puntos de la pieza que se lee (en los colores de
 * Onvision) con el título y la bitácora que suma una línea por pieza; a la
 * derecha, las seis piezas pasan con el scroll y la de la línea de lectura
 * se enciende. La sección se anota en la escena 3D: la laptop se apaga
 * mientras esta entra.
 */
export default function LoQueHacemos() {
  const seccion = useRef<HTMLElement>(null);
  const pasos = useRef<(HTMLLIElement | null)[]>([]);
  const [activa, setActiva] = useState(0);

  useLayoutEffect(() => {
    const el = seccion.current;
    if (!el) return;
    visionStore.featuresEl = el;
    visionStore.featureCount = 1;
    return () => {
      if (visionStore.featuresEl === el) visionStore.featuresEl = null;
    };
  }, []);

  // La pieza activa es la que cruza la línea de lectura: a media pantalla, o
  // más abajo en el celular (arriba queda fija la figura).
  useEffect(() => {
    const angosta = window.matchMedia("(max-width: 1023px)");
    let raf = 0;
    const leer = () => {
      raf = 0;
      const linea = window.innerHeight * (angosta.matches ? 0.7 : 0.52);
      let mejor = 0;
      let distancia = Infinity;
      pasos.current.forEach((paso, i) => {
        if (!paso) return;
        const r = paso.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - linea);
        if (d < distancia) {
          distancia = d;
          mejor = i;
        }
      });
      setActiva((a) => (a === mejor ? a : mejor));
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(leer);
    };
    leer();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, []);

  return (
    <section id="lo-que-hacemos" ref={seccion} className="lq" data-tema="oscuro" aria-label="Lo que hacemos: seis piezas, una sola marca">
      {/* En el celular el título va primero y después queda fija la figura. */}
      <Cabeza className="lq__cabeza lq__cabeza--movil" />
      <div className="lq__izq">
        <div className="lq__lienzo">
          <span className="lq__luz" aria-hidden />
          <Puntos forma={activa} className="lq__puntos" />
          <p className="lq__contador" aria-hidden>
            <b>{PIEZAS[activa]!.n}</b> / 06
          </p>
        </div>
        <div className="lq__pie">
          <Cabeza className="lq__cabeza" />
          <ol className="lq__log" aria-hidden>
            {PIEZAS.slice(0, activa + 1).map((p) => (
              <li key={p.n}>{p.log}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="lq__der">
        <ol className="lq__pasos">
          {PIEZAS.map((p, i) => (
            <li
              key={p.n}
              ref={(el) => {
                pasos.current[i] = el;
              }}
              className="lq__paso"
              data-on={i === activa ? "true" : i < activa ? "visto" : "false"}
            >
              <p className="lq__n">
                {p.n} <span>· {p.nombre}</span>
              </p>
              <h3 className="lq__grande">{p.grande}</h3>
              <p className="lq__texto">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
