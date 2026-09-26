export type ChatRole = "client" | "onvision" | "onvi";

export type ChatMessage = {
  role: ChatRole;
  name?: string;
  color?: string;
  text: string;
};

export type ClientChat = {
  id: string;
  name: string;
  initials: string;
  color: string;
  time: string;
  preview: string;
  messages: ChatMessage[];
  status?: string;
};

export const clientChats: ClientChat[] = [
  {
    id: "inventario",
    name: "Bodega Central",
    initials: "BC",
    color: "#34d59a",
    time: "14:42",
    preview: "ocupo instalar el sistema en otros dos datáfonos…",
    status: "Inventario en vivo",
    messages: [
      {
        role: "client",
        text: "Onvision, ocupo instalar el sistema que ya hicimos en otros dos datáfonos para el inventario en vivo.",
      },
      {
        role: "onvision",
        name: "Onvision",
        color: "#67e8f9",
        text: "Claro. Clonamos el mismo núcleo en los dos puntos nuevos: mismas cuentas, mismo stock, sin recargar el catálogo.",
      },
      {
        role: "onvi",
        name: "Onvi",
        color: "#fb923c",
        text: "Dejé la cola de ventas para que las cajas no se pisen las unidades. Los dos datáfonos ya pegan al panel.",
      },
      {
        role: "client",
        text: "Perfecto. Los necesitamos en piso mañana.",
      },
    ],
  },
  {
    id: "outfits",
    name: "Atelier Luna",
    initials: "AL",
    color: "#c084fc",
    time: "13:18",
    preview: "generador de outfits con mis propios productos…",
    status: "Tienda + looks",
    messages: [
      {
        role: "client",
        text: "Ocupo un generador de outfits con mis propios productos en la página web. Que el cliente arme looks y los compre.",
      },
      {
        role: "onvision",
        name: "Onvision",
        color: "#67e8f9",
        text: "Lo armamos sobre tu catálogo: prenda + calzado + accesorio, stock real y checkout Onvo.",
      },
      {
        role: "onvi",
        name: "Onvi",
        color: "#fb923c",
        text: "Sugerí reglas de estilo (color y temporada) para que no combine lo que no hay en talla.",
      },
      {
        role: "client",
        text: "Sí. Que se vea en el lookbook y que vaya al carrito de una.",
      },
    ],
  },
  {
    id: "clinica",
    name: "Clínica Solís",
    initials: "CS",
    color: "#38bdf8",
    time: "11:43",
    preview: "sistema que administre en vivo la clínica…",
    status: "Agenda en vivo",
    messages: [
      {
        role: "client",
        text: "Ocupo un sistema que administre en vivo la clínica: citas, expedientes y caja. Que recepción y el doctor vean lo mismo.",
      },
      {
        role: "onvision",
        name: "Onvision",
        color: "#67e8f9",
        text: "Queda agenda, ficha y cobro en un solo panel. WhatsApp para confirmar y el doctor ve la sala de espera al segundo.",
      },
      {
        role: "onvi",
        name: "Onvi",
        color: "#fb923c",
        text: "Marqué los huecos de 4:00 p.m. y dejé recordatorio automático 2 horas antes.",
      },
      {
        role: "client",
        text: "Eso. Sin papel y que no se dupliquen las citas.",
      },
    ],
  },
  {
    id: "universidad",
    name: "Universidad del Valle",
    initials: "UV",
    color: "#818cf8",
    time: "Ayer",
    preview: "matrícula, aulas y notas en vivo…",
    status: "Campus",
    messages: [
      {
        role: "client",
        text: "Necesitamos un sistema para la universidad: matrícula, aulas y notas en vivo. Profes y alumnos en el mismo lugar.",
      },
      {
        role: "onvision",
        name: "Onvision",
        color: "#67e8f9",
        text: "Campus con períodos, cupos y actas. El profesor sube nota y el estudiante la ve al instante.",
      },
      {
        role: "onvi",
        name: "Onvi",
        color: "#fb923c",
        text: "Armé el flujo de matrícula en 3 pasos y el aviso cuando un aula se llena.",
      },
      {
        role: "client",
        text: "Sí. Que no se sobrepongan los horarios entre facultades.",
      },
    ],
  },
  {
    id: "soda",
    name: "Soda El Patio",
    initials: "SP",
    color: "#f97316",
    time: "Ayer",
    preview: "comandas a cocina y caja al segundo…",
    status: "POS restaurante",
    messages: [
      {
        role: "client",
        text: "Onvision, ocupo que las comandas lleguen a cocina en vivo y que la caja no se atrase en el almuerzo.",
      },
      {
        role: "onvision",
        name: "Onvision",
        color: "#67e8f9",
        text: "POS + pase de cocina. La mesa manda, cocina ve el ticket y caja cierra con IVA de comida preparada.",
      },
      {
        role: "onvi",
        name: "Onvi",
        color: "#fb923c",
        text: "Separé bebidas y platos fuertes para que no se trabe la barra.",
      },
      {
        role: "client",
        text: "Listo. Lo queremos para el fin de semana.",
      },
    ],
  },
  {
    id: "taller",
    name: "Taller Ríos",
    initials: "TR",
    color: "#f472b6",
    time: "Lun",
    preview: "órdenes de trabajo y repuestos en vivo…",
    status: "Taller",
    messages: [
      {
        role: "client",
        text: "Ocupo ver las órdenes del taller en vivo: qué carro está en fosa, qué falta de repuesto y cuándo se entrega.",
      },
      {
        role: "onvision",
        name: "Onvision",
        color: "#67e8f9",
        text: "Tablero por estado, inventario de partes y aviso al cliente cuando el carro está listo.",
      },
      {
        role: "onvi",
        name: "Onvi",
        color: "#fb923c",
        text: "Dejé el WhatsApp de “ya puede pasar” ligado a la orden, no a un chat suelto.",
      },
      {
        role: "client",
        text: "Eso. Que recepción no ande preguntando al mecánico.",
      },
    ],
  },
];
