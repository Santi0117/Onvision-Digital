"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Cerrar, ConPunto, Mas } from "../od/ui";

const TOMAS = [
  { src: "/web/panel/reservas.png", label: "Reservas" },
  { src: "/web/panel/registros.png", label: "Registros" },
  { src: "/web/panel/soporte.png", label: "Soporte" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function Ventana({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="od-ventana">
      <span className="od-ventana__barra" aria-hidden>
        <i />
        <i />
        <i />
        <b>{label}</b>
      </span>
      <span className="od-ventana__vidrio">{children}</span>
    </span>
  );
}

/**
 * "Todos los planes incluyen Onvision Panel": las tres ventanas del sitio
 * oficial (reservas, registros y soporte) que se abren grandes.
 */
export default function Panel() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const toma = abierta === null ? null : TOMAS[abierta]!;

  useEffect(() => {
    if (abierta === null) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
    };
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTecla);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", alTecla);
    };
  }, [abierta]);

  return (
    <section className="od-panel od-claro" aria-labelledby="od-panel-titulo">
      <div className="od-panel__cabeza">
        <p className="od-eyebrow">Incluido</p>
        <h2 id="od-panel-titulo" className="od-h2">
          <ConPunto>Todos los planes incluyen Onvision Panel</ConPunto>
        </h2>
        <p className="od-lede">Reservas, registros y soporte de tu sitio en un solo lugar. Tocá una ventana para verla grande.</p>
      </div>

      <div className="od-panel__ventanas">
        {TOMAS.map((t, i) => (
          <motion.button
            key={t.src}
            type="button"
            className={`od-panel__boton od-panel__boton--${i}`}
            onClick={() => setAbierta(i)}
            aria-label={`Ver ${t.label} en grande`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.1 }}
          >
            <Ventana label={t.label}>
              <Image src={t.src} alt="" fill sizes="(min-width: 900px) 33vw, 90vw" className="object-cover object-left-top" />
            </Ventana>
            <span className="od-panel__abrir" aria-hidden>
              <Mas className="h-4 w-4" />
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {toma ? (
          <motion.div
            className="od-visor"
            role="dialog"
            aria-modal="true"
            aria-label={toma.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="od-visor__velo" aria-label="Cerrar" onClick={() => setAbierta(null)} />
            <motion.div
              className="od-visor__caja"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Ventana label={toma.label}>
                <Image src={toma.src} alt={`Onvision Panel: ${toma.label}`} fill sizes="90vw" className="object-contain" />
              </Ventana>
              <button type="button" className="od-visor__cerrar" onClick={() => setAbierta(null)} autoFocus>
                <Cerrar className="h-4 w-4" /> Cerrar
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
