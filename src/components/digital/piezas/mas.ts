import type { IdPieza } from "./datos";

/**
 * "Más información" de cada servicio: después de la misma escena de
 * Servicios vienen más trabajos de verdad, cada uno en su propio mundo (el
 * fondo, la letra, los colores y los pop-ups salen del diseño de su
 * captura, como las escenas de Servicios), y al final un cierre para
 * empezar. Un servicio aparece con su botón cuando tiene al menos un extra.
 */

/** El mundo de cada sección: su piel en mundos.css (y el menú de abajo la toma al pasar). */
export type Mundo = "tienda" | "plano" | "guia" | "chat" | "agenda" | "ventas" | "registros" | "soporte";

/** Los sistemas que se ven funcionando (con pestañas por industria) en vez de una captura. */
export type Vivo = "agenda" | "ventas";

export type Extra = {
  /** También elige los pop-ups de la sección (ver PopupsMas). */
  id: string;
  mundo: Mundo;
  tema: "claro" | "oscuro";
  /** La captura; o, con `vivo`, el sistema armado en la página. */
  imagen?: string;
  vivo?: Vivo;
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
          "Tu catálogo en línea con fotos, tallas, colores y filtros. Tus clientes pagan con tarjeta o transferencia, el inventario se descuenta solo y te avisamos al instante de cada pedido.",
        etiquetas: ["Pagos con tarjeta", "Inventario automático", "Ofertas y descuentos"],
        fantasma: "77",
      },
      {
        id: "web-componentes",
        mundo: "plano",
        tema: "oscuro",
        imagen: "/servicios/web-componentes.webp",
        alt: "Sitio de bienes raíces que calcula la cuota mensual de una casa en seis bancos a la vez",
        antetitulo: "herramientas a medida",
        titulo: ["Herramientas que ", "trabajan por ti"],
        bajada:
          "Agregamos a tu página lo que tu negocio necesita: reservas en línea, cotizadores, calculadoras o comparadores de precios. Tu cliente obtiene su respuesta al instante, sin tener que llamarte.",
        etiquetas: ["Reservas", "Cotizadores", "Calculadoras", "Varios idiomas"],
        fantasma: "A-03",
      },
    ],
    cierre: {
      antetitulo: "¿y la tuya?",
      titulo: ["¿Empezamos ", "tu página?"],
      bajada:
        "Diseño a medida, dominio con correo propio, hosting y Onvi, tu asistente con IA, desde $35 al mes. Te entregamos una primera versión para que la revises antes de publicarla.",
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
          "Onvi también trabaja dentro del sistema que te hacemos. Le enseña a tu equipo a usarlo, responde sus dudas al instante y lo guía paso a paso en cada tarea: registrar un paciente, cobrar una venta, cargar inventario o emitir una factura electrónica.",
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
          "En tu página, Onvi contesta al instante lo que más te preguntan: horarios, precios, envíos y cómo llegar. Cuando alguien quiere comprar o agendar, lo pasa directo a tu WhatsApp.",
        etiquetas: ["Horarios y precios", "Cómo llegar", "Pasa a WhatsApp"],
        fantasma: "hola",
      },
    ],
    cierre: {
      antetitulo: "> ¿lo probamos?",
      titulo: ["¿Le damos voz a ", "tu negocio?"],
      bajada:
        "Onvi aprende cómo funciona tu negocio, atiende a tus clientes 24/7 en español e inglés y te envía cada interesado listo para cerrar la venta.",
    },
  },
  software: {
    extras: [
      {
        id: "software-agenda",
        mundo: "agenda",
        tema: "claro",
        vivo: "agenda",
        alt: "Sistema de agenda: las citas del día, los recordatorios por WhatsApp y lo facturado, según el tipo de negocio",
        antetitulo: "Negocios con citas y clientes",
        titulo: ["Tu agenda, ", "siempre en orden"],
        bajada:
          "Para clínicas, consultorios, salones, gimnasios, talleres y centros educativos: citas, historial de cada cliente, recordatorios por WhatsApp, cobros y facturación electrónica en un solo sistema.",
        etiquetas: ["Clínicas", "Salones y barberías", "Gimnasios", "Talleres", "Educación", "Despachos"],
        fantasma: "agenda",
      },
      {
        id: "software-ventas",
        mundo: "ventas",
        tema: "claro",
        vivo: "ventas",
        alt: "Resumen de ventas: lo vendido hoy, los pedidos, lo que falta cobrar y el inventario que hay que reponer, según el tipo de negocio",
        antetitulo: "Negocios que venden y producen",
        titulo: ["Ventas e inventario, ", "en números"],
        bajada:
          "Para restaurantes, tiendas, distribuidoras, fincas, inmobiliarias y venta de autos: caja y ventas, inventario que se actualiza solo, pedidos, entregas, cobros pendientes y reportes del día.",
        etiquetas: ["Restaurantes", "Tiendas", "Distribuidoras", "Fincas", "Inmobiliarias", "Autos"],
        fantasma: "ventas",
      },
    ],
    cierre: {
      antetitulo: "02 — ¿y el tuyo?",
      titulo: ["¿Qué sistema ", "te hace falta?"],
      bajada:
        "Cuéntanos cómo trabajas hoy, ya sea con Excel, cuadernos o WhatsApp, y lo convertimos en un sistema a tu medida. Antes de empezar, te mostramos una propuesta.",
    },
  },
  panel: {
    extras: [
      {
        id: "panel-registros",
        mundo: "registros",
        tema: "oscuro",
        imagen: "/servicios/panel-registros.webp",
        alt: "Registros del Panel Onvi: el sitio en línea el 99,91 % de los últimos 90 días, la velocidad de respuesta y las interrupciones recientes",
        antetitulo: "onvi registros",
        titulo: ["Tu página, ", "siempre en línea"],
        bajada:
          "Revisamos tu página cada 10 minutos para que nunca se caiga sin que lo sepamos. En el panel ves todo lo que pasa detrás: formularios recibidos, correos, pagos y qué tan rápido carga.",
        etiquetas: ["Monitor cada 10 min", "Formularios y pagos", "Velocidad de carga"],
        fantasma: "99,91%",
      },
      {
        id: "panel-soporte",
        mundo: "soporte",
        tema: "claro",
        imagen: "/servicios/panel-soporte.webp",
        alt: "Soporte del Panel Onvi: una nueva solicitud de cambio en el sitio, con el tipo, el asunto y la prioridad",
        antetitulo: "soporte",
        titulo: ["¿Un cambio? ", "Pídelo en un clic"],
        bajada:
          "¿Quieres cambiar un texto, una foto, un precio o agregar una sección? Lo pides desde el panel, adjuntas capturas de pantalla y ves en qué va tu solicitud hasta que queda lista.",
        etiquetas: ["Cambios en tu página", "Eliges la prioridad", "Adjuntas capturas"],
        fantasma: "#1024",
      },
    ],
    cierre: {
      antetitulo: "05 — incluido en todos los planes",
      titulo: ["Tu negocio, ", "en un solo lugar"],
      bajada: "Reservas, estadísticas y soporte en un mismo panel, desde la computadora o el celular. Incluido en todos los planes, sin costo extra.",
    },
  },
};

/** Los servicios que ya tienen su "Más información". */
export const tieneMas = (id: IdPieza) => (MAS[id]?.extras.length ?? 0) > 0;
