"use client";

import { useEffect, useId, useRef } from "react";
import { webModules } from "@/lib/web";
import { Check } from "./ui";

/** Antes: lo que el mercado le cobra a un negocio (del manifiesto y los precios oficiales). */
const ANTES = [
  "páginas genéricas",
  "pagar de más",
  "agencia típica $2.500+",
  "plantilla + extras",
  "quedarse sin sistema",
  "freelance premium $1.200+",
];

/** Después: las piezas de tu sitio, como las nombra /web. */
const DESPUES = webModules.map((m) =>
  m.label
    .replace("onvi", "Onvi")
    .replace(/^\p{L}/u, (c) => c.toUpperCase()),
);

type Trazo = {
  ancho: number;
  alto: number;
  d: string;
  cap: { x: number; y: number; angulo: number; w: number; h: number };
  letra: number;
  banda: number;
  velocidad: number;
};

/** El punto de la cápsula es un extremo de tramo: así su ángulo sale exacto. */
const TRAZOS: Record<"ancho" | "angosto", Trazo> = {
  ancho: {
    ancho: 1440,
    alto: 240,
    d: "M -140 222 C 280 222, 520 192, 720 150 S 1180 44, 1580 12",
    cap: { x: 720, y: 150, angulo: -11.3, w: 132, h: 56 },
    letra: 21,
    banda: 46,
    velocidad: 0.05,
  },
  angosto: {
    ancho: 400,
    alto: 200,
    d: "M -80 186 C 60 186, 130 156, 200 124 S 330 52, 480 24",
    cap: { x: 200, y: 124, angulo: -24.6, w: 92, h: 40 },
    letra: 14,
    banda: 32,
    velocidad: 0.03,
  },
};

function Texto({ palabras, color }: { palabras: string[]; color: string }) {
  return (
    <>
      {palabras.map((p, i) => (
        <tspan key={`${p}-${i}`}>
          {p}
          {/* Espacios duros: SVG colapsa los normales. */}
          <tspan fill={color}>{"   ·   "}</tspan>
        </tspan>
      ))}
    </>
  );
}

function Variante({ nombre }: { nombre: "ancho" | "angosto" }) {
  const t = TRAZOS[nombre];
  const base = useId().replace(/[^a-zA-Z0-9]/g, "");
  const idCamino = `oh-cinta-${base}`;
  const idIzq = `oh-cinta-${base}-i`;
  const idDer = `oh-cinta-${base}-d`;
  const svgRef = useRef<SVGSVGElement>(null);
  const medidaAntes = useRef<SVGTextElement>(null);
  const medidaDespues = useRef<SVGTextElement>(null);
  const antesRef = useRef<SVGTextPathElement>(null);
  const despuesRef = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const mA = medidaAntes.current;
    const mD = medidaDespues.current;
    const a = antesRef.current;
    const d = despuesRef.current;
    if (!svg || !mA || !mD || !a || !d) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cicloA = 0;
    let cicloD = 0;
    let raf = 0;
    let visible = true;
    let recorrido = 0;
    let ultimo = performance.now();

    const cuadro = (ahora: number) => {
      const dt = Math.min(ahora - ultimo, 50);
      ultimo = ahora;
      // Escondida con display:none mide cero; se reintenta en cada cuadro.
      if (!cicloA) cicloA = mA.getComputedTextLength();
      if (!cicloD) cicloD = mD.getComputedTextLength();
      recorrido += dt * t.velocidad;
      if (cicloA) a.setAttribute("startOffset", String((recorrido % cicloA) - cicloA));
      if (cicloD) d.setAttribute("startOffset", String((recorrido % cicloD) - cicloD));
      raf = visible && !document.hidden ? requestAnimationFrame(cuadro) : 0;
    };
    const arrancar = () => {
      if (raf || !visible || document.hidden) return;
      ultimo = performance.now();
      raf = requestAnimationFrame(cuadro);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      arrancar();
    });
    io.observe(svg);
    document.addEventListener("visibilitychange", arrancar);
    arrancar();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", arrancar);
    };
  }, [t.velocidad]);

  const { cap } = t;

  return (
    <div className={`oh-cinta oh-cinta--${nombre}`}>
      <svg ref={svgRef} viewBox={`0 0 ${t.ancho} ${t.alto}`} aria-hidden focusable="false">
        <defs>
          <path id={idCamino} d={t.d} />
          <clipPath id={idIzq}>
            <rect x={-200} y={-200} width={cap.x + 200} height={t.alto + 400} />
          </clipPath>
          <clipPath id={idDer}>
            <rect x={cap.x} y={-200} width={t.ancho + 400} height={t.alto + 400} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${idIzq})`}>
          <text fontSize={t.letra} fill="#8a94a2" dy="0.35em" className="oh-cinta__texto">
            <textPath ref={antesRef} href={`#${idCamino}`}>
              <Texto palabras={[...ANTES, ...ANTES, ...ANTES]} color="#b8c0ca" />
            </textPath>
          </text>
        </g>

        <g clipPath={`url(#${idDer})`}>
          <use href={`#${idCamino}`} fill="none" stroke="#0a0d12" strokeWidth={t.banda} strokeLinecap="round" />
          <text fontSize={t.letra} fill="#f3f7fa" dy="0.35em" className="oh-cinta__texto oh-cinta__texto--limpio">
            <textPath ref={despuesRef} href={`#${idCamino}`}>
              <Texto palabras={[...DESPUES, ...DESPUES, ...DESPUES, ...DESPUES]} color="#34d3ee" />
            </textPath>
          </text>
        </g>

        <g transform={`translate(${cap.x} ${cap.y}) rotate(${cap.angulo})`}>
          <rect
            x={-cap.w / 2}
            y={-cap.h / 2}
            width={cap.w}
            height={cap.h}
            rx={cap.h / 2}
            fill="#f3f7fa"
            stroke="#0a0d12"
            strokeWidth={2.5}
          />
          {Array.from({ length: 13 }, (_, i) => {
            const paso = (cap.w - cap.h * 0.9) / 12;
            const x = -cap.w / 2 + cap.h * 0.45 + i * paso;
            const alto = cap.h * (0.18 + 0.42 * Math.abs(Math.sin(i * 1.7)));
            return (
              <rect
                key={i}
                x={x - 1.4}
                y={-alto / 2}
                width={2.8}
                height={alto}
                rx={1.4}
                fill="#0a0d12"
                className="oh-cinta__barra"
                style={{ animationDelay: `${(i % 6) * -0.14}s` }}
              />
            );
          })}
        </g>

        {/* Una sola vuelta de cada texto, fuera de vista, para medir el ciclo. */}
        <text ref={medidaAntes} fontSize={t.letra} x={-99999} y={-99999} className="oh-cinta__texto">
          <Texto palabras={ANTES} color="transparent" />
        </text>
        <text ref={medidaDespues} fontSize={t.letra} x={-99999} y={-99999} className="oh-cinta__texto oh-cinta__texto--limpio">
          <Texto palabras={DESPUES} color="transparent" />
        </text>
      </svg>

      <p
        className="oh-cinta__chip"
        style={{ left: `${(cap.x / t.ancho) * 100}%`, top: `${((cap.y - cap.h * 1.25) / t.alto) * 100}%` }}
      >
        <Check className="h-3.5 w-3.5" />
        Onvi incluida
      </p>
    </div>
  );
}

/** La cinta de wisprflow: lo que cobra el mercado entra a la cápsula y sale tu sitio, pieza por pieza. */
export default function Cinta() {
  return (
    <div className="oh-cinta-wrap" aria-hidden>
      <div className="hidden md:block">
        <Variante nombre="ancho" />
      </div>
      <div className="md:hidden">
        <Variante nombre="angosto" />
      </div>
    </div>
  );
}
