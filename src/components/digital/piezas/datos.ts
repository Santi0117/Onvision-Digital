/**
 * Las piezas de Servicios, una por una: cada una con su mundo (fondo, letra,
 * colores y pop-ups) y su forma de entrar.
 */

export type IdPieza = "web" | "onvi" | "software" | "apps" | "panel" | "marca";

/** Cómo se pinta el fondo nuevo encima del anterior. */
export type Cortina = "barras" | "marcador" | "pixeles" | "persianas" | "iris" | "app";

export type Colores = {
  /** Fondo plano (lo que pinta la cortina antes de que aparezca la textura). */
  fondo: string;
  /** El borde de la cortina, el color que va adelante. */
  borde: string;
};

/** Adónde lleva el botón de cada pieza, dentro de Servicios (o el chat de Onvi). */
export type Accion = { texto: string; destino: "planes" | "agendar" | "onvi" };

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
    accion: { texto: "Ver planes", destino: "planes" },
    fantasma: "web",
    tema: "claro",
    cortina: "marcador",
    colores: { fondo: "#f3ecdc", borde: "#ffd84d" },
  },
  {
    id: "software",
    n: "02",
    nombre: "Software",
    corto: "Software",
    imagen: "/escenas/software.webp",
    alt: "Onvi IA: tablero financiero con ingresos, operaciones y el asistente a un lado",
    antetitulo: "02 — software a medida",
    titulo: ["", "Software"],
    bajada:
      "Paneles, sistemas y automatizaciones que ordenan tu operación: ventas, inventario, reportes y clientes en un solo lugar.",
    etiquetas: ["Paneles", "Automatizaciones", "Reportes"],
    accion: { texto: "Contanos tu idea", destino: "agendar" },
    fantasma: "software",
    tema: "claro",
    cortina: "barras",
    colores: { fondo: "#f1f3ec", borde: "#c6f432" },
  },
  {
    id: "apps",
    n: "03",
    nombre: "Apps móviles",
    corto: "Apps",
    imagen: "/escenas/apps.webp",
    alt: "App de hidratación en un iPhone: la meta diaria de 2 litros, el tamaño de la botella y los recordatorios",
    antetitulo: "03 · apps móviles",
    titulo: ["Apps ", "móviles"],
    bajada:
      "Apps para iPhone y Android con tu marca en el bolsillo del cliente: cuenta, pedidos, recordatorios y notificaciones.",
    etiquetas: ["iOS y Android", "Notificaciones", "Pagos in-app"],
    accion: { texto: "Cotizar mi app", destino: "agendar" },
    fantasma: "apps",
    tema: "oscuro",
    cortina: "app",
    colores: { fondo: "#120b2e", borde: "#8b7bff" },
  },
  {
    id: "onvi",
    n: "04",
    nombre: "Onvi",
    corto: "Onvi",
    imagen: "/escenas/onvi.webp",
    alt: "El asistente de Tappy en estilo píxel, respondiendo preguntas en el chat",
    antetitulo: "04/06 > asistente IA",
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
    id: "panel",
    n: "05",
    nombre: "Panel Onvi",
    corto: "Panel",
    imagen: "/escenas/panel.webp",
    alt: "Panel Onvi: las reservas del día, con la cita de Karla Cordero abierta a la derecha",
    antetitulo: "05 — incluido en todos los planes",
    titulo: ["Panel ", "Onvi"],
    bajada:
      "Tu negocio en un solo lugar: reservas, formularios, analítica y soporte. Confirmá citas y escribile a tus clientes en un toque.",
    etiquetas: ["Reservas", "Registros", "Soporte"],
    accion: { texto: "Ver planes", destino: "planes" },
    fantasma: "panel",
    tema: "oscuro",
    cortina: "persianas",
    colores: { fondo: "#03070b", borde: "#34d3ee" },
  },
  {
    id: "marca",
    n: "06",
    nombre: "Tu marca desde cero",
    corto: "Marca",
    imagen: "/escenas/marca.webp",
    alt: "La identidad de Onvision en tazas, bolsas, vasos, cajas y papelería",
    antetitulo: "06 — identidad",
    titulo: ["Tu marca ", "desde cero"],
    bajada:
      "Logo, colores, tipografía y tu presencia en Google e Instagram: todo conectado para que te encuentren y te reconozcan.",
    etiquetas: ["Identidad", "SEO en Google", "Instagram"],
    accion: { texto: "Empezar mi marca", destino: "agendar" },
    fantasma: "marca.",
    tema: "claro",
    cortina: "iris",
    colores: { fondo: "#e9ecef", borde: "#34d3ee" },
  },
];
