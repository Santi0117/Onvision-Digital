"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number };

/** Azar con semilla: las formas salen iguales en cada visita. */
function generador(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function linea(a: P, b: P, n: number, azar: () => number): P[] {
  return Array.from({ length: n }, () => {
    const t = azar();
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  });
}

function circulo(c: P, r: number, n: number, azar: () => number, relleno = 0): P[] {
  return Array.from({ length: n }, () => {
    const t = azar() * Math.PI * 2;
    const rr = relleno ? r * Math.sqrt(azar()) * relleno + r * (1 - relleno) * azar() : r;
    return { x: c.x + Math.cos(t) * rr, y: c.y + Math.sin(t) * rr };
  });
}

function rectangulo(x: number, y: number, w: number, h: number, n: number, azar: () => number): P[] {
  const per = 2 * (w + h);
  return Array.from({ length: n }, () => {
    let d = azar() * per;
    if (d < w) return { x: x + d, y };
    d -= w;
    if (d < h) return { x: x + w, y: y + d };
    d -= h;
    if (d < w) return { x: x + w - d, y: y + h };
    d -= w;
    return { x, y: y + h - d };
  });
}

function relleno(x: number, y: number, w: number, h: number, n: number, azar: () => number): P[] {
  return Array.from({ length: n }, () => ({ x: x + azar() * w, y: y + azar() * h }));
}

/** Completa o recorta a exactamente N puntos, mezclados. */
function ajustar(puntos: P[], n: number, azar: () => number): P[] {
  const out = puntos.slice(0, n);
  while (out.length < n) out.push(puntos[Math.floor(azar() * puntos.length)]!);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Rectángulo de esquinas redondeadas, recorrido por su borde. */
function redondeado(x: number, y: number, w: number, h: number, r: number, n: number, azar: () => number): P[] {
  const tw = w - 2 * r;
  const th = h - 2 * r;
  const per = 2 * tw + 2 * th + 2 * Math.PI * r;
  const centros = [
    { x: x + w - r, y: y + r },
    { x: x + w - r, y: y + h - r },
    { x: x + r, y: y + h - r },
    { x: x + r, y: y + r },
  ];
  return Array.from({ length: n }, () => {
    let d = azar() * per;
    if (d < tw) return { x: x + r + d, y };
    d -= tw;
    if (d < th) return { x: x + w, y: y + r + d };
    d -= th;
    if (d < tw) return { x: x + w - r - d, y: y + h };
    d -= tw;
    if (d < th) return { x, y: y + h - r - d };
    d -= th;
    const t = d / r;
    const k = Math.min(3, Math.floor(t / (Math.PI / 2)));
    const ang = -Math.PI / 2 + t;
    const c = centros[k]!;
    return { x: c.x + Math.cos(ang) * r, y: c.y + Math.sin(ang) * r };
  });
}

/** 01 · Contá: la conversación — tu mensaje y Onvision escribiendo. */
function formaConversa(n: number): P[] {
  const azar = generador(19);
  const pts: P[] = [];
  pts.push(...redondeado(0.1, 0.16, 0.56, 0.3, 0.06, 240, azar));
  pts.push(...linea({ x: 0.2, y: 0.46 }, { x: 0.16, y: 0.56 }, 18, azar));
  pts.push(...linea({ x: 0.16, y: 0.56 }, { x: 0.3, y: 0.46 }, 18, azar));
  const renglones = [
    [0.17, 0.25, 0.56],
    [0.17, 0.31, 0.6],
    [0.17, 0.37, 0.46],
  ] as const;
  for (const [a, y, b] of renglones) pts.push(...linea({ x: a, y }, { x: b, y }, 30, azar));
  pts.push(...redondeado(0.36, 0.56, 0.54, 0.24, 0.06, 200, azar));
  pts.push(...linea({ x: 0.8, y: 0.8 }, { x: 0.86, y: 0.9 }, 16, azar));
  pts.push(...linea({ x: 0.86, y: 0.9 }, { x: 0.7, y: 0.8 }, 16, azar));
  for (const cx of [0.53, 0.63, 0.73]) pts.push(...circulo({ x: cx, y: 0.68 }, 0.025, 30, azar, 1));
  return ajustar(pts, n, azar);
}

/** 02 · Elegí: la cuadrícula de piezas, con la del medio elegida. */
function formaElegi(n: number): P[] {
  const azar = generador(11);
  const s = 0.2;
  const g = 0.07;
  const x0 = 0.13;
  const pts: P[] = [];
  for (let f = 0; f < 3; f++) {
    for (let c = 0; c < 3; c++) {
      const x = x0 + c * (s + g);
      const y = x0 + f * (s + g);
      const centro = f === 1 && c === 1;
      pts.push(...rectangulo(x, y, s, s, centro ? 90 : 62, azar));
      if (centro) pts.push(...relleno(x + 0.02, y + 0.02, s - 0.04, s - 0.04, 120, azar));
    }
  }
  return ajustar(pts, n, azar);
}

/** 03 · Publicá: la ventana del navegador con tu sitio y el check. */
function formaPublica(n: number): P[] {
  const azar = generador(37);
  const pts: P[] = [];
  pts.push(...redondeado(0.1, 0.18, 0.8, 0.6, 0.04, 300, azar));
  pts.push(...linea({ x: 0.1, y: 0.28 }, { x: 0.9, y: 0.28 }, 70, azar));
  for (const cx of [0.15, 0.19, 0.23]) pts.push(...circulo({ x: cx, y: 0.23 }, 0.012, 10, azar, 1));
  pts.push(...redondeado(0.3, 0.205, 0.45, 0.05, 0.02, 60, azar));
  pts.push(...relleno(0.16, 0.34, 0.36, 0.1, 90, azar));
  const renglones = [
    [0.16, 0.5, 0.5],
    [0.16, 0.56, 0.44],
    [0.16, 0.62, 0.48],
  ] as const;
  for (const [a, y, b] of renglones) pts.push(...linea({ x: a, y }, { x: b, y }, 26, azar));
  pts.push(...redondeado(0.16, 0.67, 0.16, 0.05, 0.025, 40, azar));
  const cc = { x: 0.7, y: 0.52 };
  pts.push(...circulo(cc, 0.13, 130, azar));
  pts.push(...linea({ x: 0.635, y: 0.525 }, { x: 0.685, y: 0.575 }, 24, azar));
  pts.push(...linea({ x: 0.685, y: 0.575 }, { x: 0.77, y: 0.47 }, 34, azar));
  return ajustar(pts, n, azar);
}

const FORMAS = [formaConversa, formaElegi, formaPublica];

/**
 * El dibujo de puntos de jeffmilanes: cada paso es una figura y los puntos
 * viajan de una a otra. Se detiene fuera de pantalla y, con movimiento
 * reducido, dibuja la figura quieta.
 */
export default function Particulas({ forma, className = "" }: { forma: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const formaRef = useRef(forma);
  const motor = useRef<{ cambiar: (f: number) => void } | null>(null);

  useEffect(() => {
    formaRef.current = forma;
    motor.current?.cambiar(forma);
  }, [forma]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const contexto = canvas.getContext("2d");
    if (!contexto) return;
    const ctx: CanvasRenderingContext2D = contexto;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const N = window.matchMedia("(max-width: 700px)").matches ? 520 : 820;
    const objetivos = FORMAS.map((f) => f(N));
    const azar = generador(5);
    const fase = Array.from({ length: N }, () => azar() * Math.PI * 2);
    const demora = Array.from({ length: N }, () => azar() * 420);
    // Arrancan desperdigados y se juntan en la primera figura.
    let desde: P[] = Array.from({ length: N }, () => ({ x: azar(), y: azar() }));
    let hacia: P[] = objetivos[formaRef.current] ?? objetivos[0]!;
    const actual: P[] = desde.map((p) => ({ ...p }));
    let t0 = performance.now();
    const DUR = 1100;

    let ancho = 0;
    let alto = 0;
    let raf = 0;
    let visible = false;

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = r.width;
      alto = r.height;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (quieto) dibujar(performance.now());
    };

    const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const dibujar = (ahora: number) => {
      ctx.clearRect(0, 0, ancho, alto);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      const lado = Math.min(ancho, alto);
      const ox = (ancho - lado) / 2;
      const oy = (alto - lado) / 2;
      for (let i = 0; i < N; i++) {
        let x: number;
        let y: number;
        if (quieto) {
          x = hacia[i]!.x;
          y = hacia[i]!.y;
        } else {
          const t = Math.min(1, Math.max(0, (ahora - t0 - demora[i]!) / DUR));
          const e = suave(t);
          x = desde[i]!.x + (hacia[i]!.x - desde[i]!.x) * e;
          y = desde[i]!.y + (hacia[i]!.y - desde[i]!.y) * e;
          x += Math.sin(ahora * 0.0012 + fase[i]!) * 0.0025;
          y += Math.cos(ahora * 0.001 + fase[i]!) * 0.0025;
        }
        actual[i] = { x, y };
        ctx.fillRect(ox + x * lado, oy + y * lado, 1.6, 1.6);
      }
    };

    const cuadro = (ahora: number) => {
      dibujar(ahora);
      raf = visible && !document.hidden ? requestAnimationFrame(cuadro) : 0;
    };

    const arrancar = () => {
      if (quieto || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(cuadro);
    };

    motor.current = {
      cambiar: (f: number) => {
        const nueva = objetivos[f];
        if (!nueva || nueva === hacia) return;
        desde = actual.map((p) => ({ ...p }));
        hacia = nueva;
        t0 = performance.now();
        if (quieto) dibujar(t0);
      },
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    let primeraVez = true;
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      // La primera vez que se ve, los puntos se juntan desde cero.
      if (visible && primeraVez) {
        primeraVez = false;
        t0 = performance.now();
      }
      arrancar();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", arrancar);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", arrancar);
      motor.current = null;
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
