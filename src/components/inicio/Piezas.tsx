"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { desktopSteps } from "@/lib/desktop-demo";
import { webCore, webModules } from "@/lib/web";
import { Ojo } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const N = webModules.length;

/** Qué pieza del sitio dibuja cada módulo del sitio oficial. */
const ORDEN = webModules.map((m) => m.id);
const encendida = (id: string, cuenta: number) => ORDEN.indexOf(id) < cuenta;

function Bloque({
  id,
  cuenta,
  actual,
  className,
  children,
}: {
  id: string;
  cuenta: number;
  actual: string | null;
  className: string;
  children?: React.ReactNode;
}) {
  const m = webModules.find((x) => x.id === id)!;
  return (
    <div
      className={`od-sitio__pieza ${className}`}
      data-on={encendida(id, cuenta) ? "si" : "no"}
      data-actual={actual === id ? "si" : "no"}
    >
      {children}
      <span className="od-sitio__etiqueta">{m.label}</span>
    </div>
  );
}

/**
 * "The journey" de jeffmilanes para "Un sitio completo, pieza por pieza":
 * escena fija en negro, el contador gigante sube a 9 piezas mientras el
 * sitio se arma bloque por bloque (los mismos módulos de la laptop del
 * sitio oficial) y la consola anota lo que se va construyendo.
 */
export default function Piezas() {
  const pista = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const q = Math.round(v * 200) / 200;
    setP((prev) => (prev === q ? prev : q));
  });

  const cuenta = Math.min(N, Math.floor(p * (N + 1.2)));
  const actual = cuenta > 0 ? webModules[cuenta - 1]! : null;
  const lineas = desktopSteps.slice(0, Math.min(desktopSteps.length, Math.ceil((cuenta / N) * desktopSteps.length)));

  return (
    <section id="nucleo" className="od-piezas" aria-labelledby="od-piezas-titulo">
      <div ref={pista} className="od-piezas__pista">
        <div className="od-piezas__escena">
          <div className="od-piezas__izq">
            <p className="od-mono od-piezas__rotulo">(02) El núcleo de tu sitio</p>
            <h2 id="od-piezas-titulo" className="od-piezas__h2">
              {webCore.title.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </h2>
            <p className="od-piezas__lead">{webCore.lead}</p>

            <div className="od-piezas__contador" aria-hidden>
              <span className="od-piezas__num">{cuenta}</span>
              <span className="od-piezas__de">/ {N}</span>
            </div>
            <p className="od-mono od-piezas__unidad">Piezas de tu sitio</p>

            <div className="od-piezas__actual" aria-live="off">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={actual?.id ?? "nada"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p className="od-piezas__pieza">
                    <span aria-hidden>◆</span> {actual ? actual.label : "Bajá para armarlo"}
                  </p>
                  <p className="od-piezas__detalle">{actual ? actual.detail : "Cada pieza se suma a tu marca."}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <ul className="od-piezas__consola" aria-hidden>
              {lineas.map((l, i) => (
                <li key={l.id} data-nueva={i === lineas.length - 1 ? "si" : "no"}>
                  <span>›</span> {l.file} <em>— {l.title}</em>
                </li>
              ))}
            </ul>
          </div>

          <div className="od-sitio" aria-hidden>
            <Bloque id="pantalla" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__marco">
              <div className="od-sitio__url">
                <i />
                <i />
                <i />
                <span>tunegocio.com</span>
              </div>
            </Bloque>

            <div className="od-sitio__cuerpo">
              <Bloque id="portada" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__portada">
                <span className="od-sitio__barra od-sitio__barra--xl" />
                <span className="od-sitio__barra od-sitio__barra--l" />
                <span className="od-sitio__boton" />
              </Bloque>

              <Bloque id="agenda" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__agenda">
                <span className="od-sitio__mes">Reservas</span>
                <span className="od-sitio__dias">
                  {Array.from({ length: 21 }, (_, i) => (
                    <i key={i} data-sel={i === 9 ? "si" : undefined} />
                  ))}
                </span>
              </Bloque>

              <Bloque id="contacto" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__contacto">
                <span className="od-sitio__campo" />
                <span className="od-sitio__campo" />
                <span className="od-sitio__campo od-sitio__campo--alto" />
                <span className="od-sitio__boton od-sitio__boton--chico" />
              </Bloque>

              <Bloque id="animaciones" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__anim">
                <svg viewBox="0 0 120 60" fill="none">
                  <path d="M4 50 C 30 50, 34 10, 60 10 S 92 50, 116 50" />
                  <circle cx="60" cy="10" r="4" />
                </svg>
              </Bloque>

              <Bloque id="tienda" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__tienda">
                {[0, 1, 2].map((k) => (
                  <span key={k} className="od-sitio__producto">
                    <i />
                    <b />
                  </span>
                ))}
              </Bloque>

              <Bloque id="seo" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__seo">
                <svg viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" className="od-sitio__aro-fondo" />
                  <circle cx="20" cy="20" r="16" className="od-sitio__aro" pathLength={100} />
                </svg>
                <b>98</b>
              </Bloque>
            </div>

            <Bloque id="chatbot" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__chat">
              <Ojo className="od-sitio__chat-ojo" />
              <span>¿Tienen citas mañana?</span>
            </Bloque>

            <Bloque id="base" cuenta={cuenta} actual={actual?.id ?? null} className="od-sitio__base">
              <b>Hosting · dominio · soporte</b>
            </Bloque>
          </div>
        </div>
      </div>
    </section>
  );
}
