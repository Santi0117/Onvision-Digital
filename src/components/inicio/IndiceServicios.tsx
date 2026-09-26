"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { digitalShowreel } from "@/lib/digital";
import Pantalla from "../od/Pantalla";
import { servicios } from "../od/data";
import { Flecha, Indice } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * El índice de servicios de hobro: renglones grandes centrados con su
 * número entre paréntesis y líneas finas; el activo se abre y muestra el
 * video del servicio (el mismo showreel del sitio oficial).
 */
export default function IndiceServicios() {
  const [activo, setActivo] = useState(0);

  return (
    <section className="od-indice-serv od-claro" aria-labelledby="od-indice-titulo">
      <div className="od-indice-serv__cabeza">
        <p className="od-mono od-indice-serv__rotulo">(01) Servicios</p>
        <h2 id="od-indice-titulo" className="od-indice-serv__titulo">
          Todo lo que <em className="od-serif">construimos</em>
        </h2>
      </div>

      <ol className="od-indice-serv__lista">
        {servicios.map((s, i) => {
          const abierto = activo === i;
          return (
            <li key={s.id} className={`od-indice-serv__fila${abierto ? " is-on" : ""}`}>
              <h3>
                <button
                  type="button"
                  className="od-indice-serv__boton"
                  aria-expanded={abierto}
                  aria-controls={`od-serv-${s.id}`}
                  onClick={() => setActivo(i)}
                  onMouseEnter={() => setActivo(i)}
                >
                  <Indice n={s.n} className="od-indice-serv__n" />
                  <span className="od-indice-serv__nombre">{s.label}</span>
                  <span className="od-indice-serv__precio">{s.precio}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {abierto ? (
                  <motion.div
                    id={`od-serv-${s.id}`}
                    className="od-indice-serv__panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <div className="od-indice-serv__interior">
                      <Pantalla video={s.video} poster={s.poster} titulo={s.label} className="od-indice-serv__pantalla" />
                      <div className="od-indice-serv__texto">
                        <p className="od-indice-serv__cuerpo">{s.body}</p>
                        <p className="od-indice-serv__desc">{s.descripcion}</p>
                        <p className="od-mono od-indice-serv__desde">{s.precio}</p>
                        <div className="od-indice-serv__acciones">
                          <Link href={`/digital#planes`} className="od-boton od-boton--negro od-boton--chico">
                            Ver planes de {s.pestaña.toLowerCase()} <Flecha />
                          </Link>
                          <a
                            href={digitalShowreel.cta.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="od-boton od-boton--linea od-boton--chico"
                          >
                            {digitalShowreel.cta.label} <Flecha dir="diagonal" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
