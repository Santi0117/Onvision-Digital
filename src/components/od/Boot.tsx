"use client";

import { useEffect, useRef, useState } from "react";
import { OJO_CONTORNO } from "./ui";

const DURACION = 1900;
const ETAPAS = ["CARGANDO", "ARMANDO", "LISTO"] as const;

/**
 * La intro, una vez por visita:
 * - el ojo oficial se dibuja con una línea (como la intro de hoy),
 * - la barra blanca de hobro se llena con "CARGANDO…",
 * - el porcentaje de driveberry abajo,
 * - y sale con el círculo que se abre de driveberry.
 * Con movimiento reducido o ya vista, el script del <head> la apaga.
 */
export default function Boot() {
  const [estado, setEstado] = useState<"cargando" | "saliendo" | "fuera">("cargando");
  const pct = useRef<HTMLSpanElement>(null);
  const barra = useRef<HTMLSpanElement>(null);
  const etapa = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-boot") === "off") return;

    let raf = 0;
    const t0 = performance.now();
    const cuadro = (ahora: number) => {
      const p = Math.min(1, (ahora - t0) / DURACION);
      // Rápido al principio, se detiene un momento antes de terminar.
      const e = p < 0.7 ? (p / 0.7) * 0.86 : 0.86 + ((p - 0.7) / 0.3) * 0.14;
      const n = Math.round(e * 100);
      if (pct.current) pct.current.textContent = String(n).padStart(2, "0");
      if (barra.current) barra.current.style.transform = `scaleX(${e})`;
      if (etapa.current) etapa.current.textContent = ETAPAS[n < 45 ? 0 : n < 96 ? 1 : 2];
      if (p < 1) raf = requestAnimationFrame(cuadro);
      else {
        html.setAttribute("data-boot", "done");
        setEstado("saliendo");
      }
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (estado !== "saliendo") return;
    const t = window.setTimeout(() => {
      document.documentElement.setAttribute("data-boot", "off");
      setEstado("fuera");
    }, 1100);
    return () => window.clearTimeout(t);
  }, [estado]);

  if (estado === "fuera") return null;

  return (
    <div className="od-boot" data-estado={estado} aria-hidden>
      <div className="od-boot__arriba">
        <span>ONVISION DIGITAL</span>
        <span>SITIOS · TIENDAS · SOFTWARE · APPS</span>
        <span>COSTA RICA</span>
      </div>

      <div className="od-boot__centro">
        <svg viewBox="0 0 100 56" className="od-boot__ojo">
          <path d={OJO_CONTORNO} pathLength={1} className="od-boot__trazo" />
          <path d={OJO_CONTORNO} className="od-boot__relleno" />
          <circle cx="50" cy="28" r="7.1" className="od-boot__pupila" />
        </svg>
        <p className="od-boot__marca">
          onvision<span>.</span>
        </p>
      </div>

      <div className="od-boot__carga">
        <p className="od-boot__etiqueta">
          <span ref={etapa}>CARGANDO</span>…
        </p>
        <span className="od-boot__pista">
          <span ref={barra} className="od-boot__barra" />
        </span>
      </div>

      <p className="od-boot__pct">
        <span ref={pct}>00</span>%
      </p>
    </div>
  );
}
