"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { digitalImpact } from "@/lib/digital";

/** Cuenta hasta la cifra (con su prefijo y sufijo) cuando se ve. */
function Cifra({ valor }: { valor: string }) {
  const m = valor.match(/^([^\d]*)([\d.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);
  const valido = m !== null;
  const meta = m ? Number(m[2]) : 0;
  const decimales = m?.[2]?.includes(".") ? 1 : 0;

  // Sólo valores simples en las dependencias: el arreglo del match es nuevo
  // en cada render y reiniciaba la cuenta en cada cuadro (se quedaba en +2%).
  useEffect(() => {
    if (!visto || !valido) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setN(meta), 0);
      return () => window.clearTimeout(t);
    }
    let raf = 0;
    const t0 = performance.now();
    const cuadro = (ahora: number) => {
      const p = Math.min(1, Math.max(0, (ahora - t0) / 1400));
      setN(meta * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, [visto, meta, valido]);

  if (!m) return <span>{valor}</span>;
  return (
    <span ref={ref} aria-label={valor}>
      <span aria-hidden>
        {m[1]}
        {n.toFixed(decimales)}
        {m[3]}
      </span>
    </span>
  );
}

const W = 320;
const H = 150;
const MAX = 70;

const CAJA = `-8 -10 ${W + 16} ${H + 34}`;

function puntos(valores: readonly number[]) {
  return valores.map((v, i) => [(i / (valores.length - 1)) * W, H - (v / MAX) * H] as const);
}

/**
 * Arranca una vez, cuando se ve la mitad del gráfico. Se observa el div que
 * lo envuelve: Safari no avisa cuando entran en pantalla los trazos del SVG,
 * y así las barras y las líneas se quedaban sin aparecer.
 */
function useVisto() {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.5 });
  return [ref, visto ? "true" : "false"] as const;
}

/** Las dos líneas entran de izquierda a derecha, sobre la grilla y los meses. */
function Lineas() {
  const d = digitalImpact.web;
  const [ref, visto] = useVisto();
  const series = [
    { ...d.sales, clase: "a" },
    { ...d.comms, clase: "b" },
  ];
  return (
    <div ref={ref} className="od-imp__lienzo" data-visto={visto}>
      <svg viewBox={CAJA} className="od-imp__grafico" role="img" aria-label={`${d.title}: ${d.sales.label} y ${d.comms.label} de ${d.labels[0]} a ${d.labels[d.labels.length - 1]}`}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} className="od-imp__guia" />
        ))}
        {d.labels.map((l, i) => (
          <text key={l} x={(i / (d.labels.length - 1)) * W} y={H + 22} className="od-imp__eje">
            {l}
          </text>
        ))}
      </svg>
      <div className="od-imp__datos" aria-hidden>
        <svg viewBox={CAJA} className="od-imp__grafico">
          {series.map((s) => {
            const p = puntos(s.values);
            const linea = p.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
            return (
              <g key={s.label} className={`od-imp__serie od-imp__serie--${s.clase}`}>
                <path d={`${linea} L ${W} ${H} L 0 ${H} Z`} className="od-imp__area" />
                <path d={linea} className="od-imp__linea" />
                {p.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={i === p.length - 1 ? 4 : 2.2} className="od-imp__punto" />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/** Las barras "con software" crecen desde el piso, una tras otra. */
function Barras() {
  const d = digitalImpact.software;
  const [ref, visto] = useVisto();
  const ancho = W / d.values.length;
  return (
    <div ref={ref} className="od-imp__lienzo" data-visto={visto}>
      <svg viewBox={CAJA} className="od-imp__grafico" role="img" aria-label={`${d.title}: ${d.seriesLabel} contra ${d.baselineLabel}`}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} className="od-imp__guia" />
        ))}
        {d.values.map((v, i) => {
          const x = i * ancho + ancho * 0.2;
          const hBase = (d.baseline[i]! / MAX) * H;
          const hVal = (v / MAX) * H;
          return (
            <g key={i}>
              <rect x={x} y={H - hBase} width={ancho * 0.26} height={hBase} rx={3} className="od-imp__base" />
              <rect
                x={x + ancho * 0.32}
                y={H - hVal}
                width={ancho * 0.26}
                height={hVal}
                rx={3}
                className="od-imp__barra"
                style={{ transitionDelay: `${i * 80}ms` }}
              />
              <text x={x + ancho * 0.29} y={H + 22} className="od-imp__eje">
                {d.labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * "03 — Impacto" en negro, con las tarjetas de campo difuso de driveberry
 * y los números que cuentan: web que vende, software que acelera.
 */
export default function Impacto() {
  const w = digitalImpact.web;
  const s = digitalImpact.software;
  return (
    <section id="impacto" className="od-imp" aria-labelledby="od-imp-titulo">
      <div className="od-imp__cabeza">
        <p className="od-eyebrow">{digitalImpact.label}</p>
        <h2 id="od-imp-titulo" className="od-imp__h2">
          {digitalImpact.title.split(". ").map((t, i, a) => (
            <span key={t}>
              {t.replace(/\.$/, "")}
              {i < a.length - 1 ? "." : <span className="od-punto">.</span>}
            </span>
          ))}
        </h2>
        <p className="od-lede">{digitalImpact.lead}</p>
      </div>

      <div className="od-imp__tarjetas">
        <article className="od-imp__tarjeta">
          <p className="od-mono od-imp__rotulo">{w.eyebrow}</p>
          <h3 className="od-imp__titulo">{w.title}</h3>
          <p className="od-imp__sub">{w.subtitle}</p>
          <div className="od-imp__cifras">
            {w.metrics.map((m) => (
              <p key={m.label}>
                <b>
                  <Cifra valor={m.value} />
                </b>
                <span>{m.label}</span>
              </p>
            ))}
          </div>
          <Lineas />
          <p className="od-imp__leyenda">
            <span className="od-imp__clave od-imp__clave--a" /> {w.sales.label}
            <span className="od-imp__clave od-imp__clave--b" /> {w.comms.label}
          </p>
        </article>

        <article className="od-imp__tarjeta od-imp__tarjeta--b">
          <p className="od-mono od-imp__rotulo">{s.eyebrow}</p>
          <h3 className="od-imp__titulo">{s.title}</h3>
          <p className="od-imp__sub">{s.subtitle}</p>
          <div className="od-imp__cifras">
            <p>
              <b>
                <Cifra valor={s.metric} />
              </b>
              <span>{s.metricLabel}</span>
            </p>
          </div>
          <Barras />
          <p className="od-imp__leyenda">
            <span className="od-imp__clave od-imp__clave--a" /> {s.seriesLabel}
            <span className="od-imp__clave od-imp__clave--gris" /> {s.baselineLabel}
          </p>
        </article>
      </div>
      <p className="od-mono od-imp__nota">{digitalImpact.note}</p>
    </section>
  );
}
