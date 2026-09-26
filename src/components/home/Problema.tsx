"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import { companyOnvi } from "@/lib/company";
import { abrirOnvi } from "../od/OnviChat";
import { Check, Flecha, Onda } from "./ui";
import { irAPaso, oracion, pad } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Lo que Onvi hace en cada punto (de /web y las preguntas frecuentes) y el mensaje que lo pide. */
const DETALLE: { desc: string; mensaje: string }[] = [
  {
    desc: "Viene incluida en cada proyecto: la página, la tienda, el software a medida o el Sistema Onvision.",
    mensaje: "Quiero una tienda para mi marca… ¿Onvi viene incluida?",
  },
  {
    desc: "Atiende 24/7 en español, aprende tu catálogo y te pasa los leads, conectada a tu sitio.",
    mensaje: "¿Tienen citas mañana? Quisiera reservar a las 9:00.",
  },
  {
    desc: "Conectada a tu operación: agenda, recomienda y te avisa lo que importa en tu panel.",
    mensaje: "Onvi, ¿cuántas reservas entraron esta semana?",
  },
  {
    desc: "Cada ajuste que pedís queda registrado y Onvi lo sigue con vos hasta que esté listo para revisar.",
    mensaje: "Agreguemos una sección de promociones y cambiemos el color del botón.",
  },
  {
    desc: "No pagás un chatbot aparte: Onvi va en la mensualidad, junto al hosting y el soporte.",
    mensaje: "¿La IA tiene costo extra o ya va en el plan?",
  },
];

/** Los cinco puntos oficiales de Onvi, cada uno con lo que hace y lo que alguien le diría. */
const PUNTOS = companyOnvi.points.map((p, k) => ({ titulo: oracion(p), ...DETALLE[k]! }));
const N = PUNTOS.length;

/** Fondos borrosos como las fotos en movimiento de wisprflow, en cian, azul y menta. */
const FONDOS = [
  "radial-gradient(circle at 28% 26%, #7ee8fa 0, transparent 42%), radial-gradient(circle at 72% 70%, #3b6ef6 0, transparent 48%), linear-gradient(160deg, #04161d 0%, #0a5a6e 55%, #9fe6f3 100%)",
  "radial-gradient(circle at 40% 24%, #b9d6ff 0, transparent 46%), radial-gradient(circle at 58% 72%, #e3f5f9 0, transparent 42%), linear-gradient(172deg, #2f5fd8 0%, #3aa6c8 68%, #06202a 100%)",
  "radial-gradient(circle at 30% 70%, #c9f7e5 0, transparent 44%), radial-gradient(circle at 70% 30%, #2ef2a6 0, transparent 40%), linear-gradient(160deg, #03241c 0%, #0c9f68 52%, #bff5e4 100%)",
  "radial-gradient(circle at 66% 28%, #a5b4fc 0, transparent 42%), radial-gradient(circle at 30% 74%, #7ee8fa 0, transparent 44%), linear-gradient(165deg, #0b1440 0%, #3b6ef6 55%, #7ee8fa 100%)",
  "radial-gradient(circle at 50% 30%, #34d3ee 0, transparent 40%), radial-gradient(circle at 20% 80%, #3b6ef6 0, transparent 40%), linear-gradient(170deg, #000 0%, #0a1f28 50%, #145a6b 100%)",
];

function Tarjeta({ k }: { k: number }) {
  return (
    <div className="oh-prob__tarjeta" style={{ "--fondo": FONDOS[k % FONDOS.length] } as CSSProperties}>
      <div className="oh-prob__foto" aria-hidden />
      <div className="oh-prob__composer" aria-hidden>
        <p className="oh-prob__mensaje" key={k}>
          {PUNTOS[k]!.mensaje}
        </p>
        <div className="oh-prob__barra">
          <span>+</span>
          <span>Aa</span>
          <span>☺</span>
          <span>···</span>
          <span className="oh-prob__enviar">➤</span>
        </div>
      </div>
      <div className="oh-prob__capsula" aria-hidden>
        <span className="oh-prob__x">×</span>
        <Onda barras={9} />
        <span className="oh-prob__ok">
          <Check className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

/**
 * Onvi como las funciones de wisprflow: lista con la barra de color a la
 * izquierda, la tarjeta en el medio con el mensaje que se escribe y la
 * cápsula de voz, y el título en serif a la derecha.
 */
export default function Problema() {
  const pista = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
    setI((prev) => (prev === n ? prev : n));
  });

  const actual = PUNTOS[i]!;
  const [antes, despues = ""] = companyOnvi.title.replace(/\.$/, "").split(" y ");

  return (
    <section id="onvi" className="oh-prob" aria-labelledby="oh-prob-titulo">
      <div className="oh-prob__head">
        <p className="oh-eyebrow">Onvi · IA incluida</p>
        <h2 id="oh-prob-titulo" className="oh-serif-h2">
          {antes} <em>y {despues}.</em>
        </h2>
        <p className="oh-lede">
          Responde, agenda y recomienda, conectada a tu sitio y a tu operación. Va en la mensualidad, sin contratar
          otra herramienta.
        </p>
        <div className="oh-prob__botones">
          <button type="button" className="oh-boton-lila" onClick={abrirOnvi}>
            Hablar con Onvi
            <Flecha className="h-4 w-4" />
          </button>
          <Link href={companyOnvi.cta.href} className="oh-prob__enlace">
            {companyOnvi.cta.label}
            <Flecha className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div ref={pista} className="oh-prob__pista" style={{ "--n": N } as CSSProperties}>
        <div className="oh-prob__stage">
          <svg className="oh-prob__trazo" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden>
            <path d="M -60 640 C 240 520, 420 820, 700 640 S 1010 150, 1240 250 S 1500 520, 1520 420" />
          </svg>

          <ol className="oh-prob__lista">
            {PUNTOS.map((p, k) => (
              <li key={p.titulo}>
                <button type="button" data-on={k === i ? "true" : "false"} onClick={() => irAPaso(pista.current, k, N)}>
                  {p.titulo}
                </button>
              </li>
            ))}
          </ol>

          <div className="oh-prob__centro">
            <AnimatePresence initial={false}>
              <motion.div
                key={i}
                className="oh-prob__capa"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <Tarjeta k={i} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="oh-prob__texto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={actual.titulo}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <p className="oh-prob__num">{pad(i + 1)}</p>
                <h3 className="oh-prob__titulo">{actual.titulo}</h3>
                <p className="oh-prob__desc">{actual.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ol className="oh-prob__movil">
        {PUNTOS.map((p, k) => (
          <li key={p.titulo}>
            <Tarjeta k={k} />
            <p className="oh-prob__num">{pad(k + 1)}</p>
            <h3 className="oh-prob__titulo">{p.titulo}</h3>
            <p className="oh-prob__desc">{p.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
