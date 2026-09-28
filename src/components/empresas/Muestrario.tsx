"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { empresasPage, type EmpresaFilter } from "@/lib/empresas";
import { empresas, pad, scrollA, type Empresa } from "../home/data";
import { Mono } from "../home/ui";
import Pixel, { type FiguraPixel } from "../od/Pixel";
import { filtrosEmpresas, wa } from "../od/data";
import "../home/home.css";
import "../home/home-secciones.css";
import "./empresas.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Cada cuánto pasa sola al siguiente proyecto, hasta que alguien toca algo. */
const PASO_MS = 6000;

type Tipo = Empresa["kind"];

const GRUPOS: { tipo: Tipo; nombre: string }[] = [
  { tipo: "website", nombre: "Sitio web" },
  { tipo: "ecommerce", nombre: "E-commerce" },
  { tipo: "software", nombre: "Software" },
];

/** El ícono y la palabra del centro de la señal. */
const SENAL: Record<Tipo, { figura: FiguraPixel; palabra: string }> = {
  website: { figura: "web", palabra: "Sitio" },
  ecommerce: { figura: "tienda", palabra: "Tienda" },
  software: { figura: "software", palabra: "Sistema" },
};

const dominio = (href?: string) => (href ? href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : null);
/** La captura del proyecto; la miniatura es la misma en chico ("-min"). */
const foto = (e: Empresa, chica = false) => (chica ? e.image.replace(/\.webp$/, "-min.webp") : e.image);

/**
 * Empresas como el muestrario de la preview oficial, en los colores y la
 * letra del sitio: a la izquierda los proyectos por línea, en el medio la
 * pantalla con el proyecto, su avance y sus datos, y a la derecha la ficha,
 * la señal y los botones. Pasa solo de proyecto hasta que alguien toca algo.
 */
export default function Muestrario() {
  const [filtro, setFiltro] = useState<EmpresaFilter>("all");
  const [actual, setActual] = useState(empresas[0]!.id);
  const [solo, setSolo] = useState(true);
  const [encima, setEncima] = useState(false);
  const [visible, setVisible] = useState(false);
  const [vuelta, setVuelta] = useState(0);
  const editor = useRef<HTMLDivElement>(null);
  const tira = useRef<HTMLElement>(null);

  const lista = useMemo(() => (filtro === "all" ? empresas : empresas.filter((x) => x.kind === filtro)), [filtro]);
  const indice = Math.max(0, lista.findIndex((e) => e.id === actual));
  const e = lista[indice] ?? empresas[0]!;
  const senal = SENAL[e.kind];
  const [rubro, ...lugar] = e.sector.split(" · ");
  const enlace = dominio(e.href);
  const corriendo = solo && visible && !encima;

  // Solo pasa mientras se ve.
  useEffect(() => {
    const el = editor.current;
    if (!el) return;
    const io = new IntersectionObserver(([x]) => setVisible(Boolean(x?.isIntersecting)), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Y nunca con movimiento reducido.
  useEffect(() => {
    if (!corriendo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      setActual(lista[(indice + 1) % lista.length]!.id);
      setVuelta((v) => v + 1);
    }, PASO_MS);
    return () => window.clearTimeout(t);
  }, [corriendo, indice, lista]);

  // En el celular los grupos son una tira de lado: se corre hasta el proyecto elegido
  // (solo de lado; la página no se mueve).
  useEffect(() => {
    const t = tira.current;
    if (!t || t.scrollWidth <= t.clientWidth + 1) return;
    const boton = t.querySelector<HTMLElement>('.em-mini[aria-pressed="true"]');
    if (!boton) return;
    const a = t.getBoundingClientRect();
    const b = boton.getBoundingClientRect();
    if (b.left < a.left || b.right > a.right) t.scrollTo({ left: t.scrollLeft + (b.left - a.left) - 16, behavior: "smooth" });
  }, [e.id]);

  // Las marcas que llegan con su ancla ("/empresas#firstdown") abren ese proyecto.
  useEffect(() => {
    const ids = new Set(empresas.map((x) => x.id));
    let t = 0;
    const desdeAncla = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!ids.has(id)) return;
      setFiltro("all");
      setActual(id);
      setSolo(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (editor.current) scrollA(editor.current, -100);
      }, 500);
    };
    desdeAncla();
    window.addEventListener("hashchange", desdeAncla);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", desdeAncla);
    };
  }, []);

  // Cualquier elección a mano detiene el paso solo.
  const elegir = (id: string) => {
    setSolo(false);
    setActual(id);
  };
  const mover = (d: number) => elegir(lista[(indice + d + lista.length) % lista.length]!.id);
  const filtrar = (f: EmpresaFilter) => {
    setSolo(false);
    setFiltro(f);
    const primera = f === "all" ? empresas[0] : empresas.find((x) => x.kind === f);
    if (primera && (f === "all" || e.kind !== f)) setActual(primera.id);
  };

  return (
    <div className="oh oh--incrustado oh-emp-marco">
      <section id="trabajos" className="em" aria-labelledby="em-titulo">
        <header className="em-cabeza">
          <Mono>Empresas</Mono>
          <h1 id="em-titulo" className="em-cabeza__h1">
            <span className="em-cabeza__grande">Algunos trabajos que ya corren:</span>
            <em className="em-cabeza__serif">sitios, tiendas y software a medida</em>
          </h1>
          <p className="em-cabeza__lede">{empresasPage.lead}</p>
        </header>

        <div
          ref={editor}
          className="em-editor"
          onPointerEnter={(ev) => ev.pointerType === "mouse" && setEncima(true)}
          onPointerLeave={() => setEncima(false)}
        >
          {/* Izquierda: los proyectos por línea. */}
          <nav ref={tira} className="em-grupos" aria-label="Proyectos">
            {GRUPOS.map((g) => {
              const deGrupo = empresas.filter((x) => x.kind === g.tipo);
              const apagado = filtro !== "all" && filtro !== g.tipo;
              return (
                <div key={g.tipo} className="em-grupo" data-apagado={apagado ? "true" : undefined}>
                  <p className="em-grupo__cabeza">
                    <span>
                      <i aria-hidden /> {g.nombre}
                    </span>
                    <span className="em-grupo__cuenta">{pad(deGrupo.length)}</span>
                  </p>
                  <ul className="em-grupo__grilla">
                    {deGrupo.map((x) => (
                      <li key={x.id}>
                        <button
                          type="button"
                          className="em-mini"
                          aria-pressed={x.id === e.id}
                          disabled={apagado}
                          onClick={() => {
                            if (filtro !== "all" && filtro !== x.kind) setFiltro("all");
                            elegir(x.id);
                          }}
                        >
                          <span className="em-mini__foto">
                            <Image src={foto(x, true)} alt="" fill sizes="140px" className="object-contain" />
                          </span>
                          <span className="em-mini__nombre">{x.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>

          {/* Medio: la pantalla, el avance y los datos. */}
          <div className="em-escenario">
            <div className="em-escenario__cabeza">
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2
                  key={e.id}
                  className="em-escenario__nombre"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {e.name}
                </motion.h2>
              </AnimatePresence>
              <Mono as="span" className="em-escenario__tipo">
                {e.kindLabel}
              </Mono>
            </div>

            <div className="em-pantalla">
              <span className="em-pantalla__url">{enlace ?? "sistema interno"}</span>
              <span className="em-pantalla__n">
                {pad(indice + 1)}/{pad(lista.length)}
              </span>
              <AnimatePresence initial={false}>
                <motion.div
                  key={e.id}
                  className="em-pantalla__foto"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <Image
                    src={foto(e)}
                    alt={`${e.name}: ${e.kindLabel.toLowerCase()} hecho por Onvision Digital`}
                    fill
                    priority={e.id === empresas[0]!.id}
                    sizes="(min-width: 1200px) 660px, 94vw"
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="em-avance">
              <button type="button" className="em-avance__flecha" aria-label="Proyecto anterior" onClick={() => mover(-1)}>
                ←
              </button>
              <ol className="em-avance__pista">
                {lista.map((x, i) => (
                  <li key={x.id}>
                    <button
                      type="button"
                      aria-label={`Ver ${x.name}`}
                      aria-current={i === indice ? "true" : undefined}
                      data-visto={i < indice ? "true" : undefined}
                      onClick={() => elegir(x.id)}
                    >
                      {i === indice && corriendo ? <i key={vuelta} className="em-avance__carga" style={{ animationDuration: `${PASO_MS}ms` }} /> : null}
                    </button>
                  </li>
                ))}
              </ol>
              <span className="em-avance__n">
                {pad(indice + 1)}
                <em>/{pad(lista.length)}</em>
              </span>
              <button type="button" className="em-avance__flecha" aria-label="Proyecto siguiente" onClick={() => mover(1)}>
                →
              </button>
            </div>

            <dl className="em-filas">
              <div>
                <dt>Tipo</dt>
                <dd>
                  <div className="em-seg" role="group" aria-label="Filtrar por tipo">
                    {filtrosEmpresas.map((f) => (
                      <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => filtrar(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </dd>
              </div>
              <div>
                <dt>Sector</dt>
                <dd>{e.sector}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd className="em-filas__estado">
                  <i aria-hidden /> En línea
                </dd>
              </div>
              <div>
                <dt>Enlace</dt>
                <dd>
                  {e.href ? (
                    <a href={e.href} target="_blank" rel="noopener noreferrer">
                      {enlace} <span aria-hidden>↗</span>
                    </a>
                  ) : (
                    "Sistema interno del cliente"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Derecha: la ficha, la señal y los botones. */}
          <aside className="em-lado" aria-label={`Ficha de ${e.name}`}>
            <div className="em-panel">
              <p className="em-panel__cabeza">
                <span>Ficha</span>
                <span>{e.codigo}</span>
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={e.id}
                  className="em-panel__texto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {e.body}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="em-panel em-panel--senal">
              <p className="em-panel__cabeza">
                <span>Señal</span>
                <i className="em-panel__punto" aria-hidden />
              </p>
              <div className="em-pulso" aria-hidden>
                <span className="em-pulso__aro" />
                <span className="em-pulso__aro em-pulso__aro--2" />
                <span className="em-pulso__barrido" />
                <span className="em-pulso__nucleo">
                  <Pixel figura={senal.figura} className="em-pulso__icono" />
                  <b>{senal.palabra}</b>
                </span>
              </div>
              <ul className="em-chips">
                {[e.kindLabel, rubro, ...lugar].map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="em-vivo">
                <i aria-hidden /> En el aire
              </p>
            </div>

            <div className="em-acciones">
              {e.href ? (
                <a href={e.href} target="_blank" rel="noopener noreferrer" className="em-boton">
                  {e.linkLabel ?? "Visitar sitio"} <span aria-hidden>↗</span>
                </a>
              ) : null}
              <Link href="/planes#agendar" className="em-boton em-boton--lleno">
                Agendar reunión <span aria-hidden>→</span>
              </Link>
              <a
                href={wa(`Hola, vi el trabajo de ${e.name} (${e.kindLabel.toLowerCase()}) y quiero uno así para mi negocio.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="em-quiero"
              >
                Quiero uno así, por WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
