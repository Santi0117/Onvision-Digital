"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { pad, pedirServicio } from "./data";
import { Flecha } from "./ui";
import "./proyectos.css";

type Foto = { src: string; alt: string; ancho: number; alto: number };

type Proyecto = {
  id: string;
  cliente: string;
  tipo: string;
  resumen: string;
  puntos: readonly string[];
  /** La nota que flota junto a la imagen: lo que más vale la pena recalcar. */
  nota: { titulo: string; texto: string };
  /** El servicio que queda elegido en "Cuéntanos tu idea". */
  quiero: string;
  tono: string;
  fondo: string;
  /** Lo que dice la barra de la ventana. */
  barra: string;
  imagen: Foto;
  flotantes: readonly (Foto & { clase: string })[];
};

const PROYECTOS: readonly Proyecto[] = [
  {
    id: "fasamar",
    cliente: "Fasamar",
    tipo: "Software de gestión ganadera",
    resumen:
      "Producción láctea, inventario, rutas de venta y facturación electrónica en un solo sistema, con su propia app de cobro para datáfonos.",
    puntos: ["Facturación electrónica 4.4", "Inventario y rendimientos", "Rutas de venta"],
    nota: {
      titulo: "También en datáfono",
      texto: "En la ruta se vende, se cobra con efectivo, SINPE o tarjeta y el recibo sale impreso ahí mismo.",
    },
    quiero: "Software a medida",
    tono: "#2bd497",
    fondo: "#05130e",
    barra: "sistema · fasamar",
    imagen: {
      src: "/proyectos/fasamar-sistema.webp",
      alt: "El inventario del sistema de Fasamar: stock, producción láctea y rendimientos",
      ancho: 1600,
      alto: 910,
    },
    flotantes: [
      {
        src: "/proyectos/fasamar-datafono-ruta.webp",
        alt: "Datáfono con la venta en ruta: los productos y lo que queda de cada uno",
        ancho: 417,
        alto: 1000,
        clase: "pr-flota--ruta",
      },
      {
        src: "/proyectos/fasamar-datafono-cobro.webp",
        alt: "Datáfono cobrando: efectivo, SINPE, tarjeta o pendiente, con tiquete o factura",
        ancho: 419,
        alto: 1000,
        clase: "pr-flota--cobro",
      },
    ],
  },
  {
    id: "etilico",
    cliente: "Etílico",
    tipo: "Sitio web para eventos",
    resumen:
      "Barra libre para eventos en todo Costa Rica. Un sitio oscuro y elegante que muestra las barras y la carta, y recibe las cotizaciones en línea.",
    puntos: ["Cotizador de barras", "Reservas en línea", "Monitoreo cada hora"],
    nota: {
      titulo: "Con su Panel Onvi",
      texto: "Reservas, formularios y el estado del sitio, en un panel propio.",
    },
    quiero: "Página web",
    tono: "#c6d23c",
    fondo: "#0b0b09",
    barra: "etílico · barra libre",
    imagen: {
      src: "/proyectos/etilico-sitio.webp",
      alt: "La portada del sitio de Etílico: barra libre para tu evento",
      ancho: 1600,
      alto: 948,
    },
    flotantes: [
      {
        src: "/proyectos/etilico-panel.webp",
        alt: "El Panel Onvi de Etílico: todo en línea y la velocidad de respuesta del sitio",
        ancho: 1100,
        alto: 352,
        clase: "pr-flota--panel",
      },
    ],
  },
  {
    id: "tappy",
    cliente: "Tappy",
    tipo: "Sitio y tienda en línea",
    resumen:
      "Stickers NFC que avisan a la familia con solo acercar el teléfono. Su sitio vende, explica cómo funciona y lleva a descargar la app, con un estilo retro propio.",
    puntos: ["Tienda con carrito", "Planes para empresas", "Diseño a su medida"],
    nota: {
      titulo: "Cada sección, su mundo",
      texto: "De la consola retro de la portada a la libreta de las opiniones.",
    },
    quiero: "Tienda en línea",
    tono: "#f2c418",
    fondo: "#15120c",
    barra: "tappy · stickers nfc",
    imagen: {
      src: "/proyectos/tappy-sitio.webp",
      alt: "La portada del sitio de Tappy: stickers NFC inteligentes",
      ancho: 1600,
      alto: 908,
    },
    flotantes: [
      {
        src: "/proyectos/tappy-opiniones.webp",
        alt: "Las opiniones de clientes en el sitio de Tappy, en notas de colores",
        ancho: 1000,
        alto: 633,
        clase: "pr-flota--opiniones",
      },
    ],
  },
];

/**
 * Proyectos más recientes: uno por pantalla, que se apilan al bajar (cada
 * uno tapa al anterior). A la izquierda qué es y qué se hizo; a la derecha
 * la imagen grande en una ventana, con lo que vino aparte flotando encima
 * (los datáfonos de Fasamar, el Panel Onvi de Etílico, las opiniones de
 * Tappy). Cada uno con su propio fondo, como el resto del inicio.
 */
export default function Proyectos() {
  const seccion = useRef<HTMLElement>(null);

  // Cada proyecto entra cuando se ve. Sin JavaScript se ve todo de una.
  useEffect(() => {
    const raiz = seccion.current;
    if (!raiz) return;
    raiz.setAttribute("data-listo", "");
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) e.target.setAttribute("data-visto", "");
      },
      { threshold: 0.35 },
    );
    raiz.querySelectorAll(".pr-panel").forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={seccion} id="proyectos" className="pr" aria-labelledby="pr-titulo">
      <h2 id="pr-titulo" className="sr-only">
        Proyectos más recientes
      </h2>
      {PROYECTOS.map((p, i) => (
        <article
          key={p.id}
          className={`pr-panel pr-panel--${p.id}`}
          data-tema="oscuro"
          style={{ "--pr-tono": p.tono, "--pr-fondo": p.fondo } as CSSProperties}
          aria-labelledby={`pr-${p.id}`}
        >
          <div className="pr-panel__dentro">
            <div className="pr-texto">
              <p className="pr-arriba" aria-hidden>
                <span>Proyectos más recientes</span>
                <span>
                  {pad(i + 1)} / {pad(PROYECTOS.length)}
                </span>
              </p>
              <h3 id={`pr-${p.id}`} className="pr-cliente">
                {p.cliente}
              </h3>
              <p className="pr-tipo">{p.tipo}</p>
              <p className="pr-resumen">{p.resumen}</p>
              <ul className="pr-puntos">
                {p.puntos.map((punto) => (
                  <li key={punto}>{punto}</li>
                ))}
              </ul>
              <button type="button" className="pr-quiero" onClick={() => pedirServicio(p.quiero)}>
                Quiero uno así
                <Flecha className="h-4 w-4" />
              </button>
            </div>

            <div className="pr-visual">
              <figure className="pr-ventana">
                <div className="pr-ventana__barra" aria-hidden>
                  <i />
                  <i />
                  <i />
                  <span>{p.barra}</span>
                </div>
                <Image
                  className="pr-ventana__img"
                  src={p.imagen.src}
                  alt={p.imagen.alt}
                  width={p.imagen.ancho}
                  height={p.imagen.alto}
                  sizes="(max-width: 899px) 92vw, 58vw"
                  unoptimized
                />
              </figure>
              {p.flotantes.map((f) => (
                <Image
                  key={f.src}
                  className={`pr-flota ${f.clase}`}
                  src={f.src}
                  alt={f.alt}
                  width={f.ancho}
                  height={f.alto}
                  sizes="(max-width: 899px) 40vw, 26vw"
                  unoptimized
                />
              ))}
              <p className="pr-nota">
                <b>{p.nota.titulo}</b>
                <span>{p.nota.texto}</span>
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
