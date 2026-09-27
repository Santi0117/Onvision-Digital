"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { empresasPage, type EmpresaFilter } from "@/lib/empresas";
import { empresas, planDeLinea, scrollA, tinte, type Empresa, type Linea } from "../home/data";
import { Check, Flecha, Mono } from "../home/ui";
import Pixel from "../od/Pixel";
import { filtrosEmpresas, servicios, wa } from "../od/data";
import "../home/home.css";
import "../home/home-secciones.css";
import "./empresas.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Lo que trae un proyecto de cada línea y desde cuánto (de "Qué incluye" y los planes). */
const DE_LINEA = Object.fromEntries(servicios.map((s) => [s.grupo, s])) as Record<Linea, (typeof servicios)[number]>;

function Fila({ e, abierta, alAlternar }: { e: Empresa; abierta: boolean; alAlternar: () => void }) {
  const panel = `oh-det-${e.id}`;
  const linea = DE_LINEA[e.linea];
  const figura = planDeLinea(e.linea).figura;
  const mensaje = `Hola, vi el trabajo de ${e.name} (${e.kindLabel.toLowerCase()}) y quiero uno así para mi negocio.`;
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
                    <li>Onvi IA, hosting y soporte incluidos</li>
                    <li>Entrega promedio: una semana</li>
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
                      <Pixel figura={figura} className="h-3.5 w-3.5" />
                      {e.kindLabel}
                    </figcaption>
                  </figure>
                  <div className="oh-det__botones">
                    <a href={wa(mensaje)} target="_blank" rel="noopener noreferrer" className="oh-pill oh-pill--sol oh-pill--chica">
                      Quiero uno así
                      <span className="oh-pill__circ">
                        <Flecha dir="diagonal" />
                      </span>
                    </a>
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
 * La página de Empresas: la sección de trabajos que antes iba en el inicio,
 * como "Proof, not promises" de jeffmilanes. El número delineado, el nombre
 * gigante y, al abrir, lo que hicimos con su captura; arriba, los filtros.
 * Sin precios ni planes: "Quiero uno así" abre WhatsApp contando qué trabajo
 * se vio.
 */
export default function Trabajos() {
  const [filtro, setFiltro] = useState<EmpresaFilter>("all");
  const [abierta, setAbierta] = useState<string | null>(empresas[0]!.id);
  const visibles = filtro === "all" ? empresas : empresas.filter((e) => e.kind === filtro);

  // Las marcas de la franja de clientes del inicio llegan con su ancla ("/empresas#firstdown"):
  // se abre esa fila y, cuando se acomoda, la página baja hasta ella.
  useEffect(() => {
    const ids = new Set(empresas.map((e) => e.id));
    let t = 0;
    const abrirDesdeAncla = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!ids.has(id)) return;
      setFiltro("all");
      setAbierta(id);
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const fila = document.getElementById(id);
        if (fila) scrollA(fila, -110);
      }, 700);
    };
    abrirDesdeAncla();
    window.addEventListener("hashchange", abrirDesdeAncla);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", abrirDesdeAncla);
    };
  }, []);


  const filtrar = (f: EmpresaFilter) => {
    setFiltro(f);
    const primera = f === "all" ? empresas[0] : empresas.find((e) => e.kind === f);
    setAbierta(primera?.id ?? null);
  };

  return (
    <div className="oh oh--incrustado oh-emp-marco">
      <section id="trabajos" className="oh-det" aria-labelledby="oh-det-titulo">
        <div className="oh-det__head">
          <Mono>Empresas</Mono>
          <h1 id="oh-det-titulo" className="oh-det__h2">
            <span className="oh-det__h2-grande">Trabajos que ya corren:</span>
            <em className="oh-det__h2-serif">sitios, tiendas y software a medida</em>
          </h1>
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
          </div>
        </div>

        <div className="oh-det__lista">
          {visibles.map((e) => (
            <Fila
              key={e.id}
              e={e}
              abierta={abierta === e.id}
              alAlternar={() => setAbierta((a) => (a === e.id ? null : e.id))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
