import type { CSSProperties } from "react";
import { digitalPlans, type DigitalPlanGroupKey } from "@/lib/digital";
import { empresaProjects, type EmpresaProject } from "@/lib/empresas";
import type { Seleccion } from "../digital/Pago";
import type { FiguraPixel } from "../od/Pixel";
import { SISTEMA_URL, servicios } from "../od/data";

export const pad = (n: number) => String(n).padStart(2, "0");

/** "PERSONALIZACIÓN 100%" → "Personalización 100%" (los puntos oficiales vienen en mayúscula). */
export const oracion = (t: string) => {
  const bajo = t.toLocaleLowerCase("es").replace(/\bia\b/g, "IA").replace(/\bsinpe\b/g, "SINPE");
  return bajo.charAt(0).toLocaleUpperCase("es") + bajo.slice(1);
};

/* ── Líneas de servicio y su color ─────────────────────────────────────── */

export type Linea = DigitalPlanGroupKey;

type Tono = { acento: string; sobreAcento: string };

/** Cada línea con un color de la paleta de Onvision: cian, menta, azul e índigo. */
const TONOS: Record<Linea | "sistema", Tono> = {
  web: { acento: "#34d3ee", sobreAcento: "#0a0d12" },
  shop: { acento: "#2ef2a6", sobreAcento: "#0a0d12" },
  software: { acento: "#3b6ef6", sobreAcento: "#ffffff" },
  mobile: { acento: "#818cf8", sobreAcento: "#0a0d12" },
  sistema: { acento: "#eaf8fc", sobreAcento: "#0a0d12" },
};

/** Variables de color para un `style`: tiñen marcos, íconos y selección. */
export function tinte(linea: Linea | "sistema" | null | undefined) {
  const t = TONOS[linea ?? "web"];
  return { "--acc": t.acento, "--on-acc": t.sobreAcento } as CSSProperties;
}

const FIGURA: Record<Linea, FiguraPixel> = { web: "web", shop: "tienda", software: "software", mobile: "movil" };

/** La captura de cada línea (las mismas del showreel de /digital). */
const CAPTURA = Object.fromEntries(servicios.map((s) => [s.grupo, { src: s.poster, alt: s.label }])) as Record<
  Linea,
  { src: string; alt: string }
>;

/* ── Planes con pago (los mismos seis de /digital#planes) ─────────────── */

type PlanFuente = {
  readonly name: string;
  readonly tagline: string;
  readonly price: string;
  readonly priceAlt?: string;
  readonly priceYear: string;
  readonly priceFull: string;
  readonly checkoutId: string;
  readonly highlighted?: boolean;
  readonly features: readonly string[];
};

export type PlanPago = {
  id: string;
  codigo: string;
  linea: Linea;
  lineaNombre: string;
  nombre: string;
  tagline: string;
  precio: string;
  precioAlt?: string;
  precioAnual: string;
  precioUnico: string;
  destacado: boolean;
  /** Sitios y tiendas: mínimo de 5 meses (FAQ oficial). Software y apps: sin mínimo. */
  minimo: boolean;
  features: readonly string[];
  figura: FiguraPixel;
  imagen: string;
  alt: string;
};

export const LINEAS = Object.keys(digitalPlans.groups) as Linea[];

export const planes: PlanPago[] = LINEAS.flatMap((linea) =>
  (digitalPlans.groups[linea].plans as readonly PlanFuente[]).map((p) => ({ p, linea })),
).map(({ p, linea }, i) => ({
  id: p.checkoutId,
  codigo: pad(i + 1),
  linea,
  lineaNombre: digitalPlans.tabs[linea],
  nombre: p.name,
  tagline: p.tagline,
  precio: p.price,
  precioAlt: p.priceAlt,
  precioAnual: p.priceYear,
  precioUnico: p.priceFull,
  destacado: Boolean(p.highlighted),
  minimo: linea === "web" || linea === "shop",
  features: p.features,
  figura: FIGURA[linea],
  imagen: CAPTURA[linea].src,
  alt: CAPTURA[linea].alt,
}));

export function planPorId(id: string | null | undefined) {
  return planes.find((p) => p.id === id) ?? null;
}

/** El plan "Más elegido" de cada línea: el que se propone al elegir la línea. */
export function planDeLinea(linea: Linea) {
  const deLinea = planes.filter((p) => p.linea === linea);
  return deLinea.find((p) => p.destacado) ?? deLinea[0]!;
}

/** Lo que recibe la hoja de pago de Onvo (igual que en /digital#planes). */
export function seleccionDe(p: PlanPago): Seleccion {
  return {
    planId: p.id,
    planName: p.nombre,
    categoryLabel: p.lineaNombre,
    price: p.precio,
    priceAlt: p.precioAlt,
    period: digitalPlans.period,
  };
}

/** "$35/mes · ₡15.000" */
export const precioMes = (p: PlanPago) => `${p.precio}/mes`;

/* ── Empresas: de qué línea es cada trabajo ─────────────────────────────── */

const LINEA_DE_TIPO: Record<EmpresaProject["kind"], Linea> = {
  website: "web",
  ecommerce: "shop",
  software: "software",
};

export const lineaDeEmpresa = (e: EmpresaProject) => LINEA_DE_TIPO[e.kind];

export const empresas = empresaProjects.map((e, i) => ({ ...e, codigo: pad(i + 1), linea: LINEA_DE_TIPO[e.kind] }));

export type Empresa = (typeof empresas)[number];

export const SISTEMA = {
  activar: `${SISTEMA_URL}/activar`,
  producto: `${SISTEMA_URL}/producto`,
};

/* ── Escenas de la página (el contador de jeffmilanes en la línea de avance) ── */

export const ESCENAS = [
  { id: "inicio", nombre: "Inicio" },
  { id: "nucleo", nombre: "Núcleo" },
  { id: "lo-que-hacemos", nombre: "Lo que hacemos" },
  { id: "base-comun", nombre: "Base común" },
  { id: "clientes", nombre: "Clientes" },
  { id: "onvi", nombre: "Onvi" },
  { id: "trabajos", nombre: "Trabajos" },
  { id: "por-que", nombre: "Por qué" },
  { id: "comparativa", nombre: "Precios" },
  { id: "stack", nombre: "Stack" },
  { id: "precios", nombre: "Planes" },
  { id: "registro", nombre: "Contacto" },
  { id: "activar", nombre: "Pago" },
] as const;

/* ── Desplazamiento ───────────────────────────────────────────────────── */

type ConLenis = { __odLenis?: { scrollTo: (t: HTMLElement | number, o?: object) => void } };

/** Llevar la página a un punto, con el scroll suave si está encendido. */
export function scrollA(destino: HTMLElement | number, offset = 0) {
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = (window as unknown as ConLenis).__odLenis;
  if (lenis && !quieto) {
    lenis.scrollTo(destino, { offset, duration: 1.3 });
    return;
  }
  const y = typeof destino === "number" ? destino : destino.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: quieto ? "auto" : "smooth" });
}

/** Llevar la página a una sección y, si se pide, enfocar algo al llegar. */
export function irA(id: string, enfocar?: string) {
  const destino = document.getElementById(id);
  if (!destino) return;
  scrollA(destino, -12);
  if (enfocar) {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => document.getElementById(enfocar)?.focus({ preventScroll: true }), quieto ? 0 : 1350);
  }
}

/** Recorrer una escena fija hasta su paso k (el centro de ese tramo). */
export function irAPaso(pista: HTMLElement | null, k: number, n: number) {
  if (!pista) return;
  const top = pista.getBoundingClientRect().top + window.scrollY;
  const recorrido = pista.offsetHeight - window.innerHeight;
  scrollA(top + recorrido * ((k + 0.5) / n));
}
