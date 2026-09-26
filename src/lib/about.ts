export const aboutPage = {
  hero: {
    label: "Manifiesto",
    accents: ["Accesible", "A medida", "Sostenible", "Humano"],
    /** Outline / solid segments for manifesto headline */
    lines: [
      {
        parts: [
          { text: "Nuestro objetivo era hacer que las ", style: "outline" },
          { text: "empresas y negocios", style: "solid" },
        ],
      },
      {
        parts: [
          { text: "pudieran digitalizarse sin necesidad de ", style: "outline" },
          { text: "pagar demasiado.", style: "solid" },
        ],
      },
    ],
    lead: "Sitios, tiendas y software a medida — calidad seria, precios que se pueden sostener.",
  },
  prices: {
    kicker: "Precios",
    title: "Los precios son los más competitivos del mercado,",
    emphasis: "para que cualquiera pueda accederlos.",
    market: [
      { label: "Agencia típica", value: "$2.500+" },
      { label: "Freelance premium", value: "$1.200+" },
      { label: "Plantilla + extras", value: "$800+" },
    ],
    ours: [
      { label: "Página estándar", value: "$35/mes" },
      { label: "Página Pro", value: "$55/mes" },
      { label: "E-commerce", value: "desde $50/mes" },
    ],
  },
  mission: {
    kicker: "01 · Objetivo",
    title: "Hacer la digitalización accesible de verdad.",
    body: "Vimos demasiados negocios pagar de más por páginas genéricas, o quedarse sin sistema porque el presupuesto no alcanzaba. Nuestro objetivo es simple: que cualquier empresa pueda digitalizarse bien, sin renunciar a diseño, velocidad ni soporte.",
    pillars: [
      {
        label: "Accesible",
        text: "Planes claros y mensuales que un negocio puede sostener.",
      },
      {
        label: "A medida",
        text: "Cada proyecto se adapta a tu operación, no al revés.",
      },
      {
        label: "Listo para operar",
        text: "Entregamos para usar: pagos, IA, hosting y soporte.",
      },
    ],
  },
  tools: {
    kicker: "02 · Stack",
    title: "Las mismas herramientas con las que construimos en serio.",
    body: "No improvisamos. Usamos un stack moderno, seguro y rápido — el mismo que sostiene sitios, tiendas y sistemas en producción.",
  },
  skills: {
    title: "Habilidades detrás:",
    items: [
      {
        code: "01",
        label: "Ingeniería en software",
        hint: "Arquitectura, producto vivo, ship continuo",
        mark: "code",
      },
      {
        code: "02",
        label: "Product management",
        hint: "Prioridad clara, roadmap útil, foco en valor",
        mark: "product",
      },
      {
        code: "03",
        label: "Marketing specialist",
        hint: "Posicionamiento, mensaje y crecimiento",
        mark: "market",
      },
    ],
  },
  cta: {
    title: "¿Listos para digitalizar?",
    primary: { label: "Ver los servicios", href: "/digital" },
    secondary: {
      label: "Agendar reunión",
      href: "/digital#agendar",
    },
  },
} as const;
