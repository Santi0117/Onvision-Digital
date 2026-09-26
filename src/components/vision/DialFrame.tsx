"use client";

import { useId, type ReactNode, type RefObject } from "react";

/**
 * Dial tipo instrumento: arcos de color por detalle en el borde, corona de
 * ticks, anillos concéntricos, bisel oscuro, arcos de progreso abajo a la
 * derecha y la pupila (disco oscuro) donde vive la demo (children).
 * Cada segmento (arco + sus ticks) es un grupo que se enciende con su peso.
 */

export const DIAL_SIZE = 640;
const C = DIAL_SIZE / 2;
export const ARC_R = 302;
export const PUPIL_R = 160;
const TICKS = 120;
const PROGRESS_R = [204, 192, 180];
const PROGRESS_A0 = (28 * Math.PI) / 180;
const PROGRESS_A1 = (82 * Math.PI) / 180;

/** Redondeo fijo: evita diferencias de punto flotante entre SSR e hidratación. */
const f = (n: number) => n.toFixed(2);
const P = (r: number, a: number) => `${f(C + Math.cos(a) * r)} ${f(C + Math.sin(a) * r)}`;
const arcPath = (r: number, a0: number, a1: number) =>
  `M ${P(r, a0)} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${P(r, a1)}`;

const TICK_LIST = Array.from({ length: TICKS }, (_, i) => {
  const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
  const r0 = i % 10 === 0 ? 262 : 270;
  const r1 = 286;
  return { x1: f(C + Math.cos(a) * r0), y1: f(C + Math.sin(a) * r0), x2: f(C + Math.cos(a) * r1), y2: f(C + Math.sin(a) * r1) };
});

/** Sector anular (brillo del cristal). */
const GLOSS = (() => {
  const a0 = -Math.PI * 0.92;
  const a1 = -Math.PI * 0.55;
  const ro = 212;
  const ri = 166;
  return `M ${P(ro, a0)} A ${ro} ${ro} 0 0 1 ${P(ro, a1)} L ${P(ri, a1)} A ${ri} ${ri} 0 0 0 ${P(ri, a0)} Z`;
})();

const PROGRESS = PROGRESS_R.map((r) => ({ d: arcPath(r, PROGRESS_A0, PROGRESS_A1), len: r * (PROGRESS_A1 - PROGRESS_A0) }));

type DialFrameProps = {
  /** Colores por segmento. */
  colors: readonly string[];
  /** Color inicial del acento (arcos de progreso, borde de pupila, brillo). */
  accent?: string;
  /** `segmentRefs.current[i]` = grupo (arco + ticks) del segmento i. */
  segmentRefs?: RefObject<(SVGGElement | null)[]>;
  /** Grupo del acento para recolorearlo sin React. */
  accentRef?: RefObject<SVGGElement | null>;
  /** `progressRefs.current[k]` = arco de progreso k (dasharray desde JS; largo en `data-len`). */
  progressRefs?: RefObject<(SVGPathElement | null)[]>;
  className?: string;
  children?: ReactNode;
};

export default function DialFrame({
  colors,
  accent = "#f8fafc",
  segmentRefs,
  accentRef,
  progressRefs,
  className = "",
  children,
}: DialFrameProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const glassId = `vdGlass-${uid}`;
  const n = Math.max(1, colors.length);
  const step = (Math.PI * 2) / n;
  const gap = 0.075;

  const segments = colors.map((color, i) => {
    const a0 = -Math.PI / 2 + i * step + gap / 2;
    const a1 = a0 + step - gap;
    const ticks = TICK_LIST.filter((_, j) => Math.floor((j * n) / TICKS) === i);
    return { color, d: arcPath(ARC_R, a0, a1), ticks };
  });

  return (
    <div className={`vision-dial ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`} className="vision-dial__svg">
        <defs>
          <radialGradient id={glassId} cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.012" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        {/* bisel exterior */}
        <circle cx={C} cy={C} r={294} className="vision-dial__bezel" />
        <circle cx={C} cy={C} r={252} className="vision-dial__ring" />
        <circle cx={C} cy={C} r={240} className="vision-dial__ring vision-dial__ring--dash" />
        <circle cx={C} cy={C} r={228} className="vision-dial__bezel vision-dial__bezel--inner" />
        <circle cx={C} cy={C} r={214} className="vision-dial__ring" />

        {/* segmentos: arco de color + sus ticks */}
        {segments.map((s, i) => (
          <g
            key={i}
            ref={(el) => {
              if (segmentRefs) segmentRefs.current[i] = el;
            }}
            className="vision-dial__seg"
            style={{ color: s.color }}
          >
            <path d={s.d} className="vision-dial__arc" />
            <g className="vision-dial__ticks">
              {s.ticks.map((t, k) => (
                <line key={k} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
              ))}
            </g>
          </g>
        ))}

        {/* pupila */}
        <circle cx={C} cy={C} r={PUPIL_R} fill="rgba(3,8,12,0.86)" />
        <circle cx={C} cy={C} r={PUPIL_R} fill={`url(#${glassId})`} />
        <path d={GLOSS} className="vision-dial__gloss" />

        {/* acento: borde de pupila + arcos de progreso */}
        <g ref={accentRef} className="vision-dial__accent" style={{ color: accent }}>
          <circle cx={C} cy={C} r={PUPIL_R + 3} className="vision-dial__pupil-ring" />
          {PROGRESS.map((p, k) => (
            <path key={k} d={p.d} className="vision-dial__progress-bg" />
          ))}
          {PROGRESS.map((p, k) => (
            <path
              key={`p${k}`}
              ref={(el) => {
                if (progressRefs) progressRefs.current[k] = el;
              }}
              d={p.d}
              data-len={f(p.len)}
              className="vision-dial__progress"
              style={{ strokeDasharray: `0 ${f(p.len)}` }}
            />
          ))}
        </g>
      </svg>
      {children}
    </div>
  );
}
