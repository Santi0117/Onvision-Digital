"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { companyOffers } from "@/lib/company";
import { digitalPlans, type DigitalPlanGroupKey } from "@/lib/digital";
import { LINEAS, SISTEMA, pad, planes, seleccionDe, type Linea } from "../home/data";
import { Flecha as FlechaOh, Icono } from "../home/ui";
import Pixel, { type FiguraPixel } from "../od/Pixel";
import { Check, ConPunto, Flecha } from "../od/ui";
import Pago, { type Seleccion } from "./Pago";

const EASE = [0.16, 1, 0.3, 1] as const;
const FIGURA: Record<DigitalPlanGroupKey, FiguraPixel> = { web: "web", shop: "tienda", software: "software", mobile: "movil" };
const FIGURA_OFERTA: FiguraPixel[] = ["sistema", "digital", "soporte"];

type Plan = (typeof digitalPlans.groups)[DigitalPlanGroupKey]["plans"][number];

const VISIBLES = 6;

/** La tarjeta de nordpixel: ícono de píxeles, precio grande, pagar, cotizar y qué incluye. */
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
  const idLista = `pl-plan-${grupo}-${indice}`;

  return (
    <motion.article
      className={`od-plan${destacado ? " od-plan--destacado" : ""}`}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: indice * 0.08 }}
    >
      {destacado ? <p className="od-plan__pestaña">{digitalPlans.mostChosen}</p> : null}
      <Pixel figura={FIGURA[grupo]} className="od-plan__pixel" />
      <p className="od-mono od-plan__n">{pad(indice + 1)}</p>
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
 * La línea de servicio, una sola vez para toda la sección: el precio
 * "desde", las tarjetas y el pago cambian juntos. La elegida se ve en negro
 * con su nombre en blanco (antes el fondo negro tapaba el nombre).
 */
function Lineas({ linea, alElegir }: { linea: Linea; alElegir: (l: Linea) => void }) {
  return (
    <div className="pl-lineas" role="group" aria-label="Línea de servicio">
      {LINEAS.map((l, i) => (
        <button key={l} type="button" aria-pressed={l === linea} onClick={() => alElegir(l)}>
          {l === linea ? <motion.i layoutId="pl-lineas-fondo" className="pl-lineas__fondo" transition={{ duration: 0.45, ease: EASE }} /> : null}
          <span className="pl-lineas__n">{pad(i + 1)}</span>
          <span className="pl-lineas__nombre">{digitalPlans.tabs[l]}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Planes: "No te atrasés…" y "Planes claros" en una sola sección. Arriba el
 * titular en serif y la línea de servicio; después la píldora gigante con
 * el precio "desde", las tarjetas de la línea (pagar la mensualidad con
 * Onvo, cotizar y qué incluye) y las tres ofertas de la casa.
 */
export default function Planes() {
  const [linea, setLinea] = useState<Linea>("web");
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const datos = digitalPlans.groups[linea];
  const deLinea = planes.filter((p) => p.linea === linea);
  const desde = deLinea[0]!;
  const deBase = desde.precioDesde ? `${digitalPlans.fromLabel} ` : "";
  const [antes, despues = ""] = companyOffers.title.split(". ");

  const pagar = (plan: Plan) => {
    if (!("checkoutId" in plan) || !plan.checkoutId) return;
    setSeleccion({
      planId: plan.checkoutId,
      planName: plan.name,
      categoryLabel: digitalPlans.tabs[linea],
      price: plan.price,
      priceAlt: "priceAlt" in plan ? plan.priceAlt : undefined,
      period: digitalPlans.period,
    });
  };

  return (
    <section id="planes" className="pl od-claro" aria-labelledby="pl-titulo">
      <header className="pl-cabeza">
        <p className="oh-eyebrow">Planes</p>
        <h1 id="pl-titulo" className="oh-serif-h2">
          {antes}. <em>{despues}</em>
        </h1>
        <p className="oh-lede">{digitalPlans.description}</p>
      </header>

      {/* La línea queda pegada arriba mientras se ven la píldora y las tarjetas; antes de las ofertas se suelta. */}
      <div className="pl-elegir">
        <div className="pl-pegado">
          <Lineas linea={linea} alElegir={setLinea} />
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
            <button type="button" className="oh-pildora__circulo" aria-label={`Elegir ${desde.nombre} y pagar`} onClick={() => setSeleccion(seleccionDe(desde))}>
              <FlechaOh dir="esquina" className="h-[0.6em] w-[0.6em]" />
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

        <div className="pl-planes">
          <div className="pl-planes__cabeza">
            <p className="od-eyebrow od-eyebrow--rayas">
              <i aria-hidden />
              <span>{digitalPlans.tabs[linea]}</span>
              <i aria-hidden />
            </p>
            <h2 className="od-h2">
              <ConPunto>{digitalPlans.title}</ConPunto>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={linea} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <p className="od-planes__grupo">{datos.description}</p>
              <div className={`od-planes__grilla od-planes__grilla--${datos.plans.length}`}>
                {datos.plans.map((plan, i) => (
                  <Tarjeta key={`${linea}-${plan.name}`} plan={plan} grupo={linea} indice={i} alPagar={() => pagar(plan)} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

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
        </div>
      </div>

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
                  <FlechaOh dir="diagonal" className="h-4 w-4" />
                </a>
              ) : (
                <Link href={href} className="oh-oferta__cta">
                  {c.cta.label}
                  <FlechaOh className="h-4 w-4" />
                </Link>
              )}
            </motion.li>
          );
        })}
      </ul>

      <Pago seleccion={seleccion} alCerrar={() => setSeleccion(null)} />
    </section>
  );
}
