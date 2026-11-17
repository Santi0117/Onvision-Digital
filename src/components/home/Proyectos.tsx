"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { pad, pedirServicio } from "./data";
import { Flecha } from "./ui";
import "./proyectos.css";

type Foto = { src: string; alt: string };
type Vista = Foto & { nombre: string };

type Proyecto = {
  id: string;
  cliente: string;
  tipo: string;
  resumen: string;
  puntos: readonly string[];
  /** Lo que más vale la pena recalcar del proyecto. */
  nota: { titulo: string; texto: string };
  /** El servicio que queda elegido en "Cuéntanos tu idea". */
  quiero: string;
  tono: string;
  fondo: string;
  /** El sitio del cliente. Sin él (un sistema interno) no hay botón para visitarlo. */
  sitio?: string;
  /** Lo que dice la barra de direcciones de la ventana. */
  direccion: string;
  /** Las pestañas de la ventana: cómo se ve cada parte del proyecto (1600x900). */
  vistas: readonly Vista[];
  /** Lo que flota sobre la ventana: el sitio en el celular o el datáfono. */
  flota: Foto & { ancho: number; alto: number; forma: "celular" | "datafono" };
};

const PROYECTOS: readonly Proyecto[] = [
  {
    id: "etilico",
    cliente: "Etílico",
    tipo: "Sitio web para eventos",
    resumen:
      "Barra libre para eventos en todo Costa Rica. Un sitio oscuro y elegante que muestra las barras y la carta, y recibe las cotizaciones en línea.",
    puntos: ["Cotizador de barras", "Reservas en línea", "Monitoreo cada hora"],
    nota: { titulo: "Con su Panel Onvi", texto: "Reservas, formularios y el estado del sitio, en un panel propio." },
    quiero: "Página web",
    tono: "#c6d23c",
    fondo: "#0b0b09",
    sitio: "https://www.etilicocr.com",
    direccion: "etilicocr.com",
    vistas: [
      { nombre: "Inicio", src: "/proyectos/etilico-inicio.webp", alt: "La portada del sitio de Etílico: barra libre para tu evento" },
      { nombre: "Barras", src: "/proyectos/etilico-barras.webp", alt: "Las barras de Etílico: Barra Negra, Barra Blanca y Barra Etílico" },
      { nombre: "Carta", src: "/proyectos/etilico-carta.webp", alt: "La carta de Etílico: veintisiete tragos, una sola barra" },
      { nombre: "Eventos", src: "/proyectos/etilico-eventos.webp", alt: "Los eventos de Etílico: bodas, corporativos, quinceaños y graduaciones" },
      { nombre: "Panel Onvi", src: "/proyectos/etilico-panel-onvi.webp", alt: "El Panel Onvi de Etílico: todo en línea y la velocidad de respuesta del sitio" },
    ],
    flota: { src: "/proyectos/etilico-cel.webp", alt: "El sitio de Etílico en el celular", ancho: 450, alto: 974, forma: "celular" },
  },
  {
    id: "firstdown",
    cliente: "FirstDown",
    tipo: "Tienda en línea de jerseys",
    resumen:
      "Jerseys y ropa deportiva de NFL, NBA, MLB, NHL y F1. Una tienda con el catálogo por liga y equipo, carrito de compras y campañas como Black November.",
    puntos: ["Catálogo por liga y equipo", "Carrito de compras", "Campañas y descuentos"],
    nota: { titulo: "Cientos de productos", texto: "Filtros por liga, equipo y precio para encontrar la camisa en segundos." },
    quiero: "Tienda en línea",
    tono: "#f5d000",
    fondo: "#07142b",
    sitio: "https://firstdown-store.com",
    direccion: "firstdown-store.com",
    vistas: [
      { nombre: "Inicio", src: "/proyectos/firstdown-inicio.webp", alt: "La portada de la tienda FirstDown: Black November" },
      { nombre: "Black November", src: "/proyectos/firstdown-black-november.webp", alt: "La campaña Black November de FirstDown: 10% menos en todas las camisas" },
      { nombre: "Ligas", src: "/proyectos/firstdown-ligas.webp", alt: "Las ligas de FirstDown: NBA, NFL, MLB, NHL y F1" },
      { nombre: "Tienda", src: "/proyectos/firstdown-tienda.webp", alt: "El catálogo de FirstDown con filtros por liga y equipo" },
    ],
    flota: { src: "/proyectos/firstdown-cel.webp", alt: "La tienda FirstDown en el celular", ancho: 450, alto: 974, forma: "celular" },
  },
  {
    id: "jopa-autos",
    cliente: "Jopa Autos",
    tipo: "Sitio para venta de autos",
    resumen:
      "Autos de lujo en Pitahaya, Cartago. Un sitio con el inventario y sus filtros, una calculadora de financiamiento y un formulario para vender tu vehículo.",
    puntos: ["Inventario con filtros", "Calculadora de financiamiento", "Vende tu vehículo"],
    nota: { titulo: "Financiamiento al instante", texto: "Eliges un auto del inventario y ves la cuota aproximada al mes." },
    quiero: "Página web",
    tono: "#e5484d",
    fondo: "#111113",
    sitio: "https://autosjopa.com",
    direccion: "autosjopa.com",
    vistas: [
      { nombre: "Inicio", src: "/proyectos/jopa-autos-inicio.webp", alt: "La portada de Jopa Autos" },
      { nombre: "Vehículos", src: "/proyectos/jopa-autos-vehiculos.webp", alt: "El inventario de Jopa Autos con filtros por marca, precio y año" },
      { nombre: "Financiamiento", src: "/proyectos/jopa-autos-financiamiento.webp", alt: "La calculadora de financiamiento de Jopa Autos" },
      { nombre: "Vender tu auto", src: "/proyectos/jopa-autos-vender.webp", alt: "El formulario para vender tu vehículo en Jopa Autos" },
    ],
    flota: { src: "/proyectos/jopa-autos-cel.webp", alt: "El sitio de Jopa Autos en el celular", ancho: 450, alto: 974, forma: "celular" },
  },
  {
    id: "jopa-realestate",
    cliente: "Jopa Real Estate",
    tipo: "Sitio inmobiliario",
    resumen:
      "Propiedades exclusivas en Costa Rica, en venta y alquiler. Un sitio con las propiedades destacadas, las zonas, sus servicios y la agenda de visitas en línea.",
    puntos: ["Venta y alquiler", "Zonas y servicios", "Agenda de visitas"],
    nota: { titulo: "Visitas en línea", texto: "El cliente elige la propiedad, el día y la hora; un asesor le confirma la visita." },
    quiero: "Página web",
    tono: "#e0b24a",
    fondo: "#0c1630",
    sitio: "https://joparealestate.com",
    direccion: "joparealestate.com",
    vistas: [
      { nombre: "Inicio", src: "/proyectos/jopa-realestate-inicio.webp", alt: "La portada de Jopa Real Estate: encontrá el hogar que merecés" },
      { nombre: "Propiedades", src: "/proyectos/jopa-realestate-propiedades.webp", alt: "Las propiedades destacadas de Jopa Real Estate" },
      { nombre: "Zonas", src: "/proyectos/jopa-realestate-zonas.webp", alt: "Las zonas de Jopa Real Estate: Jacó, Heredia, Cartago y San José" },
      {
        nombre: "Servicios",
        src: "/proyectos/jopa-realestate-servicios.webp",
        alt: "Los servicios de Jopa Real Estate: compra y venta, alquiler, inversión y asesoría legal",
      },
    ],
    flota: { src: "/proyectos/jopa-realestate-cel.webp", alt: "El sitio de Jopa Real Estate en el celular", ancho: 450, alto: 974, forma: "celular" },
  },
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
    direccion: "sistema · fasamar",
    vistas: [
      { nombre: "Inventario", src: "/proyectos/fasamar-sistema.webp", alt: "El inventario del sistema de Fasamar: stock, producción láctea y rendimientos" },
      { nombre: "Datáfonos", src: "/proyectos/fasamar-datafonos.webp", alt: "Los datáfonos de Fasamar: la venta en ruta y el cobro con recibo impreso" },
    ],
    flota: {
      src: "/proyectos/fasamar-datafono-cobro.webp",
      alt: "Datáfono cobrando: efectivo, SINPE, tarjeta o pendiente, con tiquete o factura",
      ancho: 620,
      alto: 1494,
      forma: "datafono",
    },
  },
];

const TOTAL = PROYECTOS.length;

/** Cuánto hay que deslizar el dedo (en px) para pasar de proyecto. */
const DESLIZAR = 48;

/**
 * Proyectos más recientes: un carrusel de clientes que ya están en línea. Se
 * pasa con las flechas (o deslizando en el celular), no bajando. A la
 * izquierda qué es y el botón para visitar el sitio; a la derecha una
 * ventana con pestañas para ver cada parte del proyecto, y el celular (o el
 * datáfono, en Fasamar) flotando encima. Cada cliente tiene su color.
 */
export default function Proyectos() {
  const seccion = useRef<HTMLElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const [actual, setActual] = useState(0);
  const [vistas, setVistas] = useState<readonly number[]>(() => PROYECTOS.map(() => 0));
  const [cerca, setCerca] = useState(false);
  const p = PROYECTOS[actual]!;

  const ir = useCallback((n: number) => setActual(((n % TOTAL) + TOTAL) % TOTAL), []);
  const elegirVista = (i: number, j: number) => setVistas((v) => v.map((x, k) => (k === i ? j : x)));

  // Las imágenes cargan cuando la sección se acerca; la entrada, cuando se ve.
  useEffect(() => {
    const raiz = seccion.current;
    if (!raiz) return;
    raiz.setAttribute("data-listo", "");
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setCerca(true);
          if (e.intersectionRatio >= 0.2) raiz.setAttribute("data-visto", "");
        }
      },
      { rootMargin: "800px 0px", threshold: [0, 0.2] },
    );
    io.observe(raiz);
    return () => io.disconnect();
  }, []);

  const alTeclado = (e: KeyboardEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).getAttribute("role") === "tab") return;
    if (e.key === "ArrowRight") ir(actual + 1);
    else if (e.key === "ArrowLeft") ir(actual - 1);
    else return;
    e.preventDefault();
  };

  // Deslizar con el dedo (el ratón usa las flechas). El scroll vertical sigue normal.
  const alTocar = (e: PointerEvent<HTMLDivElement>) => {
    toque.current = e.pointerType === "mouse" ? null : { x: e.clientX, y: e.clientY };
  };
  const alSoltar = (e: PointerEvent<HTMLDivElement>) => {
    const t = toque.current;
    toque.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) > DESLIZAR && Math.abs(dx) > Math.abs(dy) * 1.3) ir(actual + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      ref={seccion}
      id="proyectos"
      className="pr"
      data-tema="oscuro"
      aria-labelledby="pr-titulo"
      aria-roledescription="carrusel"
      style={{ "--pr-tono": p.tono } as CSSProperties}
      onKeyDown={alTeclado}
    >
      {/* Un fondo por cliente: al cambiar de proyecto, el color se funde. */}
      <div className="pr-fondos" aria-hidden>
        {PROYECTOS.map((x, i) => (
          <i key={x.id} className={i === actual ? "is-on" : undefined} style={{ "--pr-tono": x.tono, "--pr-fondo": x.fondo } as CSSProperties} />
        ))}
      </div>

      <div className="pr-dentro">
        <header className="pr-cabeza">
          <h2 id="pr-titulo" className="pr-arriba">
            Proyectos más recientes
          </h2>
          <p className="pr-cuenta" aria-hidden>
            <b>{pad(actual + 1)}</b> / {pad(TOTAL)}
          </p>
          <div className="pr-flechas">
            <button type="button" className="pr-flecha" onClick={() => ir(actual - 1)} aria-label="Proyecto anterior">
              <Flecha dir="izquierda" className="h-5 w-5" />
            </button>
            <button type="button" className="pr-flecha pr-flecha--siguiente" onClick={() => ir(actual + 1)} aria-label="Siguiente proyecto">
              <Flecha className="h-5 w-5" />
            </button>
          </div>
        </header>

        <p className="sr-only" aria-live="polite">
          Proyecto {actual + 1} de {TOTAL}: {p.cliente}
        </p>

        <div className="pr-vista" onPointerDown={alTocar} onPointerUp={alSoltar} onPointerCancel={() => (toque.current = null)}>
          <div className="pr-pista" style={{ transform: `translateX(${-actual * 100}%)` }}>
            {PROYECTOS.map((x, i) => {
              const activa = i === actual;
              const vista = vistas[i] ?? 0;
              // El activo y sus vecinos se bajan antes, para que al pasar ya estén.
              const distancia = Math.abs(i - actual);
              const vecina = Math.min(distancia, TOTAL - distancia) <= 1;
              const carga = cerca && vecina ? "eager" : "lazy";
              return (
                <article
                  key={x.id}
                  className={`pr-slide pr-slide--${x.id}`}
                  aria-roledescription="diapositiva"
                  aria-label={`${i + 1} de ${TOTAL}: ${x.cliente}`}
                  inert={!activa}
                  style={{ "--pr-tono": x.tono } as CSSProperties}
                >
                  <div className="pr-texto">
                    <h3 className="pr-cliente">{x.cliente}</h3>
                    <p className="pr-tipo">{x.tipo}</p>
                    <p className="pr-resumen">{x.resumen}</p>
                    <ul className="pr-puntos">
                      {x.puntos.map((punto) => (
                        <li key={punto}>{punto}</li>
                      ))}
                    </ul>
                    <p className="pr-nota">
                      <b>{x.nota.titulo}</b>
                      <span>{x.nota.texto}</span>
                    </p>
                    <div className="pr-botones">
                      {x.sitio ? (
                        <a className="pr-visitar" href={x.sitio} target="_blank" rel="noopener noreferrer">
                          Visitar sitio <Flecha dir="diagonal" className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="pr-privado">Sistema interno: no es público</span>
                      )}
                      <button type="button" className="pr-quiero" onClick={() => pedirServicio(x.quiero)}>
                        Quiero uno así
                        <Flecha className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pr-visual">
                    <figure className="pr-ventana">
                      <div className="pr-pestanas">
                        <span className="pr-semaforo" aria-hidden>
                          <i />
                          <i />
                          <i />
                        </span>
                        <div
                          role="tablist"
                          aria-label={`Vistas de ${x.cliente}`}
                          className="pr-pestanas__lista"
                          onKeyDown={(e) => {
                            const paso = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                            if (!paso) return;
                            e.preventDefault();
                            const j = (vista + paso + x.vistas.length) % x.vistas.length;
                            elegirVista(i, j);
                            document.getElementById(`pr-${x.id}-pestana-${j}`)?.focus();
                          }}
                        >
                          {x.vistas.map((v, j) => (
                            <button
                              key={v.src}
                              id={`pr-${x.id}-pestana-${j}`}
                              type="button"
                              role="tab"
                              aria-selected={j === vista}
                              aria-controls={`pr-${x.id}-pantalla`}
                              tabIndex={j === vista ? 0 : -1}
                              className="pr-pestana"
                              onClick={() => elegirVista(i, j)}
                            >
                              <i aria-hidden />
                              {v.nombre}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="pr-barra" aria-hidden>
                        <span>{x.direccion}</span>
                      </div>
                      <div id={`pr-${x.id}-pantalla`} className="pr-pantalla" role="tabpanel" aria-labelledby={`pr-${x.id}-pestana-${vista}`}>
                        {x.vistas.map((v, j) => (
                          <Image
                            key={v.src}
                            className={`pr-captura${j === vista ? " is-on" : ""}`}
                            src={v.src}
                            alt={j === vista ? v.alt : ""}
                            aria-hidden={j !== vista}
                            width={1600}
                            height={900}
                            sizes="(max-width: 899px) 92vw, 58vw"
                            loading={carga}
                            unoptimized
                          />
                        ))}
                      </div>
                    </figure>
                    <div className={`pr-flota pr-flota--${x.flota.forma}`}>
                      <Image
                        src={x.flota.src}
                        alt={x.flota.alt}
                        width={x.flota.ancho}
                        height={x.flota.alto}
                        sizes="(max-width: 899px) 26vw, 12vw"
                        loading={carga}
                        unoptimized
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <nav className="pr-indice" aria-label="Elegir proyecto">
          {PROYECTOS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              className="pr-indice__item"
              aria-current={i === actual ? "true" : undefined}
              onClick={() => ir(i)}
              style={{ "--pr-tono": x.tono } as CSSProperties}
            >
              <span>{pad(i + 1)}</span>
              {x.cliente}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
