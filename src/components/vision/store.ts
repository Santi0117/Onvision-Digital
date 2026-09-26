/**
 * Estado compartido entre la escena Three.js y el DOM (callouts, regla, tema).
 * Mutable a propósito: se actualiza cada frame sin pasar por React.
 */

export type Anchor = {
  x: number;
  y: number;
  visible: boolean;
  /** Recuadro en pantalla (px) del módulo 3D, para no taparlo. */
  l: number;
  t: number;
  r: number;
  b: number;
};

export type VisionFrame = {
  /** Progreso del scroll dentro de la sección del núcleo, sin clamp (puede ser <0 o >1). */
  raw: number;
  /** Progreso 0..1 dentro de la sección del núcleo. */
  progress: number;
  /** Cuánto está explotado el núcleo, 0..1. */
  explode: number;
  /** Opacidad de la escena 3D. */
  opacity: number;
  /** Posición en pantalla (px) de cada módulo. */
  anchors: Anchor[];
  /** Colores de tema resueltos para este frame. */
  theme: { bg: string; ink: string; muted: string };
  /** Sección de detalles (dial): progreso y detalle activo. */
  features: {
    raw: number;
    progress: number;
    opacity: number;
    /** progreso × cantidad de detalles: parte entera = índice, fracción = avance local. */
    x: number;
    index: number;
    /** 0..1 mientras la sección entra: el dial crece desde el logo de la tapa. */
    enter: number;
  };
  /** Logo del ojo en la tapa, proyectado a pantalla (px) con su radio. */
  logo: { x: number; y: number; r: number; visible: boolean };
  /** Progreso 0..1 de toda la página. */
  page: number;
};

type Listener = (frame: VisionFrame) => void;

class VisionStore {
  sectionEl: HTMLElement | null = null;
  featuresEl: HTMLElement | null = null;
  featureCount = 1;
  /**
   * Encendido de la escena, 0..1. Lo mueve el boot: con 0 la laptop está
   * apagada (colores = fondo, líneas invisibles, cámara lejos); con 1 ya está.
   */
  reveal = 0;
  /** La escena 3D ya pintó su primer frame (el boot espera esto para salir). */
  sceneReady = false;
  /** Teléfono: la tapa y las piezas usan el raw del hero. */
  phone = false;
  frame: VisionFrame = {
    raw: -1,
    progress: 0,
    explode: 0,
    opacity: 0,
    anchors: [],
    theme: { bg: "#0a0f14", ink: "#f8fafc", muted: "rgba(248,250,252,0.5)" },
    features: { raw: -1, progress: 0, opacity: 0, x: 0, index: 0, enter: 0 },
    logo: { x: 0, y: 0, r: 0, visible: false },
    page: 0,
  };
  private listeners = new Set<Listener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  emit() {
    for (const fn of this.listeners) fn(this.frame);
  }
}

export const visionStore = new VisionStore();

/* ---------- utilidades numéricas compartidas ---------- */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Progreso sin clamp de una sección pinned (0 = tope pegado arriba, 1 = fin del recorrido). */
export function pinnedRaw(el: HTMLElement | null, vh: number) {
  if (!el) return -1;
  const rect = el.getBoundingClientRect();
  const travel = Math.max(rect.height - vh, 1);
  return -rect.top / travel;
}

export function smoothstep(a: number, b: number, v: number) {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function rgbToCss([r, g, b]: Rgb, alpha = 1) {
  return alpha >= 1
    ? `rgb(${r | 0} ${g | 0} ${b | 0})`
    : `rgb(${r | 0} ${g | 0} ${b | 0} / ${alpha})`;
}

/** Rampa de color por paradas [posición 0..1, color]. */
export function rampAt(stops: readonly [number, Rgb][], p: number): Rgb {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [pos, col] = stops[i];
    if (p <= pos) {
      const [prevPos, prevCol] = stops[i - 1];
      const t = (p - prevPos) / (pos - prevPos || 1);
      return mixRgb(prevCol, col, t * t * (3 - 2 * t));
    }
  }
  return stops[stops.length - 1][1];
}

/* ---------- temas por etapa del scroll ---------- */

export type ThemeKey = "bg" | "ink" | "fill" | "line" | "accent" | "glass";

export const THEMES: Record<"dark" | "gray" | "paper", Record<ThemeKey, string>> = {
  dark: {
    bg: "#0a0f14",
    ink: "#f8fafc",
    fill: "#151c24",
    line: "#f8fafc",
    accent: "#f8fafc",
    glass: "#f8fafc",
  },
  gray: {
    bg: "#1c2730",
    ink: "#f2f8fa",
    fill: "#2a3742",
    line: "#f8fafc",
    accent: "#f8fafc",
    glass: "#f8fafc",
  },
  paper: {
    bg: "#e2edf1",
    ink: "#0f1c24",
    fill: "#eef5f8",
    line: "#123543",
    accent: "#0891b2",
    glass: "#b6dbe6",
  },
};

/** Paleta fija: el landing se queda en oscuro. */
const STAGE_STOPS: readonly [number, keyof typeof THEMES][] = [
  [0, "dark"],
  [1, "dark"],
];

const INK_STOPS: readonly [number, keyof typeof THEMES][] = [
  [0, "dark"],
  [1, "dark"],
];

const rampCache = new Map<ThemeKey, readonly [number, Rgb][]>();

export function themeColor(key: ThemeKey, p: number): Rgb {
  let stops = rampCache.get(key);
  if (!stops) {
    const source = key === "ink" || key === "line" ? INK_STOPS : STAGE_STOPS;
    stops = source.map(([pos, name]) => [pos, hexToRgb(THEMES[name][key])] as [number, Rgb]);
    rampCache.set(key, stops);
  }
  return rampAt(stops, p);
}

/** Curva de explosión: se abre, se mira un momento y se reensambla. */
export function explodeAt(p: number, start = 0.05, opened = 0.36) {
  return smoothstep(start, opened, p) * (1 - smoothstep(0.55, 0.86, p));
}

/**
 * Apertura de la tapa en teléfono. Ease-out (no smoothstep): el lid
 * responde al primer pixel de scroll en vez de quedarse quieto y después saltar.
 * Rango: raw -0.50 → -0.04 (el hero, antes de que el núcleo se pinnee).
 */
export function phoneLidAt(p: number) {
  const t = clamp01((p + 0.5) / 0.46);
  const open = 1 - (1 - t) * (1 - t);
  return open * (1 - smoothstep(0.86, 0.99, clamp01(p)));
}
