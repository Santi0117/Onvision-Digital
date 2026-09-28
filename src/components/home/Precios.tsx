"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { companyOffers } from "@/lib/company";
import { digitalPlans } from "@/lib/digital";
import Pixel, { type FiguraPixel } from "../od/Pixel";
import { Ojo } from "../od/ui";
import { Check, Flecha, Icono, Onda } from "./ui";
import { LINEAS, SISTEMA, planDeLinea, planes, type Linea, type PlanPago } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

const FIGURA_OFERTA: FiguraPixel[] = ["sistema", "digital", "soporte"];

/**
 * "Planes": titular en serif y selector de wisprflow, las píldoras gigantes
 * de clarvos con el precio adentro, la tarjeta del plan y las tres ofertas
 * de la casa. Elegir un plan abre el pago.
 */
export default function Precios({ alElegirPlan }: { alElegirPlan: (plan: PlanPago) => void }) {
  const [linea, setLinea] = useState<Linea>("web");
  const deLinea = planes.filter((p) => p.linea === linea);
  const desde = deLinea[0]!;
  const plan = planDeLinea(linea);
  const otros = deLinea.filter((p) => p.id !== plan.id);
  const deBase = desde.precioDesde ? `${digitalPlans.fromLabel} ` : "";
  const [antes, despues = ""] = companyOffers.title.split(". ");

  return (
    <section id="precios" className="oh-precios" aria-labelledby="oh-precios-titulo">
      <div className="oh-precios__head">
        <p className="oh-eyebrow">Planes</p>
        <h2 id="oh-precios-titulo" className="oh-serif-h2">
          {antes}. <em>{despues}</em>
        </h2>
        <p className="oh-lede">{digitalPlans.description}</p>
        <div className="oh-seg oh-seg--grande" role="group" aria-label="Línea de servicio">
          {LINEAS.map((l) => (
            <button key={l} type="button" aria-pressed={linea === l} onClick={() => setLinea(l)}>
              {digitalPlans.tabs[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="oh-pildoras">
        <div className="oh-pildoras__fila">
          <p className="oh-pildora">
            <span className="oh-pildora__desde">desde</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={desde.id}
                className="inline-block"
                initial={{ y: "60%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-60%", opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {desde.precio}
              </motion.span>
            </AnimatePresence>
            <span className="oh-pildora__icono" aria-hidden>
              <Icono nombre="calendario" className="h-[0.5em] w-[0.5em]" />
            </span>
            al mes
          </p>
          <button type="button" className="oh-pildora__circulo" aria-label={`Elegir ${desde.nombre} y pagar`} onClick={() => alElegirPlan(desde)}>
            <Flecha dir="esquina" className="h-[0.6em] w-[0.6em]" />
          </button>
        </div>
        <p className="oh-pildora__nota">
          {desde.precioAlt ? `${desde.precioAlt} al mes · ` : ""}o {deBase}
          {desde.precioUnico} {digitalPlans.onceLabel} · {deBase}
          {desde.precioAnual} {digitalPlans.yearLabel} ({digitalPlans.yearSave})
        </p>
        <p className="oh-pildora oh-pildora--corrida">
          Onvi IA y el Panel incluidos en los <span className="oh-pildora__sol">{planes.length}</span> planes.
        </p>
      </div>

      <article className="oh-plan">
        <div className="oh-plan__miniatura" aria-hidden>
          <Ojo className="oh-plan__ojo" />
          <span className="oh-plan__capsula">
            <Onda barras={9} />
          </span>
        </div>
        <div className="oh-plan__cuerpo">
          <div className="oh-plan__cabeza">
            <h3 className="oh-plan__nombre">{plan.nombre}</h3>
            <span className="oh-plan__badge">{plan.destacado && otros.length ? digitalPlans.mostChosen : plan.lineaNombre}</span>
            <span className="oh-plan__precio">
              {plan.precioDesde ? <small className="oh-plan__desde">{`${digitalPlans.fromLabel} `}</small> : null}
              {plan.precio}
              <small>{digitalPlans.period}</small>
            </span>
          </div>
          <p className="oh-plan__sub">{plan.tagline}</p>
          <ul className="oh-plan__lista">
            {plan.features.slice(0, 8).map((f) => (
              <li key={f}>
                <Check className="h-4 w-4" />
                {f}
              </li>
            ))}
          </ul>
          <div className="oh-plan__acciones">
            <button type="button" className="oh-boton-lila" onClick={() => alElegirPlan(plan)}>
              Elegir {plan.nombre}
              <Flecha className="h-4 w-4" />
            </button>
            {otros.map((o) => (
              <button key={o.id} type="button" className="oh-plan__otro" onClick={() => alElegirPlan(o)}>
                o {o.nombre} · {o.precio}/mes
              </button>
            ))}
            <Link href="/digital#planes" className="oh-plan__todo">
              Ver todo lo que incluye
              <Flecha className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>

      <ul className="oh-ofertas">
        {companyOffers.cards.map((c, i) => {
          const externo = "external" in c.cta && c.cta.external;
          const href = c.cta.href === "/activar" ? SISTEMA.activar : c.cta.href;
          const fuera = externo || href.startsWith("http");
          return (
            <motion.li
              key={c.title}
              className={`oh-oferta oh-oferta--${i}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
            >
              <span className="oh-oferta__icono">
                <Pixel figura={FIGURA_OFERTA[i] ?? "digital"} className="h-7 w-7" />
              </span>
              <h3 className="oh-oferta__titulo">{c.title}</h3>
              <p className="oh-oferta__texto">{c.body}</p>
              {fuera ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="oh-oferta__cta">
                  {c.cta.label}
                  <Flecha dir="diagonal" className="h-4 w-4" />
                </a>
              ) : (
                <Link href={href} className="oh-oferta__cta">
                  {c.cta.label}
                  <Flecha className="h-4 w-4" />
                </Link>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
