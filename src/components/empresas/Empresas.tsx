"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { empresaProjects, empresasPage, type EmpresaFilter } from "@/lib/empresas";
import { filtrosEmpresas } from "../od/data";
import { Flecha, Punto } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Empresas: "Clients BRANDS" + "Selected Cases" de hobro. El título grande
 * con la serif itálica, los filtros con su conteo "(5)" en mono y las fichas
 * de cada proyecto con su captura, sector y enlace.
 */
export default function Empresas() {
  const [filtro, setFiltro] = useState<EmpresaFilter>("all");
  const lista = filtro === "all" ? empresaProjects : empresaProjects.filter((p) => p.kind === filtro);
  const titulo = empresasPage.title.replace(/\.$/, "");
  const corte = titulo.lastIndexOf(" ya ");

  return (
    <>
      <section className="od-emp-cab" aria-labelledby="od-emp-titulo">
        <p className="od-mono od-emp-cab__rotulo">{empresasPage.eyebrow}</p>
        <h1 id="od-emp-titulo" className="od-emp-cab__h1">
          {corte > 0 ? (
            <>
              {titulo.slice(0, corte)} <em className="od-serif">{titulo.slice(corte + 1)}</em>
            </>
          ) : (
            titulo
          )}
          <Punto />
        </h1>
        <div className="od-emp-cab__pie">
          <p className="od-emp-cab__lead">{empresasPage.lead}</p>
          <ul className="od-emp-cab__conteo" aria-label="Proyectos por tipo">
            {filtrosEmpresas
              .filter((f) => f.id !== "all")
              .map((f) => (
                <li key={f.id}>
                  {f.label} <span>({f.cantidad})</span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="od-emp od-claro" aria-label="Proyectos">
        <div className="od-emp__filtros" role="group" aria-label="Filtrar proyectos">
          {filtrosEmpresas.map((f) => (
            <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.label}
              <span className="od-mono">({f.cantidad})</span>
            </button>
          ))}
        </div>

        <motion.ul layout className="od-emp__grilla">
          <AnimatePresence mode="popLayout" initial={false}>
            {lista.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                className="od-ficha"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 6) * 0.04 }}
              >
                <div className="od-ficha__imagen">
                  <Image src={p.image} alt={`${p.name}: ${p.kindLabel.toLowerCase()}`} fill sizes="(min-width: 1000px) 45vw, 92vw" className="object-contain" />
                  <span className="od-ficha__tipo">{p.kindLabel}</span>
                </div>
                <div className="od-ficha__texto">
                  <p className="od-mono od-ficha__n">{String(empresaProjects.indexOf(p) + 1).padStart(2, "0")}</p>
                  <h2 className="od-ficha__nombre">{p.name}</h2>
                  <p className="od-ficha__sector">{p.sector}</p>
                  <p className="od-ficha__cuerpo">{p.body}</p>
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="od-ficha__link">
                      {p.linkLabel ?? "Visitar sitio"} <Flecha dir="diagonal" />
                    </a>
                  ) : (
                    <p className="od-ficha__privado">Sistema interno del cliente</p>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </section>
    </>
  );
}
