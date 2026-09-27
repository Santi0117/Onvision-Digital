"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { digitalMeeting } from "@/lib/digital";
import { webOutro } from "@/lib/web";
import Particulas from "./Particulas";
import { Flecha, Mono } from "./ui";
import { empresas } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

/** De la pregunta frecuente "¿Cuánto tarda desde que pago?". */
const TIEMPO = "El tiempo promedio es de una semana";

/** Lo que traen los seis planes, sin excepción (ver /digital#planes). */
const BASE = [
  { corto: "Onvi IA", nombre: "Onvi IA", frase: "Atiende 24/7 en español y te pasa los leads." },
  { corto: "Panel Onvi", nombre: "Panel Onvi", frase: "Reservas, registros y soporte en un solo lugar." },
  { corto: "A tu marca", nombre: "A tu marca", frase: "Diseño a medida, pensado primero para el celular." },
  { corto: "Hosting", nombre: "Hosting y publicación", frase: "Lo publicamos y lo mantenemos en línea." },
  { corto: "Soporte", nombre: "Soporte", frase: "Ajustes y soporte incluidos en la mensualidad." },
];

/** Las cuatro líneas: lo que nos pedís. */
const PROYECTO = ["Web", "Tienda", "Software", "App"];

/** Tu giro: el rubro de cada empresa que ya corre sobre esta base, en corto. */
const CORTO_GIRO: Record<string, string> = {
  "Estudio musical": "Música",
  "Gestión clínica": "Clínicas",
  "Distribución láctea": "Distribución",
  "Servicios legales": "Legal",
  "Tienda de jerseys": "Deportes",
  "Clínica dental": "Dental",
  "Venta de vehículos": "Autos",
};
const RUBROS = [...new Set(empresas.map((e) => e.sector.split(" · ")[0]!))].map((s) => CORTO_GIRO[s] ?? s);

/** Largos y cortos intercalados: en el escritorio no quedan dos píldoras largas juntas. */
function intercalar(lista: string[]) {
  const porLargo = [...lista].sort((a, b) => b.length - a.length);
  const largos = porLargo.slice(0, Math.floor(lista.length * 0.4));
  const cortos = porLargo.slice(largos.length);
  return lista.map((_, i) => ((i % 5 === 1 || i % 5 === 3) && largos.length ? largos.shift()! : cortos.shift() ?? largos.shift()!));
}
const GIROS = intercalar(RUBROS);
const DOMINIO = "tudominio.com";

/** Los tres pasos de "Cómo funciona"; cada uno enciende su parte del diagrama. */
const PASOS = [
  {
    step: "01",
    palabra: "Contá",
    titulo: "Nos contás el negocio",
    desc: digitalMeeting.lead,
    consola: "agenda.reservar({ servicio: 'Sitio web' })",
  },
  {
    step: "02",
    palabra: "Elegí",
    titulo: "Elegimos las piezas",
    desc: "Sobre la base común sumamos las piezas de tu giro. Elegí la línea y mirá qué incluye.",
    consola: "piezas.elegir(['portada', 'agenda', 'onvi'])",
  },
  {
    step: "03",
    palabra: "Publicá",
    titulo: "Publicado en días",
    desc: `${TIEMPO}: la idea es entregar de forma eficiente, sin bajarle a la calidad.`,
    consola: "sitio.publicar('tudominio.com') // en días",
  },
];

/* ── El recorrido: qué se enciende en cada punto del scroll ─────────────── */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Cuántos de `n` se encendieron entre `desde` y `hasta` (0..n). */
function encendidos(p: number, desde: number, hasta: number, n: number) {
  if (p < desde) return 0;
  return clamp(Math.floor(((p - desde) / (hasta - desde)) * n) + 1, 0, n);
}

function recorrido(p: number) {
  const proyecto = encendidos(p, 0.03, 0.17, PROYECTO.length);
  const base = encendidos(p, 0.3, 0.48, BASE.length);
  const giro = encendidos(p, 0.52, 0.74, GIROS.length);
  const publicado = p >= 0.8;
  const paso = p < 0.28 ? 0 : p < 0.78 ? 1 : 2;
  const etapa = publicado
    ? { nombre: "Publicado", frase: `En ${DOMINIO}, con Onvi incluida.` }
    : giro > 0
      ? { nombre: "Tu giro", frase: "Encima, las piezas de tu negocio." }
      : base > 0
        ? BASE[base - 1]!
        : { nombre: "Tu proyecto", frase: "Sitio, tienda, software o app." };
  return { proyecto, base, giro, publicado, paso, etapa };
}

type Estado = ReturnType<typeof recorrido>;

/* ── El diagrama de píldoras (jeffmilanes) ──────────────────────────────── */

type Nodo = { texto: string; x: number; y: number };
type Punto = { x: number; y: number };

/** Dónde va cada píldora, en un sistema 0–100 que se estira a la caja. */
type Plano = {
  proyecto: Nodo[];
  base: Nodo[];
  giro: Nodo[];
  dominio: Nodo;
  filas: { texto: string; y: number }[];
  centroProyecto: Punto;
  centroBase: Punto;
};

const ubicar = (textos: readonly string[], pos: Punto[]): Nodo[] => textos.map((texto, k) => ({ texto, ...pos[k]! }));

/** Escritorio: nombres de fila a la izquierda, los giros en dos renglones de cinco. */
const ANCHO: Plano = {
  proyecto: ubicar(PROYECTO, [34, 51, 68, 85].map((x) => ({ x, y: 8 }))),
  base: ubicar(
    BASE.map((b) => b.corto),
    [
      { x: 34, y: 27 },
      { x: 60, y: 27 },
      { x: 86, y: 27 },
      { x: 47, y: 38 },
      { x: 73, y: 38 },
    ],
  ),
  giro: ubicar(
    GIROS,
    GIROS.map((_, k) => ({ x: [20, 37.5, 55, 72.5, 90][k % 5]!, y: k < 5 ? 58 : 69 })),
  ),
  dominio: { texto: DOMINIO, x: 47, y: 91 },
  filas: [
    { texto: "Tu proyecto", y: 8 },
    { texto: "Base común", y: 32.5 },
    { texto: "Tu giro", y: 63.5 },
    { texto: "Publicado", y: 91 },
  ],
  centroProyecto: { x: 60, y: 17 },
  centroBase: { x: 60, y: 48 },
};

/** Celular: los nombres van arriba de cada grupo; los giros largos, de a dos por renglón. */
const LUGARES_GIRO: Punto[] = [
  { x: 19, y: 59 },
  { x: 50, y: 59 },
  { x: 81, y: 59 },
  { x: 19, y: 66.5 },
  { x: 50, y: 66.5 },
  { x: 81, y: 66.5 },
  { x: 30, y: 74 },
  { x: 70, y: 74 },
  { x: 30, y: 81.5 },
  { x: 70, y: 81.5 },
];
const POR_LARGO = GIROS.map((t, k) => ({ t, k }))
  .sort((a, b) => a.t.length - b.t.length)
  .map((g) => g.k);

const ANGOSTO: Plano = {
  proyecto: ubicar(PROYECTO, [12, 37, 63, 88].map((x) => ({ x, y: 8.5 }))),
  base: ubicar(
    BASE.map((b) => b.corto),
    [
      { x: 28, y: 26 },
      { x: 72, y: 26 },
      { x: 17, y: 34 },
      { x: 50, y: 34 },
      { x: 83, y: 34 },
    ],
  ),
  giro: GIROS.map((texto, k) => ({ texto, ...LUGARES_GIRO[POR_LARGO.indexOf(k)]! })),
  dominio: { texto: DOMINIO, x: 50, y: 95 },
  filas: [
    { texto: "Tu proyecto", y: 0.5 },
    { texto: "Base común", y: 19.5 },
    { texto: "Tu giro", y: 52.5 },
    { texto: "Publicado", y: 88.5 },
  ],
  centroProyecto: { x: 50, y: 16 },
  centroBase: { x: 50, y: 44 },
};

/** Una curva vertical suave entre dos puntos, en el sistema 0–100. */
function curva(a: Punto, b: Punto) {
  const dy = (b.y - a.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
}

/** Cifras al fondo, como la lluvia de números de jeffmilanes. Fija, para que servidor y navegador coincidan. */
const MATRIZ = (() => {
  let s = 7;
  const azar = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return Array.from({ length: 26 }, () => Array.from({ length: 34 }, () => Math.floor(azar() * 10)).join(" ")).join(
    "\n",
  );
})();

function Pildora({ n, on, activa }: { n: Nodo; on: boolean; activa?: boolean }) {
  return (
    <span
      className="oh-dia__nodo"
      data-on={on ? "true" : "false"}
      data-activa={activa ? "true" : "false"}
      style={{ left: `${n.x}%`, top: `${n.y}%` }}
    >
      <i aria-hidden />
      {n.texto}
    </span>
  );
}

/** Hosting publica: de su píldora baja la línea a tu dominio. */
const HOSTING = 3;

function Diagrama({ plano, e, className }: { plano: Plano; e: Estado; className: string }) {
  const { proyecto, base, giro, dominio, filas, centroProyecto, centroBase } = plano;
  const hayProyecto = e.proyecto > 0;
  return (
    <div className={`oh-dia ${className}`} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="oh-dia__lineas">
        {proyecto.map((n, k) => (
          <path key={n.texto} d={curva(n, centroProyecto)} data-on={e.proyecto > k ? "true" : "false"} />
        ))}
        {base.map((n, k) => (
          <path key={n.texto} d={curva(centroProyecto, n)} data-on={e.base > k ? "true" : "false"} />
        ))}
        {base.map((n, k) => (
          <path key={`${n.texto}-b`} d={curva(n, centroBase)} data-on={e.base > k ? "true" : "false"} />
        ))}
        {giro.map((n, k) => (
          <path key={n.texto} d={curva(centroBase, n)} data-on={e.giro > k ? "true" : "false"} />
        ))}
        <path d={curva(base[HOSTING]!, dominio)} className="oh-dia__lateral" data-on={e.publicado ? "true" : "false"} />
      </svg>

      {filas.map((f) => (
        <span key={f.texto} className="oh-dia__fila" style={{ top: `${f.y}%` }}>
          {f.texto}
        </span>
      ))}
      {proyecto.map((n, k) => (
        <Pildora key={n.texto} n={n} on={e.proyecto > k} activa={e.paso === 0 && hayProyecto && e.base === 0 && k === e.proyecto - 1} />
      ))}
      {base.map((n, k) => (
        <Pildora key={n.texto} n={n} on={e.base > k} activa={e.giro === 0 && k === e.base - 1} />
      ))}
      {giro.map((n, k) => (
        <Pildora key={n.texto} n={n} on={e.giro > k} activa={!e.publicado && k === e.giro - 1} />
      ))}
      <Pildora n={dominio} on={e.publicado} activa={e.publicado} />
    </div>
  );
}

/**
 * Base común + cómo funciona: "The journey" de jeffmilanes con los dibujos
 * de puntos de "At the machine". Escena fija en oscuro: a la izquierda el
 * contador de rubros, el dibujo de puntos de cada paso (contá, elegí,
 * publicá) y la consola; a la derecha el diagrama que se enciende — tu
 * proyecto, la base común de los seis planes, tu giro y tu dominio.
 */
export default function BaseComun() {
  const pista = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const q = Math.round(v * 200) / 200;
    setP((prev) => (prev === q ? prev : q));
  });

  const e = recorrido(p);
  const paso = PASOS[e.paso]!;

  return (
    <section id="base-comun" className="oh-bc" data-tema="oscuro" aria-labelledby="oh-bc-titulo">
      <div className="oh-bc__intro-movil">
        <p className="oh-indice">(04) Base común</p>
        <h2 className="oh-bc__h2">Una base común. Piezas según tu giro.</h2>
      </div>

      <div ref={pista} className="oh-bc__pista">
        <div className="oh-bc__stage">
          <pre className="oh-bc__matriz" aria-hidden>
            {MATRIZ}
          </pre>

          <div className="oh-bc__izq">
            <div className="oh-bc__intro">
              <p className="oh-indice">(04) Base común · Cómo funciona</p>
              <h2 id="oh-bc-titulo" className="oh-bc__h2">
                Una base común. Piezas según tu giro.
              </h2>
            </div>

            <div className="oh-bc__cifra">
              <div>
                <p className="oh-bc__num" aria-hidden>
                  {e.giro}
                </p>
                <Mono className="oh-bc__unidad">Rubros sobre la misma base</Mono>
              </div>
              <Particulas forma={e.paso} className="oh-bc__puntos" />
            </div>

            <div className="oh-bc__etapa" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={e.etapa.nombre}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p className="oh-bc__nombre">
                    <span aria-hidden>◇</span> {e.etapa.nombre}
                  </p>
                  <p className="oh-bc__frase">{e.etapa.frase}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <ol className="oh-bc__pasos">
              {PASOS.map((s, k) => (
                <li key={s.step} data-on={k === e.paso ? "true" : k < e.paso ? "hecho" : "false"}>
                  <span className="oh-bc__paso-num">{s.step}</span>
                  {s.palabra}
                </li>
              ))}
            </ol>

            <div className="oh-bc__detalle">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={paso.step}
                  className="oh-bc__desc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <b>{paso.titulo}.</b> {paso.desc}
                </motion.p>
              </AnimatePresence>
              <ul className="oh-bc__consola" aria-hidden>
                {PASOS.slice(0, e.paso + 1).map((s, k) => (
                  <li key={s.step} data-nueva={k === e.paso ? "true" : "false"}>
                    <span>›</span> {s.consola}
                  </li>
                ))}
              </ul>
            </div>

            <div className="oh-bc__ctas">
              <Link href={webOutro.primaryCta.href} className="oh-pill oh-pill--blanca oh-pill--chica">
                {webOutro.primaryCta.label}
                <span className="oh-pill__circ">
                  <Flecha dir="diagonal" />
                </span>
              </Link>
              <a href="#precios" className="oh-show__detalle">
                {webOutro.secondaryCta.label}
                <Flecha className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <Diagrama plano={ANCHO} e={e} className="oh-dia--ancho" />
          <Diagrama plano={ANGOSTO} e={e} className="oh-dia--angosto" />
        </div>
      </div>
    </section>
  );
}
