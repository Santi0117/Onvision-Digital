import { site } from "./site";

export const companyNav = [
  { label: "Servicios", href: "/digital" },
  { label: "Planes", href: "/planes" },
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
  secondaryCta: { label: "Agendar una reunión", href: "/planes#agendar" },
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
  cta: { label: "Agendar una reunión", href: "/planes#agendar" },
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
  title: "Una misma base, un sistema para tu industria:",
  points: [
    "FACTURACIÓN 4.4 INCLUIDA",
    "INVENTARIO Y SINPE LISTOS",
    "VERTICAL POR INDUSTRIA",
    "₡10.500 AL MES",
  ],
  cta: { label: "Activar Onvision", href: "/activar" },
} as const;

export const companyOffers = {
  title: "Digitaliza tu negocio sin pagar de más. Hay un plan para ti.",
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
          text: "web-standard  ₡15.000/mes\nweb-pro        ₡25.000/mes\nshop-standard  ₡22.000/mes\nsoftware       $130/mes",
        },
        {
          kind: "text",
          text: "Después del mes 5 puedes seguir, pasar a cobro manual o cancelar. Software y apps móviles no tienen ese mínimo. El pago único se coordina aparte.",
        },
      ],
      ask: "¿Quieres que te muestre el Sistema Onvision o te arme el brief de tu sitio?",
    },
  },
  {
    test: /saas|factura|inventario|sinpe|hacienda|tribu|activar/i,
    reply: {
      steps: [
        { kind: "think", text: "Pensé 4s" },
        { kind: "search", text: "Sistema Onvision · FE 4.4 · industrias" },
        { kind: "read", text: "/producto, industrias y el flujo de /activar…" },
        {
          kind: "text",
          text: "El Sistema Onvision es el de la casa: facturación electrónica 4.4, inventario, caja y SINPE, con módulos para cada industria.",
        },
        {
          kind: "code",
          text: "onvision/activar  →  elige tu industria  →  ₡10.500/mes",
        },
      ],
      ask: "¿Te llevo a Activar o prefieres ver las industrias primero?",
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
      ask: "¿Quieres que te prepare una ficha para tu negocio?",
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
          text: "Armamos tiendas a medida: catálogo, personalización, checkout y envíos. FirstDown es el ejemplo vivo: camisetas deportivas en colones.",
        },
        {
          kind: "code",
          text: "tienda/  catálogo  +variantes  +whatsapp  +onvo",
        },
      ],
      ask: "¿Es una tienda nueva o ya tienes inventario?",
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
          text: "Para una clínica armo landing premium, servicios, reservas y WhatsApp. Si quieres, también la ficha en Empresas.",
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
          text: `Escríbenos y coordinamos. WhatsApp ${site.phone} o ${site.email}. También puedes agendar desde el sitio principal.`,
        },
        {
          kind: "code",
          text: `wa.me/${site.whatsapp}\n${site.email}`,
        },
      ],
      ask: "¿Prefieres que te deje el mensaje listo para WhatsApp?",
    },
  },
];

const DEFAULT_REPLY: CliReply = {
  steps: [
    { kind: "think", text: "Pensé 3s" },
    { kind: "search", text: "sitios, tiendas, sistemas y apps en Onvision…" },
    {
      kind: "text",
      text: "Puedo ayudarte a plantear un sitio, una tienda, una app o el Sistema Onvision. Cuéntame sobre tu negocio, para cuándo lo necesitas y si prefieres pagar mes a mes o en un solo pago.",
    },
    {
      kind: "code",
      text: "sitios · tiendas · software · apps · sistema onvision",
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
      text: "Hacemos sitios web, tiendas en línea, software a medida y apps, siempre a tu marca y listos para revisar.",
    },
    {
      kind: "text",
      text: "También tenemos el Sistema Onvision: facturación electrónica 4.4, inventario, caja y SINPE, con módulos para cada industria.",
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
        text: `Anoté esto: “${trimmed.slice(0, 160)}”. Lo encajo en un proyecto Onvision — sitio, tienda, app o el Sistema — y te propongo el siguiente paso.`,
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
