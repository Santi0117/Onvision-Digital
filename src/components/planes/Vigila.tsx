"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { OJO_CONTORNO } from "../od/ui";

/**
 * Lo que Onvision cuida todos los meses. Los dos de adentro (a los lados
 * del ojo) vienen en los seis planes; los de afuera, según el plan.
 */
const ADENTRO = ["Onvi IA", "Panel Onvi"];
const AFUERA = ["Hosting", "SSL", "Respaldos", "Soporte", "Actualizaciones", "Velocidad"];

/** Una vuelta del barrido; cada cosa se enciende cuando el barrido le pasa por encima. */
const VUELTA_S = 6;

const cosas = [
  ...ADENTRO.map((nombre, i) => ({ nombre, anillo: "adentro", angulo: 90 + i * 180 })),
  ...AFUERA.map((nombre, i) => ({ nombre, anillo: "afuera", angulo: i * 60 })),
];

/**
 * "Nosotros nos encargamos del resto": el ojo de Onvision en el medio de un
 * radar que gira; lo que cuidamos cada mes se enciende cuando el barrido
 * pasa. La pupila sigue al puntero (en el celular mira sola) y el ojo
 * parpadea de vez en cuando. En el celular queda chico y sin el texto largo.
 */
export default function Vigila() {
  const ojo = useRef<SVGSVGElement>(null);

  // La pupila mira hacia el puntero, sin salirse del remolino.
  useEffect(() => {
    const el = ojo.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const mover = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 400);
      el.style.setProperty("--mx", ((dx / d) * 2.6 * k).toFixed(2));
      el.style.setProperty("--my", ((dy / d) * 1.8 * k).toFixed(2));
    };
    const alMover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(mover);
    };
    window.addEventListener("pointermove", alMover, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", alMover);
    };
  }, []);

  return (
    <section className="pl-vigila" aria-labelledby="pl-vigila-titulo">
      <div className="pl-vigila__texto">
        <p className="pl-vigila__ante">Todos los meses</p>
        <h2 id="pl-vigila-titulo" className="pl-vigila__h2">
          Nosotros nos encargamos del resto<i>.</i>
        </h2>
        <p className="pl-vigila__lede">
          Hosting, seguridad, soporte y mejoras: Onvision vigila tu sitio mientras tu negocio vende. Onvi IA y el Panel vienen en los
          seis planes; lo demás, según el plan.
        </p>
        <ul className="sr-only">
          {[...ADENTRO, ...AFUERA].map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="pl-radar" aria-hidden style={{ "--vuelta": `${VUELTA_S}s` } as CSSProperties}>
        <span className="pl-radar__aro" />
        <span className="pl-radar__aro pl-radar__aro--2" />
        <span className="pl-radar__aro pl-radar__aro--3" />
        <span className="pl-radar__barrido" />
        <ul className="pl-radar__cosas">
          {cosas.map((c) => (
            <li
              key={c.nombre}
              data-anillo={c.anillo}
              style={{ "--a": `${c.angulo}deg`, "--d": `${(c.angulo / 360) * VUELTA_S}s` } as CSSProperties}
            >
              <span>{c.nombre}</span>
            </li>
          ))}
        </ul>
        <span className="pl-radar__nucleo">
          <svg ref={ojo} viewBox="0 0 100 56" className="pl-radar__ojo">
            <g className="pl-radar__parpado">
              <path d={OJO_CONTORNO} />
              <circle className="pl-radar__pupila" cx="50" cy="28" r="7.1" />
            </g>
          </svg>
        </span>
      </div>
    </section>
  );
}
