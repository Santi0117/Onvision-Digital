"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { EYE_PUPIL_R, eyeOutlinePath } from "@/lib/ojo";
import { RING_COLORS } from "./scene/laptopModel";
import { clamp01, visionStore } from "./store";

/**
 * Arranque estilo instrumento de la preview oficial (el flujo de animejs.com,
 * con el ojo Onvision): pantalla negra → los ticks se van encendiendo con la
 * carga, los arcos parpadean como neón, el ojo se dibuja y abre → todo se
 * encoge hasta el logo de la tapa mientras la laptop se enciende detrás y
 * aparece el texto.
 *
 * Una vez por visita en todo el sitio: lo decide el script del <head>
 * (`html[data-boot]`), el mismo que usa la intro de las demás páginas.
 */

/**
 * La intro ya se vio en esta visita (la de esta página o la de otra), o se
 * pidió menos movimiento: el script del <head> dejó `data-boot` en "off".
 * Con eso el CSS ni la pinta, así que no hay destello antes de hidratar.
 */
const yaVista = () => {
  const estado = document.documentElement.getAttribute("data-boot");
  return estado === "off" || estado === "done";
};

type ConLenis = { __odLenis?: { stop: () => void; start: () => void } };
const lenis = () => (window as unknown as ConLenis).__odLenis;
const BOOT_MIN_MS = 2450;
const BOOT_MAX_MS = 6500;
const EXIT_MS = 950;
const REVEAL_MS = 1500;

const VB = 400;
const C = VB / 2;
const TICKS = 120;
const EYE_HALF_W = 110;
const f = (n: number) => n.toFixed(2);

const TICK_LIST = Array.from({ length: TICKS }, (_, i) => {
  const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
  const r0 = i % 10 === 0 ? 160 : 168;
  const r1 = 182;
  return {
    x1: f(C + Math.cos(a) * r0),
    y1: f(C + Math.sin(a) * r0),
    x2: f(C + Math.cos(a) * r1),
    y2: f(C + Math.sin(a) * r1),
  };
});

const ARC_R = 193;
const ARCS = RING_COLORS.map((color, i) => {
  const n = RING_COLORS.length;
  const step = (Math.PI * 2) / n;
  const a0 = i * step - Math.PI / 2 + 0.07;
  const a1 = a0 + step - 0.14;
  return {
    color,
    d: `M ${f(C + Math.cos(a0) * ARC_R)} ${f(C + Math.sin(a0) * ARC_R)} A ${ARC_R} ${ARC_R} 0 0 1 ${f(C + Math.cos(a1) * ARC_R)} ${f(C + Math.sin(a1) * ARC_R)}`,
    delay: 0.36 + ((i * 0.37) % 1) * 0.3,
  };
});

/*
 * El ojo es el logo (eyeLogo) y se destapa con máscaras: cada trazo guía se
 * dibuja igual que antes (párpado de arriba, de abajo, remolino) y deja ver
 * su parte del logo. Coordenadas del logo × EYE_HALF_W, centradas en la pupila.
 */
const EYE = eyeOutlinePath(EYE_HALF_W, C, C);
const PUPIL_R = EYE_PUPIL_R * EYE_HALF_W;
/** Punto del logo → coordenadas del SVG. */
const at = (x: number, y: number) => `${f(C + x * EYE_HALF_W)} ${f(C + y * EYE_HALF_W)}`;

const UPPER_LID = `M ${C - EYE_HALF_W} ${C} Q ${C} ${C - 92} ${C + EYE_HALF_W} ${C}`;
const LOWER_LID = `M ${C - EYE_HALF_W} ${C} Q ${C} ${C + 92} ${C + EYE_HALF_W} ${C}`;

/** Un brazo del remolino: nace donde se corta el párpado y se enrosca hasta la pupila. El otro es el mismo girado 180°. */
const SPIRAL_START = -Math.PI * 0.42;
const SPIRAL = (() => {
  const pts: string[] = [];
  const N = 64;
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const a = SPIRAL_START + u * Math.PI * 2;
    const r = 0.3 * (1 - u);
    pts.push(at(Math.cos(a) * r, Math.sin(a) * r));
  }
  return `M ${pts.join(" L ")}`;
})();

/**
 * Zona del remolino: hasta los huecos en espiral que lo separan de los
 * párpados, más el arranque de cada brazo (desde `cut`, y cut + 180°, hasta la
 * punta de su hueco). Cada hueco: ángulo de su punta y radio a `psi` rad de
 * ella, ajustados al logo. Primero el de abajo, después el de arriba (+2π).
 */
const GAPS = [
  { tip: 2.2454, r: (psi: number) => 0.2414 + 0.0253 * (Math.exp(1.0185 * psi) - 1) },
  { tip: 5.4852, r: (psi: number) => 0.2388 + 0.0124 * (Math.exp(1.3515 * psi) - 1) },
];
function spiralZone(cut: number) {
  const pts: string[] = [];
  GAPS.forEach((gap, i) => {
    for (let k = 0; k <= 45; k++) {
      const a = cut + (i + k / 45) * Math.PI;
      const r = Math.min(0.45, gap.r(gap.tip - a));
      pts.push(at(Math.cos(a) * r, Math.sin(a) * r));
    }
  });
  return `M ${pts.join(" L ")} Z`;
}
const SPIRAL_ZONE = spiralZone(SPIRAL_START);
/** Para los párpados, el corte entra un poco en el remolino: así no queda costura. */
const LIDS_CUT = spiralZone(SPIRAL_START + 0.06);
const OUTSIDE_SPIRAL = `M -${VB} -${VB} H ${2 * VB} V ${2 * VB} H -${VB} Z ${SPIRAL_ZONE}`;

/** Donde se juntan los párpados: puntas y esquinas internas del ojo. */
const SEAM = [
  [-1.0135, -0.0338],
  [-0.7373, -0.0124],
  [0.7224, -0.0443],
  [0.9856, -0.0357],
];
/** Todo lo que queda de un lado de la costura (1 abajo, -1 arriba), corrido un poco hacia ese lado: los párpados se pisan y no queda línea. */
function beyondSeam(side: 1 | -1) {
  const lap = 0.005 * side;
  const edge = SEAM.map(([x, y]) => at(x, y + lap));
  const far = 3 * side;
  return `M ${at(-3, SEAM[0][1] + lap)} L ${edge.join(" L ")} L ${at(3, SEAM[3][1] + lap)} L ${at(3, far)} L ${at(-3, far)} Z`;
}
const BELOW_SEAM = beyondSeam(1);
const ABOVE_SEAM = beyondSeam(-1);

const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
const easeInOut = (v: number) => {
  const x = clamp01(v);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

type Phase = "boot" | "exit" | "quick" | "done";

type Props = {
  /** Cuando el texto del hero ya puede entrar. */
  onReady: () => void;
};

export default function VisionBoot({ onReady }: Props) {
  const [phase, setPhase] = useState<Phase>("boot");
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<SVGGElement>(null);
  const arcRefs = useRef<(SVGPathElement | null)[]>([]);
  const upperRef = useRef<SVGPathElement>(null);
  const lowerRef = useRef<SVGPathElement>(null);
  const spiralRefs = useRef<(SVGPathElement | null)[]>([]);
  const pupilRef = useRef<SVGGElement>(null);
  const eyeRef = useRef<SVGGElement>(null);
  const ringsRef = useRef<SVGGElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const readyRef = useRef(onReady);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = {
    upper: `vbUpper-${uid}`,
    lower: `vbLower-${uid}`,
    spiral: `vbSpiral-${uid}`,
  };

  useLayoutEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const remember = () => html.setAttribute("data-boot", "off");

    // Ya vista: la escena queda encendida y el texto entra enseguida. La capa
    // queda escondida por CSS (`html[data-boot="off"] .vision-boot--boot`).
    if (yaVista() || reduce) {
      visionStore.reveal = 1;
      remember();
      readyRef.current();
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    html.classList.add("ov-preloader-lock");
    lenis()?.stop();
    window.scrollTo(0, 0);
    visionStore.reveal = 0;

    const ticks = ticksRef.current ? Array.from(ticksRef.current.children) : [];
    const lidLen = upperRef.current?.getTotalLength() ?? 400;
    const spiralLen = spiralRefs.current[0]?.getTotalLength() ?? 400;
    const draw = (el: SVGPathElement | null, len: number, k: number) => {
      if (!el) return;
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = String(len * (1 - k));
    };

    let lit = 0;
    let exitAt = -1;
    let base: { cx: number; cy: number; w: number } | null = null;
    let readyFired = false;
    let lastLabel = "";
    const setLabel = (s: string) => {
      if (s !== lastLabel && labelRef.current) {
        labelRef.current.textContent = s;
        lastLabel = s;
      }
    };

    // DEBUG: ?boot=<ms> congela el arranque en ese instante
    const holdAt = Number(new URLSearchParams(location.search).get("boot"));
    const holdExit = Number(new URLSearchParams(location.search).get("bootExit"));
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const frame = (now: number) => {
      if (cancelled) return;
      const t = holdAt > 0 ? holdAt : now - start;

      if (exitAt < 0) {
        /* ---------- arranque ---------- */
        const u = t / BOOT_MIN_MS;
        // Hasta 92% por tiempo; el último tramo espera a que la escena 3D esté lista.
        const canFinish = visionStore.sceneReady || t > BOOT_MAX_MS;
        const prog = 0.92 * easeOut(seg(u, 0, 0.72)) + 0.08 * (canFinish ? easeOut(seg(u, 0.72, 0.9)) : 0);

        const want = Math.floor(prog * TICKS);
        while (lit < want && lit < TICKS) {
          ticks[lit]?.classList.add("is-on");
          lit++;
        }
        if (pctRef.current) pctRef.current.textContent = String(Math.round(prog * 100)).padStart(3, "0");
        setLabel(prog < 0.45 ? "CARGANDO" : prog < 0.92 ? "ARMANDO" : canFinish ? "LISTO" : "ESPERANDO");

        draw(upperRef.current, lidLen, easeOut(seg(u, 0.06, 0.42)));
        draw(lowerRef.current, lidLen, easeOut(seg(u, 0.12, 0.48)));
        const swirl = easeInOut(seg(u, 0.24, 0.6));
        spiralRefs.current.forEach((el) => draw(el, spiralLen, swirl));
        if (pupilRef.current) {
          const k = seg(u, 0.54, 0.66);
          const s = k <= 0 ? 0 : 1 + 0.35 * Math.sin(k * Math.PI) * (1 - k);
          pupilRef.current.style.transform = `scale(${(easeOut(k) * s).toFixed(3)})`;
          pupilRef.current.style.opacity = k > 0 ? "1" : "0";
        }
        ARCS.forEach((arc, i) => {
          const el = arcRefs.current[i];
          if (!el) return;
          const k = seg(u, arc.delay, arc.delay + 0.16);
          el.style.opacity = k >= 1 ? "1" : Math.floor(k * 6) % 2 === 1 ? "1" : "0.06";
        });
        // parpadeo: el ojo se cierra y abre justo antes de salir
        if (eyeRef.current) {
          const b = seg(u, 0.74, 0.88);
          const sy = b <= 0 || b >= 1 ? 1 : 1 - 0.94 * Math.sin(b * Math.PI);
          eyeRef.current.style.transform = `scaleY(${sy.toFixed(3)})`;
        }

        const done = canFinish && t >= BOOT_MIN_MS;
        if (done) {
          exitAt = now;
          // medir antes de transformar: el rect cambia con el scale
          const r = stageRef.current?.getBoundingClientRect();
          if (r) base = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width };
          remember();
          html.classList.remove("ov-preloader-lock");
          lenis()?.start();
          setPhase("exit");
        }
      } else {
        /* ---------- salida: todo se encoge hasta el logo de la tapa ---------- */
        const since = holdExit > 0 ? holdExit : now - exitAt;
        const e = since / EXIT_MS;
        const k = easeInOut(e);
        visionStore.reveal = easeInOut(since / REVEAL_MS);
        if (!readyFired && e > 0.22) {
          readyFired = true;
          readyRef.current();
        }

        const stage = stageRef.current;
        if (stage && base) {
          const { cx, cy } = base;
          const logo = visionStore.frame.logo;
          const eyePx = (EYE_HALF_W / VB) * base.w;
          const target = logo.visible && logo.r > 2 ? logo : { x: cx, y: cy, r: eyePx * 0.1 };
          const s = 1 + (target.r / eyePx - 1) * k;
          const dx = (target.x - cx) * k;
          const dy = (target.y - cy) * k;
          stage.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
          stage.style.opacity = String(1 - seg(e, 0.84, 1));
        }
        const fade = 1 - seg(e, 0, 0.42);
        if (ticksRef.current) ticksRef.current.style.opacity = String(fade);
        if (ringsRef.current) ringsRef.current.style.opacity = String(fade);
        arcRefs.current.forEach((el) => {
          if (el) el.style.opacity = String(fade);
        });
        if (metaRef.current) metaRef.current.style.opacity = String(1 - seg(e, 0, 0.3));
        root.style.backgroundColor = `rgb(0 0 0 / ${(1 - easeInOut(seg(e, 0.05, 0.75))).toFixed(3)})`;

        if (since >= REVEAL_MS) {
          visionStore.reveal = 1;
          setPhase("done");
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      html.classList.remove("ov-preloader-lock");
      lenis()?.start();
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      className={`vision-boot vision-boot--${phase}`}
      aria-hidden
      role="presentation"
      suppressHydrationWarning
    >
      {phase !== "quick" ? (
        <>
          <div ref={stageRef} className="vision-boot__stage">
            <svg viewBox={`0 0 ${VB} ${VB}`} className="vision-boot__svg">
              <g ref={ticksRef} className="vision-boot__ticks">
                {TICK_LIST.map((tk, i) => (
                  <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2} />
                ))}
              </g>
              <g className="vision-boot__arcs">
                {ARCS.map((arc, i) => (
                  <path
                    key={i}
                    ref={(el) => {
                      arcRefs.current[i] = el;
                    }}
                    d={arc.d}
                    stroke={arc.color}
                    style={{ opacity: 0, color: arc.color }}
                  />
                ))}
              </g>
              <g ref={ringsRef} className="vision-boot__rings">
                <circle cx={C} cy={C} r={150} strokeDasharray="2 7" />
                <circle cx={C} cy={C} r={140} />
                <circle cx={C} cy={C} r={128} className="is-thick" />
              </g>
              <defs>
                <mask id={ids.upper} maskUnits="userSpaceOnUse" x={0} y={0} width={VB} height={VB}>
                  <path ref={upperRef} d={UPPER_LID} className="vision-boot__lid" style={{ strokeDasharray: "1 9999", strokeDashoffset: 1 }} />
                  <path d={BELOW_SEAM} className="vision-boot__cut" />
                  <path d={LIDS_CUT} className="vision-boot__cut" />
                </mask>
                <mask id={ids.lower} maskUnits="userSpaceOnUse" x={0} y={0} width={VB} height={VB}>
                  <path ref={lowerRef} d={LOWER_LID} className="vision-boot__lid" style={{ strokeDasharray: "1 9999", strokeDashoffset: 1 }} />
                  <path d={ABOVE_SEAM} className="vision-boot__cut" />
                  <path d={LIDS_CUT} className="vision-boot__cut" />
                </mask>
                <mask id={ids.spiral} maskUnits="userSpaceOnUse" x={0} y={0} width={VB} height={VB}>
                  {[0, 180].map((deg, i) => (
                    <path
                      key={deg}
                      ref={(el) => {
                        spiralRefs.current[i] = el;
                      }}
                      d={SPIRAL}
                      transform={`rotate(${deg} ${C} ${C})`}
                      className="vision-boot__spiral"
                      style={{ strokeDasharray: "1 9999", strokeDashoffset: 1 }}
                    />
                  ))}
                  <path d={OUTSIDE_SPIRAL} fillRule="evenodd" className="vision-boot__cut" />
                </mask>
              </defs>
              <g ref={eyeRef} className="vision-boot__eye">
                <path d={EYE} mask={`url(#${ids.upper})`} />
                <path d={EYE} mask={`url(#${ids.lower})`} />
                <path d={EYE} mask={`url(#${ids.spiral})`} />
                <g ref={pupilRef} className="vision-boot__pupil" style={{ opacity: 0, transform: "scale(0)" }}>
                  <circle cx={C} cy={C} r={PUPIL_R} />
                </g>
              </g>
            </svg>
          </div>
          <div ref={metaRef} className="vision-boot__meta">
            <span className="vision-boot__mark">
              onvision<b>.</b>digital
            </span>
            <span className="vision-boot__status">
              <span ref={labelRef}>CARGANDO</span>
              <span className="vision-boot__pct">
                <span ref={pctRef}>000</span>%
              </span>
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
