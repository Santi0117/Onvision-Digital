export const empresasPage = {
  eyebrow: "Onvision Digital · Empresas",
  title: "Algunos de los trabajos que ya están corriendo.",
  lead: "Algunas de las marcas y proyectos con los que hemos trabajado: sitios, tiendas y software a medida.",
  filters: [
    { id: "all", label: "Todos" },
    { id: "website", label: "Sitio web" },
    { id: "ecommerce", label: "E-commerce" },
    { id: "software", label: "Software" },
  ],
  cta: {
    title: "¿Querés ver el tuyo acá?",
    lead: "Agendá una reunión y vemos qué vale la pena construir primero.",
    label: "Agendar reunión",
    href: "/digital#agendar",
  },
} as const;

export type EmpresaFilter = (typeof empresasPage.filters)[number]["id"];

export type EmpresaProject = {
  id: string;
  name: string;
  sector: string;
  kind: Exclude<EmpresaFilter, "all">;
  kindLabel: string;
  body: string;
  image: string;
  href?: string;
  linkLabel?: string;
};

/** Mismas empresas que /empresas del portafolio (TRUSTED_COMPANIES). */
export const empresaProjects: EmpresaProject[] = [
  {
    id: "alchemy",
    name: "Alchemy Studio",
    sector: "Estudio musical · Estados Unidos",
    kind: "website",
    kindLabel: "Sitio web",
    body: "Estudio de grabación y producción musical. Sesiones, producción y servicios para artistas, bandas y proyectos creativos.",
    image: "/digital/web-std-alchemy-cut2.png",
    href: "https://www.alchemymusicstudio.com",
  },
  {
    id: "clinicos",
    name: "Clinic OS",
    sector: "Gestión clínica · Costa Rica",
    kind: "software",
    kindLabel: "Software",
    body: "Plataforma de gestión para clínicas y consultorios: agenda, pacientes, inventario y finanzas en un solo lugar.",
    image: "/digital/saas-clinicos-mock.png",
    href: "https://clinicos.onvisiondigital.com",
    linkLabel: "Visitar sitio de ejemplo",
  },
  {
    id: "fasamar",
    name: "Fasamar S.A.",
    sector: "Distribución láctea · Costa Rica",
    kind: "software",
    kindLabel: "Software",
    body: "Distribuidora de productos lácteos. Sistema a medida para rutas, inventario y control operativo de la zona cartaginesa.",
    image: "/digital/saas-fasamar-mock.png",
  },
  {
    id: "jopa-realestate",
    name: "Jopa Real Estate",
    sector: "Inmobiliaria · Cartago",
    kind: "website",
    kindLabel: "Sitio web",
    body: "Agencia inmobiliaria en Cartago. Compra, venta y asesoría de propiedades residenciales y comerciales en la zona central.",
    image: "/digital/web-jopa-realestate-cut8.png",
    href: "https://joparealestate.com",
  },
  {
    id: "crestview",
    name: "Crestview Legal",
    sector: "Servicios legales · Estados Unidos",
    kind: "website",
    kindLabel: "Sitio web",
    body: "Firma de servicios legales que acompaña clientes en temas jurídicos con atención personalizada, claridad y confianza.",
    image: "/digital/web-std-crestview-cut2.png",
    href: "https://www.crestview-legal.com",
  },
  {
    id: "firstdown",
    name: "FirstDown",
    sector: "Tienda de jerseys · Costa Rica",
    kind: "ecommerce",
    kindLabel: "E-commerce",
    body: "Tienda de jerseys de fútbol americano y béisbol. Camisetas por liga y equipo, con personalización y pedidos con envío.",
    image: "/digital/ecom-firstdown-tienda-cut2.png",
    href: "https://firstdown-store.com",
  },
  {
    id: "la-pacifica",
    name: "Clínica Dental La Pacífica",
    sector: "Clínica dental · San José",
    kind: "website",
    kindLabel: "Sitio web",
    body: "Centro odontológico en San Francisco de Dos Ríos. Cirugía dental, ortodoncia, endodoncia, periodoncia y atención integral.",
    image: "/digital/web-la-pacifica-mock.png",
    href: "https://la-pacifica.com",
  },
  {
    id: "unilearn",
    name: "UniLearn",
    sector: "Educación · Costa Rica",
    kind: "software",
    kindLabel: "Software",
    body: "Plataforma académica para instituciones. Conecta administración, docentes y estudiantes con cursos, calendario y seguimiento.",
    image: "/digital/saas-unilearn-cut2.png",
    href: "https://unilearn.onvisiondigital.com",
    linkLabel: "Visitar sitio de ejemplo",
  },
  {
    id: "jopa-autos",
    name: "Jopa Autos",
    sector: "Venta de vehículos · Cartago",
    kind: "website",
    kindLabel: "Sitio web",
    body: "Concesionario de vehículos usados y nuevos en Pitahaya, Cartago. Inventario, financiamiento y asesoría para encontrar el carro adecuado.",
    image: "/digital/web-pro-jopa-autos-cut2.png",
    href: "https://autosjopa.com",
  },
  {
    id: "guba",
    name: "Guba",
    sector: "Retail · Costa Rica",
    kind: "ecommerce",
    kindLabel: "E-commerce",
    body: "Tienda retail con catálogo de productos para compra online. Variedad de artículos con compra directa desde la web.",
    image: "/digital/ecom-guba-cut2.png",
    href: "https://frutasguba.onvisiondigital.com",
  },
];
