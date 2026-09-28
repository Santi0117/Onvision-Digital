"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { digitalPlans, type DigitalPlanGroupKey } from "@/lib/digital";
import Pixel, { type FiguraPixel } from "../od/Pixel";
import { Check, ConPunto, Flecha } from "../od/ui";
import Pago, { type Seleccion } from "./Pago";

const EASE = [0.16, 1, 0.3, 1] as const;
const GRUPOS = ["web", "shop", "software", "mobile"] as const;
const FIGURA: Record<DigitalPlanGroupKey, FiguraPixel> = { web: "web", shop: "tienda", software: "software", mobile: "movil" };

type Plan = (typeof digitalPlans.groups)[DigitalPlanGroupKey]["plans"][number];

const VISIBLES = 6;

function Tarjeta({
  plan,
  grupo,
  indice,
  alPagar,
}: {
  plan: Plan;
  grupo: DigitalPlanGroupKey;
  indice: number;
  alPagar: () => void;
}) {
  const [todo, setTodo] = useState(false);
  const destacado = "highlighted" in plan && plan.highlighted;
  const desde = "startsAt" in plan && plan.startsAt ? `${digitalPlans.fromLabel} ` : "";
  const lista = todo ? plan.features : plan.features.slice(0, VISIBLES);
  const idLista = `od-plan-${grupo}-${indice}`;

  return (
    <motion.article
      className={`od-plan${destacado ? " od-plan--destacado" : ""}`}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: indice * 0.08 }}
    >
      {destacado ? <p className="od-plan__pestaña">{digitalPlans.mostChosen}</p> : null}
      <Pixel figura={FIGURA[grupo]} className="od-plan__pixel" />
      <p className="od-mono od-plan__n">{String(indice + 1).padStart(2, "0")}</p>
      <h3 className="od-plan__nombre">{plan.name}</h3>
      <p className="od-plan__tagline">{plan.tagline}</p>

      <div className="od-plan__precios">
        <p className="od-plan__precio">
          {desde ? <span>{digitalPlans.fromLabel}</span> : null}
          <b>{plan.price}</b>
          <span>{digitalPlans.period}</span>
        </p>
        {"priceAlt" in plan && plan.priceAlt ? <p className="od-plan__alt">{plan.priceAlt}</p> : null}
        <p className="od-plan__otros">
          {"priceYear" in plan && plan.priceYear ? (
            <span>
              {desde}
              {plan.priceYear} {digitalPlans.yearLabel} <em>{digitalPlans.yearSave}</em>
            </span>
          ) : null}
          {"priceFull" in plan && plan.priceFull ? (
            <span>
              {desde}
              {plan.priceFull} {digitalPlans.onceLabel}
            </span>
          ) : null}
        </p>
      </div>

      <button type="button" className={`od-boton ${destacado ? "od-boton--negro" : "od-boton--linea"} od-plan__pagar`} onClick={alPagar}>
        {digitalPlans.payMonthlyCta} <Flecha dir="diagonal" />
      </button>
      <a href={digitalPlans.quoteHref} target="_blank" rel="noopener noreferrer" className="od-plan__cotizar">
        {digitalPlans.quoteCta}
      </a>

      <p className="od-mono od-plan__rotulo">Qué incluye</p>
      <ul id={idLista} className="od-plan__lista">
        {lista.map((f) => (
          <li key={f}>
            <Check className="h-4 w-4" />
            {f}
          </li>
        ))}
      </ul>
      {plan.features.length > VISIBLES ? (
        <button type="button" className="od-plan__mas" aria-expanded={todo} aria-controls={idLista} onClick={() => setTodo((v) => !v)}>
          {todo ? "Ver menos" : `Ver todo (${plan.features.length})`}
        </button>
      ) : null}
    </motion.article>
  );
}

/**
 * "02 — Precios" con las tarjetas de nordpixel: pestañas numeradas por
 * línea, íconos de píxeles, la del medio en negro con su pestaña "Más
 * elegido", precio grande y la lista con checks. Pagar abre la hoja de Onvo.
 */
export default function Planes() {
  const [grupo, setGrupo] = useState<DigitalPlanGroupKey>("web");
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const datos = digitalPlans.groups[grupo];

  const pagar = (plan: Plan) => {
    if (!("checkoutId" in plan) || !plan.checkoutId) return;
    setSeleccion({
      planId: plan.checkoutId,
      planName: plan.name,
      categoryLabel: digitalPlans.tabs[grupo],
      price: plan.price,
      priceAlt: "priceAlt" in plan ? plan.priceAlt : undefined,
      period: digitalPlans.period,
    });
  };

  return (
    <section id="planes" className="od-planes od-claro" aria-labelledby="od-planes-titulo">
      <div className="od-planes__cabeza">
        <p className="od-eyebrow od-eyebrow--rayas">
          <i aria-hidden />
          <span>{digitalPlans.label}</span>
          <i aria-hidden />
        </p>
        <h2 id="od-planes-titulo" className="od-h2">
          <ConPunto>{digitalPlans.title}</ConPunto>
        </h2>
        <p className="od-lede">{digitalPlans.description}</p>
      </div>

      <div className="od-planes__tabs" role="tablist" aria-label="Categorías de planes">
        {GRUPOS.map((g, i) => (
          <button
            key={g}
            type="button"
            role="tab"
            id={`od-tab-${g}`}
            aria-selected={g === grupo}
            aria-controls="od-planes-panel"
            className={g === grupo ? "is-on" : undefined}
            onClick={() => setGrupo(g)}
          >
            <span className="od-mono">{String(i + 1).padStart(2, "0")}</span>
            {digitalPlans.tabs[g]}
            {g === grupo ? <motion.i layoutId="od-tab-fondo" className="od-planes__tab-fondo" transition={{ duration: 0.45, ease: EASE }} /> : null}
          </button>
        ))}
      </div>

      <div id="od-planes-panel" role="tabpanel" aria-labelledby={`od-tab-${grupo}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={grupo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="od-planes__grupo">{datos.description}</p>
            <div className={`od-planes__grilla od-planes__grilla--${datos.plans.length}`}>
              {datos.plans.map((plan, i) => (
                <Tarjeta key={`${grupo}-${plan.name}`} plan={plan} grupo={grupo} indice={i} alPagar={() => pagar(plan)} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="od-planes__custom">
        {digitalPlans.customQuotePrefix}{" "}
        <a href={digitalPlans.quoteHref} target="_blank" rel="noopener noreferrer">
          {digitalPlans.customQuoteLink}
        </a>
      </p>
      <p className="od-planes__unico">
        {digitalPlans.onceAskPrefix}{" "}
        <a href={digitalPlans.quoteHref} target="_blank" rel="noopener noreferrer">
          {digitalPlans.onceAskLink}
        </a>
      </p>

      <Pago seleccion={seleccion} alCerrar={() => setSeleccion(null)} />
    </section>
  );
}
