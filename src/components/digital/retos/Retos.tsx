"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Calculadora, Chat, Marca, PanelVivo, SinSenal, TodoEnUno } from "./demos";
import "./retos.css";

const EASE = [0.16, 1, 0.3, 1] as const;

type Demo = (p: { enVista: boolean }) => React.JSX.Element;

/**
 * Lo difícil de cada servicio, contado con un caso de verdad (sin decir de
 * quién): la pregunta que nos hacen, una demo que se puede tocar y cómo lo
 * resolvemos.
 */
const RETOS: { id: string; servicio: string; pregunta: string; ventana: string; como: string[]; Demo: Demo }[] = [
  {
    id: "web",
    servicio: "Páginas web",
    pregunta: "¿Que tu cliente compare la cuota en varios bancos sin salir de tu sitio?",
    ventana: "tusitio.com/financiamiento",
    como: [
      "La cuota se calcula al instante, sin recargar la página.",
      "Las tasas se cambian en un solo lugar y el sitio entero se entera.",
      "El cálculo le llega al asesor con los datos del cliente.",
    ],
    Demo: Calculadora,
  },
  {
    id: "onvi",
    servicio: "Onvi",
    pregunta: "¿Que alguien escriba a las 11:48 p. m. y reciba respuesta con tu agenda real?",
    ventana: "tusitio.com · chat",
    como: [
      "Onvi lee tu agenda: nunca ofrece una hora ocupada.",
      "Responde con tus precios, tus horarios y tus políticas.",
      "Si no sabe algo, te pasa la conversación con todo el contexto.",
    ],
    Demo: Chat,
  },
  {
    id: "software",
    servicio: "Software",
    pregunta: "¿Que las rutas de distribución, la facturación electrónica y el inventario estén en un mismo lugar?",
    ventana: "sistema · rutas, facturas e inventario",
    como: [
      "Al entregar, la factura electrónica sale sola con lo que se bajó del camión.",
      "Bodega, camiones y facturas leen el mismo inventario, al mismo tiempo.",
      "Cada movimiento queda anotado con hora y con quién lo hizo.",
    ],
    Demo: TodoEnUno,
  },
  {
    id: "apps",
    servicio: "Apps",
    pregunta: "¿Una app que siga funcionando sin señal?",
    ventana: "app · mis gastos",
    como: [
      "Todo se guarda primero en el teléfono.",
      "Al volver la señal se sube solo, sin duplicar nada.",
      "Notificaciones en el momento justo, no a cualquier hora.",
    ],
    Demo: SinSenal,
  },
  {
    id: "panel",
    servicio: "Panel Onvi",
    pregunta: "¿Ver quién reservó, quién escribió y qué falta, en un vistazo?",
    ventana: "panel.onvisiondigital.com",
    como: [
      "Reservas, formularios y soporte llegan a una sola bandeja.",
      "Recordatorios automáticos antes de cada cita.",
      "Viene incluido en todos los planes.",
    ],
    Demo: PanelVivo,
  },
  {
    id: "marca",
    servicio: "Tu marca",
    pregunta: "¿Un logo que se lea igual en 16 píxeles y en un rótulo de 6 metros?",
    ventana: "marca · versiones",
    como: [
      "Una versión para cada tamaño: ícono, perfil, horizontal y completa.",
      "Colores y letras que se ven bien en pantalla y en impresión.",
      "Todo en un manual corto para tu equipo.",
    ],
    Demo: Marca,
  },
];

/**
 * "¿Y eso se puede?": lo que no muestran las tarjetas de arriba. Seis cosas
 * que nos piden y parecen difíciles, una por servicio, cada una con su demo
 * andando. A la izquierda las preguntas; a la derecha la ventana con la
 * demo y cómo lo resolvemos. En el celular las preguntas se deslizan de lado.
 */
export default function Retos() {
  const [activo, setActivo] = useState(0);
  const [enVista, setEnVista] = useState(false);
  const seccion = useRef<HTMLElement>(null);
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);
  const reto = RETOS[activo]!;

  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setEnVista(Boolean(e?.isIntersecting)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Flechas, Inicio y Fin entre las pestañas.
  const alTeclado = (ev: KeyboardEvent<HTMLDivElement>) => {
    const mapa: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let k = activo;
    if (ev.key in mapa) k = (activo + mapa[ev.key]! + RETOS.length) % RETOS.length;
    else if (ev.key === "Home") k = 0;
    else if (ev.key === "End") k = RETOS.length - 1;
    else return;
    ev.preventDefault();
    setActivo(k);
    pestanas.current[k]?.focus();
  };

  return (
    <section ref={seccion} id="retos" className="rt" data-tema="oscuro" aria-labelledby="rt-titulo">
      <header className="rt-cabeza">
        <p className="rt-ante">01 — Lo difícil</p>
        <h2 id="rt-titulo" className="rt-h2">
          ¿Y eso <span>se puede?</span>
        </h2>
        <p className="rt-lede">
          Seis cosas que nos piden y parecen difíciles, una por servicio. <em>Sí se puede: probalas acá mismo.</em>
        </p>
      </header>

      <div className="rt-cuerpo">
        <div className="rt-lista" role="tablist" aria-label="Lo difícil de cada servicio" aria-orientation="vertical" onKeyDown={alTeclado}>
          {RETOS.map((r, i) => (
            <button
              key={r.id}
              ref={(el) => {
                pestanas.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`rt-tab-${r.id}`}
              aria-selected={i === activo}
              aria-controls="rt-panel"
              tabIndex={i === activo ? 0 : -1}
              className="rt-lista__item"
              onClick={() => setActivo(i)}
            >
              <span className="rt-lista__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="rt-lista__servicio">{r.servicio}</span>
              <span className="rt-lista__pregunta">{r.pregunta}</span>
            </button>
          ))}
        </div>

        <div id="rt-panel" role="tabpanel" aria-labelledby={`rt-tab-${reto.id}`} className="rt-ventana">
          <p className="rt-ventana__pregunta" aria-hidden>
            {reto.pregunta}
          </p>
          <div className="rt-ventana__marco">
            <p className="rt-ventana__barra">
              <span className="rt-ventana__puntos" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="rt-ventana__url">{reto.ventana}</span>
              <span className="rt-ventana__vivo">
                <i aria-hidden /> en vivo
              </span>
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={reto.id}
                className="rt-ventana__demo"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <reto.Demo enVista={enVista} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="rt-como">
            <p className="rt-como__titulo">Cómo lo resolvemos</p>
            <ul>
              {reto.como.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
