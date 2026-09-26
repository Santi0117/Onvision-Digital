"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { companyOffers } from "@/lib/company";
import Pixel, { type FiguraPixel } from "../od/Pixel";
import { SISTEMA_URL } from "../od/data";
import { ConPunto, Flecha } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const FIGURA: FiguraPixel[] = ["sistema", "digital", "soporte"];

/** El enlace de cada tarjeta: el sistema vive en su propio sitio. */
function destino(href: string) {
  return href === "/activar" ? `${SISTEMA_URL}/activar` : href;
}

/**
 * "No te atrasés en digitalizar tu negocio" con las tarjetas de precios de
 * nordpixel: ícono de píxeles, título, texto, botón; la del medio en negro
 * con su pestaña arriba.
 */
export default function Ofertas() {
  return (
    <section className="od-ofertas od-claro" aria-labelledby="od-ofertas-titulo">
      <div className="od-ofertas__cabeza">
        <p className="od-eyebrow">(06) Para todos</p>
        <h2 id="od-ofertas-titulo" className="od-h2">
          <ConPunto>{companyOffers.title}</ConPunto>
        </h2>
      </div>

      <div className="od-ofertas__grilla">
        {companyOffers.cards.map((c, i) => {
          const href = destino(c.cta.href);
          const externo = href.startsWith("http");
          const destacada = i === 1;
          return (
            <motion.article
              key={c.title}
              className={`od-oferta${destacada ? " od-oferta--negra" : ""}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
            >
              {destacada ? <p className="od-oferta__pestaña">Con Onvi incluida</p> : null}
              <Pixel figura={FIGURA[i]!} className="od-oferta__pixel" />
              <h3 className="od-oferta__titulo">{c.title}</h3>
              <p className="od-oferta__texto">{c.body}</p>
              {externo ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`od-boton od-boton--chico ${destacada ? "od-boton--cian" : "od-boton--linea"}`}
                >
                  {c.cta.label} <Flecha dir="diagonal" />
                </a>
              ) : (
                <Link href={href} className={`od-boton od-boton--chico ${destacada ? "od-boton--cian" : "od-boton--linea"}`}>
                  {c.cta.label} <Flecha />
                </Link>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
