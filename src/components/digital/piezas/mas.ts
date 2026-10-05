import type { IdPieza } from "./datos";

/**
 * "Más información" de cada servicio: después de la misma escena de
 * Servicios vienen más trabajos de verdad, cada uno en su propio mundo (el
 * fondo, la letra, los colores y los pop-ups salen del diseño de su
 * captura, como las escenas de Servicios), y al final un cierre para
 * arrancar. Un servicio aparece con su botón cuando tiene al menos un extra.
 */

/** El mundo de cada sección: su piel en mundos.css (y el menú de abajo la toma al pasar). */
export type Mundo = "tienda" | "cuotas" | "guia" | "chat" | "finca" | "salon";

export type Extra = {
  /** También elige los pop-ups de la sección (ver PopupsMas). */
  id: string;
  mundo: Mundo;
  tema: "claro" | "oscuro";
  imagen: string;
  alt: string;
  antetitulo: string;
  /** El título, con la parte que se resalta en el estilo del mundo. */
  titulo: readonly [string, string];
  bajada: string;
  etiquetas: readonly string[];
  /** La palabra (o el número) gigante del fondo. */
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
        mundo: "tienda",
        tema: "oscuro",
        imagen: "/servicios/web-tienda.webp",
        alt: "Tienda en línea de camisetas deportivas: filtros por liga y por equipo, ofertas y precios en colones",
        antetitulo: "tiendas en línea",
        titulo: ["Tu tienda, ", "vendiendo"],
        bajada:
          "Catálogo con filtros, tallas y colores, carrito y pagos con tarjeta o SINPE. Las ofertas y el stock se actualizan solos y cada pedido te llega al instante.",
        etiquetas: ["Carrito y pagos", "Filtros", "Stock al día"],
        fantasma: "77",
      },
      {
        id: "web-componentes",
        mundo: "cuotas",
        tema: "claro",
        imagen: "/servicios/web-componentes.webp",
        alt: "Sitio de bienes raíces que calcula la cuota mensual de una casa en seis bancos a la vez",
        antetitulo: "componentes a medida",
        titulo: ["Piezas que ", "trabajan"],
        bajada:
          "Lo que tu negocio necesita dentro de la página: calculadoras, cotizadores, reservas o comparadores. Como la cuota de una casa en seis bancos, al instante y en tres idiomas.",
        etiquetas: ["Calculadoras", "Cotizadores", "Varios idiomas"],
        fantasma: "₡",
      },
    ],
    cierre: {
      antetitulo: "¿y la tuya?",
      titulo: ["¿Arrancamos ", "tu página?"],
      bajada: "Diseño a medida, tu dominio con correo propio y Onvi incluido. La primera versión, lista para revisar.",
    },
  },
  onvi: {
    extras: [
      {
        id: "onvi-software",
        mundo: "guia",
        tema: "oscuro",
        imagen: "/servicios/onvi-software.webp",
        alt: "Sistema de una clínica con la agenda del día y Onvi abierto a un lado, guiando la configuración para facturar",
        antetitulo: "dentro de tu software",
        titulo: ["Te guía ", "paso a paso"],
        bajada:
          "Onvi también vive dentro del software que te hacemos: acompaña a tu equipo a configurarlo, explica cada pantalla y responde dudas. Como dejar una clínica lista para facturar ante Hacienda, campo por campo.",
        etiquetas: ["Guía paso a paso", "Responde dudas", "Dentro del sistema"],
        fantasma: "guía",
      },
      {
        id: "onvi-pagina",
        mundo: "chat",
        tema: "claro",
        imagen: "/servicios/onvi-pagina.webp",
        alt: "Sitio de un taller con el asistente respondiendo el horario y el mapa para llegar",
        antetitulo: "en tu página",
        titulo: ["¿En qué te ", "ayudo?"],
        bajada:
          "En tu sitio, Onvi responde horarios, precios, envíos y cómo llegar, con los datos de tu negocio, y pasa a WhatsApp a quien quiere comprar o agendar.",
        etiquetas: ["Horarios y precios", "Cómo llegar", "Pasa a WhatsApp"],
        fantasma: "hola",
      },
    ],
    cierre: {
      antetitulo: "> ¿lo probamos?",
      titulo: ["¿Le damos voz a ", "tu negocio?"],
      bajada: "Onvi aprende de tu negocio, atiende 24/7 en español e inglés y te pasa los contactos listos.",
    },
  },
  software: {
    extras: [
      {
        id: "software-cosecha",
        mundo: "finca",
        tema: "claro",
        imagen: "/servicios/software-cosecha.webp",
        alt: "Sistema de una finca: valor de la cosecha, insumos y lo que hay en bodega, producto por producto",
        antetitulo: "fincas y producción",
        titulo: ["Tu finca, ", "en números"],
        bajada:
          "Cosecha en bodega, insumos, merma y rendimientos en un solo lugar. Cada cosecha registrada actualiza el inventario y el valor de lo que tenés.",
        etiquetas: ["Inventario", "Rendimientos", "Merma"],
        fantasma: "cosecha",
      },
      {
        id: "software-mesas",
        mundo: "salon",
        tema: "claro",
        imagen: "/servicios/software-mesas.webp",
        alt: "Sistema de un restaurante con las mesas del salón, libres y ocupadas, y el botón para pasar al punto de venta",
        antetitulo: "restaurantes",
        titulo: ["Del salón ", "a la cocina"],
        bajada:
          "Las mesas libres y ocupadas de un vistazo: tocás una, abrís la orden y pasás a cobrar. La comanda llega a la cocina y la factura electrónica sale al cobrar.",
        etiquetas: ["Mesas y órdenes", "Punto de venta", "Factura electrónica"],
        fantasma: "mesas",
      },
    ],
    cierre: {
      antetitulo: "03 — ¿y el tuyo?",
      titulo: ["¿Qué sistema ", "te hace falta?"],
      bajada: "Contanos cómo trabajás hoy y lo convertimos en un sistema a tu medida: ventas, inventario, reportes y clientes en un solo lugar.",
    },
  },
};

/** Los servicios que ya tienen su "Más información". */
export const tieneMas = (id: IdPieza) => (MAS[id]?.extras.length ?? 0) > 0;
