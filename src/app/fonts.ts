import { Archivo, Caveat, Cormorant_Garamond, Geist, Geist_Mono, Silkscreen } from "next/font/google";

/**
 * Cuatro familias de base, cada una registrada una sola vez:
 * - Archivo con eje de ancho: la grotesca gigante y ancha de hobro y la
 *   condensada en mayúsculas de jeffmilanes, según el ancho que se pida.
 * - Cormorant Garamond: la serif fina de acento (hobro, nordpixel) y los
 *   titulares editoriales del inicio, con su parte en itálica (wisprflow).
 * - Geist: el texto de siempre de Onvision.
 * - Geist Mono: etiquetas, contadores y botones de terminal.
 *
 * Y dos de escena, solo para "Lo que hacemos" (sin precarga: están más
 * abajo): Caveat, la letra a mano del cuaderno, y Silkscreen, la de píxeles.
 */
const display = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--ff-display",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--ff-serif",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--ff-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--ff-mono",
  display: "swap",
});

const mano = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--ff-mano",
  display: "swap",
  preload: false,
});

const pixel = Silkscreen({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--ff-pixel",
  display: "swap",
  preload: false,
});

export const fontVariables = [display, serif, sans, mono, mano, pixel].map((f) => f.variable).join(" ");
