import type { VisionDemo } from "@/lib/web";

/**
 * Viñetas de la pupila, en blanco: un libro que se abre, la esfera,
 * la grilla de puntos, el disco con resorte y el ecualizador.
 * Canvas de `s` px, centradas, tiempo `t` en segundos.
 */

const TAU = Math.PI * 2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const inOutCubic = (v: number) => {
  const x = clamp01(v);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const inOutQuad = (v: number) => {
  const x = clamp01(v);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

/** Como `draw: ['0 0', '0 1', '1 1']`: entra el trazo y luego se borra desde el inicio. */
function drawWindow(u: number): [number, number] {
  const x = ((u % 1) + 1) % 1;
  if (x < 0.34) return [0, inOutCubic(x / 0.34)];
  if (x < 0.66) return [0, 1];
  return [inOutCubic((x - 0.66) / 0.34), 1];
}

type Pt = { x: number; y: number };

function strokeRange(ctx: CanvasRenderingContext2D, pts: Pt[], start: number, end: number) {
  const n = pts.length - 1;
  if (n < 2 || end - start < 0.01) return;
  const a = clamp01(start) * n;
  const b = clamp01(end) * n;
  const at = (i: number, f: number) => {
    const p = pts[Math.min(n, i)];
    const q = pts[Math.min(n, i + 1)];
    return { x: lerp(p.x, q.x, f), y: lerp(p.y, q.y, f) };
  };
  const i0 = Math.floor(a);
  const i1 = Math.ceil(b);
  ctx.beginPath();
  const p0 = at(i0, a - i0);
  ctx.moveTo(p0.x, p0.y);
  for (let i = i0 + 1; i < i1 && i <= n; i++) ctx.lineTo(pts[i].x, pts[i].y);
  const p1 = at(Math.floor(b), b - Math.floor(b));
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
}

function roundSq(ctx: CanvasRenderingContext2D, s: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(-s / 2, -s / 2, s, s, r);
}

/* ------------------------------------------------------------------ */

/** Libro cerrado que se abre, muestra las páginas y se vuelve a cerrar. */
function factura(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) {
  const cycle = 4.2;
  const u = t <= 0 ? 0.55 : (t % cycle) / cycle;
  let k = 0;
  if (u < 0.16) k = 0;
  else if (u < 0.42) k = inOutCubic((u - 0.16) / 0.26);
  else if (u < 0.68) k = 1;
  else if (u < 0.9) k = 1 - inOutCubic((u - 0.68) / 0.22);
  const h = 156;
  const page = lerp(24, 108, k);
  const base = ctx.globalAlpha;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  const pageFill = (x: number, w: number, radii: number[]) => {
    ctx.beginPath();
    ctx.roundRect(x, -h / 2, w, h, radii);
  };

  ctx.globalAlpha = base * (1 - k * 0.82);
  pageFill(-page, page, [12, 2, 2, 12]);
  ctx.fill();
  pageFill(0, page, [2, 12, 12, 2]);
  ctx.fill();

  ctx.globalAlpha = base;
  ctx.lineWidth = 2.6;
  pageFill(-page, page, [12, 2, 2, 12]);
  ctx.stroke();
  pageFill(0, page, [2, 12, 12, 2]);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2 + 6);
  ctx.lineTo(0, h / 2 - 6);
  ctx.stroke();

  if (k > 0.04) {
    ctx.globalAlpha = base * k;
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      const y = -42 + i * 26;
      const inset = 18;
      const reach = Math.max(8, page - inset);
      ctx.beginPath();
      ctx.moveTo(-reach, y);
      ctx.lineTo(-inset + 4, y);
      ctx.moveTo(inset - 4, y);
      ctx.lineTo(reach, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Esfera completa, de muchas líneas. Gira todo el tiempo y cada aro
 * se traza y se borra en desfase, como createDrawable.
 */
function inventario(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) {
  const R = 170;
  const tilt = 0.74;
  const lean = -0.34;
  const spin = t * 0.7;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const cl = Math.cos(lean);
  const sl = Math.sin(lean);
  const steps = 72;

  const project = (x: number, y: number, z: number): Pt => {
    const x0 = x * cs + z * ss;
    const z0 = -x * ss + z * cs;
    const y1 = y * ct - z0 * st;
    const sx = x0 * R;
    const sy = -y1 * R;
    return { x: cx + sx * cl - sy * sl, y: cy + sx * sl + sy * cl };
  };

  const ring = (fn: (u: number) => Pt) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= steps; i++) pts.push(fn(i / steps));
    return pts;
  };

  const rings: Pt[][] = [];
  const lats = 12;
  for (let i = 0; i < lats; i++) {
    const lat = -1.25 + (i / (lats - 1)) * 2.5;
    const cLat = Math.cos(lat);
    const sLat = Math.sin(lat);
    rings.push(ring((u) => project(cLat * Math.cos(u * TAU), sLat, cLat * Math.sin(u * TAU))));
  }
  const lons = 10;
  for (let i = 0; i < lons; i++) {
    const phi = (i / lons) * Math.PI;
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);
    rings.push(
      ring((u) => {
        const cu = Math.cos(u * TAU);
        return project(cu * cp, Math.sin(u * TAU), cu * sp);
      }),
    );
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  const base = ctx.globalAlpha;
  const cycle = 3.4;
  rings.forEach((pts, i) => {
    const u = t <= 0 ? 0.5 : (t / cycle - i * 0.028) % 1;
    const [a, b] = t <= 0 ? [0, 1] : drawWindow(u < 0 ? u + 1 : u);
    ctx.globalAlpha = base * 0.14;
    ctx.lineWidth = 3.4;
    strokeRange(ctx, pts, a, b);
    ctx.globalAlpha = base * 0.92;
    ctx.lineWidth = 1.55;
    strokeRange(ctx, pts, a, b);
  });
  ctx.globalAlpha = base;
}

/** Grilla circular. El tamaño viaja desde el centro hacia afuera. */
function sinpe(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) {
  const N = 13;
  const gap = 30;
  const mid = (N - 1) / 2;
  const u = ((t / 2.15) % 1 + 1) % 1;
  ctx.fillStyle = color;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const dx = c - mid;
      const dy = r - mid;
      const dist = Math.hypot(dx, dy) / mid;
      if (dist > 1.02) continue;
      const local = (u - dist * 0.55 + 1) % 1;
      const pulse = Math.sin(local * Math.PI);
      const rad = lerp(12.6, 8.2, dist) * lerp(0.58, 1.32, pulse);
      ctx.beginPath();
      ctx.arc(cx + dx * gap, cy + dy * gap, rad, 0, TAU);
      ctx.fill();
    }
  }
}

/** Disco que se suelta y vuelve con resorte, una y otra vez. */
function onvi(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) {
  const cycle = 2.7;
  const u = t <= 0 ? cycle : t % cycle;
  const attack = inOutQuad(clamp01(u / 0.16));
  const release = Math.max(0, u - 0.16);
  const osc = attack * Math.exp(-1.65 * release) * Math.cos(10.5 * release);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx + osc * 34, cy - osc * 16, 112 * (1 + 0.18 * osc), 0, TAU);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.setLineDash([7, 9]);
  ctx.beginPath();
  ctx.arc(cx, cy, 156 * (1 + 0.1 * osc), 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** Barras de un ecualizador, más altas hacia el centro. */
function verticales(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) {
  const bars = 7;
  const bw = 26;
  const gap = 16;
  const total = bars * bw + (bars - 1) * gap;
  const x0 = cx - total / 2;
  ctx.fillStyle = color;
  for (let i = 0; i < bars; i++) {
    const mid = 1 - Math.abs(i / (bars - 1) - 0.5) * 2;
    const a = 0.5 + 0.5 * Math.sin(t * (2.4 + (i % 3) * 0.85) + i * 0.95);
    const b = 0.5 + 0.5 * Math.sin(t * (4.1 + i * 0.22) + i * 1.6);
    const c = 0.5 + 0.5 * Math.sin(t * 1.35 + i * 0.55);
    const e = clamp01(0.12 + mid * 0.22 + a * 0.38 + b * 0.22 + c * 0.1);
    const h = lerp(28, 176, e);
    ctx.beginPath();
    ctx.roundRect(x0 + i * (bw + gap), cy - h / 2, bw, h, bw / 2);
    ctx.fill();
  }
}

/** Cuadrícula que palpita desde el centro. */
function tienda(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) {
  const N = 3;
  const size = 68;
  const gap = 16;
  const total = N * size + (N - 1) * gap;
  const x0 = cx - total / 2;
  const y0 = cy - total / 2;
  const mid = (N - 1) / 2;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const dist = Math.hypot(c - mid, r - mid);
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 - dist * 1.2);
      const sc = lerp(0.82, 1.18, pulse);
      ctx.save();
      ctx.translate(x0 + c * (size + gap) + size / 2, y0 + r * (size + gap) + size / 2);
      ctx.scale(sc, sc);
      roundSq(ctx, size, 14);
      if ((r + c) % 2 === 0) ctx.fill();
      else ctx.stroke();
      ctx.restore();
    }
  }
}

/* ------------------------------------------------------------------ */

const DEMOS: Record<VisionDemo, typeof factura> = {
  factura,
  inventario,
  sinpe,
  onvi,
  verticales,
  tienda,
};

export function drawDemo(
  ctx: CanvasRenderingContext2D,
  kind: VisionDemo,
  s: number,
  t: number,
  color: string,
  alpha: number,
) {
  if (alpha <= 0.005) return;
  const cx = s / 2;
  const cy = s / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.47, 0, TAU);
  ctx.clip();
  DEMOS[kind](ctx, cx, cy, t, color);
  ctx.restore();
}
