"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Ojo } from "../../od/ui";
import "./retos.css";

/** Lo que aparece sobre la imagen, uno después del otro: el pedido y cómo quedó. */
type Aviso = { etiqueta: string; texto: string; listo?: boolean };

type Reto = {
  id: string;
  servicio: string;
  pregunta: string;
  /** Sin imagen: la marca se dibuja en vivo. */
  imagen?: string;
  alt: string;
  avisos: [Aviso, Aviso];
  como: [string, string, string];
};

/**
 * Lo difícil de cada servicio, contado con un trabajo de verdad (sin decir
 * de quién): la pregunta que nos hacen, la captura de cómo quedó y cómo lo
 * resolvemos.
 */
const RETOS: Reto[] = [
  {
    id: "web",
    servicio: "Páginas web",
    pregunta: "¿Que tu cliente compare la cuota en varios bancos sin salir de tu sitio?",
    imagen: "/retos/cuotas.webp",
    alt: "Sitio de bienes raíces que compara la cuota de seis bancos, en computadora y celular.",
    avisos: [
      { etiqueta: "Casa en Tejar · $145.000", texto: "Prima 20% · 25 años" },
      { etiqueta: "La más baja", texto: "Banco A · $891 al mes", listo: true },
    ],
    como: [
      "La cuota se calcula al instante, sin recargar la página.",
      "Las tasas se cambian en un solo lugar y el sitio entero se entera.",
      "El cálculo le llega al asesor con los datos del cliente.",
    ],
  },
  {
    id: "onvi",
    servicio: "Onvi",
    pregunta: "¿Que alguien escriba a las 11:48 p. m. y reciba respuesta con tu agenda real?",
    imagen: "/retos/clinica.webp",
    alt: "Sitio de una clínica dental con el chat abierto en el celular.",
    avisos: [
      { etiqueta: "11:48 p. m. · cliente", texto: "¿Tienen espacio mañana para una limpieza?" },
      { etiqueta: "Onvi", texto: "Sí: mañana a las 4:15 p. m. ¿Te la agendo?", listo: true },
    ],
    como: [
      "Onvi lee tu agenda: nunca ofrece una hora ocupada.",
      "Responde con tus precios, tus horarios y tus políticas.",
      "Si no sabe algo, te pasa la conversación con todo el contexto.",
    ],
  },
  {
    id: "software",
    servicio: "Software",
    pregunta: "¿Que las rutas de distribución, la facturación electrónica y el inventario estén en un mismo lugar?",
    imagen: "/retos/rutas.webp",
    alt: "Sistema de una distribuidora con el inventario y la producción del día.",
    avisos: [
      { etiqueta: "Ruta 03 · Pulpería La Esquina", texto: "32 productos entregados" },
      { etiqueta: "Factura electrónica", texto: "FE-00128 · ₡39.800 · Aceptada", listo: true },
    ],
    como: [
      "Al entregar, la factura electrónica sale sola con lo que se bajó del camión.",
      "Bodega, camiones y facturas leen el mismo inventario, al mismo tiempo.",
      "Cada movimiento queda anotado con hora y con quién lo hizo.",
    ],
  },
  {
    id: "apps",
    servicio: "Apps",
    pregunta: "¿Una app que siga funcionando sin señal?",
    imagen: "/retos/app.webp",
    alt: "App de finanzas personales en el celular.",
    avisos: [
      { etiqueta: "Sin señal", texto: "2 cambios guardados en el teléfono" },
      { etiqueta: "Volvió la señal", texto: "Todo al día, sin duplicados", listo: true },
    ],
    como: [
      "Todo se guarda primero en el teléfono.",
      "Al volver la señal se sube solo, sin duplicar nada.",
      "Notificaciones en el momento justo, no a cualquier hora.",
    ],
  },
  {
    id: "panel",
    servicio: "Panel Onvi",
    pregunta: "¿Ver quién reservó, quién escribió y qué falta, en un vistazo?",
    imagen: "/retos/agenda.webp",
    alt: "Agenda de una clínica con las citas de la semana, en computadora y celular.",
    avisos: [
      { etiqueta: "Nueva reserva · 8:45 a. m.", texto: "Karla Cordero · Limpieza dental" },
      { etiqueta: "Recordatorio", texto: "Enviado 24 horas antes de la cita", listo: true },
    ],
    como: [
      "Reservas, formularios y soporte llegan a una sola bandeja.",
      "Recordatorios automáticos antes de cada cita.",
      "Viene incluido en todos los planes.",
    ],
  },
  {
    id: "marca",
    servicio: "Tu marca",
    pregunta: "¿Un logo que se lea igual en 16 píxeles y en un rótulo de 6 metros?",
    alt: "El mismo logo en la pestaña del navegador, en un perfil y en un rótulo grande.",
    avisos: [
      { etiqueta: "Ícono", texto: "16 px, en la pestaña del navegador" },
      { etiqueta: "Rótulo", texto: "6 m, en la fachada", listo: true },
    ],
    como: [
      "Una versión para cada tamaño: ícono, perfil, horizontal y completa.",
      "Colores y letras que se ven bien en pantalla y en impresión.",
      "Todo en un manual corto para tu equipo.",
    ],
  },
];

/** Cada cuánto pasa sola a la siguiente (en la compu, mientras se ve y nadie la toca). */
const VUELTA_MS = 7000;

/** La marca, dibujada: el mismo ojo de 16 px en la pestaña a un rótulo que llena la escena. */
function Marca() {
  return (
    <div className="rt-marca" aria-hidden>
      <span className="rt-marca__pestana">
        <Ojo className="rt-marca__favicon" />
        Tu marca
        <i>×</i>
      </span>
      <span className="rt-marca__perfil">
        <Ojo />
      </span>
      <Ojo className="rt-marca__grande" />
      <span className="rt-marca__medida">
        <i />6 m<i />
      </span>
    </div>
  );
}

/**
 * "¿Y eso se puede?": seis cosas que nos piden y parecen difíciles, una por
 * servicio. En la compu, las preguntas a la izquierda (pasan solas, con su
 * rayita de avance, y se detienen si el cursor está encima) y a la derecha
 * la captura de un trabajo de verdad con dos avisos que cuentan cómo quedó.
 * En el celular son tarjetas que se deslizan de lado, con sus puntitos.
 */
export default function Retos() {
  const [activo, setActivo] = useState(0);
  const [enVista, setEnVista] = useState(false);
  const [quieto, setQuieto] = useState(true);
  const cuerpo = useRef<HTMLDivElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  // Los avisos y el avance arrancan cuando las escenas están a la vista (no al cargar la página).
  useEffect(() => {
    const el = cuerpo.current;
    if (!el) return;
    setQuieto(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setEnVista(Boolean(e?.isIntersecting)), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Celular: la activa es la tarjeta más cerca del medio de la pista.
  const alDeslizar = () => {
    const el = pista.current;
    if (!el) return;
    const medio = el.scrollLeft + el.clientWidth / 2;
    let k = 0;
    let cerca = Infinity;
    Array.from(el.children as HTMLCollectionOf<HTMLElement>).forEach((t, i) => {
      const d = Math.abs(t.offsetLeft + t.offsetWidth / 2 - medio);
      if (d < cerca) {
        cerca = d;
        k = i;
      }
    });
    if (k !== activo) setActivo(k);
  };

  const irA = (k: number) => {
    setActivo(k);
    const el = pista.current;
    const tarjeta = el?.children[k];
    // En el celular (pista deslizable) también se lleva la tarjeta a la vista.
    if (el && tarjeta && el.scrollWidth > el.clientWidth + 4) {
      tarjeta.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "nearest", inline: "start" });
    }
  };

  // Flechas, Inicio y Fin entre las preguntas.
  const alTeclado = (ev: KeyboardEvent<HTMLDivElement>) => {
    const mapa: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let k = activo;
    if (ev.key in mapa) k = (activo + mapa[ev.key]! + RETOS.length) % RETOS.length;
    else if (ev.key === "Home") k = 0;
    else if (ev.key === "End") k = RETOS.length - 1;
    else return;
    ev.preventDefault();
    setActivo(k);
    botones.current[k]?.focus();
  };

  return (
    <section
      id="retos"
      className="rt"
      data-tema="oscuro"
      data-vista={enVista ? "true" : undefined}
      data-anda={enVista && !quieto ? "true" : undefined}
      aria-labelledby="rt-titulo"
      style={{ "--rt-vuelta": `${VUELTA_MS}ms` } as CSSProperties}
    >
      <header className="rt-cabeza">
        <p className="rt-ante">01 — Lo difícil</p>
        <h2 id="rt-titulo" className="rt-h2">
          ¿Y eso <span>se puede?</span>
        </h2>
        <p className="rt-lede">
          Seis cosas que nos piden y parecen difíciles, una por servicio. <em>Sí se puede. Mirá cómo quedó.</em>
        </p>
      </header>

      <div ref={cuerpo} className="rt-cuerpo">
        <div className="rt-lista" role="group" aria-label="Lo difícil de cada servicio" onKeyDown={alTeclado}>
          {RETOS.map((r, i) => (
            <button
              key={r.id}
              ref={(el) => {
                botones.current[i] = el;
              }}
              type="button"
              aria-pressed={i === activo}
              aria-controls={`rt-${r.id}`}
              tabIndex={i === activo ? 0 : -1}
              className="rt-lista__item"
              onClick={() => irA(i)}
            >
              <span className="rt-lista__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="rt-lista__servicio">{r.servicio}</span>
              <span className="rt-lista__pregunta">{r.pregunta}</span>
              {i === activo ? (
                <i key={`avance-${activo}`} className="rt-lista__avance" aria-hidden onAnimationEnd={() => setActivo((a) => (a + 1) % RETOS.length)} />
              ) : null}
            </button>
          ))}
        </div>

        <div ref={pista} className="rt-pista" onScroll={alDeslizar}>
          {RETOS.map((r, i) => (
            <article
              key={r.id}
              id={`rt-${r.id}`}
              className="rt-reto"
              data-activo={i === activo ? "true" : undefined}
              aria-label={`${i + 1} de ${RETOS.length}: ${r.servicio}`}
            >
              <div className="rt-foto">
                {r.imagen ? (
                  <Image src={r.imagen} alt={r.alt} fill unoptimized sizes="(max-width: 1023px) 86vw, 720px" className="rt-foto__img" />
                ) : (
                  <>
                    <Marca />
                    <span className="sr-only">{r.alt}</span>
                  </>
                )}
                <ol className="rt-avisos" aria-label="Cómo quedó">
                  {r.avisos.map((a, j) => (
                    <li key={a.etiqueta} className="rt-aviso" data-listo={a.listo ? "true" : undefined} style={{ "--i": j } as CSSProperties}>
                      <small>
                        {a.listo ? <b aria-hidden>✓</b> : null}
                        {a.etiqueta}
                      </small>
                      <span>{a.texto}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rt-reto__texto">
                <p className="rt-reto__servicio">
                  {String(i + 1).padStart(2, "0")} · {r.servicio}
                </p>
                <h3 className="rt-reto__pregunta">{r.pregunta}</h3>
                <div className="rt-si">
                  <p className="rt-si__titulo">Sí. Así lo hacemos</p>
                  <ul>
                    {r.como.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="rt-puntos" aria-label="Elegí un reto">
          {RETOS.map((r, i) => (
            <button key={r.id} type="button" aria-label={`${i + 1}: ${r.servicio}`} aria-current={i === activo ? "true" : undefined} onClick={() => irA(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
