"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { companyHero } from "@/lib/company";
import { webHero } from "@/lib/web";
import Letrero from "../od/Letrero";
import Cinta from "./Cinta";
import Streaks from "./Streaks";
import { Check, Esquinas, Flecha, Tag } from "./ui";
import { pad, tinte, type Linea } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

/** "…a tu marca: tu sitio." La palabra que rota y la pantalla que la acompaña. */
const ROTACION: {
  palabra: string;
  etiqueta: string;
  imagen: string;
  alt: string;
  ajuste: "contain" | "cover";
  linea: Linea | "sistema";
}[] = [
  {
    palabra: "tu sitio",
    etiqueta: "Página web",
    imagen: "/digital/web-la-pacifica-mock.png",
    alt: "Sitio de Clínica Dental La Pacífica en computadora y celular",
    ajuste: "contain",
    linea: "web",
  },
  {
    palabra: "tu tienda",
    etiqueta: "E-commerce",
    imagen: "/digital/ecom-firstdown-tienda-cut2.png",
    alt: "Tienda de jerseys FirstDown en computadora y celular",
    ajuste: "contain",
    linea: "shop",
  },
  {
    palabra: "tu software",
    etiqueta: "Software a medida",
    imagen: "/digital/saas-clinicos-inventario-cut2.png",
    alt: "Clinic OS: inventario de la clínica",
    ajuste: "contain",
    linea: "software",
  },
  {
    palabra: "tu app",
    etiqueta: "App móvil",
    imagen: "/digital/mobile-run-cut5.png",
    alt: "App móvil My Run",
    ajuste: "contain",
    linea: "mobile",
  },
  {
    palabra: "tu sistema",
    etiqueta: "Sistema Onvision",
    imagen: "/product/retail-pos-hq2.webp",
    alt: "Sistema Onvision: punto de venta",
    ajuste: "cover",
    linea: "sistema",
  },
];

/** SCROLL 000 → 100 en el riel derecho (sibaldesign). */
function ContadorScroll() {
  const { scrollYProgress } = useScroll();
  const [valor, setValor] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = Math.round(v * 100);
    setValor((prev) => (prev === n ? prev : n));
  });
  return <>SCROLL {String(valor).padStart(3, "0")}</>;
}

/** Las tarjetas de la portada, ordenadas como el mosaico de clarvos. */
function Collage({ indice }: { indice: number }) {
  const item = ROTACION[indice]!;
  return (
    <div className="oh-collage" style={tinte(item.linea)}>
      <div className="oh-collage__panel oh-panel">
        <Tag derecha={`${pad(indice + 1)} / ${pad(ROTACION.length)}`}>{item.etiqueta}</Tag>
        <div className="oh-collage__pantalla">
          <AnimatePresence initial={false}>
            <motion.div
              key={item.imagen}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <Image
                src={item.imagen}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 640px, 92vw"
                className={item.ajuste === "cover" ? "oh-img-sistema object-cover object-left-top" : "object-contain"}
                {...(indice === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
              />
            </motion.div>
          </AnimatePresence>
          <Esquinas className="oh-collage__esquinas" />
        </div>
      </div>

      <div className="oh-card oh-card--sol oh-collage__caja">
        <p className="oh-card__label">Rendimiento</p>
        <p className="oh-card__grande">98 · 100</p>
        <p className="oh-card__chico">velocidad · SEO · carga en menos de 1 s</p>
        <p className="oh-chip oh-chip--negro">{webHero.pill}</p>
      </div>

      <div className="oh-card oh-collage__factura">
        <div className="oh-card__fila">
          <p className="oh-card__titulo">Reserva · Consulta 9:00</p>
          <span className="oh-chip oh-chip--menta">
            <Check className="h-3 w-3" />
            Confirmada
          </span>
        </div>
        <div className="oh-barra">
          <i style={{ width: "92%" }} />
        </div>
        <p className="oh-card__mono">agenda.reservar(&#123; servicio: &apos;Consulta&apos; &#125;)</p>
        <p className="oh-card__chico">
          <i className="oh-punto" /> Panel Onvi · aviso por WhatsApp
        </p>
      </div>

      <div className="oh-card oh-collage__stock">
        <p className="oh-card__label">
          <i className="oh-vivo" /> Pedidos en vivo
        </p>
        {[
          ["Jersey Cowboys · M", "SINPE", "ok"],
          ["Reserva 10:30", "Tarjeta", "ok"],
          ["Pedido #148", "Nuevo", "nuevo"],
        ].map(([nombre, estado, tipo], i) => (
          <div key={nombre} className="oh-card__item">
            <span className="oh-rango">{i + 1}</span>
            <span className="oh-card__item-nombre">{nombre}</span>
            <span className={`oh-chip ${tipo === "nuevo" ? "oh-chip--sol" : "oh-chip--menta"}`}>{estado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Portada: el marco negro con la muesca del menú (clarvos), el titular
 * gigante en mayúscula (jeffmilanes) con la segunda línea delineada
 * (sibaldesign) y la palabra que rota en cian; debajo, la cinta de
 * wisprflow.
 */
export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const enVista = useInView(ref, { amount: 0.2 });
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (!enVista) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reloj = window.setInterval(() => setIndice((n) => (n + 1) % ROTACION.length), 2600);
    return () => window.clearInterval(reloj);
  }, [enVista]);

  const { palabra } = ROTACION[indice]!;

  return (
    <section id="inicio" className="oh-hero" aria-labelledby="oh-h1">
      <div ref={ref} className="oh-hero__marco">
        <div className="oh-notch" aria-hidden />
        <div className="oh-fx" aria-hidden>
          <div className="oh-fx__rayado" />
          <div className="oh-fx__puntos" />
          <div className="oh-fx__vineta" />
          <Streaks className="oh-fx__estelas" />
        </div>
        <p className="oh-riel oh-riel--izq" aria-hidden>
          ONVISION <b>{"//"}</b> COSTA RICA
        </p>
        <p className="oh-riel oh-riel--der" aria-hidden>
          <ContadorScroll />
        </p>
        <Esquinas className="oh-hero__esquinas" />

        <div className="oh-hero__in">
          <motion.div
            className="oh-hero__arriba"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            <p className="oh-hero__kicker">
              « ONVISION.DIGITAL
              <span>.SITIOS.TIENDAS.SOFTWARE.APPS</span>
            </p>
            <Letrero palabras={companyHero.flapWords} className="oh-hero__letrero" />
          </motion.div>

          <h1 id="oh-h1" className="oh-hero__h1">
            <span className="sr-only">{webHero.title.join(" ")}</span>
            <span aria-hidden className="oh-hero__linea">
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE, delay: 0.15 }}
              >
                Pieza por pieza,
              </motion.span>
            </span>
            <span aria-hidden className="oh-hero__linea oh-hero__linea--hueca">
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE, delay: 0.27 }}
              >
                hecho a tu marca:
              </motion.span>
            </span>
            <span
              aria-hidden
              className="oh-hero__linea oh-hero__linea--sol"
              style={{ "--len": palabra.length + 1 } as CSSProperties}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={palabra}
                  className="inline-block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-130%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {palabra}.
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <div className="oh-hero__fila">
            <motion.div
              className="oh-hero__copy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
            >
              <p className="oh-hero__lede">{webHero.lead}</p>
              <div className="oh-hero__ctas">
                <Link href={webHero.primaryCta.href} className="oh-pill oh-pill--sol">
                  {webHero.primaryCta.label}
                  <span className="oh-pill__circ">
                    <Flecha dir="diagonal" />
                  </span>
                </Link>
                <a href={webHero.secondaryCta.href} className="oh-pill oh-pill--linea">
                  {webHero.secondaryCta.label}
                  <Flecha />
                </a>
              </div>
              <ul className="oh-hero__meta">
                {[companyHero.headline.replace(/\.$/, ""), "Onvi IA incluida", "Costa Rica"].map((parte, i) => (
                  <li key={parte}>
                    {i > 0 ? <em aria-hidden>/</em> : null}
                    {parte}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="oh-hero__visual"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
            >
              <Collage indice={indice} />
            </motion.div>
          </div>

          <a href="#clientes" className="oh-hero__bajar">
            Bajá para recorrer
            <span aria-hidden>
              <Flecha dir="abajo" className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>
      </div>

      <Cinta />
    </section>
  );
}
