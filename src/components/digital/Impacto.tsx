"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { digitalImpact } from "@/lib/digital";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Cuenta hasta la cifra (con su prefijo y sufijo) cuando se ve. */
function Cifra({ valor }: { valor: string }) {
  const m = valor.match(/^([^\d]*)([\d.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);
  const meta = m ? Number(m[2]) : 0;
  const decimales = m?.[2]?.includes(".") ? 1 : 0;

  useEffect(() => {
    if (!visto || !m) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setN(meta), 0);
      return () => window.clearTimeout(t);
    }
    let raf = 0;
    const t0 = performance.now();
    const cuadro = (ahora: number) => {
      const p = Math.min(1, (ahora - t0) / 1400);
      setN(meta * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, [visto, meta, m]);

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

function puntos(valores: readonly number[]) {
  return valores.map((v, i) => [(i / (valores.length - 1)) * W, H - (v / MAX) * H] as const);
}

function Lineas() {
  const d = digitalImpact.web;
  const series = [
    { ...d.sales, clase: "a" },
    { ...d.comms, clase: "b" },
  ];
  return (
    <svg viewBox={`-8 -10 ${W + 16} ${H + 34}`} className="od-imp__grafico" role="img" aria-label={`${d.title}: ${d.sales.label} y ${d.comms.label} de ${d.labels[0]} a ${d.labels[d.labels.length - 1]}`}>
      {[0, 0.5, 1].map((f) => (
        <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} className="od-imp__guia" />
      ))}
      {series.map((s) => {
        const p = puntos(s.values);
        const linea = p.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
        return (
          <g key={s.label} className={`od-imp__serie od-imp__serie--${s.clase}`}>
            <path d={`${linea} L ${W} ${H} L 0 ${H} Z`} className="od-imp__area" />
            <motion.path
              d={linea}
              className="od-imp__linea"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.6, ease: EASE }}
            />
            {p.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i === p.length - 1 ? 4 : 2.2} className="od-imp__punto" />
            ))}
          </g>
        );
      })}
      {d.labels.map((l, i) => (
        <text key={l} x={(i / (d.labels.length - 1)) * W} y={H + 22} className="od-imp__eje">
          {l}
        </text>
      ))}
    </svg>
  );
}

function Barras() {
  const d = digitalImpact.software;
  const ancho = W / d.values.length;
  return (
    <svg viewBox={`-8 -10 ${W + 16} ${H + 34}`} className="od-imp__grafico" role="img" aria-label={`${d.title}: ${d.seriesLabel} contra ${d.baselineLabel}`}>
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
            <motion.rect
              x={x + ancho * 0.32}
              width={ancho * 0.26}
              rx={3}
              className="od-imp__barra"
              initial={{ height: 0, y: H }}
              whileInView={{ height: hVal, y: H - hVal }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.1, ease: EASE, delay: i * 0.08 }}
            />
            <text x={x + ancho * 0.29} y={H + 22} className="od-imp__eje">
              {d.labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
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
