import { site } from "./site";

export const companyNav = [
  { label: "Servicios", href: "/digital" },
  { label: "Planes", href: "/digital#planes" },
  { label: "Empresas", href: "/empresas" },
  { label: "Sistema", href: "https://sistema.onvisiondigital.com/producto" },
  { label: "Sobre nosotros", href: "/sobre-nosotros" },
] as const;

export const companyHero = {
  headline: "Ambicioso y accesible.",
  flapWords: [
    "ONVISION DIGITAL",
    "HACEMOS SOFTWARE",
    "SITIOS Y TIENDAS",
    "SISTEMAS EN VIVO",
  ],
  primaryCta: { label: "Ver los servicios", href: "/digital" },
  secondaryCta: { label: "Agendar una reunión", href: "/digital#agendar" },
} as const;

export const companyWalkthrough = {
  title: "Cualquier idea que tengas, la volvemos realidad",
  points: [
    "PERSONALIZACIÓN 100%",
    "IA ENTRENADA PARA TU NEGOCIO",
    "DISEÑO A TU MARCA",
    "FLUJO HECHO A TU OPERACIÓN",
    "SOFTWARE, PÁGINA WEB, APPS MÓVILES",
  ],
  cta: { label: "Ver los servicios", href: "/digital" },
} as const;

export const companyOnvi = {
  title: "Nuestra IA Onvi se incluye y te ayuda en cualquier proyecto.",
  points: [
    "VA CON SITIO, TIENDA O SISTEMA",
    "IA QUE RESPONDE A TUS CLIENTES",
    "IA QUE AYUDA A MANEJAR TU NEGOCIO",
    "ACOMPAÑA CADA AJUSTE DEL CLIENTE",
    "SIN CONTRATAR OTRA HERRAMIENTA",
  ],
  cta: { label: "Agendar una reunión", href: "/digital#agendar" },
} as const;

export const companyChats = {
  title: "Los clientes piden el sistema. Nosotros lo dejamos corriendo.",
  points: [
    "INVENTARIO, CLÍNICAS, UNIVERSIDADES, TIENDAS",
    "CADA CHAT ES UN BRIEF",
    "LO TOMAMOS Y LO CONSTRUIMOS",
    "ENTREGA LISTA PARA REVISAR",
  ],
  cta: { label: "Ver los servicios", href: "/digital" },
} as const;

export const companySistema = {
  title: "Un mismo núcleo, un sistema para tu industria:",
  points: [
    "FACTURACIÓN 4.4 INCLUIDA",
    "INVENTARIO Y SINPE LISTOS",
    "VERTICAL POR INDUSTRIA",
    "₡10.500 AL MES",
  ],
  cta: { label: "Activar Onvision", href: "/activar" },
} as const;

export const companyOffers = {
  title: "No te atrasés en digitalizar tu negocio. Onvision es para todos.",
  cards: [
    {
      title: "Sistema Onvision",
      body: "Unificá cada parte del negocio en un solo sistema, con IA y personalización asistida por industria.",
      cta: { label: "Activar el sistema", href: "/activar" },
    },
    {
      title: "Onvision Digital",
      body: "Software o página a medida: tienda, landing o app con tu marca, lista para vender y con Onvi incluido.",
      cta: {
        label: "Ver Digital",
        href: "/digital",
      },
    },
    {
      title: "Soporte 24/7",
      body: "English and Spanish, around the clock. Te respondemos cuando el negocio no puede parar.",
      cta: {
        label: "Hablar ahora",
        href: `https://wa.me/${site.whatsapp}`,
        external: true,
      },
    },
  ],
} as const;

export type CliStepKind = "think" | "read" | "search" | "write" | "text" | "code";

export type CliStep = {
  kind: CliStepKind;
  text: string;
};

export type CliReply = {
  steps: CliStep[];
  ask?: string;
};

const REPLIES: { test: RegExp; reply: CliReply }[] = [
  {
    test: /precio|plan|mensual|cuesta|cobr|pago|onvo/i,
    reply: {
      steps: [
        { kind: "think", text: "Pensé 3s" },
        { kind: "read", text: "planes, mensualidades y el mínimo de 5 meses…" },
        {
          kind: "text",
          text: "La mensualidad cubre diseño a medida, hosting, soporte y el panel Onvi. En sitios y tiendas, el primer mes se paga en Onvo; con tarjeta, los meses 2 a 5 se recargan solos.",
        },
        {
          kind: "code",
          text: "web-standard  ₡15.000/mes\nweb-pro        ₡25.000/mes\nshop-standard  ₡22.000/mes\nsaas           $130/mes",
        },
        {
          kind: "text",
          text: "Después del mes 5 podés seguir, pasar a cobro manual o cancelar. Software y apps móviles no tienen ese mínimo. El pago único se coordina aparte.",
        },
      ],
      ask: "¿Querés que te abra el producto SaaS o te arme el brief de tu sitio?",
    },
  },
  {
    test: /saas|factura|inventario|sinpe|hacienda|tribu|activar/i,
    reply: {
      steps: [
        { kind: "think", text: "Pensé 4s" },
        { kind: "search", text: "Onvision SaaS · FE 4.4 · verticales" },
        { kind: "read", text: "/producto, industrias y el flujo de /activar…" },
        {
          kind: "text",
          text: "Onvision es el SaaS de la casa: facturación electrónica 4.4, inventario, POS y SINPE. Un núcleo, módulos por industria.",
        },
        {
          kind: "code",
          text: "onvision/activar  →  elegí vertical  →  ₡10.500/mes",
        },
      ],
      ask: "¿Te llevo a Activar o preferís ver industrias primero?",
    },
  },
  {
    test: /empresa|pac[ií]fica|firstdown|portafolio|cliente|vitrina/i,
    reply: {
      steps: [
        { kind: "think", text: "Pensé 2s" },
        { kind: "read", text: "Onvision Empresas y fichas de clientes…" },
        {
          kind: "text",
          text: "Empresas es la vitrina pública: cada cliente tiene ficha, sector y sitio. La Pacífica y FirstDown ya están con su dominio propio.",
        },
        {
          kind: "code",
          text: "la-pacifica.com\nfirstdown-store.com\nonvisiondigital.com/empresas",
        },
      ],
      ask: "¿Querés que te prepare una ficha para tu negocio?",
    },
  },
  {
    test: /tienda|e-?commerce|jersey|carrito|shop/i,
    reply: {
      steps: [
        { kind: "think", text: "Pensé 3s" },
        { kind: "search", text: "tiendas Onvision · catálogo · checkout" },
        {
          kind: "text",
          text: "Armamos tiendas a medida: catálogo, personalización, checkout y envíos. FirstDown es el ejemplo vivo de jerseys en colones.",
        },
        {
          kind: "code",
          text: "tienda/  catálogo  +variantes  +whatsapp  +onvo",
        },
      ],
      ask: "¿Es una tienda nueva o ya tenés inventario?",
    },
  },
  {
    test: /cl[ií]nica|dental|reserva|cita|whatsapp/i,
    reply: {
      steps: [
        { kind: "think", text: "Pensé 4s" },
        { kind: "read", text: "clínicas del portafolio y el flujo de reservas…" },
        {
          kind: "text",
          text: "Para una clínica armo landing premium, servicios, reservas y WhatsApp. Si querés, también la ficha en Empresas.",
        },
        {
          kind: "code",
          text: "clinica/page.tsx  +Reservas  +WhatsApp  +Empresas",
        },
      ],
      ask: "¿La clínica ya tiene marca y fotos, o partimos de cero?",
    },
  },
  {
    test: /contacto|hablar|reunion|demo|cotiz|whats?app|llamar/i,
    reply: {
      steps: [
        { kind: "think", text: "Pensé 1s" },
        {
          kind: "text",
          text: `Escribinos y coordinamos. WhatsApp ${site.phone} o ${site.email}. También podés agendar desde el sitio principal.`,
        },
        {
          kind: "code",
          text: `wa.me/${site.whatsapp}\n${site.email}`,
        },
      ],
      ask: "¿Preferís que te deje el mensaje listo para WhatsApp?",
    },
  },
];

const DEFAULT_REPLY: CliReply = {
  steps: [
    { kind: "think", text: "Pensé 3s" },
    { kind: "search", text: "sitios, tiendas, SaaS y apps en Onvision…" },
    {
      kind: "text",
      text: "Puedo ayudarte a plantear un sitio, una tienda, una app o el SaaS de Onvision. Contame el negocio, el plazo y si preferís mensualidad o pago único.",
    },
    {
      kind: "code",
      text: "sitios · tiendas · software · apps · onvision saas",
    },
  ],
  ask: "¿Empezamos por el tipo de proyecto o por presupuesto?",
};

export const cliWelcomeReply: CliReply = {
  steps: [
    {
      kind: "text",
      text: "Hola, soy Onvi — la IA de Onvision.",
    },
    {
      kind: "text",
      text: "Hacemos sitios web, tiendas online, software a medida y apps, siempre a tu marca y listos para revisar.",
    },
    {
      kind: "text",
      text: "También tenemos el Sistema Onvision: facturación electrónica 4.4, inventario, POS y SINPE, con un núcleo por industria.",
    },
    {
      kind: "text",
      text: "Yo voy incluida en cada proyecto: ayudo a responder clientes, a operar el negocio y a ajustar lo que haga falta.",
    },
  ],
  ask: "¿En qué te puedo ayudar?",
};

export function replyForPrompt(prompt: string): CliReply {
  const trimmed = prompt.trim();
  if (!trimmed) return DEFAULT_REPLY;
  for (const entry of REPLIES) {
    if (entry.test.test(trimmed)) return entry.reply;
  }
  return {
    ...DEFAULT_REPLY,
    steps: [
      { kind: "think", text: "Pensé 2s" },
      {
        kind: "text",
        text: `Anoté esto: “${trimmed.slice(0, 160)}”. Lo encajo en un proyecto Onvision — sitio, tienda, app o el SaaS — y te propongo el siguiente paso.`,
      },
      ...DEFAULT_REPLY.steps.slice(1),
    ],
  };
}

export function stepLabel(kind: CliStepKind): string | null {
  switch (kind) {
    case "think":
      return null;
    case "read":
      return "Leí";
    case "search":
      return "Busqué";
    case "write":
      return "Escribí";
    default:
      return null;
  }
}
