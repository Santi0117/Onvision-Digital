/**
 * "Lo que hacemos": las cinco piezas que se muestran una por una, cada una
 * con su mundo (fondo, letra, colores y pop-ups) y su forma de entrar.
 */

export type IdPieza = "web" | "onvi" | "software" | "componentes" | "marca";

/** La escena en pantalla: la portada con las cinco juntas, o una pieza. */
export type IdEscena = "intro" | IdPieza;

/** Cómo se pinta el fondo nuevo encima del anterior. */
export type Cortina = "barras" | "marcador" | "pixeles" | "persianas" | "iris";

export type Colores = {
  /** Fondo plano (lo que pinta la cortina antes de que aparezca la textura). */
  fondo: string;
  /** El borde de la cortina, el color que va adelante. */
  borde: string;
};

export type Accion = { texto: string; destino: "precios" | "registro" | "onvi" };

export type Pieza = {
  id: IdPieza;
  n: string;
  nombre: string;
  /** Nombre corto para el selector. */
  corto: string;
  imagen: string;
  alt: string;
  antetitulo: string;
  /** El título, con la parte que se resalta en el estilo de la escena. */
  titulo: readonly [string, string];
  bajada: string;
  etiquetas: readonly string[];
  accion: Accion;
  /** La palabra gigante del fondo. */
  fantasma: string;
  /** Para la tarjeta del menú: clara u oscura, según el fondo. */
  tema: "claro" | "oscuro";
  cortina: Cortina;
  colores: Colores;
};

export const PIEZAS: readonly Pieza[] = [
  {
    id: "web",
    n: "01",
    nombre: "Páginas web",
    corto: "Web",
    imagen: "/escenas/web.webp",
    alt: "Página de Tappy con estilo de cuaderno: los cuatro pasos para comprar, en notas pegadas",
    antetitulo: "01 · páginas web",
    titulo: ["Páginas ", "web"],
    bajada:
      "Sitios y tiendas diseñados desde cero para tu negocio: rápidos, claros y listos para vender desde el celular.",
    etiquetas: ["Diseño a medida", "Tienda y pagos", "Tu dominio"],
    accion: { texto: "Ver planes", destino: "precios" },
    fantasma: "web",
    tema: "claro",
    cortina: "marcador",
    colores: { fondo: "#f3ecdc", borde: "#ffd84d" },
  },
  {
    id: "onvi",
    n: "02",
    nombre: "Onvi",
    corto: "Onvi",
    imagen: "/escenas/onvi.webp",
    alt: "El asistente de Tappy en estilo píxel, respondiendo preguntas en el chat",
    antetitulo: "02/05 > asistente IA",
    titulo: ["", "Onvi"],
    bajada:
      "Tu asistente con IA: atiende a tus clientes por chat las 24 horas, en español e inglés, agenda citas y te pasa los contactos listos.",
    etiquetas: ["24/7", "Agenda citas", "Capta clientes"],
    accion: { texto: "Hablar con Onvi", destino: "onvi" },
    fantasma: "ONVI",
    tema: "oscuro",
    cortina: "pixeles",
    colores: { fondo: "#0c0c0c", borde: "#f2b705" },
  },
  {
    id: "software",
    n: "03",
    nombre: "Software",
    corto: "Software",
    imagen: "/escenas/software.webp",
    alt: "Onvi IA: tablero financiero con ingresos, operaciones y el asistente a un lado",
    antetitulo: "03 — software a medida",
    titulo: ["", "Software"],
    bajada:
      "Paneles, sistemas y automatizaciones que ordenan tu operación: ventas, inventario, reportes y clientes en un solo lugar.",
    etiquetas: ["Paneles", "Automatizaciones", "Reportes"],
    accion: { texto: "Contanos tu idea", destino: "registro" },
    fantasma: "software",
    tema: "claro",
    cortina: "barras",
    colores: { fondo: "#f1f3ec", borde: "#c6f432" },
  },
  {
    id: "componentes",
    n: "04",
    nombre: "Componentes personalizados",
    corto: "Componentes",
    imagen: "/escenas/componentes.webp",
    alt: "Jopa Real Estate: calculadora de cuotas con la tasa y el plazo de cada banco",
    antetitulo: "IV · a la medida de tu giro",
    titulo: ["Componentes ", "personalizados"],
    bajada:
      "Calculadoras, cotizadores, reservas y todo lo que tu página necesite para que el cliente decida sin tener que llamarte.",
    etiquetas: ["Cotizadores", "Reservas", "Calculadoras"],
    accion: { texto: "Cotizar el mío", destino: "registro" },
    fantasma: "a medida",
    tema: "claro",
    cortina: "persianas",
    colores: { fondo: "#f6f1e8", borde: "#b08a57" },
  },
  {
    id: "marca",
    n: "05",
    nombre: "Tu marca desde cero",
    corto: "Marca",
    imagen: "/escenas/marca.webp",
    alt: "La identidad de Onvision en tazas, bolsas, vasos, cajas y papelería",
    antetitulo: "05 — identidad",
    titulo: ["Tu marca ", "desde cero"],
    bajada:
      "Logo, colores, tipografía y tu presencia en Google e Instagram: todo conectado para que te encuentren y te reconozcan.",
    etiquetas: ["Identidad", "SEO en Google", "Instagram"],
    accion: { texto: "Empezar mi marca", destino: "registro" },
    fantasma: "marca.",
    tema: "claro",
    cortina: "iris",
    colores: { fondo: "#e9ecef", borde: "#34d3ee" },
  },
];

/** La portada: las cinco juntas en cascada, sobre el cielo de noche. */
export const INTRO = {
  tema: "oscuro" as const,
  cortina: "barras" as Cortina,
  colores: { fondo: "#070d24", borde: "#7ea2ff" } satisfies Colores,
  fantasma: "piezas",
};

export const escenaDe = (estado: number): IdEscena => (estado < 0 ? "intro" : PIEZAS[estado]!.id);
