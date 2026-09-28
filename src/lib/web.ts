/**
 * Contenido e tipos de la landing /web (laptop que se abre).
 * Independiente de /vision: se puede trabajar y deployar por separado.
 */

export type VisionPin = "up" | "down" | "left" | "right";

export type VisionModule = {
  id: string;
  label: string;
  detail: string;
  accent?: boolean;
  pin?: VisionPin;
};

export type VisionDemo =
  | "factura"
  | "inventario"
  | "sinpe"
  | "onvi"
  | "verticales"
  | "tienda";

export type VisionFeature = {
  id: string;
  color: string;
  title: string;
  lead: string;
  bullets: readonly [string, string, string];
  snippet: readonly string[];
  demo: VisionDemo;
};

type Cta = { readonly label: string; readonly href: string };

export type VisionContent = {
  hero: {
    readonly eyebrow: string;
    readonly title: readonly string[];
    readonly lead: string;
    readonly pill: string;
    readonly primaryCta: Cta;
    readonly secondaryCta: Cta;
  };
  core: { readonly title: readonly string[]; readonly lead: string };
  modules: readonly VisionModule[];
  features: readonly VisionFeature[];
  outro: {
    readonly eyebrow: string;
    readonly modulesTitle: string;
    readonly title: string;
    readonly lead: string;
    readonly primaryCta: Cta;
    readonly secondaryCta: Cta;
  };
};

export const webHero = {
  eyebrow: "Onvision Digital",
  title: ["Soluciones digitales", "hechas para vender."],
  lead: "Construimos lo que tu negocio necesita para vender y operar en digital.",
  pill: "Moderno y accesible",
  primaryCta: { label: "Quiero mi sitio", href: "/planes#agendar" },
  secondaryCta: { label: "Ver cómo se arma", href: "#nucleo" },
} as const;

export const webCore = {
  title: ["Un sitio completo,", "pieza por pieza."],
  lead: "Todo lo que tu sitio necesita para funcionar, ya incluido.",
} as const;

/** Orden = tapa → piezas del sitio → cuerpo, igual que en la escena 3D. */
export const webModules: readonly VisionModule[] = [
  { id: "pantalla", label: "tu sitio", detail: "Diseño a medida, en tu dominio.", pin: "left" },
  { id: "portada", label: "portada", detail: "Primera impresión que convierte.", pin: "left" },
  { id: "agenda", label: "agenda", detail: "Reservas y citas en línea.", pin: "right" },
  { id: "contacto", label: "contacto", detail: "Formularios que llegan a WhatsApp y correo.", pin: "right" },
  { id: "animaciones", label: "animaciones", detail: "Movimiento que se siente premium.", pin: "left" },
  { id: "chatbot", label: "chatbot onvi", detail: "Responde a tus clientes 24/7.", accent: true, pin: "down" },
  { id: "tienda", label: "catálogo y tienda", detail: "Vendé con SINPE y tarjeta.", pin: "right" },
  { id: "seo", label: "seo y velocidad", detail: "Google te encuentra y carga rápido.", pin: "right" },
  { id: "base", label: "hosting incluido", detail: "Dominio, hosting y soporte, todo en la cuota.", pin: "down" },
] as const;

export const webFeatures: readonly VisionFeature[] = [
  {
    id: "agenda",
    color: "#f8fafc",
    title: "Agendas y reservas",
    lead: "Tus clientes reservan y agendan desde el sitio, y se vincula con tu panel administrativo Onvi.",
    bullets: ["Reservas desde el sitio", "Vinculado al panel Onvi", "Confirmación en segundos"],
    snippet: ["agenda.reservar({", "  servicio: 'Consulta',", "  fecha: 'mañana 9:00',", "});"],
    demo: "factura",
  },
  {
    id: "seo",
    color: "#f8fafc",
    title: "SEO y velocidad",
    lead: "Un sitio que Google entiende y que carga en menos de un segundo, también en el teléfono.",
    bullets: ["Métricas en verde", "Textos y etiquetas optimizados", "Imágenes livianas"],
    snippet: ["sitio.medir();", "// → rendimiento 98 · seo 100"],
    demo: "inventario",
  },
  {
    id: "contacto",
    color: "#f8fafc",
    title: "Software a medida",
    lead: "Paneles, inventario y flujos propios, hechos para cómo opera tu negocio todos los días.",
    bullets: ["Hecho para tu operación", "Paneles e inventario", "Se integra con lo que ya usás"],
    snippet: ["sistema.operar({", "  panel: 'administrativo',", "  flujo: 'pedidos',", "});"],
    demo: "sinpe",
  },
  {
    id: "chatbot",
    color: "#f8fafc",
    title: "Integración con IA",
    lead: "Onvi responde, agenda y recomienda, conectada a tu sitio y a tu operación.",
    bullets: ["Atiende 24/7 en español", "Aprende tu catálogo", "Te pasa los leads"],
    snippet: ["onvi.responder(", "  '¿Tienen citas mañana?'", ");"],
    demo: "onvi",
  },
  {
    id: "animaciones",
    color: "#f8fafc",
    title: "Animaciones",
    lead: "Transiciones y movimiento con intención: el sitio se siente vivo sin distraer.",
    bullets: ["Scroll con escenas", "Micro-interacciones", "Fluido en móvil"],
    snippet: ["animar('.hero', {", "  entrada: 'suave',", "});"],
    demo: "verticales",
  },
  {
    id: "tienda",
    color: "#f8fafc",
    title: "Métodos de pago integrados",
    lead: "Tu marca vendiendo en línea, con SINPE y tarjeta, conectada a tu inventario.",
    bullets: ["Dominio propio", "Catálogo sincronizado", "Checkout con SINPE y tarjeta"],
    snippet: ["tienda.publicar({", "  pagos: ['sinpe', 'tarjeta'],", "});"],
    demo: "tienda",
  },
] as const;

export const webOutro = {
  eyebrow: "Piezas",
  modulesTitle: "Todo lo que trae tu sitio.",
  title: "Un sitio a tu medida, no una plantilla.",
  lead:
    "Nos contás el negocio, elegimos las piezas y en días tenés tu sitio publicado en tu dominio, con Onvi incluida.",
  primaryCta: { label: "Quiero mi sitio", href: "/planes#agendar" },
  secondaryCta: { label: "Ver planes", href: "/planes" },
} as const;

export const webContent: VisionContent = {
  hero: webHero,
  core: webCore,
  modules: webModules,
  features: webFeatures,
  outro: webOutro,
};
