"use client";

import { useEffect, useRef, type RefObject } from "react";
import { OJO_D } from "../od/ui";

type P = { x: number; y: number };
type Azar = () => number;

/**
 * Lo que manda sobre la figura, leído en cada cuadro (sin renders):
 * `p` es la pieza (-1 = la nube del principio, 0…5 las figuras).
 * - "tiempo": la figura de la pieza más cercana y los puntos viajan solos,
 *   como en jeffmilanes.
 * - "scroll": el dedo manda: entre una pieza y la siguiente los puntos
 *   estallan, giran y se vuelven a juntar al ritmo del scroll.
 */
export type Senal = { p: number; modo: "tiempo" | "scroll" };

/** Azar con semilla: las formas salen iguales en cada visita. */
function generador(semilla: number): Azar {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** Normal (Box-Muller): el grosor de tiza de cada trazo. */
function normal(azar: Azar) {
  const u = Math.max(azar(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * azar());
}

function linea(a: P, b: P, n: number, azar: Azar): P[] {
  return Array.from({ length: n }, () => {
    const t = azar();
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  });
}

function circulo(c: P, r: number, n: number, azar: Azar, relleno = 0): P[] {
  return Array.from({ length: n }, () => {
    const t = azar() * Math.PI * 2;
    const rr = relleno ? r * Math.sqrt(azar()) : r;
    return { x: c.x + Math.cos(t) * rr, y: c.y + Math.sin(t) * rr };
  });
}

function relleno(x: number, y: number, w: number, h: number, n: number, azar: Azar): P[] {
  return Array.from({ length: n }, () => ({ x: x + azar() * w, y: y + azar() * h }));
}

/** Rectángulo de esquinas redondeadas, recorrido por su borde. */
function redondeado(x: number, y: number, w: number, h: number, r: number, n: number, azar: Azar): P[] {
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

function mezclar(puntos: P[], azar: Azar): P[] {
  const out = puntos.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Exactamente N puntos, mezclados y con grosor de tiza. Si sobran se elige
 * al azar entre todos (no los primeros: si no, en el celular se perdían
 * las últimas partes del dibujo); si faltan, se repiten.
 */
function ajustar(puntos: P[], n: number, azar: Azar): P[] {
  const out = mezclar(puntos, azar).slice(0, n);
  while (out.length < n) out.push(puntos[Math.floor(azar() * puntos.length)]!);
  return mezclar(out, azar).map((p) => {
    // Casi todos pegados al trazo; unos pocos sueltos, como polvo de tiza.
    const s = azar() < 0.05 ? 0.011 : 0.0034;
    return { x: p.x + normal(azar) * s, y: p.y + normal(azar) * s };
  });
}

/** Estrella de cuatro puntas (astroide), rellena. */
function chispa(c: P, r: number, n: number, azar: Azar): P[] {
  const pts: P[] = [];
  while (pts.length < n) {
    const x = azar() * 2 - 1;
    const y = azar() * 2 - 1;
    if (Math.abs(x) ** (2 / 3) + Math.abs(y) ** (2 / 3) <= 1) pts.push({ x: c.x + x * r, y: c.y + y * r });
  }
  return pts;
}

/* ── Las seis figuras, en un cuadro de 0 a 1 ─────────────────────────── */

/** 01 · Páginas web: la ventana del navegador con tu sitio. */
function formaWeb(n: number): P[] {
  const azar = generador(37);
  const pts: P[] = [];
  pts.push(...redondeado(0.08, 0.2, 0.84, 0.6, 0.04, 320, azar));
  pts.push(...linea({ x: 0.08, y: 0.3 }, { x: 0.92, y: 0.3 }, 80, azar));
  for (const cx of [0.13, 0.17, 0.21]) pts.push(...circulo({ x: cx, y: 0.25 }, 0.011, 10, azar, 1));
  pts.push(...redondeado(0.32, 0.228, 0.4, 0.045, 0.02, 50, azar));
  pts.push(...relleno(0.14, 0.37, 0.34, 0.09, 110, azar));
  for (const [a, y, b] of [
    [0.14, 0.52, 0.46],
    [0.14, 0.57, 0.42],
    [0.14, 0.62, 0.44],
  ] as const) {
    pts.push(...linea({ x: a, y }, { x: b, y }, 26, azar));
  }
  pts.push(...redondeado(0.14, 0.67, 0.15, 0.05, 0.025, 40, azar));
  pts.push(...redondeado(0.55, 0.37, 0.31, 0.35, 0.02, 120, azar));
  pts.push(...circulo({ x: 0.79, y: 0.45 }, 0.03, 28, azar));
  pts.push(...linea({ x: 0.57, y: 0.69 }, { x: 0.65, y: 0.54 }, 18, azar));
  pts.push(...linea({ x: 0.65, y: 0.54 }, { x: 0.72, y: 0.64 }, 16, azar));
  pts.push(...linea({ x: 0.7, y: 0.61 }, { x: 0.76, y: 0.55 }, 12, azar));
  pts.push(...linea({ x: 0.76, y: 0.55 }, { x: 0.84, y: 0.69 }, 18, azar));
  return ajustar(pts, n, azar);
}

/** 02 · Onvi: el ojo de Onvision, sacado del mismo vector del logo. */
function formaOnvi(n: number): P[] {
  const azar = generador(13);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.style.visibility = "hidden";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", OJO_D);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const pts: P[] = [];
  try {
    const largo = path.getTotalLength();
    // viewBox del ojo: 100 × 56, al 84% del ancho del cuadro.
    const k = 0.84 / 100;
    const ox = 0.08;
    const oy = 0.5 - (56 * k) / 2;
    for (let i = 0; i < n; i++) {
      const q = path.getPointAtLength(azar() * largo);
      pts.push({ x: ox + q.x * k, y: oy + q.y * k });
    }
  } catch {
    pts.push(...circulo({ x: 0.5, y: 0.5 }, 0.3, n, azar));
  } finally {
    svg.remove();
  }
  return ajustar(pts, n, azar);
}

/** 03 · Software: tres módulos conectados, como un diagrama del sistema. */
function formaSoftware(n: number): P[] {
  const azar = generador(23);
  const pts: P[] = [];
  const cajas = [
    [0.08, 0.16],
    [0.62, 0.16],
    [0.35, 0.62],
  ] as const;
  for (const [x, y] of cajas) {
    pts.push(...redondeado(x, y, 0.3, 0.21, 0.025, 170, azar));
    pts.push(...linea({ x: x + 0.05, y: y + 0.075 }, { x: x + 0.22, y: y + 0.075 }, 22, azar));
    pts.push(...linea({ x: x + 0.05, y: y + 0.13 }, { x: x + 0.16, y: y + 0.13 }, 16, azar));
  }
  pts.push(...linea({ x: 0.23, y: 0.37 }, { x: 0.42, y: 0.62 }, 60, azar));
  pts.push(...linea({ x: 0.77, y: 0.37 }, { x: 0.58, y: 0.62 }, 60, azar));
  pts.push(...linea({ x: 0.38, y: 0.265 }, { x: 0.62, y: 0.265 }, 40, azar));
  for (const c of [
    { x: 0.23, y: 0.37 },
    { x: 0.77, y: 0.37 },
    { x: 0.5, y: 0.62 },
  ]) {
    pts.push(...circulo(c, 0.012, 14, azar, 1));
  }
  return ajustar(pts, n, azar);
}

/** 04 · Componentes: la cuadrícula de piezas, con la del medio elegida. */
function formaComponentes(n: number): P[] {
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
      pts.push(...redondeado(x, y, s, s, 0.02, centro ? 90 : 62, azar));
      if (centro) pts.push(...relleno(x + 0.025, y + 0.025, s - 0.05, s - 0.05, 130, azar));
    }
  }
  return ajustar(pts, n, azar);
}

/** 05 · Tu marca: la chispa de una marca nueva, con otra chica al lado. */
function formaMarca(n: number): P[] {
  const azar = generador(53);
  const pts = [...chispa({ x: 0.45, y: 0.53 }, 0.37, Math.round(n * 0.84), azar), ...chispa({ x: 0.82, y: 0.19 }, 0.09, Math.round(n * 0.16), azar)];
  return ajustar(pts, n, azar);
}

/** 06 · Panel Onvi: el panel con su menú, las cifras, las reservas y la cita abierta. */
function formaPanel(n: number): P[] {
  const azar = generador(71);
  const pts: P[] = [];
  pts.push(...redondeado(0.06, 0.16, 0.88, 0.66, 0.035, 300, azar));
  pts.push(...linea({ x: 0.27, y: 0.16 }, { x: 0.27, y: 0.82 }, 60, azar));
  for (let i = 0; i < 5; i++) pts.push(...linea({ x: 0.1, y: 0.27 + i * 0.07 }, { x: 0.22, y: 0.27 + i * 0.07 }, 12, azar));
  pts.push(...relleno(0.09, 0.325, 0.15, 0.03, 44, azar));
  for (let i = 0; i < 3; i++) pts.push(...redondeado(0.32 + i * 0.2, 0.24, 0.17, 0.1, 0.015, 70, azar));
  for (let i = 0; i < 4; i++) {
    const y = 0.44 + i * 0.085;
    pts.push(...linea({ x: 0.33, y }, { x: 0.33, y: y + 0.05 }, 8, azar));
    pts.push(...linea({ x: 0.36, y: y + 0.012 }, { x: 0.6, y: y + 0.012 }, 22, azar));
    pts.push(...linea({ x: 0.36, y: y + 0.04 }, { x: 0.5, y: y + 0.04 }, 12, azar));
  }
  pts.push(...redondeado(0.67, 0.42, 0.22, 0.34, 0.02, 110, azar));
  pts.push(...circulo({ x: 0.78, y: 0.51 }, 0.04, 40, azar));
  pts.push(...linea({ x: 0.71, y: 0.61 }, { x: 0.85, y: 0.61 }, 14, azar));
  pts.push(...linea({ x: 0.71, y: 0.67 }, { x: 0.82, y: 0.67 }, 12, azar));
  return ajustar(pts, n, azar);
}

const FORMAS = [formaWeb, formaOnvi, formaSoftware, formaComponentes, formaMarca, formaPanel];

/** La nube del principio: polvo suelto, más ancho y más alto que la figura. */
function nube(n: number): P[] {
  const azar = generador(97);
  return Array.from({ length: n }, () => {
    const t = azar() * Math.PI * 2;
    const r = Math.sqrt(azar());
    return { x: 0.5 + Math.cos(t) * r * 0.78, y: 0.5 + Math.sin(t) * r * 1.02 };
  });
}

/** Blanco, como la tiza de jeffmilanes: casi todo brillante, algo gris. */
const TONOS = ["rgba(255, 255, 255, 0.96)", "rgba(255, 255, 255, 0.6)", "rgba(206, 216, 226, 0.34)"];

/** El fondo de la sección: se pinta en vez de borrar para dejar la estela. */
const FONDO = "10, 15, 20";

const pisar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const escalon = (a: number, b: number, v: number) => {
  const t = pisar((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Los dibujos de puntos de jeffmilanes, en blanco: cada pieza es una figura
 * y los puntos viajan de una a otra. La figura se acomoda en `caja` (o en
 * el lienzo entero) y los puntos pueden volar por todo el lienzo. Se
 * detiene fuera de pantalla y, con movimiento reducido, cambia de figura
 * sin viajar.
 */
export default function Puntos({
  senal,
  caja,
  className = "",
}: {
  senal: RefObject<Senal>;
  caja?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const contexto = canvas.getContext("2d");
    if (!contexto) return;
    const ctx: CanvasRenderingContext2D = contexto;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const N = window.matchMedia("(max-width: 767px)").matches ? 1100 : 1500;
    const formas = FORMAS.map((f) => f(N));
    const polvo = nube(N);
    const M = formas.length;
    const azar = generador(5);
    const fase = Array.from({ length: N }, () => azar() * Math.PI * 2);
    const demora = Array.from({ length: N }, () => azar() * 420);
    const tono = Array.from({ length: N }, () => {
      const r = azar();
      return r < 0.58 ? 0 : r < 0.86 ? 1 : 2;
    });
    const tamano = Array.from({ length: N }, () => 1.15 + azar() * 0.85);
    const brillo = Array.from({ length: N }, () => 0.6 + azar() * 1.6);
    // El estallido: cuánto gira cada punto, cuánto se aleja y hacia dónde.
    // Llega a cubrir la pantalla entera antes de volver a juntarse.
    const giro = Array.from({ length: N }, () => (azar() < 0.72 ? 1 : -1) * (0.8 + azar() * 1.6));
    const empuje = Array.from({ length: N }, () => 0.2 + azar() * 1.05);
    const deriva = Array.from({ length: N }, () => {
      const t = azar() * Math.PI * 2;
      const r = 0.04 + azar() * 0.3;
      return { x: Math.cos(t) * r, y: Math.sin(t) * r };
    });

    // Modo "tiempo": de dónde salen, a qué figura van y desde cuándo.
    let desde: P[] = polvo.map((p) => ({ ...p }));
    let destino = -2;
    let hacia: P[] = polvo;
    let t0 = performance.now();
    const DUR = 1100;
    const actual: P[] = polvo.map((p) => ({ ...p }));
    let modoAntes = senal.current?.modo ?? "tiempo";

    let ancho = 0;
    let alto = 0;
    let lado = 0;
    let ox = 0;
    let oy = 0;
    let raf = 0;
    let visible = false;
    let ultimo = "";

    const posiciones = (ahora: number) => {
      const s = senal.current ?? { p: 0, modo: "tiempo" as const };
      if (s.modo !== modoAntes) {
        // Cambió el ancho de la pantalla: sigue desde donde estaban los puntos.
        modoAntes = s.modo;
        desde = actual.map((q) => ({ ...q }));
        destino = -2;
      }

      if (s.modo === "scroll") {
        const p = pisar(s.p, -1, M - 1);
        const k = Math.min(Math.floor(p), M - 2);
        const f = p - k;
        const a = k < 0 ? polvo : formas[k]!;
        const b = formas[k + 1]!;
        const e = quieto ? (f < 0.5 ? 0 : 1) : escalon(0.26, 0.74, f);
        const onda = quieto ? 0 : Math.sin(Math.PI * e);
        for (let i = 0; i < N; i++) {
          let x = a[i]!.x + (b[i]!.x - a[i]!.x) * e;
          let y = a[i]!.y + (b[i]!.y - a[i]!.y) * e;
          if (onda > 0.001) {
            const dx = x - 0.5;
            const dy = y - 0.5;
            const ang = giro[i]! * onda;
            const c = Math.cos(ang);
            const sn = Math.sin(ang);
            const lejos = 1 + empuje[i]! * onda;
            x = 0.5 + (dx * c - dy * sn) * lejos + deriva[i]!.x * onda;
            y = 0.5 + (dx * sn + dy * c) * lejos + deriva[i]!.y * onda;
          }
          if (!quieto) {
            x += Math.sin(ahora * 0.0012 + fase[i]!) * 0.0026;
            y += Math.cos(ahora * 0.001 + fase[i]!) * 0.0026;
          }
          actual[i] = { x, y };
        }
        return onda;
      }

      const objetivo = pisar(Math.round(s.p), 0, M - 1);
      if (objetivo !== destino) {
        desde = actual.map((q) => ({ ...q }));
        hacia = formas[objetivo]!;
        destino = objetivo;
        t0 = ahora;
      }
      for (let i = 0; i < N; i++) {
        let x: number;
        let y: number;
        if (quieto) {
          x = hacia[i]!.x;
          y = hacia[i]!.y;
        } else {
          const e = suave(pisar((ahora - t0 - demora[i]!) / DUR, 0, 1));
          x = desde[i]!.x + (hacia[i]!.x - desde[i]!.x) * e;
          y = desde[i]!.y + (hacia[i]!.y - desde[i]!.y) * e;
          x += Math.sin(ahora * 0.0012 + fase[i]!) * 0.0026;
          y += Math.cos(ahora * 0.001 + fase[i]!) * 0.0026;
        }
        actual[i] = { x, y };
      }
      return 0;
    };

    const dibujar = (ahora: number) => {
      const estela = posiciones(ahora);
      // En el estallido no se borra del todo: queda la estela de los puntos.
      ctx.fillStyle = `rgba(${FONDO}, ${estela > 0.02 ? 1 - 0.7 * estela : 1})`;
      ctx.fillRect(0, 0, ancho, alto);
      // Por color, para no cambiar el pincel en cada punto.
      for (let k = 0; k < TONOS.length; k++) {
        ctx.fillStyle = TONOS[k]!;
        for (let i = 0; i < N; i++) {
          if (tono[i] !== k) continue;
          let s = tamano[i]!;
          if (k === 0 && !quieto) {
            // Algunos destellan un instante, como la tiza al sol.
            const b = Math.sin(ahora * 0.0021 * brillo[i]! + fase[i]! * 3);
            if (b > 0.93) s *= 1 + (b - 0.93) * 14;
          }
          ctx.fillRect(ox + actual[i]!.x * lado - s / 2, oy + actual[i]!.y * lado - s / 2, s, s);
        }
      }
    };

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = r.width;
      alto = r.height;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = caja?.current?.getBoundingClientRect();
      const bx = c ? c.left - r.left : 0;
      const by = c ? c.top - r.top : 0;
      const bw = c ? c.width : ancho;
      const bh = c ? c.height : alto;
      lado = Math.max(0, Math.min(bw, bh));
      ox = bx + (bw - lado) / 2;
      oy = by + (bh - lado) / 2;
      ultimo = "";
      dibujar(performance.now());
    };

    const cuadro = (ahora: number) => {
      if (quieto) {
        // Quieto: se vuelve a pintar solo si cambió la figura.
        const s = senal.current;
        const clave = s ? `${s.modo}:${s.modo === "scroll" ? (s.p - Math.floor(s.p) < 0.5 ? Math.floor(s.p) : Math.floor(s.p) + 1) : Math.round(s.p)}` : "";
        if (clave !== ultimo) {
          ultimo = clave;
          dibujar(ahora);
        }
      } else {
        dibujar(ahora);
      }
      raf = visible && !document.hidden ? requestAnimationFrame(cuadro) : 0;
    };

    const arrancar = () => {
      if (raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(cuadro);
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    if (caja?.current) ro.observe(caja.current);
    let primeraVez = true;
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      // La primera vez que se ve, los puntos se juntan desde la nube.
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
    };
  }, [senal, caja]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
