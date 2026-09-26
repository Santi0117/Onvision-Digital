"use client";

import { useEffect, useRef, useState } from "react";
import { smoothstep, visionStore } from "./store";

const TICKS = 72;
const W = 1000;
const H = 100;

/** Marcas tipo pestaña: altura ondulada, con una larga cada 8. */
const TICK_LIST = Array.from({ length: TICKS }, (_, i) => {
  const x = (i / (TICKS - 1)) * W;
  const wave = 0.5 + 0.5 * Math.sin((i / (TICKS - 1)) * Math.PI * 3.2);
  const h = i % 8 === 0 ? 34 : 12 + wave * 12;
  return { x: x.toFixed(2), y1: (H / 2 - h).toFixed(2), y2: (H / 2 + h).toFixed(2) };
});

export type Escena = { id: string; nombre: string };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * La línea de avance de la preview oficial, fija abajo a la derecha, con el
 * contador de escenas de jeffmilanes: "05 · SERVICIOS ||||||||| 042%". La
 * escena es la sección que cruza el medio de la pantalla. El contador abre
 * el índice de la página (los "(01)" de hobro) para saltar a cualquier escena.
 */
export default function Linea({ escenas, alIr }: { escenas: readonly Escena[]; alIr: (id: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const cursorRef = useRef<SVGLineElement>(null);
  const glowRef = useRef<SVGLineElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const [actual, setActual] = useState(0);
  const [abierto, setAbierto] = useState(false);

  // La escena en pantalla: la última que ya pasó el medio de la pantalla.
  // Por posición (no por intersección) para que un salto largo, con el
  // índice o un enlace, también la actualice.
  useEffect(() => {
    let tops: number[] = [];
    let raf = 0;
    const medir = () => {
      tops = escenas.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
    };
    const ubicar = () => {
      raf = 0;
      const medio = window.scrollY + window.innerHeight / 2;
      let k = 0;
      for (let i = 0; i < tops.length; i++) if (tops[i]! <= medio) k = i;
      setActual(k);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(ubicar);
    };
    const alCambiar = () => {
      medir();
      pedir();
    };
    const ro = new ResizeObserver(alCambiar);
    ro.observe(document.body);
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", alCambiar);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", alCambiar);
    };
  }, [escenas]);

  // El avance de toda la página, cuadro a cuadro desde la escena 3D.
  useEffect(() => {
    let lastPct = "";
    let lastOn = "";
    return visionStore.subscribe((frame) => {
      const root = rootRef.current;
      if (!root) return;
      const p = frame.page;
      root.style.opacity = smoothstep(0.004, 0.03, p).toFixed(3);
      // Arriba del todo no se ve: tampoco se puede tocar.
      const on = p > 0.006 ? "1" : "0";
      if (on !== lastOn) {
        root.dataset.on = on;
        lastOn = on;
        if (on === "0") setAbierto(false);
      }
      const x = (p * W).toFixed(2);
      clipRef.current?.setAttribute("width", x);
      cursorRef.current?.setAttribute("x1", x);
      cursorRef.current?.setAttribute("x2", x);
      glowRef.current?.setAttribute("x1", x);
      glowRef.current?.setAttribute("x2", x);
      const pct = String(Math.round(p * 100)).padStart(3, "0");
      if (pct !== lastPct && pctRef.current) {
        pctRef.current.textContent = pct;
        lastPct = pct;
      }
    });
  }, []);

  // El índice se cierra con Escape o tocando afuera.
  useEffect(() => {
    if (!abierto) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const alTocar = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    window.addEventListener("keydown", alTecla);
    document.addEventListener("pointerdown", alTocar);
    return () => {
      window.removeEventListener("keydown", alTecla);
      document.removeEventListener("pointerdown", alTocar);
    };
  }, [abierto]);

  const escena = escenas[actual];

  return (
    <div ref={rootRef} className="vision-line" data-on="0" data-abierto={abierto || undefined}>
      {abierto ? (
        <nav id="vision-line-indice" className="vision-line__indice" aria-label="Escenas de la página">
          <p className="vision-line__indice-titulo" aria-hidden>
            Índice <span>{pad(escenas.length)} escenas</span>
          </p>
          <ol>
            {escenas.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  aria-current={i === actual ? "location" : undefined}
                  onClick={() => {
                    setAbierto(false);
                    alIr(e.id);
                  }}
                >
                  <span aria-hidden>({pad(i + 1)})</span>
                  {e.nombre}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <button
        type="button"
        className="vision-line__stage"
        aria-expanded={abierto}
        aria-controls={abierto ? "vision-line-indice" : undefined}
        onClick={() => setAbierto((v) => !v)}
      >
        <b>{pad(actual + 1)}</b> <span>{escena?.nombre}</span>
        <span className="sr-only"> · índice de la página</span>
        <svg className="vision-line__caret" viewBox="0 0 10 6" aria-hidden>
          <path d="M1 5l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <svg className="vision-line__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <clipPath id="vlClip">
            <rect ref={clipRef} x="0" y="0" width="0" height={H} />
          </clipPath>
        </defs>
        <g className="vision-line__ticks">
          {TICK_LIST.map((t, i) => (
            <line key={i} x1={t.x} x2={t.x} y1={t.y1} y2={t.y2} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g className="vision-line__ticks is-lit" clipPath="url(#vlClip)">
          {TICK_LIST.map((t, i) => (
            <line key={i} x1={t.x} x2={t.x} y1={t.y1} y2={t.y2} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <line ref={glowRef} className="vision-line__glow" x1="0" x2="0" y1="6" y2={H - 6} vectorEffect="non-scaling-stroke" />
        <line ref={cursorRef} className="vision-line__cursor" x1="0" x2="0" y1="8" y2={H - 8} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="vision-line__pct" aria-hidden>
        <span ref={pctRef}>000</span>
        <small>%</small>
      </span>
    </div>
  );
}
