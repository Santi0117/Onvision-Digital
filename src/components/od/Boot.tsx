"use client";

import { useEffect, useRef, useState } from "react";
import { OJO_CONTORNO } from "./ui";

/** Lo que "arranca": las piezas que trae cada proyecto. */
const FILAS = ["Diseño a tu marca", "Onvi IA", "SEO y velocidad", "SINPE y tarjeta", "Hosting incluido"];

const R = 52;
const CIRCUNFERENCIA = 2 * Math.PI * R;
const DURACION = 1900;

/**
 * La intro, una vez por visita, con la estructura del arranque de
 * verticales: el ojo oficial que se dibuja con una línea, la marca
 * espaciada, las líneas en mono, el anillo de carga y la lista "INICIANDO"
 * de jeffmilanes; el botón de entrar de sibaldesign. Sale con el círculo
 * que se abre de driveberry. Con movimiento reducido o ya vista, el script
 * del <head> la apaga; sin JavaScript, se va sola por CSS.
 */
export default function Boot() {
  const [estado, setEstado] = useState<"cargando" | "saliendo" | "fuera">("cargando");
  const pct = useRef<HTMLSpanElement>(null);
  const anillo = useRef<SVGCircleElement>(null);
  const año = new Date().getFullYear();

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-boot") === "off") return;

    let raf = 0;
    const t0 = performance.now();
    const cuadro = (ahora: number) => {
      const t = Math.min(1, (ahora - t0) / DURACION);
      const e = 1 - Math.pow(1 - t, 3);
      if (pct.current) pct.current.textContent = String(Math.round(e * 100)).padStart(2, "0");
      if (anillo.current) anillo.current.style.strokeDashoffset = String(CIRCUNFERENCIA * (1 - e));
      if (t < 1) raf = requestAnimationFrame(cuadro);
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

  const entrar = () => {
    document.documentElement.setAttribute("data-boot", "done");
    setEstado("saliendo");
  };

  return (
    <div className="od-boot" data-estado={estado} aria-hidden>
      <div className="od-boot__in">
        <div className="od-boot__marca">
          <svg viewBox="0 0 100 56" className="od-boot__ojo">
            <path d={OJO_CONTORNO} pathLength={1} className="od-boot__trazo" />
            <path d={OJO_CONTORNO} className="od-boot__relleno" />
            <circle cx="50" cy="28" r="7.1" className="od-boot__pupila" />
          </svg>
          <div>
            <p className="od-boot__nombre">
              ONVISION<span>.</span>
            </p>
            <p className="od-boot__sub">
              {"DIGITAL".split("").map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </p>
          </div>
        </div>

        <ol className="od-boot__lineas">
          <li>ONVISION DIGITAL · PRESENTA</li>
          <li>COSTA RICA [DIGITAL / {año}]</li>
          <li>
            SITIOS · TIENDAS · SOFTWARE · APPS <b>◤</b>
          </li>
        </ol>

        <button type="button" tabIndex={-1} className="od-boot__entrar" onClick={entrar}>
          <span className="od-boot__regla" />
          <span className="od-boot__barras">
            <i />
            <i />
            <i />
          </span>
          ENTRAR A ONVISION
        </button>
      </div>

      <div className="od-boot__carga">
        <div className="od-boot__anillo">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={R} className="od-boot__pista" />
            <circle
              ref={anillo}
              cx="60"
              cy="60"
              r={R}
              className="od-boot__lleno"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={CIRCUNFERENCIA}
            />
          </svg>
          <p>
            <span ref={pct}>00</span>
            <small>%</small>
          </p>
        </div>
        <p className="od-boot__titulo">OD.CARGANDO.SITIO</p>
      </div>

      <div className="od-boot__lista">
        <p className="od-boot__iniciando">INICIANDO</p>
        <ul>
          {FILAS.map((f, i) => (
            <li key={f} style={{ animationDelay: `${0.2 + i * 0.26}s` }}>
              <span>{f}</span>
              <i />
              <b>LISTO</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
