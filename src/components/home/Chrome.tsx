"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Pixel from "../od/Pixel";
import Linea from "../vision/Linea";
import { Flecha } from "./ui";
import { ESCENAS, irA, tinte, type PlanPago } from "./data";

/**
 * Lo que queda fijo sobre el inicio: la línea de avance de la preview con el
 * contador de escenas de jeffmilanes, y la barra con el plan elegido
 * mientras el pago está más abajo.
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
      <Linea escenas={ESCENAS} alIr={(id) => irA(id)} />

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
