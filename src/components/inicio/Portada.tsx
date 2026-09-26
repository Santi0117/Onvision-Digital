"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { companyHero } from "@/lib/company";
import { webHero } from "@/lib/web";
import Letrero from "../od/Letrero";
import { irA, servicios } from "../od/data";
import { Cerrar, Flecha, Globo } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const GIGANTE = "ONVISION DIGITAL";
const FONDOS = servicios.map((s) => s.poster);

/** El fondo difuso de hobro, hecho con las pantallas reales de los proyectos. */
function Campo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % FONDOS.length), 4200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="od-portada__campo" aria-hidden>
      <AnimatePresence initial={false}>
        <motion.div
          key={FONDOS[i]}
          className="od-portada__foto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
        >
          <Image src={FONDOS[i]!} alt="" fill sizes="40vw" loading={i === 0 ? "eager" : "lazy"} className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <i className="od-portada__mancha od-portada__mancha--a" />
      <i className="od-portada__mancha od-portada__mancha--b" />
      <i className="od-portada__mancha od-portada__mancha--c" />
      <i className="od-portada__grano" />
    </div>
  );
}

/** La tarjeta de vidrio de hobro ("request our capabilities deck"). */
function Aviso() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let cerrado = false;
    try {
      cerrado = sessionStorage.getItem("od-aviso") === "no";
    } catch {}
    if (cerrado) return;
    const t = window.setTimeout(() => setVisible(true), 2600);
    return () => window.clearTimeout(t);
  }, []);
  const cerrar = () => {
    setVisible(false);
    try {
      sessionStorage.setItem("od-aviso", "no");
    } catch {}
  };
  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          className="od-aviso"
          aria-label="Agendar una reunión"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="od-aviso__txt">
            ¿Tenés una idea? — Contanos el negocio y la volvemos realidad.
          </p>
          <Link href="/digital#agendar" className="od-pastilla">
            <Flecha dir="diagonal" /> Agendar reunión
          </Link>
          <button type="button" className="od-aviso__cerrar" aria-label="Cerrar aviso" onClick={cerrar}>
            <Cerrar className="h-3 w-3" />
          </button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Portada: la tarjeta redondeada de driveberry con el fondo difuso y el
 * nombre gigante a todo lo ancho de hobro, el letrero de fichas del sitio
 * oficial y abajo el mensaje, los botones y la tarjeta de vidrio.
 */
export default function Portada() {
  return (
    <section className="od-portada" aria-labelledby="od-portada-titulo">
      <div className="od-portada__tarjeta">
        <Campo />

        <div className="od-portada__letrero">
          <span className="od-portada__vivo" aria-hidden />
          <Letrero palabras={companyHero.flapWords} />
        </div>

        <div className="od-portada__centro">
          <p className="od-portada__gigante" aria-hidden>
            {GIGANTE.split("").map((c, i) => (
              <span key={i} className="od-portada__letra">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.035 }}
                >
                  {c === " " ? " " : c}
                </motion.span>
              </span>
            ))}
          </p>
          <motion.p
            className="od-portada__pie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <span>Sitios · Tiendas · Software · Apps</span>
            <span>Onvi IA incluida</span>
            <span>Costa Rica</span>
            <Globo className="od-portada__globo" />
          </motion.p>
        </div>

        <div className="od-portada__abajo">
          <motion.div
            className="od-portada__copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
          >
            <p className="od-portada__lema">
              <i aria-hidden /> {webHero.eyebrow} — {companyHero.headline}
            </p>
            <h1 id="od-portada-titulo" className="od-portada__h1">
              {webHero.title.join(" ").replace(/\.$/, "")}
              <span className="od-punto">.</span>
            </h1>
            <p className="od-portada__lead">{webHero.lead}</p>
            <div className="od-portada__botones">
              <Link href={webHero.primaryCta.href} className="od-boton od-boton--cian">
                {webHero.primaryCta.label} <Flecha />
              </Link>
              <a
                href={webHero.secondaryCta.href}
                className="od-boton od-boton--linea-d"
                onClick={(e) => {
                  e.preventDefault();
                  irA("#nucleo");
                }}
              >
                {webHero.secondaryCta.label} <Flecha dir="abajo" />
              </a>
              <span className="od-portada__chip">{webHero.pill}</span>
            </div>
          </motion.div>

          <button type="button" className="od-portada__bajar" onClick={() => irA("#confianza", -20)}>
            <span>Bajá para ver más</span>
            <span className="od-portada__bajar-circ">
              <Flecha dir="abajo" />
            </span>
          </button>
        </div>

        <Aviso />
      </div>
    </section>
  );
}
