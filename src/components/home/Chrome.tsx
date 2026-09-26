"use client";

import { AnimatePresence, motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import Pixel from "../od/Pixel";
import { Flecha } from "./ui";
import { ESCENAS, irA, pad, tinte, type PlanPago } from "./data";

/** "ESCENA 04": la sección que cruza el medio de la pantalla (jeffmilanes). En la portada no se muestra: ahí están los rieles. */
function Escena() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const k = ESCENAS.indexOf(e.target.id as (typeof ESCENAS)[number]);
          if (k >= 0) setN(k + 1);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const id of ESCENAS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return (
    <p className="oh-escena" data-on={n > 1 ? "true" : "false"} aria-hidden>
      Escena <b>{pad(n)}</b>
    </p>
  );
}

/** La tira de película que avanza con la página (jeffmilanes). */
function Pelicula() {
  const { scrollYProgress } = useScroll();
  return (
    <div className="oh-pelicula" aria-hidden>
      <motion.div className="oh-pelicula__tira" style={{ scaleX: scrollYProgress }} />
    </div>
  );
}

/**
 * Lo que queda fijo sobre el inicio: el contador de escena y la tira de
 * película de jeffmilanes, y la barra con el plan elegido mientras el pago
 * está más abajo.
 */
export default function Chrome({ elegido }: { elegido: PlanPago | null }) {
  const [ctaAdelante, setCtaAdelante] = useState(true);

  useEffect(() => {
    const cta = document.querySelector(".oh-activar__cta");
    if (!cta) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        setCtaAdelante(!e.isIntersecting && e.boundingClientRect.top > 0);
      },
      { threshold: 0.3 },
    );
    io.observe(cta);
    return () => io.disconnect();
  }, []);

  const barra = Boolean(elegido) && ctaAdelante;

  return (
    <>
      <Escena />
      <Pelicula />

      <AnimatePresence>
        {barra && elegido ? (
          <motion.div
            key="barra"
            className="oh-barra-sel"
            style={tinte(elegido.linea)}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="oh-barra-sel__in" role="region" aria-label="Tu plan">
              <span className="oh-barra-sel__ico">
                <Pixel figura={elegido.figura} className="h-5 w-5" />
              </span>
              <span className="oh-barra-sel__txt">
                <span className="oh-barra-sel__nombre">{elegido.nombre}</span>
                <span className="oh-mono">
                  {elegido.precio}/mes
                  <span className="hidden sm:inline"> · {elegido.lineaNombre}</span>
                </span>
              </span>
              <button type="button" className="oh-barra-sel__ir" onClick={() => irA("activar", "oh-pagar")}>
                Ir a pagar
                <Flecha dir="abajo" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
