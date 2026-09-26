"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { empresasPage, type EmpresaFilter } from "@/lib/empresas";
import Pixel from "../od/Pixel";
import { filtrosEmpresas, servicios } from "../od/data";
import { Check, Flecha, Mono } from "./ui";
import { empresas, planDeLinea, tinte, type Empresa, type Linea } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Lo que trae un proyecto de cada línea y desde cuánto (de "Qué incluye" y los planes). */
const DE_LINEA = Object.fromEntries(servicios.map((s) => [s.grupo, s])) as Record<Linea, (typeof servicios)[number]>;

function Fila({
  e,
  abierta,
  alAlternar,
  alElegir,
}: {
  e: Empresa;
  abierta: boolean;
  alAlternar: () => void;
  alElegir: (linea: Linea) => void;
}) {
  const panel = `oh-det-${e.id}`;
  const linea = DE_LINEA[e.linea];
  const plan = planDeLinea(e.linea);
  return (
    <article id={e.id} className="oh-det__fila" data-abierta={abierta ? "true" : "false"} style={tinte(e.linea)}>
      <h3 className="oh-det__h3">
        <button type="button" aria-expanded={abierta} aria-controls={panel} onClick={alAlternar}>
          <span className="oh-det__num" aria-hidden>
            {e.codigo}
          </span>
          <span className="oh-det__nombre">
            {e.name}
            <span className="oh-det__flecha" aria-hidden>
              <Flecha dir="diagonal" className="h-[0.42em] w-[0.42em]" />
            </span>
          </span>
          <span className="oh-det__sub">{e.sector}</span>
          <span className="oh-det__estado" aria-hidden>
            <i />
            {e.kindLabel}
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {abierta ? (
          <motion.div
            id={panel}
            key="panel"
            className="oh-det__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="oh-det__cuerpo">
              <p className="oh-det__pitch">{e.body}</p>
              <div className="oh-det__columnas">
                <div>
                  <Mono className="oh-det__label">Lo que trae un proyecto así</Mono>
                  <ul className="oh-det__modulos">
                    {linea.piezas.map((m) => (
                      <li key={m}>
                        <Check className="h-4 w-4" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Mono className="oh-det__label">Línea · {linea.titulo}</Mono>
                  <ul className="oh-det__ayuda">
                    <li>{linea.precio}</li>
                    <li>
                      Plan sugerido: {plan.nombre} · {plan.precio}/mes
                    </li>
                    <li>Onvi IA, hosting y soporte incluidos</li>
                  </ul>
                </div>
                <div className="oh-det__lado">
                  <figure className="oh-det__captura">
                    <Image
                      src={e.image}
                      alt={`${e.name}: ${e.kindLabel.toLowerCase()} hecho por Onvision Digital`}
                      fill
                      sizes="(min-width: 1024px) 380px, 90vw"
                      className="object-contain"
                    />
                    <figcaption>
                      <Pixel figura={plan.figura} className="h-3.5 w-3.5" />
                      {e.kindLabel}
                    </figcaption>
                  </figure>
                  <div className="oh-det__botones">
                    <button type="button" className="oh-pill oh-pill--sol oh-pill--chica" onClick={() => alElegir(e.linea)}>
                      Quiero uno así
                      <span className="oh-pill__circ">
                        <Flecha dir="diagonal" />
                      </span>
                    </button>
                    {e.href ? (
                      <a href={e.href} target="_blank" rel="noopener noreferrer" className="oh-det__visitar">
                        {e.linkLabel ?? "Visitar sitio"}
                        <Flecha dir="diagonal" className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

/**
 * "Empresas" como "Proof, not promises" de jeffmilanes: el número
 * delineado, el nombre gigante y, al abrir, lo que hicimos con su captura.
 * Arriba, los filtros oficiales de /empresas.
 */
export default function Detalle({ alElegir }: { alElegir: (linea: Linea) => void }) {
  const [filtro, setFiltro] = useState<EmpresaFilter>("all");
  const [abierta, setAbierta] = useState<string | null>(empresas[0]!.id);
  const visibles = filtro === "all" ? empresas : empresas.filter((e) => e.kind === filtro);

  // Las marcas de la franja de clientes ("#firstdown", "#guba"…) abren su fila.
  useEffect(() => {
    const ids = new Set(empresas.map((e) => e.id));
    const alClic = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement | null)?.closest?.("a[href^='#']");
      const id = a?.getAttribute("href")?.slice(1);
      if (id && ids.has(id)) {
        setFiltro("all");
        setAbierta(id);
      }
    };
    document.addEventListener("click", alClic);
    return () => document.removeEventListener("click", alClic);
  }, []);

  const filtrar = (f: EmpresaFilter) => {
    setFiltro(f);
    const primera = f === "all" ? empresas[0] : empresas.find((e) => e.kind === f);
    setAbierta(primera?.id ?? null);
  };

  return (
    <section id="trabajos" className="oh-det" aria-labelledby="oh-det-titulo">
      <div className="oh-det__head">
        <Mono>Empresas</Mono>
        <h2 id="oh-det-titulo" className="oh-det__h2">
          <span className="oh-det__h2-grande">Trabajos que ya corren:</span>
          <em className="oh-det__h2-serif">sitios, tiendas y software a medida</em>
        </h2>
        <p className="oh-det__lede">{empresasPage.lead}</p>
        <div className="oh-det__pie">
          <div className="oh-seg" role="group" aria-label="Filtrar trabajos">
            {filtrosEmpresas.map((f) => (
              <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => filtrar(f.id)}>
                {f.label}
                <small>{f.cantidad}</small>
              </button>
            ))}
          </div>
          <Link href="/empresas" className="oh-det__todas">
            Ver la vitrina completa
            <Flecha className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="oh-det__lista">
        {visibles.map((e) => (
          <Fila
            key={e.id}
            e={e}
            abierta={abierta === e.id}
            alAlternar={() => setAbierta((a) => (a === e.id ? null : e.id))}
            alElegir={alElegir}
          />
        ))}
      </div>
    </section>
  );
}
