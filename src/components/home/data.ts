import { digitalPlans, type DigitalPlanGroupKey } from "@/lib/digital";
import { empresaProjects, type EmpresaProject } from "@/lib/empresas";
import type { Seleccion } from "../planes/Pago";

export const pad = (n: number) => String(n).padStart(2, "0");

/* ── Líneas de servicio ────────────────────────────────────────────────── */

export type Linea = DigitalPlanGroupKey;

/* ── Planes con pago (los mismos seis de /planes) ───────────────────────── */

type PlanFuente = {
  readonly name: string;
  readonly price: string;
  readonly priceAlt?: string;
  readonly checkoutId: string;
};

export type PlanPago = {
  id: string;
  linea: Linea;
  lineaNombre: string;
  nombre: string;
  precio: string;
  precioAlt?: string;
};

export const LINEAS = Object.keys(digitalPlans.groups) as Linea[];

export const planes: PlanPago[] = LINEAS.flatMap((linea) =>
  (digitalPlans.groups[linea].plans as readonly PlanFuente[]).map((p) => ({
    id: p.checkoutId,
    linea,
    lineaNombre: digitalPlans.tabs[linea],
    nombre: p.name,
    precio: p.price,
    precioAlt: p.priceAlt,
  })),
);

/** Lo que recibe la hoja de pago de Onvo. */
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

/* ── Empresas: de qué línea es cada trabajo ─────────────────────────────── */

const LINEA_DE_TIPO: Record<EmpresaProject["kind"], Linea> = {
  website: "web",
  ecommerce: "shop",
  software: "software",
};

export const empresas = empresaProjects.map((e, i) => ({ ...e, codigo: pad(i + 1), linea: LINEA_DE_TIPO[e.kind] }));

export type Empresa = (typeof empresas)[number];

/* ── Escenas de la página (el contador de jeffmilanes en la línea de avance) ── */

export const ESCENAS = [
  { id: "inicio", nombre: "Inicio" },
  { id: "nucleo", nombre: "Núcleo" },
  { id: "lo-que-hacemos", nombre: "Lo que hacemos" },
  { id: "panel", nombre: "Panel Onvi" },
  { id: "planes-inicio", nombre: "Planes" },
  { id: "contacto", nombre: "Contacto" },
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
