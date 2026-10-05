import type { IdPieza } from "./datos";

/**
 * "Más información" de cada servicio: después de la misma escena de
 * Servicios vienen más trabajos de verdad, cada uno con su captura, su texto
 * y sus pop-ups en el estilo de la escena, y al final un cierre para
 * arrancar. Un servicio aparece con su botón cuando tiene al menos un extra.
 */

export type Extra = {
  /** También elige los pop-ups de la sección (ver PopupsMas). */
  id: string;
  imagen: string;
  alt: string;
  antetitulo: string;
  /** El título, con la parte que se resalta en el estilo de la escena. */
  titulo: readonly [string, string];
  bajada: string;
  etiquetas: readonly string[];
  /** La palabra gigante del fondo. */
  fantasma: string;
};

export type Mas = {
  extras: readonly Extra[];
  cierre: { antetitulo: string; titulo: readonly [string, string]; bajada: string };
};

export const MAS: Partial<Record<IdPieza, Mas>> = {
  web: {
    extras: [
      {
        id: "web-tienda",
        imagen: "/servicios/web-tienda.webp",
        alt: "Tienda en línea de camisetas deportivas: filtros por liga y por equipo, ofertas y precios en colones",
        antetitulo: "02 · tiendas en línea",
        titulo: ["Tu tienda, ", "vendiendo"],
        bajada:
          "Catálogo con filtros, tallas y colores, carrito y pagos con tarjeta o SINPE. Las ofertas y el stock se actualizan solos y cada pedido te llega al instante.",
        etiquetas: ["Carrito y pagos", "Filtros", "Stock al día"],
        fantasma: "tienda",
      },
      {
        id: "web-componentes",
        imagen: "/servicios/web-componentes.webp",
        alt: "Sitio de bienes raíces que calcula la cuota mensual de una casa en seis bancos a la vez",
        antetitulo: "03 · componentes a medida",
        titulo: ["Piezas que ", "trabajan"],
        bajada:
          "Lo que tu negocio necesita dentro de la página: calculadoras, cotizadores, reservas o comparadores. Como la cuota de una casa en seis bancos, al instante y en tres idiomas.",
        etiquetas: ["Calculadoras", "Cotizadores", "Varios idiomas"],
        fantasma: "a medida",
      },
    ],
    cierre: {
      antetitulo: "¿y la tuya?",
      titulo: ["¿Arrancamos ", "tu página?"],
      bajada: "Diseño a medida, tu dominio con correo propio y Onvi incluido. La primera versión, lista para revisar.",
    },
  },
};

/** Los servicios que ya tienen su "Más información". */
export const tieneMas = (id: IdPieza) => (MAS[id]?.extras.length ?? 0) > 0;
