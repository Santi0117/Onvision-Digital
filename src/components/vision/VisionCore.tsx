"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { webCore, webModules, type VisionPin } from "@/lib/web";
import { smoothstep, visionStore, type Anchor } from "./store";

/** "onvi, asistente con IA" → "Onvi, asistente con IA", "agenda" → "Agenda". */
const nombre = (t: string) =>
  t
    .replace("onvi", "Onvi")
    .replace(/^\p{L}/u, (c) => c.toUpperCase());

type Dir = VisionPin;
type Lock = { dir: Dir; extra: number };
type Box = { l: number; t: number; r: number; b: number };

function hits(a: Box, b: Box, pad: number) {
  return a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
}

function labelBox(x: number, y: number, lw: number, lh: number): Box {
  return { l: x, t: y - lh / 2, r: x + lw, b: y + lh / 2 };
}

/** Pastilla justo fuera del recuadro. `y` es el centro vertical (translateY -50%). */
function placeOutside(a: Box, lw: number, lh: number, dir: Dir, air: number) {
  const mx = (a.l + a.r) / 2;
  const my = (a.t + a.b) / 2;
  switch (dir) {
    case "up":
      return { x: mx - lw / 2, y: a.t - air - lh / 2 };
    case "down":
      return { x: mx - lw / 2, y: a.b + air + lh / 2 };
    case "left":
      return { x: a.l - air - lw, y: my };
    case "right":
      return { x: a.r + air, y: my };
  }
}

function onScreen(box: Box, lw: number, lh: number, w: number, pad: number, minY: number, maxY: number) {
  const visW = Math.min(box.r, w - pad) - Math.max(box.l, pad);
  const visH = Math.min(box.b, maxY) - Math.max(box.t, minY);
  return visW > lw * 0.85 && visH > lh * 0.85;
}

const DIRS: Dir[] = ["up", "down", "left", "right"];

/**
 * Lado fijo: el `pin` del contenido. Solo se cambia si esa cara deja la
 * pastilla fuera de pantalla o con el centro encima de otra pieza.
 */
function pickDir(
  a: Anchor,
  lw: number,
  lh: number,
  air: number,
  w: number,
  minY: number,
  maxY: number,
  pad: number,
  preferred?: Dir | null,
  allowFallback = false,
): Dir {
  if (preferred && !allowFallback) return preferred;
  if (preferred) {
    const { x, y } = placeOutside(a, lw, lh, preferred, air);
    if (onScreen(labelBox(x, y, lw, lh), lw, lh, w, pad, minY, maxY)) return preferred;
  }

  const order = preferred ? DIRS.filter((d) => d !== preferred) : DIRS;
  const fallback = preferred ?? "right";
  for (const dir of order) {
    const { x, y } = placeOutside(a, lw, lh, dir, air);
    if (!onScreen(labelBox(x, y, lw, lh), lw, lh, w, pad, minY, maxY)) continue;
    return dir;
  }
  return fallback;
}

/**
 * "Un sitio completo, pieza por pieza": la laptop se abre y salen sus nueve
 * piezas (preview oficial), cada una con su etiqueta fija fuera de su
 * recuadro 3D. A la izquierda, el contador gigante de jeffmilanes sube con
 * las piezas y nombra la que acaba de salir.
 */
const visionCore = webCore;
const visionModules = webModules;

/** Lo que dice el contador antes de que se abra la primera pieza. */
const ESPERA = "Sigue bajando: cada pieza que se abre se suma a la cuenta.";

export default function VisionCore() {
  const sectionRef = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const piezaRef = useRef<HTMLSpanElement>(null);
  const detalleRef = useRef<HTMLSpanElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const legendRef = useRef<HTMLDivElement>(null);
  const dirLock = useRef<(Lock | null)[]>([]);
  const modeRef = useRef<"m" | "d" | null>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    visionStore.sectionEl = sectionEl;
    dirLock.current = visionModules.map(() => null);
    modeRef.current = null;

    const copyEl = stickyRef.current?.querySelector(".vision-core__copy") as HTMLElement | null;
    let lastInk = "";
    let lastCopyFade = "";
    let lastCuenta = -1;
    let travel = 1;
    let mobile = window.innerWidth < 768;
    const measureCore = () => {
      mobile = window.innerWidth < 768;
      const h = sectionEl?.offsetHeight ?? window.innerHeight;
      travel = Math.max(h - window.innerHeight, 1);
    };
    measureCore();
    window.addEventListener("resize", measureCore);

    const unsubscribe = visionStore.subscribe((frame) => {
      const sticky = stickyRef.current;
      if (!sticky) return;
      if (frame.theme.ink !== lastInk) {
        lastInk = frame.theme.ink;
        sticky.style.setProperty("--v-ink", frame.theme.ink);
        sticky.style.setProperty("--v-muted", frame.theme.muted);
        sticky.style.setProperty("--v-bg", frame.theme.bg);
      }

      const vis = smoothstep(0.72, 0.98, frame.explode);
      // En móvil el título cruza la laptop al entrar a la sección y se ve
      // como un glitch. Aparece recién cuando el bloque ya está pinneado arriba.
      // stickyTop sale del raw (sin leer layout en cada frame).
      const stickyTop = mobile && frame.raw < 0 ? -frame.raw * travel : 0;
      const copyFade = mobile ? smoothstep(64, 6, stickyTop) : 1;
      const fadeKey = copyFade.toFixed(3);
      if (copyEl && fadeKey !== lastCopyFade) {
        lastCopyFade = fadeKey;
        copyEl.style.opacity = fadeKey;
      }

      legendRef.current?.classList.toggle("is-on", mobile && copyFade > 0.92 && frame.explode > 0.08);

      // El contador: cuántas piezas ya salieron y cuál fue la última.
      // Sube mientras el núcleo se abre y queda completo cuando se vuelve a armar.
      const abierto = smoothstep(0.05, 0.34, frame.progress);
      const cuenta = Math.min(visionModules.length, Math.floor(abierto * (visionModules.length + 0.6)));
      if (cuenta !== lastCuenta) {
        lastCuenta = cuenta;
        if (numRef.current) numRef.current.textContent = String(cuenta);
        const m = visionModules[Math.max(0, cuenta - 1)]!;
        if (piezaRef.current) piezaRef.current.textContent = cuenta ? nombre(m.label) : "Tu marca";
        if (detalleRef.current) detalleRef.current.textContent = cuenta ? m.detail : ESPERA;
      }

      // Fuera de la sección no hay nada que acomodar.
      if (mobile || frame.raw < -0.6 || frame.raw > 1.3) return;

      const w = sticky.clientWidth;
      const h = sticky.clientHeight;

      if (frame.anchors.length < visionModules.length) return;

      const mode = mobile ? "m" : "d";
      if (modeRef.current !== mode || frame.explode < 0.12) {
        modeRef.current = mode;
        for (let i = 0; i < dirLock.current.length; i++) dirLock.current[i] = null;
      }

      const pad = mobile ? 8 : 16;
      const air = mobile ? 11 : 14;
      const minY = mobile ? h * 0.2 : 64;
      const maxY = h - (mobile ? 44 : 28);

      // Recién cuando la cámara ya se retiró: antes el close-up saca el pin
      // de pantalla y el fallback termina sobre el teclado.
      const ready = frame.explode > 0.8 && frame.anchors.some((a) => a.r - a.l > 16);
      if (ready) {
        let fresh = false;
        for (let i = 0; i < visionModules.length; i++) {
          if (dirLock.current[i]) continue;
          fresh = true;
          const label = labelRefs.current[i];
          const a = frame.anchors[i];
          if (!label || !a) continue;
          const lw = label.offsetWidth || 80;
          const lh = label.offsetHeight || 18;
          dirLock.current[i] = {
            dir: pickDir(a, lw, lh, air, w, minY, maxY, pad, visionModules[i].pin ?? null, mobile),
            extra: 0,
          };
        }

        if (fresh) {
          const placed: Box[] = [];
          for (let i = 0; i < visionModules.length; i++) {
            const lock = dirLock.current[i];
            const label = labelRefs.current[i];
            const a = frame.anchors[i];
            if (!lock || !label || !a) continue;
            const lw = label.offsetWidth || 80;
            const lh = label.offsetHeight || 18;
            let extra = 0;
            let { x, y } = placeOutside(a, lw, lh, lock.dir, air);
            let box = labelBox(x, y, lw, lh);
            for (let n = 0; n < 4; n++) {
              const hit = placed.find((p) => hits(box, p, 6));
              if (!hit) break;
              extra += lh + 8;
              ({ x, y } = placeOutside(a, lw, lh, lock.dir, air + extra));
              box = labelBox(x, y, lw, lh);
            }
            lock.extra = extra;
            placed.push(box);
          }
        }
      }

      for (let i = 0; i < visionModules.length; i++) {
        const label = labelRefs.current[i];
        const a = frame.anchors[i];
        if (!label || !a) continue;

        const lw = label.offsetWidth || 80;
        const lh = label.offsetHeight || 18;
        const lock = dirLock.current[i];
        const dir =
          lock?.dir ?? pickDir(a, lw, lh, air, w, minY, maxY, pad, visionModules[i].pin ?? null, mobile);
        const extra = lock?.extra ?? 0;

        let { x: lx, y: ly } = placeOutside(a, lw, lh, dir, air + extra);

        if (dir === "up" || dir === "down") {
          const nx = Math.max(pad, Math.min(w - lw - pad, lx));
          if (!hits(labelBox(nx, ly, lw, lh), a, 0)) lx = nx;
        } else {
          const ny = Math.max(minY, Math.min(maxY, ly));
          if (!hits(labelBox(lx, ny, lw, lh), a, 0)) ly = ny;
        }

        label.classList.toggle("is-right", dir === "left");

        const local = smoothstep(0, 1, Math.min(1, Math.max(0, vis * 1.25 - i * 0.04)));
        const alpha = a.visible ? local : 0;
        label.style.opacity = alpha.toFixed(3);
        label.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translateY(-50%)`;
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("resize", measureCore);
      if (copyEl) copyEl.style.opacity = "";
      if (visionStore.sectionEl === sectionEl) visionStore.sectionEl = null;
    };
  }, []);

  return (
    <section id="nucleo" ref={sectionRef} className="vision-core" data-tema="oscuro" aria-labelledby="vision-core-titulo">
      <div ref={stickyRef} className="vision-core__sticky">
        <div className="vision-core__copy">
          <p className="oh-indice">(02) Qué incluye</p>
          <h2 id="vision-core-titulo" className="vision-core__title">
            {visionCore.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div ref={legendRef} className="vision-core__legend" aria-hidden>
            {visionModules.map((mod, i) => (
              <span key={mod.id} className="vision-legend-chip" style={{ "--d": `${i * 0.055}s` } as CSSProperties}>
                <i className="vision-legend-chip__pin" />
                {mod.label}
              </span>
            ))}
          </div>
          <p className="vision-core__lead">{visionCore.lead}</p>
          <div className="vision-core__cuenta" aria-hidden>
            <span ref={numRef} className="vision-core__num">
              0
            </span>
            <span className="vision-core__unidad">Piezas listas para tu marca</span>
            <span className="vision-core__pieza">
              <i>◇</i> <span ref={piezaRef}>Tu marca</span>
            </span>
            <span ref={detalleRef} className="vision-core__detalle">
              {ESPERA}
            </span>
          </div>
        </div>

        <div className="vision-callouts" aria-hidden>
          {visionModules.map((mod, i) => (
            <div
              key={mod.id}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="vision-callout"
            >
              <span className="vision-callout__tag">
                <i className="vision-callout__pin" />
                <span className="vision-callout__label">{mod.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
