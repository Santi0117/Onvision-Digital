"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { abrirOnvi } from "../../od/OnviChat";
import "./retos.css";

type Reto = { id: string; servicio: string; pregunta: string; como: [string, string, string] };

/** Lo que nos piden y parece imposible, una cosa por servicio, y cómo lo resolvemos. */
const RETOS: Reto[] = [
  {
    id: "web",
    servicio: "Páginas web",
    pregunta: "¿Que tu cliente compare la cuota en varios bancos sin salir de tu sitio?",
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
    como: [
      "Onvi lee tu agenda: nunca ofrece una hora ocupada.",
      "Responde con tus precios, tus horarios y tus políticas.",
      "Si no sabe algo, te pasa la conversación con todo el contexto.",
    ],
  },
  {
    id: "software",
    servicio: "Software",
    pregunta: "¿Rutas de distribución, facturación electrónica e inventario en un mismo lugar?",
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
    como: [
      "Una versión para cada tamaño: ícono, perfil, horizontal y completa.",
      "Colores y letras que se ven bien en pantalla y en impresión.",
      "Todo en un manual corto para tu equipo.",
    ],
  },
];

const N = RETOS.length;
const dos = (n: number) => String(n).padStart(2, "0");

/**
 * "¿Y eso se puede?", sin imágenes: seis cosas que parecen imposibles,
 * tachadas. Al bajar, cada una cruza el medio de la pantalla y se destacha
 * (la raya se recoge del final al principio), se prende en blanco y muestra
 * cómo lo resolvemos. Al lado, el contador de imposibles baja de 06 a 00.
 */
export default function Retos() {
  const [hechos, setHechos] = useState<boolean[]>(() => RETOS.map(() => false));
  const [activo, setActivo] = useState(-1);
  const filas = useRef<(HTMLLIElement | null)[]>([]);

  // Lo que cruza la franja del medio queda resuelto (y no se vuelve a tachar).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const i = filas.current.indexOf(e.target as HTMLLIElement);
          if (i < 0) continue;
          setActivo(i);
          setHechos((h) => (h[i] ? h : h.map((v, j) => v || j === i)));
        }
      },
      { rootMargin: "-46% 0px -46% 0px" },
    );
    filas.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const quedan = N - hechos.filter(Boolean).length;
  const cero = quedan === 0 || undefined;

  return (
    <section id="retos" className="rt" data-tema="oscuro" aria-labelledby="rt-titulo">
      <div className="rt-lado">
        <p className="rt-ante">Lo difícil</p>
        <h2 id="rt-titulo" className="rt-h2">
          ¿Y eso <span>se puede?</span>
        </h2>
        <p className="rt-lede">Seis cosas que nos piden y parecen imposibles, una por servicio. Bajá y mirá cómo se destachan.</p>

        <div className="rt-cuenta" data-cero={cero}>
          <p className="rt-cuenta__num" aria-hidden>
            <span key={quedan}>{dos(quedan)}</span>
          </p>
          <p className="rt-cuenta__txt" aria-live="polite">
            {quedan === 0 ? (
              <>
                <b>Todas se pudieron.</b> Ninguna era imposible.
              </>
            ) : (
              <>
                <span className="sr-only">{quedan} </span>
                {quedan === 1 ? "cosa que «no se podía»" : "cosas que «no se podían»"}
              </>
            )}
          </p>
          <span className="rt-cuenta__barra" aria-hidden>
            {RETOS.map((r, i) => (
              <i key={r.id} data-on={hechos[i] || undefined} />
            ))}
          </span>
        </div>
      </div>

      <ol className="rt-lista">
        {RETOS.map((r, i) => (
          <li
            key={r.id}
            ref={(el) => {
              filas.current[i] = el;
            }}
            className="rt-reto"
            data-hecho={hechos[i] || undefined}
            data-activo={i === activo || undefined}
          >
            <p className="rt-reto__servicio">
              <span>{dos(i + 1)}</span>
              {r.servicio}
              <span className="rt-si">{hechos[i] ? "Sí, se puede" : null}</span>
            </p>
            <h3 className="rt-reto__pregunta">
              <span className="rt-reto__tachado">{r.pregunta}</span>
            </h3>
            <ol className="rt-como" aria-label="Así lo hacemos">
              {r.como.map((c, j) => (
                <li key={c} style={{ "--j": j } as CSSProperties}>
                  {c}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <div className="rt-otra">
        <p>
          ¿Tenés otra que <em>parece imposible?</em>
        </p>
        <div className="rt-otra__botones">
          <button type="button" className="rt-boton rt-boton--cian" onClick={abrirOnvi}>
            Preguntale a Onvi
          </button>
          <Link href="/planes#agendar" className="rt-boton">
            Agendar reunión
          </Link>
        </div>
      </div>

      <p className="rt-pastilla" aria-hidden data-cero={cero}>
        <span key={quedan}>{dos(quedan)}</span>
        {quedan === 0 ? "imposibles. Todas se pudieron" : "imposibles"}
      </p>
    </section>
  );
}
