import localFont from "next/font/local";

/**
 * Cuatro familias de base, cada una registrada una sola vez:
 * - Archivo con eje de ancho: la grotesca gigante y ancha de hobro y la
 *   condensada en mayúsculas de jeffmilanes, según el ancho que se pida.
 * - Cormorant Garamond: la serif fina de acento (hobro, nordpixel) y los
 *   titulares editoriales del inicio, con su parte en itálica (wisprflow).
 * - Geist: el texto de siempre de Onvision.
 * - Geist Mono: etiquetas, contadores y botones de terminal.
 *
 * Y dos de escena, solo para las escenas de Servicios (sin precarga: están
 * más abajo): Caveat, la letra a mano del cuaderno, y Silkscreen, la de
 * píxeles.
 *
 * Van guardadas en `fuentes/` (las de Google Fonts, recortadas a latín y
 * latín extendido, como antes): bajarlas de Google en cada compilación a veces
 * fallaba en Vercel y la publicación no salía.
 */
const display = localFont({
  src: "./fuentes/archivo.woff2",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--ff-display",
  display: "swap",
});

const serif = localFont({
  src: [
    { path: "./fuentes/cormorant.woff2", weight: "300 500", style: "normal" },
    { path: "./fuentes/cormorant-italica.woff2", weight: "300 500", style: "italic" },
  ],
  variable: "--ff-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const sans = localFont({
  src: "./fuentes/geist.woff2",
  weight: "100 900",
  variable: "--ff-sans",
  display: "swap",
});

const mono = localFont({
  src: "./fuentes/geist-mono.woff2",
  weight: "100 900",
  variable: "--ff-mono",
  display: "swap",
});

const mano = localFont({
  src: "./fuentes/caveat.woff2",
  weight: "500 700",
  variable: "--ff-mano",
  display: "swap",
  preload: false,
});

const pixel = localFont({
  src: [
    { path: "./fuentes/silkscreen-400.woff2", weight: "400", style: "normal" },
    { path: "./fuentes/silkscreen-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--ff-pixel",
  display: "swap",
  preload: false,
});

export const fontVariables = [display, serif, sans, mono, mano, pixel].map((f) => f.variable).join(" ");
