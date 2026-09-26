import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ------------------------------------------------------------------ */
/*  Materiales compartidos (se recolorean por frame según el tema)     */
/* ------------------------------------------------------------------ */

function makeGradientMap() {
  const data = new Uint8Array([110, 170, 225, 255]);
  const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Disco con degradado radial (blanco → transparente) para los halos. */
function makeGlowTexture() {
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type Mats = {
  /** Carcasa. */
  fill: THREE.MeshToonMaterial;
  /** Carcasa en sombra: base, bisagra, rejillas, teclas hundidas. */
  shade: THREE.MeshToonMaterial;
  /** Teclas y relieves claros. */
  key: THREE.MeshToonMaterial;
  /** Elementos de UI y el logo. */
  accent: THREE.MeshToonMaterial;
  /** Paneles translúcidos (pantalla, trackpad, tarjetas de fondo). */
  glass: THREE.MeshToonMaterial;
  /** Fondo de la pantalla encendida. */
  screen: THREE.MeshBasicMaterial;
  /** Halo aditivo (logo, LED, luz de pantalla). */
  glow: THREE.MeshBasicMaterial;
  line: THREE.LineBasicMaterial;
  accentLine: THREE.LineBasicMaterial;
  /** Líneas secundarias (anillo de ticks, rejillas). */
  tickLine: THREE.LineBasicMaterial;
};

export function makeMats(): Mats {
  const gradientMap = makeGradientMap();
  const base = {
    gradientMap,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  };
  return {
    fill: new THREE.MeshToonMaterial({ ...base, color: 0x151c24 }),
    shade: new THREE.MeshToonMaterial({ ...base, color: 0x0e141b }),
    key: new THREE.MeshToonMaterial({ ...base, color: 0x1c2530 }),
    accent: new THREE.MeshToonMaterial({ ...base, color: 0xf8fafc }),
    glass: new THREE.MeshToonMaterial({
      ...base,
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.55,
    }),
    screen: new THREE.MeshBasicMaterial({
      color: 0x0b2a36,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    glow: new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      map: makeGlowTexture(),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    line: new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.9 }),
    accentLine: new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.9 }),
    tickLine: new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.4 }),
  };
}

/* ------------------------------------------------------------------ */
/*  Piezas                                                             */
/* ------------------------------------------------------------------ */

/** Geometrías creadas por los builders, para liberarlas al desmontar. */
export const geometries: THREE.BufferGeometry[] = [];

export function disposeGeometries() {
  geometries.forEach((g) => g.dispose());
  geometries.length = 0;
}

export function addPart(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  lineMat: THREE.LineBasicMaterial | null,
  pos?: [number, number, number],
  rot?: [number, number, number],
  edgeAngle = 24,
) {
  geometries.push(geo);
  const mesh = new THREE.Mesh(geo, mat);
  if (pos) mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  parent.add(mesh);
  if (lineMat) {
    const edges = new THREE.EdgesGeometry(geo, edgeAngle);
    geometries.push(edges);
    const lines = new THREE.LineSegments(edges, lineMat);
    lines.position.copy(mesh.position);
    lines.rotation.copy(mesh.rotation);
    parent.add(lines);
  }
  return mesh;
}

/** Geometría ya colocada (posición/rotación horneadas) para fusionar. */
export function placed(geo: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number]) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  if (rot) q.setFromEuler(new THREE.Euler(...rot));
  m.compose(new THREE.Vector3(...pos), q, new THREE.Vector3(1, 1, 1));
  geo.applyMatrix4(m);
  return geo;
}

/**
 * Muchas piezas chicas del mismo material en un solo mesh + un solo
 * LineSegments (teclas, rejillas, ticks): ahorra cientos de draw calls.
 */
export function addMerged(
  parent: THREE.Object3D,
  parts: THREE.BufferGeometry[],
  mat: THREE.Material,
  lineMat: THREE.LineBasicMaterial | null,
  edgeAngle = 24,
) {
  if (!parts.length) return null;
  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  if (!merged) return null;
  return addPart(parent, merged, mat, lineMat, undefined, undefined, edgeAngle);
}

/** Líneas sueltas (sin malla): pares de puntos → un LineSegments. */
export function addLines(parent: THREE.Object3D, points: number[], mat: THREE.LineBasicMaterial) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  geometries.push(geo);
  const lines = new THREE.LineSegments(geo, mat);
  parent.add(lines);
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Módulos y configuración de escena                                  */
/* ------------------------------------------------------------------ */

export type Module = {
  group: THREE.Group;
  /** Posición compacta y explotada (en el espacio del spinner). */
  home: THREE.Vector3;
  exploded: THREE.Vector3;
  /** Rotación en reposo y explotado; se interpola con el avance local. */
  rotHome: THREE.Euler;
  rotExploded: THREE.Euler;
  /** Escala en reposo (1 = tamaño real). Al explotar siempre llega a 1. */
  scaleHome: number;
  /** Retraso de la cascada, en unidades de `explode`. */
  delay: number;
  /** Objeto que se proyecta a pantalla para el callout (por defecto el grupo). */
  anchor?: THREE.Object3D;
  /** Hook por frame para animaciones propias (p = progreso de la sección). */
  update?: (p: number, explode: number, local: number, t: number) => void;
};

export type CameraPose = { pos: THREE.Vector3; look: THREE.Vector3 };

export type SceneBuild = {
  modules: Module[];
  /** Centro del logo de la tapa y un punto en su borde (para proyectar el radio). */
  logo?: { center: THREE.Object3D; edge: THREE.Object3D };
  /** Piezas que solo se ven en horizontal. */
  landscapeOnly?: THREE.Object3D[];
  /** Ajuste por orientación (p. ej. encoger el anillo en el teléfono). */
  fit?: (portrait: boolean) => void;
  /** Hook por frame con el encendido (0..1) y el tiempo. */
  tick?: (reveal: number, t: number) => void;
  /** Materiales propios del builder (los compartidos los libera la escena). */
  dispose?: () => void;
};

export type SceneConfig = {
  build: (m: Mats) => SceneBuild;
  fov: number;
  /** Rotación del grupo inclinado según orientación y ratón suavizado (-1..1). */
  tilt: (portrait: boolean, mouse: { x: number; y: number }) => [number, number, number];
  /** Desplazamiento horizontal del modelo en escritorio (deja aire al texto). */
  offsetX: number;
  /** Eje y ángulo del giro global. */
  spinAxis: "x" | "y" | "z";
  spin: (p: number, t: number, reduceMotion: boolean) => number;
  /** Cámara en función de la explosión y la orientación. Escribe en `out`. */
  camera: (explode: number, portrait: boolean, out: CameraPose) => void;
  /** Compresión lateral/vertical de las posiciones en vertical. */
  portraitSquash: [number, number];
  /** Escala global del modelo en vertical (1 = igual que escritorio). */
  portraitScale?: number;
  /** Escala global en escritorio (1 = tamaño original). */
  desktopScale?: number;
};
