import type { Colores, Cortina } from "./datos";

/**
 * La cortina que repinta el fondo al cambiar de pieza: va en un canvas entre
 * el fondo y el contenido, así que las tarjetas y los textos siguen a la
 * vista mientras el fondo nuevo entra. Primero pasa el color de borde y, un
 * poco atrás, el fondo plano de la escena nueva; cuando cubrió todo, la
 * escena cambia debajo y el canvas se limpia.
 *
 * Todo crece de forma monótona: cada cuadro se pinta encima del anterior sin
 * borrar, y una cortina nueva a mitad de camino simplemente pinta encima.
 */

export type Pintura = {
  tipo: Cortina;
  colores: Colores;
  /** Hacia adelante (bajando) o hacia atrás. */
  adelante: boolean;
  /** Centro del iris, en px del escenario. */
  cx: number;
  cy: number;
  /** Umbral al azar de cada celda de los píxeles. */
  azar: Float32Array;
};

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const suave = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

type Medidas = { crece: number; paso: number; atras: number; tiras: number };

function medidas(tipo: Cortina, movil: boolean): Medidas {
  switch (tipo) {
    case "marcador":
      return { crece: 400, paso: 44, atras: 95, tiras: movil ? 6 : 7 };
    case "pixeles":
      return { crece: 480, paso: 0, atras: 150, tiras: 0 };
    case "persianas":
      return { crece: 420, paso: 34, atras: 80, tiras: movil ? 6 : 8 };
    case "iris":
      return { crece: 600, paso: 0, atras: 110, tiras: 0 };
    default:
      return { crece: 400, paso: 36, atras: 90, tiras: movil ? 5 : 8 };
  }
}

/** Cuánto dura la cortina completa, en ms. */
export function duracion(tipo: Cortina, movil: boolean) {
  const m = medidas(tipo, movil);
  return Math.max(0, m.tiras - 1) * m.paso + m.atras + m.crece;
}

/** Tamaño de celda de los píxeles. */
export const celda = (movil: boolean) => (movil ? 30 : 44);

type Ctx = CanvasRenderingContext2D;

function redondo(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

/** Barras verticales que suben (o bajan, hacia atrás) una tras otra. */
function barras(ctx: Ctx, w: number, h: number, t: number, p: Pintura, m: Medidas) {
  const n = m.tiras;
  for (const [color, retraso] of [
    [p.colores.borde, 0],
    [p.colores.fondo, m.atras],
  ] as const) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const k = p.adelante ? i : n - 1 - i;
      const e = suave(c01((t - k * m.paso - retraso) / m.crece));
      if (e <= 0) continue;
      const x0 = Math.floor((i * w) / n);
      const x1 = Math.ceil(((i + 1) * w) / n) + 1;
      const alto = h * e;
      ctx.fillRect(x0, p.adelante ? h - alto : 0, x1 - x0, alto);
    }
  }
}

/** Trazos de resaltador de lado a lado, en zigzag como quien colorea. */
function marcador(ctx: Ctx, w: number, h: number, t: number, p: Pintura, m: Medidas) {
  const n = m.tiras;
  const fila = h / n;
  const grueso = fila * 1.3;
  for (const [color, retraso] of [
    [p.colores.borde, 0],
    [p.colores.fondo, m.atras],
  ] as const) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const k = p.adelante ? i : n - 1 - i;
      const e = suave(c01((t - k * m.paso - retraso) / m.crece));
      if (e <= 0) continue;
      const largo = e * (w + grueso * 2);
      const y = (i + 0.5) * fila - grueso / 2;
      const deIzq = i % 2 === 0;
      redondo(ctx, deIzq ? -grueso : w + grueso - largo, y, largo, grueso, grueso / 2);
    }
  }
}

/** Celdas que se prenden al azar, barriendo de un lado al otro, a saltos. */
function pixeles(ctx: Ctx, w: number, h: number, t: number, p: Pintura, m: Medidas, movil: boolean) {
  const lado = celda(movil);
  const cols = Math.ceil(w / lado);
  const filas = Math.ceil(h / lado);
  const saltos = 12;
  for (const [color, retraso] of [
    [p.colores.borde, 0],
    [p.colores.fondo, m.atras],
  ] as const) {
    const avance = Math.floor(c01((t - retraso) / m.crece) * saltos) / saltos;
    if (avance <= 0) continue;
    ctx.fillStyle = color;
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        const lado01 = cols > 1 ? x / (cols - 1) : 0;
        const barrido = p.adelante ? lado01 : 1 - lado01;
        const umbral = 0.55 * (p.azar[(y * cols + x) % p.azar.length] ?? 0) + 0.45 * barrido;
        if (umbral < avance * 1.001) ctx.fillRect(x * lado, y * lado, lado, lado);
      }
    }
  }
}

/** Persianas horizontales que se corren de lado, de arriba hacia abajo. */
function persianas(ctx: Ctx, w: number, h: number, t: number, p: Pintura, m: Medidas) {
  const n = m.tiras;
  for (const [color, retraso] of [
    [p.colores.borde, 0],
    [p.colores.fondo, m.atras],
  ] as const) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const k = p.adelante ? i : n - 1 - i;
      const e = suave(c01((t - k * m.paso - retraso) / m.crece));
      if (e <= 0) continue;
      const y0 = Math.floor((i * h) / n);
      const y1 = Math.ceil(((i + 1) * h) / n) + 1;
      const ancho = w * e;
      ctx.fillRect(p.adelante ? 0 : w - ancho, y0, ancho, y1 - y0);
    }
  }
}

/** Un ojo que se abre desde la tarjeta hasta cubrir todo. */
function iris(ctx: Ctx, w: number, h: number, t: number, p: Pintura, m: Medidas) {
  const dx = Math.max(p.cx, w - p.cx);
  const dy = Math.max(p.cy, h - p.cy);
  // Con medio ancho 2·dx, el borde del ojo pasa por las esquinas con alto 1,31·dy.
  const A = dx * 2.05;
  const B = dy * 1.45;
  for (const [color, retraso] of [
    [p.colores.borde, 0],
    [p.colores.fondo, m.atras],
  ] as const) {
    const e = suave(c01((t - retraso) / m.crece));
    if (e <= 0) continue;
    const a = A * e;
    const b = B * e;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(p.cx - a, p.cy);
    ctx.quadraticCurveTo(p.cx, p.cy - b * 2, p.cx + a, p.cy);
    ctx.quadraticCurveTo(p.cx, p.cy + b * 2, p.cx - a, p.cy);
    ctx.fill();
  }
}

/** Pinta el instante t (ms). Devuelve true cuando ya cubrió todo el escenario. */
export function pintar(ctx: Ctx, w: number, h: number, t: number, p: Pintura, movil: boolean) {
  const m = medidas(p.tipo, movil);
  if (t >= duracion(p.tipo, movil)) {
    ctx.fillStyle = p.colores.fondo;
    ctx.fillRect(0, 0, w, h);
    return true;
  }
  switch (p.tipo) {
    case "marcador":
      marcador(ctx, w, h, t, p, m);
      break;
    case "pixeles":
      pixeles(ctx, w, h, t, p, m, movil);
      break;
    case "persianas":
      persianas(ctx, w, h, t, p, m);
      break;
    case "iris":
      iris(ctx, w, h, t, p, m);
      break;
    default:
      barras(ctx, w, h, t, p, m);
  }
  return false;
}
