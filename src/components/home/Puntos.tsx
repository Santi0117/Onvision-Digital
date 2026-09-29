"use client";

import { useEffect, useRef, type RefObject } from "react";
import { OJO_D } from "../od/ui";

/**
 * Lo que manda sobre los puntos, leído en cada cuadro (sin renders): `p` es
 * la pieza que se lee (con decimales). Antes de la primera (p < -0.5) se ve
 * el globo del principio.
 */
export type Senal = { p: number };

type Azar = () => number;
type Par = [number, number];

/** Azar con semilla: las figuras salen iguales en cada visita. */
function generador(semilla: number): Azar {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/* ── Trazos: cada figura es una lista de trazos en un cuadro de 0 a 1 ──── */

/** Un trazo con su largo; `en(t)` da el punto a esa fracción del recorrido. */
type Trazo = { largo: number; en: (t: number, azar: Azar) => Par };

const seg = (x1: number, y1: number, x2: number, y2: number): Trazo => ({
  largo: Math.hypot(x2 - x1, y2 - y1),
  en: (t) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t],
});

const poli = (...p: Par[]): Trazo[] => p.slice(1).map((b, i) => seg(p[i]![0], p[i]![1], b[0], b[1]));

const aro = (cx: number, cy: number, r: number): Trazo => ({
  largo: 2 * Math.PI * r,
  en: (t) => [cx + Math.cos(t * 2 * Math.PI) * r, cy + Math.sin(t * 2 * Math.PI) * r],
});

/** Rectángulo de esquinas redondeadas, recorrido por su borde. */
function caja(x: number, y: number, w: number, h: number, r: number): Trazo {
  const tw = w - 2 * r;
  const th = h - 2 * r;
  const arco = (Math.PI / 2) * r;
  const largo = 2 * tw + 2 * th + 4 * arco;
  const esquina = (cx: number, cy: number, desde: number, d: number): Par => {
    const a = desde + d / r;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  return {
    largo,
    en: (t) => {
      let d = t * largo;
      if (d < tw) return [x + r + d, y];
      d -= tw;
      if (d < arco) return esquina(x + w - r, y + r, -Math.PI / 2, d);
      d -= arco;
      if (d < th) return [x + w, y + r + d];
      d -= th;
      if (d < arco) return esquina(x + w - r, y + h - r, 0, d);
      d -= arco;
      if (d < tw) return [x + w - r - d, y + h];
      d -= tw;
      if (d < arco) return esquina(x + r, y + h - r, Math.PI / 2, d);
      d -= arco;
      if (d < th) return [x, y + h - r - d];
      d -= th;
      return esquina(x + r, y + r, Math.PI, Math.min(d, arco));
    },
  };
}

/** Destello de cuatro puntas (astroide), recorrido parejo por su borde. */
function destello(cx: number, cy: number, r: number): Trazo {
  return {
    largo: 6 * r,
    en: (t) => {
      // En cada cuarto el largo recorrido crece como sen²: así queda parejo.
      const q = Math.min(3, Math.floor(t * 4));
      const a = (q * Math.PI) / 2 + Math.asin(Math.sqrt(Math.min(1, t * 4 - q)));
      return [cx + r * Math.cos(a) ** 3, cy + r * Math.sin(a) ** 3];
    },
  };
}

/** Relleno de un destello, más denso cerca del borde (como el corazón de jeffmilanes). */
function destelloLleno(cx: number, cy: number, r: number, peso: number): Trazo {
  return {
    largo: peso,
    en: (_t, azar) => {
      const a = azar() * Math.PI * 2;
      const borde = 1 / Math.pow(Math.abs(Math.cos(a)) ** (2 / 3) + Math.abs(Math.sin(a)) ** (2 / 3), 1.5);
      const k = borde * Math.pow(azar(), 0.4);
      return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
    },
  };
}

/**
 * Reparte n puntos por los trazos según su largo, en orden y parejos (un
 * punto por tramo, apenas movido). Así la línea sale continua, sin grumos
 * ni huecos, y al pasar de una figura a otra cada trazo se desliza hacia
 * el trazo que le toca. z: un poco de profundidad para el giro en 3D.
 */
function repartir(trazos: Trazo[], n: number, azar: Azar): Float32Array {
  const total = trazos.reduce((s, t) => s + t.largo, 0);
  const out = new Float32Array(n * 3);
  let k = 0;
  let acumulado = 0;
  trazos.forEach((trazo, j) => {
    acumulado += trazo.largo;
    const hasta = j === trazos.length - 1 ? n : Math.round((acumulado / total) * n);
    const cuantos = hasta - k;
    for (let i = 0; i < cuantos; i++) {
      const [x, y] = trazo.en((i + 0.2 + azar() * 0.6) / cuantos, azar);
      out[k * 3] = x + (azar() - 0.5) * 0.003;
      out[k * 3 + 1] = y + (azar() - 0.5) * 0.003;
      out[k * 3 + 2] = (azar() - 0.5) * 0.05;
      k++;
    }
  });
  return out;
}

/* ── Las seis figuras ─────────────────────────────────────────────────── */

/** 01 · Páginas web: la ventana del navegador con tu sitio. */
function web(): Trazo[] {
  return [
    caja(0.08, 0.2, 0.84, 0.6, 0.035),
    seg(0.08, 0.3, 0.92, 0.3),
    aro(0.13, 0.25, 0.012),
    aro(0.165, 0.25, 0.012),
    aro(0.2, 0.25, 0.012),
    caja(0.3, 0.233, 0.44, 0.034, 0.017),
    seg(0.14, 0.39, 0.46, 0.39),
    seg(0.14, 0.405, 0.46, 0.405),
    seg(0.14, 0.47, 0.42, 0.47),
    seg(0.14, 0.52, 0.45, 0.52),
    seg(0.14, 0.57, 0.37, 0.57),
    caja(0.14, 0.64, 0.15, 0.06, 0.03),
    caja(0.54, 0.38, 0.31, 0.34, 0.02),
    aro(0.785, 0.46, 0.03),
    ...poli([0.56, 0.69], [0.64, 0.55], [0.7, 0.63], [0.75, 0.57], [0.83, 0.69]),
  ];
}

/** 02 · Onvi: el ojo de Onvision, del mismo vector del logo (borde parejo y un relleno liviano). */
function onvi(): Trazo[] {
  const k = 0.84 / 100;
  const ox = 0.08;
  const oy = 0.5 - (56 * k) / 2;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", OJO_D);
  svg.appendChild(path);
  document.body.appendChild(svg);
  try {
    const largo = path.getTotalLength();
    const muestras = Array.from({ length: 1600 }, (_, i) => path.getPointAtLength((i / 1600) * largo));
    const borde: Trazo = {
      largo: largo * k,
      en: (t) => {
        const q = muestras[Math.min(muestras.length - 1, Math.floor(t * muestras.length))]!;
        return [ox + q.x * k, oy + q.y * k];
      },
    };
    // Adentro del logo (con la pupila hueca), para que se lea lleno.
    const contexto = document.createElement("canvas").getContext("2d");
    const figura = new Path2D(OJO_D);
    const lleno: Trazo = {
      largo: largo * k * 0.2,
      en: (_t, azar) => {
        for (let i = 0; i < 60; i++) {
          const x = azar() * 100;
          const y = azar() * 56;
          if (!contexto || contexto.isPointInPath(figura, x, y, "evenodd")) return [ox + x * k, oy + y * k];
        }
        return borde.en(azar(), azar);
      },
    };
    return [borde, lleno];
  } catch {
    return [aro(0.5, 0.5, 0.3)];
  } finally {
    svg.remove();
  }
}

/** 03 · Software: tres módulos del sistema, conectados. */
function software(): Trazo[] {
  const t: Trazo[] = [];
  for (const [x, y] of [
    [0.08, 0.13],
    [0.62, 0.13],
    [0.35, 0.6],
  ] as const) {
    t.push(caja(x, y, 0.3, 0.23, 0.02), seg(x, y + 0.055, x + 0.3, y + 0.055));
    t.push(aro(x + 0.03, y + 0.028, 0.008), aro(x + 0.053, y + 0.028, 0.008));
    t.push(seg(x + 0.04, y + 0.105, x + 0.22, y + 0.105), seg(x + 0.04, y + 0.16, x + 0.15, y + 0.16));
  }
  t.push(seg(0.38, 0.245, 0.62, 0.245));
  t.push(...poli([0.23, 0.36], [0.23, 0.48], [0.43, 0.48], [0.43, 0.6]));
  t.push(...poli([0.77, 0.36], [0.77, 0.48], [0.57, 0.48], [0.57, 0.6]));
  for (const [x, y] of [
    [0.23, 0.36],
    [0.77, 0.36],
    [0.43, 0.6],
    [0.57, 0.6],
  ] as const) {
    t.push(aro(x, y, 0.013));
  }
  return t;
}

/** 04 · Componentes: una calculadora, con su pantalla y sus teclas. */
function componentes(): Trazo[] {
  const t: Trazo[] = [caja(0.28, 0.08, 0.44, 0.84, 0.045), caja(0.33, 0.14, 0.34, 0.15, 0.02)];
  t.push(seg(0.47, 0.235, 0.62, 0.235), seg(0.56, 0.19, 0.62, 0.19));
  for (let f = 0; f < 4; f++) {
    for (let c = 0; c < 3; c++) t.push(aro(0.375 + c * 0.125, 0.4 + f * 0.135, 0.04));
  }
  return t;
}

/** 05 · Tu marca: el destello de una marca nueva, con otro chico al lado. */
function marca(): Trazo[] {
  return [destello(0.45, 0.54, 0.38), destello(0.45, 0.54, 0.2), destelloLleno(0.45, 0.54, 0.38, 0.5), destello(0.83, 0.18, 0.1)];
}

/** 06 · Panel Onvi: el panel con su menú, las cifras, el gráfico y la cita abierta. */
function panel(): Trazo[] {
  const t: Trazo[] = [caja(0.06, 0.16, 0.88, 0.66, 0.03), seg(0.26, 0.16, 0.26, 0.82), aro(0.13, 0.235, 0.02)];
  for (let i = 0; i < 4; i++) t.push(seg(0.1, 0.33 + i * 0.07, 0.21, 0.33 + i * 0.07));
  for (let i = 0; i < 3; i++) {
    const x = 0.31 + i * 0.205;
    t.push(caja(x, 0.22, 0.175, 0.11, 0.015), seg(x + 0.025, 0.29, x + 0.1, 0.29));
  }
  t.push(...poli([0.32, 0.72], [0.39, 0.62], [0.45, 0.66], [0.52, 0.52], [0.58, 0.58], [0.64, 0.46]));
  t.push(seg(0.31, 0.76, 0.65, 0.76));
  t.push(caja(0.69, 0.4, 0.2, 0.36, 0.02), aro(0.79, 0.49, 0.035), seg(0.72, 0.6, 0.86, 0.6), seg(0.72, 0.65, 0.83, 0.65));
  t.push(caja(0.72, 0.69, 0.14, 0.04, 0.02));
  return t;
}

const FIGURAS = [web, onvi, software, componentes, marca, panel];

/** El globo del principio: puntos parejos sobre una esfera que gira. */
function globo(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const r = 0.36;
  const dorado = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const radio = Math.sqrt(1 - y * y);
    out[i * 3] = 0.5 + Math.cos(i * dorado) * radio * r;
    out[i * 3 + 1] = 0.5 + y * r;
    out[i * 3 + 2] = Math.sin(i * dorado) * radio * r;
  }
  return out;
}

/** Distancia de la cámara (en lados del cuadro) para la perspectiva del giro. */
const CAMARA = 2.2;
/** Hasta dónde llega el cursor (o el dedo) y cuánto empuja, como en jeffmilanes. */
const RADIO = 0.21;
const FUERZA = 0.16 * RADIO;

const pisar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Los dibujos de puntos de jeffmilanes, en blanco: cada pieza es una figura
 * y los puntos saltan de una a otra en un cuarto de segundo (se acercan con
 * una curva exponencial, todos a la vez). El cursor, o el dedo en el
 * celular, abre un hueco: los puntos cercanos se apartan y vuelven solos.
 * La figura gira apenas en 3D y se inclina hacia el cursor. Los puntos se
 * pintan alineados a los píxeles de la pantalla, así quedan nítidos. Se
 * detiene fuera de pantalla y, con movimiento reducido, cambia de figura
 * sin viajar ni girar.
 */
export default function Puntos({
  senal,
  caja: cajaRef,
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

    const N = window.matchMedia("(max-width: 767px)").matches ? 1100 : 1400;
    const figuras = FIGURAS.map((f, i) => repartir(f(), N, generador(31 + i * 17)));
    const GLOBO = figuras.length;
    figuras.push(globo(N));

    // Dónde está cada punto (en lados del cuadro), cuánto lo corrió el cursor y su profundidad.
    const gx = new Float32Array(N);
    const gy = new Float32Array(N);
    const gz = new Float32Array(N);
    const ux = new Float32Array(N);
    const uy = new Float32Array(N);
    const inicio = figuras[GLOBO]!;
    for (let i = 0; i < N; i++) {
      gx[i] = inicio[i * 3]!;
      gy[i] = inicio[i * 3 + 1]!;
    }

    // Dónde está el cursor o el dedo: en la ventana y respecto del lienzo (se mide al moverse, no en cada cuadro).
    const puntero = { cx: 0, cy: 0, rx: 0, ry: 0, activo: false, dedo: false };
    const giro = { x: 0, y: 0 };
    let dpr = 1;
    let lado = 1;
    let ox = 0;
    let oy = 0;
    let tam = 2;
    let raf = 0;
    let visible = false;
    let antes = 0;
    let ultimo = -1;
    let esGlobo = true;

    const objetivo = () => {
      const p = senal.current?.p ?? -1;
      return p < -0.5 ? GLOBO : pisar(Math.round(p), 0, GLOBO - 1);
    };

    const mover = (ahora: number, dt: number) => {
      const k = objetivo();
      const f = figuras[k]!;
      const t = ahora / 1000;
      const k60 = dt * 60;
      // Curva exponencial un poco más rápida que la de jeffmilanes: casi armada a los 0,25 s.
      const v = quieto ? 1 : 1 - Math.pow(0.0004, dt);
      const decae = Math.pow(0.88, k60);

      // El puntero, en lados del cuadro.
      const px = (puntero.rx - ox) / lado;
      const py = (puntero.ry - oy) / lado;
      const activo = puntero.activo && !quieto;
      const inclina = activo && !puntero.dedo;

      // El giro: vaivén lento y, con el cursor, un poco hacia él. El globo, además, rota.
      const haciaY = quieto ? 0 : 0.26 * Math.sin(0.3 * t) + (inclina ? pisar(px - 0.5, -0.6, 0.6) * 0.22 : 0);
      const haciaX = inclina ? pisar(py - 0.5, -0.6, 0.6) * -0.18 : 0;
      giro.y += (haciaY - giro.y) * Math.min(1, 0.05 * k60);
      giro.x += (haciaX - giro.x) * Math.min(1, 0.05 * k60);
      esGlobo = k === GLOBO;
      const ry = giro.y + (esGlobo && !quieto ? t * 0.35 : 0);
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx = Math.cos(giro.x);
      const sx = Math.sin(giro.x);
      const escala = quieto ? 1 : 1 + Math.sin(1.2 * t) * 0.012;

      for (let i = 0; i < N; i++) {
        const x0 = (f[i * 3]! - 0.5) * escala;
        const y0 = (f[i * 3 + 1]! - 0.5) * escala;
        const z0 = f[i * 3 + 2]! * escala;
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y1 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const pk = CAMARA / (CAMARA - z2);
        const X = 0.5 + x1 * pk;
        const Y = 0.5 + y1 * pk;

        let dx = ux[i]! * decae;
        let dy = uy[i]! * decae;
        if (activo) {
          const ex = gx[i]! - px;
          const ey = gy[i]! - py;
          const d2 = ex * ex + ey * ey;
          if (d2 < RADIO * RADIO && d2 > 1e-7) {
            const d = Math.sqrt(d2);
            const s = (1 - d / RADIO) * FUERZA * k60;
            dx += (ex / d) * s;
            dy += (ey / d) * s;
          }
        }
        ux[i] = dx;
        uy[i] = dy;
        gx[i] = gx[i]! + (X + dx - gx[i]!) * v;
        gy[i] = gy[i]! + (Y + dy - gy[i]!) * v;
        gz[i] = z2;
      }
    };

    const pintar = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      const medio = tam / 2;
      // Blancos; en el globo, los de la cara de atrás más apagados.
      for (let pasada = 0; pasada < (esGlobo ? 2 : 1); pasada++) {
        ctx.fillStyle = pasada === 0 ? "rgba(255, 255, 255, 0.9)" : "rgba(200, 220, 232, 0.4)";
        for (let i = 0; i < N; i++) {
          if (esGlobo && gz[i]! < -0.06 !== (pasada === 1)) continue;
          const x = Math.round((ox + gx[i]! * lado) * dpr - medio);
          const y = Math.round((oy + gy[i]! * lado) * dpr - medio);
          ctx.fillRect(x, y, tam, tam);
        }
      }
    };

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      const c = cajaRef?.current?.getBoundingClientRect();
      const bx = c ? c.left - r.left : 0;
      const by = c ? c.top - r.top : 0;
      const bw = c ? c.width : r.width;
      const bh = c ? c.height : r.height;
      lado = Math.max(1, Math.min(bw, bh));
      ox = bx + (bw - lado) / 2;
      oy = by + (bh - lado) / 2;
      // Puntos chicos y enteros en píxeles de pantalla: nítidos en cualquier celular.
      tam = Math.max(2, Math.round(1.45 * dpr));
      ultimo = -1;
      if (quieto) mover(performance.now(), 1);
      pintar();
    };

    const cuadro = (ahora: number) => {
      const dt = pisar((ahora - (antes || ahora)) / 1000, 0, 0.05);
      antes = ahora;
      if (quieto) {
        // Quieto: se vuelve a pintar solo si cambió la figura.
        const k = objetivo();
        if (k !== ultimo) {
          ultimo = k;
          mover(ahora, 1);
          pintar();
        }
      } else {
        mover(ahora, dt);
        pintar();
      }
      raf = visible && !document.hidden ? requestAnimationFrame(cuadro) : 0;
    };

    const arrancar = () => {
      if (raf || !visible || document.hidden) return;
      antes = 0;
      raf = requestAnimationFrame(cuadro);
    };

    // El cursor (compu) o el dedo (celular) sobre los puntos.
    const ubicar = () => {
      const r = canvas.getBoundingClientRect();
      puntero.rx = puntero.cx - r.left;
      puntero.ry = puntero.cy - r.top;
      puntero.activo = puntero.rx >= 0 && puntero.rx <= r.width && puntero.ry >= 0 && puntero.ry <= r.height;
    };
    const alMover = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      puntero.cx = e.clientX;
      puntero.cy = e.clientY;
      puntero.dedo = false;
      ubicar();
    };
    const alTocar = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      puntero.cx = t.clientX;
      puntero.cy = t.clientY;
      puntero.dedo = true;
      ubicar();
    };
    const alSoltar = () => {
      puntero.activo = false;
    };
    // Con la rueda el lienzo se mueve bajo el cursor quieto.
    const alBajar = () => {
      if (puntero.activo && !puntero.dedo) ubicar();
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    if (cajaRef?.current) ro.observe(cajaRef.current);
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      arrancar();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", arrancar);
    window.addEventListener("pointermove", alMover, { passive: true });
    window.addEventListener("scroll", alBajar, { passive: true });
    document.documentElement.addEventListener("pointerleave", alSoltar);
    window.addEventListener("touchstart", alTocar, { passive: true });
    window.addEventListener("touchmove", alTocar, { passive: true });
    window.addEventListener("touchend", alSoltar, { passive: true });
    window.addEventListener("touchcancel", alSoltar, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", arrancar);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("scroll", alBajar);
      document.documentElement.removeEventListener("pointerleave", alSoltar);
      window.removeEventListener("touchstart", alTocar);
      window.removeEventListener("touchmove", alTocar);
      window.removeEventListener("touchend", alSoltar);
      window.removeEventListener("touchcancel", alSoltar);
    };
  }, [senal, cajaRef]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
