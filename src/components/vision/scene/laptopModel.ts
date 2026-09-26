import * as THREE from "three";
import { clamp01, phoneLidAt, smoothstep, visionStore } from "../store";
import { EYE_PUPIL_R, traceEyeOutline } from "@/lib/ojo";
import {
  addLines,
  addMerged,
  addPart,
  placed,
  type Mats,
  type Module,
  type SceneBuild,
  type SceneConfig,
} from "./kit";

/**
 * Laptop procedural, estilo instrumento: carcasa con bisagra, rejillas,
 * puertos, teclado real, trackpad, LED, y el ojo Onvision en la tapa.
 * Se abre con el scroll y de la pantalla salen, en cascada, las piezas de un
 * sitio (portada, agenda, contacto, animaciones, chatbot, tienda, SEO).
 * Al final se reensambla y se cierra. Descansa sobre un anillo de ticks con
 * los arcos de color del dial (solo en horizontal).
 *
 * Orden de módulos = orden de `webModules` en lib/web.ts.
 */

const BODY_W = 3.7;
const BODY_D = 2.5;
const BODY_H = 0.16;
const TOP = BODY_H / 2;
const LID_W = 3.62;
const LID_H = 2.36;
const LID_T = 0.1;
const HINGE = new THREE.Vector3(0, TOP, -BODY_D / 2 + 0.04);
const LID_CLOSED = Math.PI / 2;
const LID_OPEN = -0.18;
const SCREEN_LOCAL = new THREE.Vector3(0, LID_H / 2, 0.08);
/** Logo en el dorso de la tapa (mira hacia arriba con la tapa cerrada). */
const LOGO_Z = -LID_T - 0.02;
const LOGO_HALF_W = 0.42;

/** Luces del dial, todas blancas (mismo orden que `webFeatures`). */
export const RING_COLORS = ["#f8fafc", "#f8fafc", "#f8fafc", "#f8fafc", "#f8fafc", "#f8fafc"];

function openAt(p: number) {
  if (visionStore.phone) return phoneLidAt(p);
  return smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.86, 0.99, clamp01(p)));
}

function lidAngle(p: number) {
  return LID_CLOSED + (LID_OPEN - LID_CLOSED) * openAt(p);
}

function screenCenter(angle: number, out: THREE.Vector3) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  out.set(
    HINGE.x,
    HINGE.y + SCREEN_LOCAL.y * c - SCREEN_LOCAL.z * s,
    HINGE.z + SCREEN_LOCAL.y * s + SCREEN_LOCAL.z * c,
  );
  return out;
}

/* ---------- ojo Onvision (plano, en XY) ---------- */

function almondShape(halfW: number, bulge: number) {
  const s = new THREE.Shape();
  s.moveTo(-halfW, 0);
  s.quadraticCurveTo(0, bulge, halfW, 0);
  s.quadraticCurveTo(0, -bulge, -halfW, 0);
  return s;
}

function spiralCurve(r0: number, r1: number, a0: number, a1: number, z: number) {
  const pts: THREE.Vector3[] = [];
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = a0 + (a1 - a0) * u;
    const r = r0 + (r1 - r0) * u;
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Ojo de la tarjeta en pantalla: almendra, iris, remolino y pupila. */
function buildEye(parent: THREE.Object3D, m: Mats, scale: number, z: number) {
  const g = new THREE.Group();
  g.position.z = z;
  g.scale.setScalar(scale);
  parent.add(g);

  const outer = almondShape(LOGO_HALF_W, 0.36);
  outer.holes.push(almondShape(LOGO_HALF_W * 0.84, 0.29));
  addPart(g, new THREE.ShapeGeometry(outer, 24), m.accent, m.accentLine, [0, 0, 0]);
  addPart(g, new THREE.TorusGeometry(0.13, 0.02, 10, 40), m.accent, m.accentLine, [0, 0, 0.012], undefined, 40);
  addPart(
    g,
    new THREE.TubeGeometry(spiralCurve(0.24, 0.075, Math.PI * 0.85, Math.PI * 2.35, 0), 40, 0.012, 6, false),
    m.accent,
    null,
    [0, 0, 0.012],
  );
  addPart(g, new THREE.SphereGeometry(0.05, 18, 12), m.accent, m.accentLine, [0, 0, 0.02], undefined, 50);
  const halo = addPart(g, new THREE.CircleGeometry(0.62, 40), m.glow, null, [0, 0, -0.006]);
  halo.name = "halo";
  return g;
}

/** Logo de la tapa (el de eyeLogo): plano, con la pupila hueca. Mira a -z: hacia arriba con la tapa cerrada. */
function buildLogo(parent: THREE.Object3D, m: Mats) {
  const g = new THREE.Group();
  g.position.set(0, LID_H / 2, LOGO_Z);
  g.rotation.y = Math.PI;
  parent.add(g);

  // Girado 180°: con la tapa cerrada la cámara lo ve desde el frente y así queda derecho.
  const shape = new THREE.Shape();
  traceEyeOutline(
    (x, y) => [-x * LOGO_HALF_W, y * LOGO_HALF_W],
    (x, y) => shape.moveTo(x, y),
    (...p) => shape.bezierCurveTo(...p),
  );
  const pupilR = EYE_PUPIL_R * LOGO_HALF_W;
  shape.holes.push(new THREE.Path().absarc(0, 0, pupilR, 0, Math.PI * 2, true));
  addPart(g, new THREE.ShapeGeometry(shape, 24), m.accent, m.accentLine, [0, 0, 0]);
  // mismo halo, sin tapar la pupila
  const halo = addPart(g, new THREE.RingGeometry(pupilR, 0.62, 40), m.glow, null, [0, 0, -0.006]);
  halo.name = "halo";
}

/* ---------- piezas del sitio: cada una una pantalla chica con "chrome" ---------- */

function card(g: THREE.Group, m: Mats, w: number, h: number) {
  addPart(g, new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.03), m.shade, m.tickLine, [0.03, -0.03, -0.06]);
  addPart(g, new THREE.BoxGeometry(w, h, 0.08), m.fill, m.line);
  addPart(g, new THREE.BoxGeometry(w - 0.08, 0.11, 0.02), m.shade, m.tickLine, [0, h / 2 - 0.1, 0.05]);
  addMerged(
    g,
    [0, 1, 2].map((i) => placed(new THREE.SphereGeometry(0.018, 8, 6), [-w / 2 + 0.12 + i * 0.06, h / 2 - 0.1, 0.065])),
    m.key,
    null,
  );
  addPart(g, new THREE.BoxGeometry(w * 0.42, 0.045, 0.01), m.key, null, [0.05, h / 2 - 0.1, 0.062]);
}

const cardBuilders: Array<(g: THREE.Group, m: Mats) => void> = [
  // portada
  (g, m) => {
    card(g, m, 1.85, 1.28);
    addPart(g, new THREE.BoxGeometry(0.82, 0.12, 0.04), m.accent, m.accentLine, [-0.36, 0.3, 0.06]);
    addPart(g, new THREE.BoxGeometry(1.0, 0.055, 0.03), m.glass, m.line, [-0.27, 0.1, 0.06], undefined, 60);
    addPart(g, new THREE.BoxGeometry(0.78, 0.055, 0.03), m.glass, m.line, [-0.38, -0.03, 0.06], undefined, 60);
    addPart(g, new THREE.BoxGeometry(0.5, 0.18, 0.05), m.accent, m.accentLine, [-0.52, -0.36, 0.065]);
    addPart(g, new THREE.BoxGeometry(0.62, 0.78, 0.03), m.glass, m.line, [0.5, -0.1, 0.06], undefined, 60);
    addPart(g, new THREE.TorusGeometry(0.1, 0.018, 8, 32), m.accent, m.accentLine, [0.5, -0.02, 0.085], undefined, 40);
    const cursor = addPart(g, new THREE.ConeGeometry(0.045, 0.14, 4), m.key, m.line, [0.1, -0.4, 0.13], [0, 0, -2.4]);
    cursor.name = "cursor";
  },
  // agenda
  (g, m) => {
    card(g, m, 1.55, 1.48);
    addPart(g, new THREE.BoxGeometry(1.22, 0.12, 0.03), m.accent, m.accentLine, [0, 0.5, 0.06]);
    addMerged(
      g,
      Array.from({ length: 5 }, (_, c) => placed(new THREE.BoxGeometry(0.16, 0.035, 0.01), [-0.52 + c * 0.26, 0.36, 0.06])),
      m.key,
      null,
    );
    const booked = new Set(["1,1", "3,2", "0,3", "2,0", "4,1"]);
    const cells: THREE.BufferGeometry[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const pos: [number, number, number] = [-0.52 + c * 0.26, 0.2 - r * 0.24, 0.06];
        if (booked.has(`${c},${r}`)) {
          addPart(g, new THREE.BoxGeometry(0.2, 0.17, 0.05), m.accent, m.accentLine, pos);
        } else {
          cells.push(placed(new THREE.BoxGeometry(0.2, 0.17, 0.025), pos));
        }
      }
    }
    addMerged(g, cells, m.glass, m.line, 60);
    addPart(g, new THREE.CircleGeometry(0.2, 24), m.glow, null, [0.26, -0.28, 0.1]);
  },
  // contacto
  (g, m) => {
    card(g, m, 1.55, 1.32);
    for (let i = 0; i < 3; i++) {
      const y = 0.36 - i * 0.28;
      addPart(g, new THREE.BoxGeometry(0.34, 0.035, 0.01), m.key, null, [-0.42, y + 0.13, 0.06]);
      addPart(g, new THREE.BoxGeometry(1.18, 0.16, 0.03), m.glass, m.line, [0, y, 0.06], undefined, 60);
    }
    addPart(g, new THREE.BoxGeometry(0.64, 0.2, 0.05), m.accent, m.accentLine, [-0.27, -0.48, 0.065]);
    addPart(g, new THREE.TorusGeometry(0.075, 0.016, 8, 28), m.accent, m.accentLine, [0.42, -0.48, 0.07], undefined, 40);
  },
  // animaciones
  (g, m) => {
    card(g, m, 1.45, 1.45);
    const knot = addPart(g, new THREE.TorusKnotGeometry(0.34, 0.1, 96, 12), m.accent, m.accentLine, [0, -0.06, 0.14], undefined, 40);
    knot.name = "knot";
    const orbit = addPart(g, new THREE.TorusGeometry(0.6, 0.02, 8, 64), m.glass, m.line, [0, -0.06, 0.14], [0.4, 0.15, 0]);
    orbit.name = "orbit";
    for (let i = 0; i < 3; i++) {
      const s = addPart(g, new THREE.SphereGeometry(0.04, 10, 8), m.key, null);
      s.name = `sat${i}`;
    }
  },
  // chatbot
  (g, m) => {
    card(g, m, 1.7, 1.4);
    addPart(g, new THREE.BoxGeometry(0.95, 0.26, 0.05), m.glass, m.line, [-0.14, 0.3, 0.06], undefined, 60);
    addPart(g, new THREE.BoxGeometry(1.05, 0.26, 0.05), m.accent, m.accentLine, [0.16, -0.04, 0.06]);
    addPart(g, new THREE.BoxGeometry(0.62, 0.22, 0.05), m.glass, m.line, [-0.32, -0.38, 0.06], undefined, 60);
    for (let i = 0; i < 3; i++) {
      const d = addPart(g, new THREE.SphereGeometry(0.03, 10, 8), m.key, null, [-0.44 + i * 0.12, -0.38, 0.1]);
      d.name = `dot${i}`;
    }
    addPart(g, new THREE.SphereGeometry(0.17, 22, 16), m.accent, m.accentLine, [-0.66, 0.3, 0.08], undefined, 36);
    addPart(g, new THREE.TorusGeometry(0.075, 0.018, 8, 24), m.accent, m.accentLine, [-0.66, 0.3, 0.18]);
    addPart(g, new THREE.CircleGeometry(0.3, 24), m.glow, null, [-0.66, 0.3, 0.04]);
  },
  // tienda
  (g, m) => {
    card(g, m, 1.7, 1.45);
    const frames: THREE.BufferGeometry[] = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const x = (c - 0.5) * 0.74;
        const y = (0.5 - r) * 0.58 - 0.08;
        frames.push(placed(new THREE.BoxGeometry(0.64, 0.5, 0.04), [x, y, 0.06]));
        addPart(g, new THREE.BoxGeometry(0.5, 0.26, 0.025), m.key, m.tickLine, [x, y + 0.07, 0.085]);
        addPart(g, new THREE.BoxGeometry(0.26, 0.055, 0.025), m.accent, m.accentLine, [x - 0.12, y - 0.16, 0.09]);
        addPart(g, new THREE.BoxGeometry(0.14, 0.035, 0.01), m.key, null, [x + 0.16, y - 0.16, 0.09]);
      }
    }
    addMerged(g, frames, m.glass, m.line, 60);
    addPart(g, new THREE.SphereGeometry(0.07, 14, 10), m.accent, m.accentLine, [0.68, 0.56, 0.1], undefined, 50);
  },
  // seo
  (g, m) => {
    card(g, m, 1.7, 1.35);
    addPart(g, new THREE.BoxGeometry(1.42, 0.04, 0.18), m.fill, m.line, [0, -0.5, 0.02]);
    const heights = [0.3, 0.48, 0.4, 0.7, 0.92];
    const ghost: THREE.BufferGeometry[] = [];
    heights.forEach((h, i) => {
      const pos: [number, number, number] = [-0.56 + i * 0.28, -0.48 + h / 2, 0.04];
      if (i === heights.length - 1) addPart(g, new THREE.BoxGeometry(0.18, h, 0.18), m.accent, m.accentLine, pos);
      else ghost.push(placed(new THREE.BoxGeometry(0.18, h, 0.18), pos));
    });
    addMerged(g, ghost, m.glass, m.line, 50);
    const pts: number[] = [];
    heights.forEach((h, i) => {
      if (i === 0) return;
      pts.push(-0.56 + (i - 1) * 0.28, -0.48 + heights[i - 1] + 0.1, 0.16, -0.56 + i * 0.28, -0.48 + h + 0.1, 0.16);
    });
    addLines(g, pts, m.accentLine);
    addPart(g, new THREE.TorusGeometry(0.11, 0.02, 8, 32), m.accent, m.accentLine, [0.6, 0.42, 0.08], undefined, 40);
  },
];

/** Fan alrededor de la pantalla abierta: arriba, flancos y frente. */
const CARD_TARGETS: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
  { pos: [0.0, 3.45, -0.35], rot: [-0.1, 0.0, 0] },
  { pos: [-2.7, 2.85, 0.15], rot: [-0.05, 0.42, 0.04] },
  { pos: [2.7, 2.85, 0.15], rot: [-0.05, -0.42, -0.04] },
  { pos: [-3.45, 1.15, 0.85], rot: [0.04, 0.68, 0] },
  { pos: [-2.05, 0.55, 2.35], rot: [0.1, 0.22, 0] },
  { pos: [3.45, 1.15, 0.85], rot: [0.04, -0.68, 0] },
  { pos: [2.1, 0.5, 2.4], rot: [0.12, -0.22, 0] },
];

/* ---------- tapa ---------- */

function buildLid(pivot: THREE.Group, m: Mats) {
  // carcasa + placa hundida en el dorso
  addPart(pivot, new THREE.BoxGeometry(LID_W, LID_H, LID_T), m.fill, m.line, [0, LID_H / 2, -LID_T / 2]);
  addPart(pivot, new THREE.BoxGeometry(LID_W - 0.22, LID_H - 0.22, 0.016), m.shade, m.tickLine, [0, LID_H / 2, -LID_T - 0.008]);

  // logo en el dorso (mira a -z: hacia arriba con la tapa cerrada)
  buildLogo(pivot, m);

  // bisel + pantalla
  addPart(pivot, new THREE.BoxGeometry(LID_W - 0.14, LID_H - 0.14, 0.03), m.shade, m.line, [0, LID_H / 2, 0.015]);
  const SW = LID_W - 0.36;
  const SH = LID_H - 0.44;
  const SY = LID_H / 2 - 0.05;
  addPart(pivot, new THREE.BoxGeometry(SW, SH, 0.02), m.screen, m.line, [0, SY, 0.04]);
  addPart(pivot, new THREE.BoxGeometry(SW, SH, 0.006), m.glass, null, [0, SY, 0.056]);
  addPart(pivot, new THREE.SphereGeometry(0.024, 12, 8), m.glass, m.line, [0, LID_H - 0.11, 0.05], undefined, 50);
  addPart(pivot, new THREE.SphereGeometry(0.009, 8, 6), m.accent, null, [0, LID_H - 0.11, 0.072]);

  // chrome del navegador
  const topY = SY + SH / 2;
  addPart(pivot, new THREE.BoxGeometry(SW, 0.15, 0.012), m.shade, m.tickLine, [0, topY - 0.075, 0.062]);
  addMerged(
    pivot,
    [0, 1, 2].map((i) => placed(new THREE.SphereGeometry(0.02, 8, 6), [-SW / 2 + 0.14 + i * 0.07, topY - 0.075, 0.075])),
    m.key,
    null,
  );
  addPart(pivot, new THREE.BoxGeometry(1.1, 0.07, 0.01), m.key, null, [0, topY - 0.075, 0.072]);

  // UI: nav, título, texto, botones, tarjeta con el ojo, pie
  addMerged(
    pivot,
    [0, 1, 2, 3].map((i) => placed(new THREE.BoxGeometry(0.22, 0.04, 0.01), [SW / 2 - 0.3 - i * 0.3, topY - 0.28, 0.066])),
    m.glass,
    null,
  );
  addPart(pivot, new THREE.BoxGeometry(0.12, 0.12, 0.01), m.accent, m.accentLine, [-SW / 2 + 0.2, topY - 0.28, 0.066]);
  addPart(pivot, new THREE.BoxGeometry(1.35, 0.11, 0.024), m.accent, m.accentLine, [-0.62, LID_H - 0.7, 0.068]);
  addPart(pivot, new THREE.BoxGeometry(1.0, 0.11, 0.024), m.accent, m.accentLine, [-0.8, LID_H - 0.87, 0.068]);
  addPart(pivot, new THREE.BoxGeometry(1.1, 0.045, 0.012), m.glass, m.line, [-0.75, LID_H - 1.06, 0.066], undefined, 60);
  addPart(pivot, new THREE.BoxGeometry(0.85, 0.045, 0.012), m.glass, m.line, [-0.88, LID_H - 1.17, 0.066], undefined, 60);
  addPart(pivot, new THREE.BoxGeometry(0.48, 0.14, 0.03), m.accent, m.accentLine, [-1.06, LID_H - 1.42, 0.072]);
  addPart(pivot, new THREE.BoxGeometry(0.48, 0.14, 0.02), m.glass, m.line, [-0.5, LID_H - 1.42, 0.068], undefined, 60);
  addPart(pivot, new THREE.BoxGeometry(1.15, 0.72, 0.02), m.glass, m.line, [0.72, LID_H / 2 - 0.1, 0.066], undefined, 60);
  buildEye(pivot, m, 0.42, 0.09).position.set(0.72, LID_H / 2 - 0.1, 0.09);
  addPart(pivot, new THREE.BoxGeometry(SW - 0.3, 0.045, 0.01), m.glass, null, [0, SY - SH / 2 + 0.12, 0.064]);
  const soft = m.glow.clone();
  soft.opacity = 0.18;
  addPart(pivot, new THREE.BoxGeometry(SW * 0.98, SH * 0.98, 0.002), soft, null, [0, SY, 0.06]).name = "screenGlow";
  return soft;
}

/* ---------- cuerpo ---------- */

function buildBody(group: THREE.Group, m: Mats) {
  addPart(group, new THREE.BoxGeometry(BODY_W, BODY_H, BODY_D), m.fill, m.line);
  addPart(group, new THREE.BoxGeometry(BODY_W - 0.24, 0.028, BODY_D - 0.24), m.shade, m.tickLine, [0, -TOP - 0.014, 0]);
  addMerged(
    group,
    [
      [-1.5, -0.95],
      [1.5, -0.95],
      [-1.5, 0.95],
      [1.5, 0.95],
    ].map(([x, z]) => placed(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 12), [x, -TOP - 0.045, z])),
    m.shade,
    null,
  );
  // rejilla de ventilación bajo el borde trasero
  addMerged(
    group,
    Array.from({ length: 14 }, (_, i) => placed(new THREE.BoxGeometry(0.12, 0.02, 0.06), [-1.3 + i * 0.2, -TOP - 0.02, -1.05])),
    m.shade,
    m.tickLine,
  );
  // línea del deck
  addPart(group, new THREE.BoxGeometry(BODY_W - 0.1, 0.012, BODY_D - 0.1), m.fill, m.tickLine, [0, TOP + 0.006, 0]);

  // teclado
  addPart(group, new THREE.BoxGeometry(3.0, 0.014, 1.2), m.shade, m.tickLine, [0, TOP + 0.012, -0.28]);
  const keys: THREE.BufferGeometry[] = [];
  const KW = 0.19;
  const KP = 0.22;
  const rows: Array<{ z: number; d: number; widths: number[] }> = [
    { z: -0.8, d: 0.1, widths: Array(13).fill(KW) },
    { z: -0.6, d: 0.16, widths: Array(13).fill(KW) },
    { z: -0.4, d: 0.16, widths: [0.28, ...Array(11).fill(KW), 0.28] },
    { z: -0.2, d: 0.16, widths: [0.34, ...Array(10).fill(KW), 0.34] },
    { z: 0.0, d: 0.16, widths: [0.42, ...Array(9).fill(KW), 0.42] },
    { z: 0.2, d: 0.16, widths: [KW, KW, KW, 1.32, KW, KW, KW, KW] },
  ];
  rows.forEach((row) => {
    const span = row.widths.reduce((a, w) => a + w, 0) + (row.widths.length - 1) * (KP - KW);
    let x = -span / 2;
    row.widths.forEach((w) => {
      keys.push(placed(new THREE.BoxGeometry(w, 0.03, row.d), [x + w / 2, TOP + 0.034, row.z]));
      x += w + (KP - KW);
    });
  });
  addMerged(group, keys, m.key, m.tickLine);
  addPart(group, new THREE.BoxGeometry(KW, 0.034, 0.1), m.accent, m.accentLine, [1.33, TOP + 0.036, -0.8]);

  // rejillas de parlantes a los lados del teclado
  const holes: THREE.BufferGeometry[] = [];
  for (const sx of [-1.64, 1.64]) {
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 14; r++) {
        holes.push(placed(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 6), [sx + (c - 1) * 0.06, TOP + 0.014, -0.84 + r * 0.08]));
      }
    }
  }
  addMerged(group, holes, m.shade, null);

  // trackpad
  addPart(group, new THREE.BoxGeometry(1.25, 0.012, 0.74), m.glass, m.line, [0, TOP + 0.008, 0.8], undefined, 60);

  // bisagra
  addPart(group, new THREE.CylinderGeometry(0.085, 0.085, 3.3, 16), m.shade, m.tickLine, [0, TOP + 0.02, -BODY_D / 2 + 0.06], [0, 0, Math.PI / 2], 40);
  addPart(group, new THREE.CylinderGeometry(0.1, 0.1, 0.24, 16), m.fill, m.line, [-1.62, TOP + 0.02, -BODY_D / 2 + 0.06], [0, 0, Math.PI / 2], 40);
  addPart(group, new THREE.CylinderGeometry(0.1, 0.1, 0.24, 16), m.fill, m.line, [1.62, TOP + 0.02, -BODY_D / 2 + 0.06], [0, 0, Math.PI / 2], 40);

  // puertos
  addMerged(
    group,
    [
      placed(new THREE.BoxGeometry(0.03, 0.05, 0.16), [-BODY_W / 2, 0, -0.45]),
      placed(new THREE.BoxGeometry(0.03, 0.05, 0.16), [-BODY_W / 2, 0, -0.2]),
      placed(new THREE.BoxGeometry(0.03, 0.05, 0.16), [BODY_W / 2, 0, -0.45]),
      placed(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), [BODY_W / 2, 0, -0.15], [0, 0, Math.PI / 2]),
    ],
    m.shade,
    m.tickLine,
    40,
  );

  // LED de estado en el labio frontal
  addPart(group, new THREE.SphereGeometry(0.026, 12, 8), m.accent, null, [1.15, 0, BODY_D / 2 + 0.004]);
  addPart(group, new THREE.CircleGeometry(0.11, 20), m.glow, null, [1.15, 0, BODY_D / 2 + 0.01]).name = "ledGlow";
}

/* ---------- anillo pedestal: ticks + arcos del dial ---------- */

function buildRing(m: Mats) {
  const ring = new THREE.Group();
  const y = -TOP - 0.06;
  const pts: number[] = [];
  const N = 120;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r0 = i % 10 === 0 ? 2.5 : 2.58;
    const r1 = 2.72;
    pts.push(Math.cos(a) * r0, y, Math.sin(a) * r0, Math.cos(a) * r1, y, Math.sin(a) * r1);
  }
  addLines(ring, pts, m.tickLine);
  const loop: number[] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    const b = ((i + 1) / 128) * Math.PI * 2;
    loop.push(Math.cos(a) * 2.44, y, Math.sin(a) * 2.44, Math.cos(b) * 2.44, y, Math.sin(b) * 2.44);
  }
  addLines(ring, loop, m.tickLine);

  const arcMats = RING_COLORS.map(
    (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, side: THREE.DoubleSide }),
  );
  const step = (Math.PI * 2) / RING_COLORS.length;
  arcMats.forEach((mat, i) => {
    const arc = addPart(ring, new THREE.TorusGeometry(2.9, 0.022, 6, 48, step - 0.16), mat, null);
    arc.rotation.set(Math.PI / 2, 0, i * step + 0.08);
    arc.position.y = y;
  });
  return { ring, arcMats };
}

/* ---------- escena ---------- */

function buildLaptop(m: Mats): SceneBuild {
  const modules: Module[] = [];
  let lidPivot: THREE.Group | null = null;
  const ownMats: THREE.Material[] = [];

  // 0 · tapa + pantalla (pivota en la bisagra)
  {
    const group = new THREE.Group();
    const pivot = new THREE.Group();
    group.add(pivot);
    ownMats.push(buildLid(pivot, m));
    lidPivot = pivot;

    const anchor = new THREE.Object3D();
    anchor.position.copy(SCREEN_LOCAL);
    pivot.add(anchor);
    pivot.rotation.x = LID_CLOSED;

    modules.push({
      group,
      home: HINGE.clone(),
      exploded: HINGE.clone().add(new THREE.Vector3(0, 0.08, -0.12)),
      rotHome: new THREE.Euler(),
      rotExploded: new THREE.Euler(-0.04, 0, 0),
      scaleHome: 1,
      delay: 0,
      anchor,
      update: (p) => {
        pivot.rotation.x = lidAngle(p);
      },
    });
  }

  // 1..7 · piezas del sitio: nacen en el centro de la pantalla
  const tmp = new THREE.Vector3();
  cardBuilders.forEach((build, i) => {
    const group = new THREE.Group();
    build(group, m);
    const target = CARD_TARGETS[i];
    const knot = group.getObjectByName("knot");
    const knotLines = knot ? (group.children[group.children.indexOf(knot) + 1] as THREE.Object3D) : null;
    const orbit = group.getObjectByName("orbit");
    const sats = [0, 1, 2].map((k) => group.getObjectByName(`sat${k}`));
    const dots = [0, 1, 2].map((k) => group.getObjectByName(`dot${k}`));
    const cursor = group.getObjectByName("cursor");
    const cursorLines = cursor ? (group.children[group.children.indexOf(cursor) + 1] as THREE.Object3D) : null;
    const mod: Module = {
      group,
      home: screenCenter(LID_CLOSED, new THREE.Vector3()),
      exploded: new THREE.Vector3(...target.pos),
      rotHome: new THREE.Euler(LID_OPEN, 0, 0),
      rotExploded: new THREE.Euler(...target.rot),
      scaleHome: 0.04,
      delay: 0.28 + i * 0.035,
      update: (p, _explode, local, t) => {
        const a = lidAngle(p);
        mod.home.copy(screenCenter(a, tmp));
        mod.rotHome.x = a;
        if (local < 0.02) return;
        if (knot && knotLines) {
          knot.rotation.set(t * 0.55, t * 0.38, 0);
          knotLines.rotation.copy(knot.rotation);
        }
        if (orbit) {
          sats.forEach((s, k) => {
            if (!s) return;
            const ang = t * 0.9 + (k * Math.PI * 2) / 3;
            s.position.set(Math.cos(ang) * 0.6, Math.sin(ang) * 0.6, 0).applyEuler(orbit.rotation).add(orbit.position);
          });
        }
        dots.forEach((d, k) => {
          if (!d) return;
          const s = 0.75 + 0.45 * Math.max(0, Math.sin(t * 4 - k * 0.9));
          d.scale.setScalar(s);
        });
        if (cursor && cursorLines) {
          cursor.position.set(0.1 + Math.cos(t * 0.7) * 0.22, -0.4 + Math.sin(t * 1.1) * 0.12, 0.13);
          cursorLines.position.copy(cursor.position);
        }
      },
    };
    modules.push(mod);
  });

  // 8 · cuerpo: base, bisagra, teclado, trackpad y el anillo pedestal
  const { ring, arcMats } = buildRing(m);
  {
    const group = new THREE.Group();
    buildBody(group, m);
    group.add(ring);

    modules.push({
      group,
      home: new THREE.Vector3(0, 0, 0),
      exploded: new THREE.Vector3(0, -0.35, 0.2),
      rotHome: new THREE.Euler(),
      rotExploded: new THREE.Euler(0.1, 0, 0),
      scaleHome: 1,
      delay: 0,
    });
  }

  modules.forEach((mod) => {
    mod.group.position.copy(mod.home);
    mod.group.rotation.copy(mod.rotHome);
    mod.group.scale.setScalar(mod.scaleHome);
  });

  // anclas del logo (centro y borde) para proyectar su radio en pantalla
  const logoCenter = new THREE.Object3D();
  logoCenter.position.set(0, LID_H / 2, LOGO_Z);
  const logoEdge = new THREE.Object3D();
  logoEdge.position.set(LOGO_HALF_W, LID_H / 2, LOGO_Z);
  lidPivot!.add(logoCenter, logoEdge);

  const halos = [modules[0].group, ...modules.slice(1, 8).map((x) => x.group)]
    .flatMap((g) => {
      const out: THREE.Object3D[] = [];
      g.traverse((o) => {
        if (o.name === "halo") out.push(o);
      });
      return out;
    });
  const screenGlow = modules[0].group.getObjectByName("screenGlow");
  const ledGlow = modules[8].group.getObjectByName("ledGlow");
  const arcDelay = RING_COLORS.map((_, i) => 0.18 + ((i * 0.37) % 1) * 0.42);

  return {
    modules,
    logo: { center: logoCenter, edge: logoEdge },
    landscapeOnly: [],
    fit: (portrait) => {
      // En vertical el viewport es angosto: el anillo de 2.9 se corta.
      // Lo acercamos a la laptop para que se lea el halo sin tocar bordes.
      ring.scale.setScalar(portrait ? 0.64 : 1);
    },
    tick: (reveal, t) => {
      if (visionStore.phone) {
        // Sin parpadeo ni pulso: en iPhone el cambio de opacity/scale
        // por frame traba el scroll justo cuando abre la tapa.
        arcMats.forEach((mat, i) => {
          const u = Math.min(1, Math.max(0, (reveal - arcDelay[i]) / 0.3));
          mat.opacity = 0.85 * u;
        });
        if (screenGlow) screenGlow.visible = reveal > 0.55;
        return;
      }
      // arcos: parpadean al encender, como luces de neón
      arcMats.forEach((mat, i) => {
        const u = Math.min(1, Math.max(0, (reveal - arcDelay[i]) / 0.3));
        mat.opacity = u >= 1 ? 0.9 : Math.floor(u * 6) % 2 === 1 ? 0.9 : 0.06;
      });
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      halos.forEach((h) => h.scale.setScalar(0.9 + 0.18 * pulse));
      if (ledGlow) ledGlow.scale.setScalar(1 + 0.4 * (0.5 + 0.5 * Math.sin(t * 3.1)));
      if (screenGlow) screenGlow.visible = reveal > 0.55;
    },
    dispose: () => [...arcMats, ...ownMats].forEach((mat) => mat.dispose()),
  };
}

export const laptopScene: SceneConfig = {
  build: buildLaptop,
  fov: 28,
  tilt: (portrait, mouse) =>
    portrait ? [0.2, 0.0, 0] : [0.22 + mouse.y * 0.04, -0.48 + mouse.x * 0.1, 0.02],
  offsetX: 1.02,
  desktopScale: 0.9,
  spinAxis: "y",
  spin: (p, t, reduce) => (reduce ? 0 : Math.sin(t * 0.28) * 0.035) + (p - 0.12) * 0.32,
  camera: (explode, portrait, out) => {
    if (portrait) {
      // De frente. El drive en teléfono es la tapa (no la explosión):
      // si no, la cámara se queda quieta y después salta hacia atrás.
      out.pos.set(0, 3.85 + explode * 0.08, 14.6 + explode * 3.6);
      out.look.set(0, 0.55 + explode * 0.12, 0);
    } else {
      // Close-up de producto sobre la tapa cerrada → se abre y la cámara se retira.
      // Un poco más lejos y alto para que el anillo del pedestal entre en el hero.
      out.pos.set(0.42, 4.3 - explode * 0.76, 9.4 + explode * 5.8);
      out.look.set(explode * 0.1, 0.05 + explode * 0.72, 0);
    }
  },
  portraitSquash: [0.7, 0.78],
  portraitScale: 0.82,
};
