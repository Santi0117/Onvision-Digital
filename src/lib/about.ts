export const aboutPage = {
  hero: {
    label: "Manifiesto",
    /** Lo que va cambiando dentro del óvalo, junto a "Manifiesto". */
    accents: ["Accesible", "A medida", "Con soporte", "Humano"],
    /** Outline / solid segments for manifesto headline */
    lines: [
      {
        parts: [
          { text: "Nuestro objetivo es que ", style: "outline" },
          { text: "cualquier negocio", style: "solid" },
        ],
      },
      {
        parts: [
          { text: "pueda digitalizarse ", style: "outline" },
          { text: "sin pagar de más.", style: "solid" },
        ],
      },
    ],
  },
  mission: {
    kicker: "01 · Objetivo",
    title: "Hacer la digitalización accesible de verdad.",
    body: "Somos Onvision Digital, un equipo de Costa Rica que crea páginas web, tiendas, sistemas y apps. Vimos a muchos negocios pagar de más por páginas genéricas o quedarse sin sistema por falta de presupuesto. Por eso trabajamos con pagos mensuales: buen diseño, rapidez y soporte.",
    pillars: [
      {
        label: "Accesible",
        text: "Pagos mensuales claros, sin un gran pago al inicio.",
      },
      {
        label: "A medida",
        text: "Cada proyecto se adapta a cómo trabaja tu negocio.",
      },
      {
        label: "Listo para usar",
        text: "Te lo entregamos funcionando: cobros en línea, asistente con IA, hosting y soporte.",
      },
    ],
  },
  tools: {
    kicker: "02 · Tecnología",
    title: "Tecnología moderna, la misma que usan empresas grandes.",
    body: "Trabajamos con herramientas modernas y seguras, usadas en todo el mundo. Tu página carga rápido, está protegida y crece contigo.",
    /** Una línea debajo de cada logo: para qué sirve. */
    uses: {
      "Next.js": "Páginas que cargan rápido",
      ONVO: "Cobros con tarjeta",
      React: "Pantallas fluidas",
      PostgreSQL: "Tus datos ordenados",
      Neon: "Datos en la nube",
      Notion: "Proyecto organizado",
      Postman: "Todo probado",
      OWASP: "Normas de seguridad",
      AWS: "Servidores confiables",
      Vercel: "Tu sitio siempre en línea",
    } as Record<string, string>,
  },
  skills: {
    title: "Lo que hay detrás de cada proyecto",
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
    title: "¿Todo listo para digitalizar tu negocio?",
    primary: { label: "Ver los servicios", href: "/digital" },
    secondary: {
      label: "Agendar reunión",
      href: "/planes#agendar",
    },
  },
} as const;
