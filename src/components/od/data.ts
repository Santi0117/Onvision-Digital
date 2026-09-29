import { companyNav } from "@/lib/company";
import { digitalShowreel } from "@/lib/digital";
import { empresaProjects, empresasPage } from "@/lib/empresas";
import { site } from "@/lib/site";

export const SISTEMA_URL = "https://sistema.onvisiondigital.com";

/** El menú oficial; "Sistema" sale al sitio del SaaS. */
export const navegacion = companyNav.map((l) => ({
  label: l.label,
  href: l.href,
  externo: l.href.startsWith("http"),
}));

export const wa = (texto?: string) =>
  `https://wa.me/${site.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;

/** Los cuatro servicios del showreel, cada uno con su línea de planes. */
const GRUPO = { web: "web", shop: "shop", saas: "software", mobile: "mobile" } as const;

export const servicios = digitalShowreel.items.map((item) => ({
  ...item,
  grupo: GRUPO[item.id as keyof typeof GRUPO],
}));

export type Servicio = (typeof servicios)[number];

/** Filtros de empresas con su cantidad: "SITIO WEB (5)". */
export const filtrosEmpresas = empresasPage.filters.map((f) => ({
  ...f,
  cantidad: f.id === "all" ? empresaProjects.length : empresaProjects.filter((p) => p.kind === f.id).length,
}));

export const iniciales = (nombre: string) =>
  nombre
    .replace(/S\.A\.|Studio|Legal|Real Estate/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

type LenisLike = { scrollTo: (t: number | string | HTMLElement, o?: { offset?: number; duration?: number }) => void };

/** Scroll suave con Lenis si está prendido; si no, el del navegador. */
export function irA(destino: string | number, offset = -90) {
  const w = window as unknown as { __odLenis?: LenisLike };
  if (typeof destino === "string") {
    const el = document.querySelector<HTMLElement>(destino);
    if (!el) return;
    if (w.__odLenis) w.__odLenis.scrollTo(el, { offset });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
    return;
  }
  if (w.__odLenis) w.__odLenis.scrollTo(destino);
  else window.scrollTo({ top: destino, behavior: "smooth" });
}
