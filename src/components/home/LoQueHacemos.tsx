"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import Puntos, { type Senal } from "./Puntos";
import "./lo-que-hacemos.css";

/** Las piezas de Onvision, con su figura de puntos (en el mismo orden) y lo que trae cada una. */
const PIEZAS = [
  {
    n: "01",
    nombre: "Páginas web",
    grande: "Páginas web",
    texto: "Sitios y tiendas diseñados desde cero: rápidos, claros y listos para vender desde el celular.",
    rasgos: ["diseño desde cero, sin plantillas", "rápidas y listas para el celular", "formularios que llegan a tu WhatsApp"],
  },
  {
    n: "02",
    nombre: "Onvi, tu asistente con IA",
    grande: "Onvi",
    texto: "Atiende a tus clientes por chat las 24 horas, agenda citas y te pasa los contactos listos.",
    rasgos: ["responde por vos las 24 horas", "agenda citas y toma pedidos", "te pasa cada cliente listo"],
  },
  {
    n: "03",
    nombre: "Software a medida",
    grande: "Software",
    texto: "Paneles, sistemas y automatizaciones que ordenan ventas, inventario, reportes y clientes.",
    rasgos: ["ventas, inventario y reportes juntos", "automatiza lo que hoy hacés a mano", "hecho a la medida de tu operación"],
  },
  {
    n: "04",
    nombre: "Componentes personalizados",
    grande: "Componentes",
    texto: "Calculadoras, cotizadores y reservas para que el cliente decida sin tener que llamarte.",
    rasgos: ["calculadoras y cotizadores en vivo", "reservas y catálogos con filtros", "el cliente decide sin llamarte"],
  },
  {
    n: "05",
    nombre: "Tu marca desde cero",
    grande: "Tu marca",
    texto: "Logo, colores, tipografía y tu presencia en Google e Instagram, todo conectado.",
    rasgos: ["logo, colores y tipografía", "Google e Instagram, listos", "se reconoce a la primera"],
  },
  {
    n: "06",
    nombre: "Panel Onvi",
    grande: "Panel Onvi",
    texto: "Reservas, formularios, analítica y soporte en un solo lugar. Viene con todos los planes.",
    rasgos: ["reservas, registros y soporte", "lo que pasa en tu sitio, en vivo", "incluido en todos los planes"],
  },
] as const;

const TOTAL = PIEZAS.length;

/** Celular y tablet parada: la escena fija a pantalla completa y el dedo manda. */
const ANGOSTA = "(max-width: 1023px)";

/** Las características de la pieza que se lee: se escriben de a una, sin juntarse con las de antes. */
function Rasgos({ pieza, className }: { pieza: number; className: string }) {
  const lista = PIEZAS[Math.max(0, pieza)]!.rasgos;
  return (
    <ul key={pieza} className={className} aria-hidden>
      {lista.map((r, i) => (
        <li key={r} style={{ "--ch": r.length, "--i": i } as CSSProperties}>
          {r}
        </li>
      ))}
    </ul>
  );
}

/** El título grande del celular: entra letra por letra, desde abajo o desde arriba según el scroll. */
function Letras({ texto, dir }: { texto: string; dir: "baja" | "sube" }) {
  return (
    <span className="lq__letras" data-dir={dir}>
      {texto.split(" ").map((palabra, j, todas) => {
        const antes = todas.slice(0, j).join(" ").length + (j ? 1 : 0);
        return (
          <Fragment key={`${palabra}-${j}`}>
            {j > 0 ? " " : null}
            <span className="lq__palabra">
              {[...palabra].map((l, i) => (
                <span key={i} className="lq__letra" style={{ "--i": antes + i } as CSSProperties}>
                  {l}
                </span>
              ))}
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}

/**
 * "Lo que hacemos", como "At the machine" de jeffmilanes: la figura de
 * puntos blancos queda fija a la izquierda con el título y las
 * características de la pieza que se lee; a la derecha pasan las seis
 * piezas y la de la línea de lectura se enciende.
 *
 * En el celular la escena queda fija a pantalla completa: arriba el avance,
 * en el medio los puntos (se arman en un instante y se apartan del dedo) y
 * abajo el título que entra letra por letra. Las piezas de la derecha siguen ahí,
 * invisibles, para los lectores de pantalla y para medir el scroll.
 */
export default function LoQueHacemos() {
  const seccion = useRef<HTMLElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const pasos = useRef<(HTMLLIElement | null)[]>([]);
  const senal = useRef<Senal>({ p: -1 });
  const [activa, setActiva] = useState(0);
  const [angosta, setAngosta] = useState(false);
  const [dir, setDir] = useState<"baja" | "sube">("baja");

  // Dónde va la lectura: p = pieza (con decimales) según la línea de lectura.
  useEffect(() => {
    const mq = window.matchMedia(ANGOSTA);
    let raf = 0;
    let previa = -2;

    const leer = () => {
      raf = 0;
      const el = seccion.current;
      const centros = pasos.current.map((paso) => {
        const r = paso?.getBoundingClientRect();
        return r ? r.top + r.height / 2 : 0;
      });
      if (!el || centros.length < 2) return;
      const movil = mq.matches;
      const linea = window.innerHeight * (movil ? 0.5 : 0.52);
      const paso = centros[1]! - centros[0]!;
      let p: number;
      if (linea < centros[0]!) p = -1 + Math.max(0, 1 - (centros[0]! - linea) / paso);
      else if (linea >= centros[TOTAL - 1]!) p = TOTAL - 1;
      else {
        let k = 0;
        while (k < TOTAL - 2 && linea >= centros[k + 1]!) k++;
        p = k + (linea - centros[k]!) / (centros[k + 1]! - centros[k]!);
      }
      // En la compu la primera figura ya está al entrar; el globo es la portada del celular.
      senal.current.p = movil ? p : Math.max(0, p);
      el.style.setProperty("--lq-p", p.toFixed(3));

      // En el celular, antes de la primera pieza se ve el título de la sección.
      const nueva = movil && p < -0.5 ? -1 : Math.min(TOTAL - 1, Math.max(0, Math.round(p)));
      if (nueva !== previa) {
        setDir(nueva > previa ? "baja" : "sube");
        previa = nueva;
        setActiva(nueva);
      }
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(leer);
    };
    const alCambiar = () => {
      setAngosta(mq.matches);
      pedir();
    };

    alCambiar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    mq.addEventListener("change", alCambiar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      mq.removeEventListener("change", alCambiar);
    };
  }, []);

  const pieza = activa >= 0 ? PIEZAS[activa]! : null;

  return (
    <section
      id="lo-que-hacemos"
      ref={seccion}
      className="lq"
      data-tema="oscuro"
      data-intro={activa < 0 ? "true" : undefined}
      aria-label="Lo que hacemos: seis piezas, una sola marca"
    >
      <div className="lq__escena">
        <Puntos senal={senal} caja={caja} className="lq__puntos" />

        <p className="lq__contador" aria-hidden>
          <b>{pieza?.n ?? "00"}</b> / 06
        </p>

        {/* Celular: el avance, pieza por pieza. */}
        <div className="lq__avance" aria-hidden>
          <p>
            <span>Lo que hacemos</span>
            <span>
              <b>{pieza?.n ?? "00"}</b> / 06
            </span>
          </p>
          <ol>
            {PIEZAS.map((p, i) => (
              <li key={p.n} style={{ "--i": i } as CSSProperties} />
            ))}
          </ol>
        </div>

        <div ref={caja} className="lq__caja" />

        {/* Compu: el título de la sección y lo que trae la pieza que se lee. */}
        <div className="lq__pie">
          <p className="lq__ante">Lo que hacemos</p>
          <h2 className="lq__h2">
            <span>Seis piezas.</span> <span>Una sola marca.</span>
          </h2>
          {!angosta ? <Rasgos pieza={activa} className="lq__log" /> : null}
        </div>

        {/* Celular: la pieza que se lee, en grande. */}
        {angosta ? (
          <div className="lq__movil" aria-hidden>
            {pieza ? (
              <>
                <p key={`n-${activa}`} className="lq__m-n">
                  {pieza.n} <span>· {pieza.nombre}</span>
                </p>
                <p key={`t-${activa}`} className="lq__m-titulo">
                  <Letras texto={pieza.grande} dir={dir} />
                </p>
                <p key={`x-${activa}`} className="lq__m-texto">
                  {pieza.texto}
                </p>
                <Rasgos pieza={activa} className="lq__log lq__log--movil" />
              </>
            ) : (
              <>
                <p className="lq__m-n">(04) Lo que hacemos</p>
                <p key="intro" className="lq__m-titulo lq__m-titulo--intro">
                  <Letras texto="Seis piezas." dir={dir} />
                  <Letras texto="Una sola marca." dir={dir} />
                </p>
                <p className="lq__m-pista">
                  Deslizá y mirá cómo se arma <i />
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>

      <ol className="lq__pasos">
        {PIEZAS.map((p, i) => (
          <li
            key={p.n}
            ref={(el) => {
              pasos.current[i] = el;
            }}
            className="lq__paso"
            data-on={i === activa ? "true" : i < activa ? "visto" : "false"}
          >
            <p className="lq__n">
              {p.n} <span>· {p.nombre}</span>
            </p>
            <h3 className="lq__grande">{p.grande}</h3>
            <p className="lq__texto">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
