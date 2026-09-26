"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { webFeatures } from "@/lib/web";
import { VISUALES } from "../home/Visuales";
import { scrollA } from "../home/data";
import { abrirOnvi } from "../od/OnviChat";
import { Ojo } from "../od/ui";
import DialFrame, { DIAL_SIZE, PUPIL_R } from "./DialFrame";
import { drawDemo } from "./demos";
import { smoothstep, visionStore } from "./store";

/** Nombre corto de cada detalle, para las pestañas de arriba (driveberry). */
const CORTO: Record<string, string> = {
  agenda: "Agenda",
  seo: "SEO",
  contacto: "Software",
  chatbot: "IA",
  animaciones: "Animaciones",
  tienda: "Pagos",
};

/** Tramo de scroll de cada detalle, en pantallas. */
const TRAMO = 0.8;

/** Peso 0..1 de cada detalle. Pico al entrar al slot (no a mitad), para que la demo no vaya tarde. */
function weightAt(x: number, i: number) {
  const d = Math.abs(x - i);
  return 1 - smoothstep(0.38, 0.72, d);
}

const TAU = Math.PI * 2;

/** El cian del ojo: arcos de avance, borde de la pupila y el punto del snippet. */
const ACENTO = "#34d3ee";

/** Colorea un renglón del snippet: llamadas en el color del detalle, strings cálidos, comentarios apagados. */
function tokens(line: string, color: string) {
  const out: { t: string; c?: string; k?: string }[] = [];
  const re = /(\/\/.*$)|('[^']*')|([A-Za-z_À-ÿ][\wÀ-ÿ]*)(?=\s*[(.])|(\d+)/g;
  let last = 0;
  for (const m of line.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ t: line.slice(last, idx) });
    if (m[1]) out.push({ t: m[1], k: "c" });
    else if (m[2]) out.push({ t: m[2], k: "s" });
    else if (m[3]) out.push({ t: m[3], c: color });
    else if (m[4]) out.push({ t: m[4], k: "n" });
    last = idx + m[0].length;
  }
  if (last < line.length) out.push({ t: line.slice(last) });
  return out;
}

function dotGrid(ctx: CanvasRenderingContext2D, S: number, color: string) {
  const c = S / 2;
  const r = S * 0.46;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.075;
  const stepPx = 22;
  for (let x = c % stepPx; x < S; x += stepPx) {
    for (let y = c % stepPx; y < S; y += stepPx) {
      if ((x - c) * (x - c) + (y - c) * (y - c) > r * r) continue;
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Sección de detalles (preview oficial). La capa es fija: el dial nace del
 * logo de la tapa (crece desde ahí mientras la sección entra), se queda en
 * el centro y el copy de la izquierda sube con el scroll. Arriba, las
 * pestañas de los seis detalles (driveberry); a la derecha, la tarjeta de
 * producto de cada pieza (clarvos) y el snippet con su código.
 */
const visionFeatures = webFeatures;
const COLORS = visionFeatures.map((f) => f.color);

export default function VisionFeatures() {
  const N = visionFeatures.length;
  const sectionRef = useRef<HTMLElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const dialWrapRef = useRef<HTMLDivElement>(null);
  const dialInnerRef = useRef<HTMLDivElement>(null);
  const copyColRef = useRef<HTMLDivElement>(null);
  const copyTrackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmentRefs = useRef<(SVGGElement | null)[]>([]);
  const progressRefs = useRef<(SVGPathElement | null)[]>([]);
  const accentRef = useRef<SVGGElement | null>(null);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const snippetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const codeRef = useRef<HTMLDivElement>(null);
  const codeTitleRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabBarRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    visionStore.featuresEl = sectionEl;
    visionStore.featureCount = N;
    const applyLead = () => {
      if (!sectionEl) return;
      sectionEl.style.height = `${(N * TRAMO + 1) * 100}vh`;
    };
    applyLead();
    window.addEventListener("resize", applyLead);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const S = 440;
    const phone = () => window.innerWidth < 768;
    const fitCanvas = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, phone() ? 3 : 2);
      // En el celu la pupila es chica: se dibuja a los pixeles de la pantalla, no a 880px.
      let css = S;
      if (phone()) {
        const dial = Math.min(260, window.innerWidth * 0.72, window.innerHeight * 0.36);
        css = Math.max(96, Math.round(dial * 0.468));
      }
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      const k = (css / S) * dpr;
      ctx.setTransform(k, 0, 0, k, 0, 0);
    };
    fitCanvas();
    const start = performance.now();
    let lastBest = -1;
    let live = false;
    let lastFixed = "";
    let lastWrap = "";
    let lastAside = "";
    let lastCode = "";
    let slot = 0;
    const measureSlot = () => {
      const next = copyColRef.current?.clientHeight ?? 0;
      if (next <= 0 || next === slot) return;
      slot = next;
      for (const copy of copyRefs.current) {
        if (copy) copy.style.height = `${slot}px`;
      }
    };
    measureSlot();
    const onResize = () => {
      fitCanvas();
      measureSlot();
    };
    window.addEventListener("resize", onResize);

    const unsubscribe = visionStore.subscribe((frame) => {
      const fixed = fixedRef.current;
      if (!fixed) return;
      const { x, opacity, enter } = frame.features;
      const op = opacity.toFixed(3);
      if (op !== lastFixed) {
        lastFixed = op;
        fixed.style.opacity = op;
      }
      const nextLive = opacity > 0.5;
      if (nextLive !== live) {
        live = nextLive;
        fixed.classList.toggle("is-live", live);
      }
      if (opacity < 0.005) {
        codeRef.current?.classList.remove("is-on");
        return;
      }

      const t = reduce ? 0 : (performance.now() - start) / 1000;

      // ---- el dial nace del logo de la tapa ----
      const wrap = dialWrapRef.current;
      const inner = dialInnerRef.current;
      if (wrap && inner) {
        const k = smoothstep(0, 1, enter);
        const leave = smoothstep(0.94, 1, frame.features.raw);
        const wrapOp = (k >= 1 ? 1 - leave : 1).toFixed(3);
        if (wrapOp !== lastWrap) {
          lastWrap = wrapOp;
          wrap.style.opacity = wrapOp;
        }
        if (k >= 1) {
          if (leave < 0.001) {
            if (inner.style.transform) inner.style.transform = "";
          } else {
            const s = 1 - leave * 0.42;
            const y = -leave * 90;
            inner.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
          }
        } else {
          const rect = wrap.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const pupilPx = (rect.width / 2) * ((PUPIL_R + 3) / (DIAL_SIZE / 2));
          const logo = frame.logo;
          const s0 = logo.r > 2 ? Math.min(1, logo.r / pupilPx) : 0.08;
          const dx = logo.r > 2 ? (logo.x - cx) * (1 - k) : 0;
          const dy = logo.r > 2 ? (logo.y - cy) * (1 - k) : 0;
          const s = s0 + (1 - s0) * k;
          inner.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        }
      }
      const aside = 1 - smoothstep(0.94, 0.975, frame.features.raw);
      const asideKey = aside.toFixed(3);
      if (asideKey !== lastAside && copyColRef.current) {
        lastAside = asideKey;
        copyColRef.current.style.opacity = asideKey;
      }
      if (codeRef.current) {
        const codeOpacity = smoothstep(0.72, 1, enter) * aside;
        const codeKey = codeOpacity.toFixed(3);
        if (codeKey !== lastCode) {
          lastCode = codeKey;
          codeRef.current.style.opacity = codeKey;
        }
        codeRef.current.classList.toggle("is-on", codeOpacity > 0.45);
      }

      if (ctx) ctx.clearRect(0, 0, S, S);

      if (slot <= 0) measureSlot();
      const track = copyTrackRef.current;
      if (track && slot > 0) {
        track.style.transform = `translate3d(0, ${(-x * slot).toFixed(2)}px, 0)`;
      }

      let best = 0;
      let bestW = -1;

      for (let i = 0; i < N; i++) {
        const w = weightAt(x, i);
        const dir = x < i ? 1 : -1;

        const copy = copyRefs.current[i];
        if (copy) copy.style.pointerEvents = w > 0.5 ? "auto" : "none";
        const card = cardRefs.current[i];
        if (card) {
          const cw = smoothstep(0.5, 0.9, w);
          card.style.opacity = cw.toFixed(3);
          card.style.transform = `translate3d(0, ${((1 - cw) * 16 * dir).toFixed(1)}px, 0) scale(${(0.97 + 0.03 * cw).toFixed(3)})`;
          card.style.pointerEvents = cw > 0.6 ? "auto" : "none";
        }
        const snip = snippetRefs.current[i];
        if (snip) {
          // corte seco: solo se lee un snippet a la vez
          const sw = smoothstep(0.55, 0.9, w);
          snip.style.opacity = sw.toFixed(3);
          snip.style.transform = `translateY(${((1 - sw) * 10 * dir).toFixed(1)}px)`;
        }
        const seg = segmentRefs.current[i];
        if (seg) {
          seg.style.opacity = (0.62 + 0.38 * w).toFixed(3);
          seg.style.setProperty("--w", (3.5 + 3 * w).toFixed(2));
          // El glow a pasos: reescribir filter cada frame repinta el círculo entero.
          const gw = Math.round(w * 8) / 8;
          const glow = gw > 0.05 ? `drop-shadow(0 0 ${(9 * gw).toFixed(1)}px ${COLORS[i]})` : "none";
          if (seg.dataset.glow !== glow) {
            seg.dataset.glow = glow;
            seg.style.filter = glow;
          }
        }
        if (w > bestW) {
          bestW = w;
          best = i;
        }
      }

      if (ctx) {
        dotGrid(ctx, S, COLORS[best]);
        if (bestW > 0.02) {
          drawDemo(ctx, visionFeatures[best].demo, S, t, COLORS[best], smoothstep(0.08, 0.42, bestW));
        }
      }

      if (accentRef.current) accentRef.current.style.color = ACENTO;
      if (tabBarRef.current) {
        const tab = tabRefs.current[best];
        if (tab) {
          tabBarRef.current.style.transform = `translate3d(${tab.offsetLeft}px, 0, 0)`;
          tabBarRef.current.style.width = `${tab.offsetWidth}px`;
        }
      }
      if (best !== lastBest) {
        lastBest = best;
        tabRefs.current.forEach((t, k) => t?.setAttribute("aria-current", k === best ? "true" : "false"));
        if (codeTitleRef.current) codeTitleRef.current.textContent = visionFeatures[best].id;
        if (codeRef.current) codeRef.current.style.setProperty("--c", ACENTO);
      }

      // avance local dentro del detalle: arcos del dial + barra de ticks
      const frac = Math.min(1, Math.max(0, x + 0.5 - Math.floor(x + 0.5)));
      const fr = [frac, smoothstep(0.1, 0.95, frac), smoothstep(0.3, 1, frac)];
      progressRefs.current.forEach((el, k) => {
        if (!el) return;
        const len = Number(el.dataset.len) || 1;
        el.style.strokeDasharray = `${(len * fr[k]).toFixed(1)} ${len.toFixed(1)}`;
      });
    });

    return () => {
      unsubscribe();
      window.removeEventListener("resize", applyLead);
      window.removeEventListener("resize", onResize);
      if (visionStore.featuresEl === sectionEl) visionStore.featuresEl = null;
    };
  }, [N]);

  /** Ir al detalle k: el centro de su tramo de scroll. */
  const irA = (k: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const recorrido = el.offsetHeight - window.innerHeight;
    scrollA(top + recorrido * 0.94 * ((k + 0.5) / N));
  };

  return (
    <section
      id="detalles"
      ref={sectionRef}
      className="vision-features"
      data-tema="oscuro"
      aria-label="Detalles de cada pieza"
      style={{ height: `${(N * TRAMO + 1) * 100}vh` }}
    >
      <div ref={fixedRef} className="vision-features__fixed">
        <nav className="vision-tabs" aria-label="Detalles">
          <span ref={tabBarRef} className="vision-tabs__barra" aria-hidden />
          {visionFeatures.map((f, i) => (
            <button
              key={f.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              className="vision-tabs__tab"
              aria-current={i === 0 ? "true" : "false"}
              onClick={() => irA(i)}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              {CORTO[f.id] ?? f.title}
            </button>
          ))}
        </nav>

        <div ref={dialWrapRef} className="vision-features__dial">
          <div ref={dialInnerRef} className="vision-features__dial-inner">
            <DialFrame
              colors={COLORS}
              accent={ACENTO}
              segmentRefs={segmentRefs}
              accentRef={accentRef}
              progressRefs={progressRefs}
              className="vision-dial--features"
            >
              <canvas ref={canvasRef} className="vision-dial__canvas" />
            </DialFrame>
          </div>
        </div>

        <div ref={copyColRef} className="vision-features__copy">
          <div ref={copyTrackRef} className="vision-features__copy-track">
            {visionFeatures.map((f, i) => (
              <div
                key={f.id}
                ref={(el) => {
                  copyRefs.current[i] = el;
                }}
                className="vision-feature"
              >
                <p className="oh-indice">(03) Detalle {String(i + 1).padStart(2, "0")}</p>
                <h2 className="vision-feature__title" style={{ color: f.color }}>
                  {f.title}
                </h2>
                <p className="vision-feature__lead">{f.lead}</p>
                <ul className="vision-feature__bullets">
                  {f.bullets.map((b) => (
                    <li key={b}>
                      <span aria-hidden>→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="vision-tarjetas" aria-hidden>
          {visionFeatures.map((f, i) => {
            const Visual = VISUALES[f.id];
            return (
              <div
                key={f.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="vision-tarjeta"
              >
                {Visual ? <Visual /> : null}
              </div>
            );
          })}
        </div>

        <div ref={codeRef} className="vision-code" style={{ "--c": ACENTO } as CSSProperties}>
          <button type="button" className="vision-code__ia" onClick={abrirOnvi} aria-label="Hablar con Onvi">
            <Ojo className="vision-code__ojo" />
            IA
          </button>
          <div className="vision-code__panel" aria-hidden>
            <span className="vision-code__head">
              <i className="vision-code__pin" />
              <span ref={codeTitleRef}>{visionFeatures[0]?.id}</span>
              <svg className="vision-code__copy" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 10.5V4.5A1.5 1.5 0 0 1 4.5 3h6" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </span>
            <div className="vision-code__stack">
              {visionFeatures.map((f, i) => (
                <div
                  key={f.id}
                  ref={(el) => {
                    snippetRefs.current[i] = el;
                  }}
                  className="vision-code__snippet"
                >
                  {f.snippet.map((line, li) => (
                    <span key={li} className="vision-code__line">
                      {tokens(line, f.color).map((tk, ti) => (
                        <span key={ti} className={tk.k ? `is-${tk.k}` : undefined} style={tk.c ? { color: tk.c } : undefined}>
                          {tk.t}
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
