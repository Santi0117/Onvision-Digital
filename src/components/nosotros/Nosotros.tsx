"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { aboutPage } from "@/lib/about";
import { herramientas } from "../od/Herramientas";
import { irA } from "../od/data";
import { ConPunto, Flecha, Indice } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const TEXTO_PLANO = aboutPage.hero.lines.map((l) => l.parts.map((p) => p.text).join("")).join(" ");

/** El óvalo dibujado a mano de hobro ("OUR C◯RE IDENTITY"). */
function Ovalo() {
  return (
    <svg viewBox="0 0 220 110" className="od-man__ovalo" aria-hidden preserveAspectRatio="none">
      <motion.path
        d="M18 62 C 14 26, 92 8, 150 14 C 206 20, 214 58, 188 80 C 160 104, 64 108, 30 86 C 8 72, 20 44, 60 30"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.9 }}
      />
    </svg>
  );
}

/** El acento que cambia (Accesible · A medida · Sostenible · Humano). */
function Acentos() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % aboutPage.hero.accents.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="od-man__acentos">
      <span className="od-mono">{aboutPage.hero.label}</span>
      <span className="od-man__acento">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={aboutPage.hero.accents[i]}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {aboutPage.hero.accents[i]}
          </motion.span>
        </AnimatePresence>
        <Ovalo />
      </span>
    </p>
  );
}

function Manifiesto() {
  return (
    <section className="od-man" aria-labelledby="od-man-titulo">
      <Acentos />
      <h1 id="od-man-titulo" className="od-man__h1" aria-label={TEXTO_PLANO}>
        {aboutPage.hero.lines.map((linea, li) => (
          <span key={li} className="od-man__linea" aria-hidden>
            {linea.parts.map((p, pi) => (
              <motion.span
                key={pi}
                className={p.style === "outline" ? "od-man__hueco" : "od-man__lleno"}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 + (li * 2 + pi) * 0.12 }}
              >
                {p.text}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>
      <div className="od-man__pie">
        <p className="od-man__lead">{aboutPage.hero.lead}</p>
        <div className="od-man__botones">
          <button type="button" className="od-boton od-boton--linea-d" onClick={() => irA("#precios")}>
            Seguir leyendo <Flecha dir="abajo" />
          </button>
          <Link href={aboutPage.cta.primary.href} className="od-boton od-boton--blanco">
            {aboutPage.cta.primary.label} <Flecha />
          </Link>
        </div>
      </div>
      <p className="od-man__equipo" aria-hidden>
        {aboutPage.hero.accents.map((a) => (
          <span key={a}>{a}</span>
        ))}
      </p>
    </section>
  );
}

/** Tachado que se dibuja (el "NEXT" tachado de jeffmilanes). */
function Tachado({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.8 });
  return (
    <span ref={ref} className="od-tachado" data-on={visto ? "si" : "no"}>
      <s>{children}</s>
    </span>
  );
}

function Precios() {
  return (
    <section id="precios" className="od-np od-claro" aria-labelledby="od-np-titulo">
      <div className="od-np__cabeza">
        <p className="od-eyebrow">{aboutPage.prices.kicker}</p>
        <h2 id="od-np-titulo" className="od-np__h2">
          {aboutPage.prices.title} <em className="od-serif">{aboutPage.prices.emphasis}</em>
        </h2>
      </div>
      <div className="od-np__tabla">
        <div className="od-np__col">
          <p className="od-mono od-np__rotulo">Mercado</p>
          <ul>
            {aboutPage.prices.market.map((m) => (
              <li key={m.label}>
                <span>{m.label}</span>
                <Tachado>{m.value}</Tachado>
              </li>
            ))}
          </ul>
        </div>
        <div className="od-np__col od-np__col--nuestra">
          <p className="od-mono od-np__rotulo">Onvision</p>
          <ul>
            {aboutPage.prices.ours.map((m) => (
              <li key={m.label}>
                <span>{m.label}</span>
                <b>{m.value}</b>
              </li>
            ))}
          </ul>
          <Link href="/digital#planes" className="od-boton od-boton--negro od-boton--chico">
            Ver planes <Flecha />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Mision() {
  return (
    <section className="od-mision od-claro" aria-labelledby="od-mision-titulo">
      <div className="od-mision__texto">
        <p className="od-eyebrow">{aboutPage.mission.kicker}</p>
        <h2 id="od-mision-titulo" className="od-h2">
          <ConPunto>{aboutPage.mission.title}</ConPunto>
        </h2>
        <p className="od-lede">{aboutPage.mission.body}</p>
      </div>
      <ol className="od-mision__pilares">
        {aboutPage.mission.pillars.map((p, i) => (
          <motion.li
            key={p.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
          >
            <span className="od-mono">{String(i + 1).padStart(2, "0")}</span>
            <h3>{p.label}</h3>
            <p>{p.text}</p>
            <i className="od-mision__barra" aria-hidden />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Stack() {
  return (
    <section className="od-stack" aria-labelledby="od-stack-titulo">
      <div className="od-stack__cabeza">
        <p className="od-eyebrow">{aboutPage.tools.kicker}</p>
        <h2 id="od-stack-titulo" className="od-stack__h2">
          <ConPunto>{aboutPage.tools.title}</ConPunto>
        </h2>
        <p className="od-lede">{aboutPage.tools.body}</p>
      </div>
      <ul className="od-stack__grilla">
        {herramientas.map(({ name, mark: Mark }, i) => (
          <motion.li
            key={name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
          >
            <span className="od-stack__marca">
              <Mark />
            </span>
            <span>{name}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function Habilidades() {
  return (
    <section className="od-hab" aria-labelledby="od-hab-titulo">
      <h2 id="od-hab-titulo" className="od-hab__titulo">
        {aboutPage.skills.title.replace(/:$/, "")}
        <em className="od-serif">:</em>
      </h2>
      <ol className="od-hab__lista">
        {aboutPage.skills.items.map((s) => (
          <li key={s.code}>
            <Indice n={s.code} className="od-hab__n" />
            <span className="od-hab__nombre">{s.label}</span>
            <span className="od-hab__hint">{s.hint}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Nosotros() {
  return (
    <>
      <Manifiesto />
      <div className="od-bloque">
        <Precios />
        <Mision />
      </div>
      <Stack />
      <Habilidades />
    </>
  );
}
