"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { digitalPlans } from "@/lib/digital";
import Pixel from "../od/Pixel";
import { Check, Esquinas, Flecha, Mono, Tag } from "./ui";
import { planes, tinte, type PlanPago } from "./data";

type Props = {
  elegido: PlanPago | null;
  alElegir: (id: string) => void;
  alPagar: () => void;
};

function Opcion({ p, on, alElegir }: { p: PlanPago; on: boolean; alElegir: (id: string) => void }) {
  return (
    <label className="oh-opcion" data-on={on ? "true" : "false"} style={tinte(p.linea)}>
      <input type="radio" name="plan" value={p.id} checked={on} onChange={() => alElegir(p.id)} className="sr-only" />
      {on ? (
        <motion.span
          layoutId="oh-opcion-marco"
          className="oh-opcion__marco"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        >
          <Esquinas />
        </motion.span>
      ) : null}
      <span className="oh-opcion__num">{p.codigo}</span>
      <span className="oh-opcion__ico">
        <Pixel figura={p.figura} className="h-5 w-5" />
      </span>
      <span className="oh-opcion__texto">
        <span className="oh-opcion__nombre">{p.nombre}</span>
        <span className="oh-opcion__sub">
          {p.lineaNombre} · {p.tagline}
        </span>
      </span>
      <span className="oh-opcion__estado" aria-hidden>
        {on ? <Check className="h-4 w-4" /> : `${p.precio}/MES`}
      </span>
    </label>
  );
}

/**
 * Activar: el titular de contacto de jeffmilanes con la palabra tachada,
 * los dos pasos en paneles de HUD de sibaldesign y el botón gigante de
 * clarvos. El mismo cobro de /digital#planes: la hoja de pago y Onvo.
 */
export default function Activar({ elegido, alElegir, alPagar }: Props) {
  return (
    <section id="activar" className="oh-activar" aria-labelledby="oh-activar-titulo" style={tinte(elegido?.linea)}>
      <div className="oh-activar__head">
        <Mono>Elegí y pagá</Mono>
        <h2 id="oh-activar-titulo" className="oh-activar__h2" aria-label="Tu sitio, listo en días.">
          <span aria-hidden>Tu sitio, listo en </span>
          <s aria-hidden>meses</s>
          <span aria-hidden> días.</span>
        </h2>
        <p className="oh-activar__lede">
          Elegí el plan y pagá la <b>mensualidad</b> con Onvo: tarjeta, SINPE y más. El pago único se coordina aparte.
        </p>
      </div>

      <div className="oh-activar__grid">
        <fieldset id="oh-lista" className="oh-panel oh-activar__lista" tabIndex={-1}>
          <legend className="sr-only">Elegí tu plan</legend>
          <Tag derecha={`${planes.length} PLANES · 4 LÍNEAS`}>PASO 01 · TU PLAN</Tag>
          <div className="oh-activar__opciones">
            {planes.map((p) => (
              <Opcion key={p.id} p={p} on={p.id === elegido?.id} alElegir={alElegir} />
            ))}
          </div>
        </fieldset>

        <div className="oh-panel oh-activar__pago">
          <Tag derecha="CHECKOUT · ONVO">PASO 02 · PAGO</Tag>
          <div className="oh-activar__resumen" aria-live="polite">
            {elegido ? (
              <>
                <div className="oh-activar__pantalla">
                  <Image
                    key={elegido.imagen}
                    src={elegido.imagen}
                    alt={elegido.alt}
                    fill
                    sizes="(min-width: 1024px) 520px, 90vw"
                    className="object-contain"
                  />
                  <Esquinas className="oh-activar__esquinas" />
                </div>
                <p className="oh-activar__sistema">{elegido.nombre}</p>
              </>
            ) : (
              <p className="oh-activar__vacio">Elegí un plan</p>
            )}
          </div>

          <dl className="oh-recibo">
            <div>
              <dt>Línea</dt>
              <dd>{elegido?.lineaNombre ?? "—"}</dd>
            </div>
            <div>
              <dt>Mensualidad</dt>
              <dd className="oh-recibo__precio">
                {elegido ? `${elegido.precio}${digitalPlans.period}` : "—"}
                {elegido?.precioAlt ? <small> · {elegido.precioAlt}</small> : null}
              </dd>
            </div>
            <div>
              <dt>Pago único</dt>
              <dd>{elegido ? `${elegido.precioUnico} · se coordina aparte` : "—"}</dd>
            </div>
            <div>
              <dt>Mínimo</dt>
              <dd>
                {elegido
                  ? elegido.minimo
                    ? "5 meses; después podés cancelar"
                    : "Sin mínimo de meses"
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Cobro</dt>
              <dd>Onvo · tarjeta, SINPE y más</dd>
            </div>
          </dl>

          <ul className="oh-recibo__incluye">
            {(elegido?.features ?? planes[1]!.features)
              .filter((f) => !f.startsWith("Mínimo"))
              .slice(0, 6)
              .map((f) => (
                <li key={f}>
                  <Check className="h-3.5 w-3.5" />
                  {f}
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="oh-activar__cta">
        {elegido ? (
          <button id="oh-pagar" type="button" className="oh-gigante" onClick={alPagar} aria-describedby="oh-pago-nota">
            <span className="oh-gigante__circ">
              <Flecha dir="diagonal" className="h-[42%] w-[42%]" />
            </span>
            <span className="oh-gigante__texto">Pagar {elegido.precio}/mes</span>
          </button>
        ) : (
          <button
            id="oh-pagar"
            type="button"
            className="oh-gigante oh-gigante--vacio"
            onClick={() => document.getElementById("oh-lista")?.focus()}
          >
            <span className="oh-gigante__circ">
              <Flecha dir="arriba" className="h-[42%] w-[42%]" />
            </span>
            <span className="oh-gigante__texto">Elegí un plan</span>
          </button>
        )}

        <p id="oh-pago-nota" className="oh-activar__nota">
          {elegido ? (
            <>
              Al pagar se abre la hoja de pago y de ahí el checkout de Onvo. {digitalPlans.paySheet.note.split(". ")[0]}.
            </>
          ) : (
            <>El resumen aparece cuando elijas tu plan arriba.</>
          )}
        </p>
        <p className="oh-activar__nota oh-activar__nota--chica">
          {digitalPlans.onceAskPrefix}{" "}
          <a href={digitalPlans.quoteHref} target="_blank" rel="noopener noreferrer">
            {digitalPlans.onceAskLink}
          </a>{" "}
          · {digitalPlans.customQuotePrefix}{" "}
          <a href={digitalPlans.quoteHref} target="_blank" rel="noopener noreferrer">
            {digitalPlans.customQuoteLink}
          </a>
        </p>
      </div>
    </section>
  );
}
