"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { digitalFaq } from "@/lib/digital";
import { ConPunto, Mas } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * "05 — FAQ" como "Klar beantwortet." de nordpixel: renglones en tarjetas
 * blancas con su "+", el número en mono y la respuesta que se abre.
 */
export default function Faq() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <section id="faq" className="od-faq od-claro" aria-labelledby="od-faq-titulo">
      <div className="od-faq__cabeza">
        <p className="od-eyebrow od-eyebrow--rayas">
          <i aria-hidden />
          <span>{digitalFaq.label}</span>
          <i aria-hidden />
        </p>
        <h2 id="od-faq-titulo" className="od-h2">
          <ConPunto>{digitalFaq.title}</ConPunto>
        </h2>
        <p className="od-lede">{digitalFaq.description}</p>
      </div>

      <div className="od-faq__lista">
        {digitalFaq.items.map((it, i) => {
          const abierto = abierta === i;
          const id = `od-faq-${i}`;
          return (
            <div key={it.q} className={`od-faq__item${abierto ? " is-on" : ""}`}>
              <h3>
                <button type="button" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierta(abierto ? null : i)}>
                  <span className="od-mono od-faq__n">
                    {digitalFaq.itemPrefix}
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="od-faq__q">{it.q}</span>
                  <span className="od-faq__icono" aria-hidden>
                    <Mas className="h-4 w-4" />
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {abierto ? (
                  <motion.div
                    id={id}
                    className="od-faq__a"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <div className="od-faq__cuerpo">
                      <p>{it.a}</p>
                      {"groups" in it && it.groups
                        ? it.groups.map((g) => (
                            <div key={g.title} className="od-faq__grupo">
                              <p className="od-faq__grupo-titulo">{g.title}</p>
                              <ul>
                                {g.points.map((pt) => (
                                  <li key={pt}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                        : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="od-faq__pie">
        {digitalFaq.footerText}
        <a href={digitalFaq.footerHref} target="_blank" rel="noopener noreferrer">
          {digitalFaq.footerCta}
        </a>
      </p>
    </section>
  );
}
