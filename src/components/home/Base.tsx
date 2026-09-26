"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { webCore, webModules } from "@/lib/web";
import { Mono } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL = webModules.length;

/** "chatbot onvi" → "Chatbot Onvi", "seo y velocidad" → "SEO y velocidad". */
const nombre = (t: string) =>
  t
    .replace("seo", "SEO")
    .replace("onvi", "Onvi")
    .replace(/^\p{L}/u, (c) => c.toUpperCase());

/** Antes de la primera pieza: tu marca. Después, cada pieza de /web con su detalle. */
const INICIO = { nombre: "Tu marca", frase: webCore.lead };
const ETAPAS = webModules.map((m) => ({ nombre: nombre(m.label), frase: m.detail }));

/** Nombres cortos para las píldoras del diagrama. */
const CORTO: Record<string, string> = {
  pantalla: "Tu sitio",
  portada: "Portada",
  agenda: "Agenda",
  contacto: "Contacto",
  animaciones: "Animaciones",
  chatbot: "Chatbot Onvi",
  tienda: "Tienda",
  seo: "SEO",
  base: "Hosting",
};

const CUERPO =
  "Cada pieza se arma a tu marca y llega conectada a tu panel Onvi: lo que reservan, escriben o compran tus clientes aparece ahí.";

type Nodo = { id: string; texto: string; x: number; y: number };
type Punto = { x: number; y: number };

/** Dónde va cada píldora, en un sistema 0–100 que se estira a la caja. */
type Plano = {
  cliente: Nodo[];
  piezas: Nodo[];
  panel: Nodo[];
  dominio: Nodo;
  filas: { texto: string; y: number }[];
  centroCliente: Punto;
  centroSitio: Punto;
};

function nodos(ids: string[], textos: string[], pos: Punto[]): Nodo[] {
  return textos.map((texto, k) => ({ id: ids[k]!, texto, ...pos[k]! }));
}

const ID_CLIENTE = ["web", "cel", "wa"];
const TEXTO_CLIENTE = ["Web", "Celular", "WhatsApp"];
const ID_PIEZAS = webModules.map((m) => m.id);
const TEXTO_PIEZAS = webModules.map((m) => CORTO[m.id] ?? nombre(m.label));
const ID_PANEL = ["reservas", "registros", "soporte"];
const TEXTO_PANEL = ["Reservas", "Registros", "Soporte"];
const DOMINIO = "tudominio.com";

/** Escritorio: filas a la izquierda y las nueve piezas en tres renglones. */
const ANCHO: Plano = {
  cliente: nodos(ID_CLIENTE, TEXTO_CLIENTE, [
    { x: 38, y: 8 },
    { x: 60, y: 8 },
    { x: 82, y: 8 },
  ]),
  piezas: nodos(
    ID_PIEZAS,
    TEXTO_PIEZAS,
    ID_PIEZAS.map((_, k) => ({ x: [38, 60, 82][k % 3]!, y: [28, 37, 46][Math.floor(k / 3)]! })),
  ),
  panel: nodos(ID_PANEL, TEXTO_PANEL, [
    { x: 38, y: 70 },
    { x: 60, y: 70 },
    { x: 82, y: 70 },
  ]),
  dominio: { id: "dom", texto: DOMINIO, x: 60, y: 91 },
  filas: [
    { texto: "Tu cliente", y: 8 },
    { texto: "Tu sitio", y: 37 },
    { texto: "Panel Onvi", y: 70 },
    { texto: "Dominio", y: 91 },
  ],
  centroCliente: { x: 60, y: 18 },
  centroSitio: { x: 60, y: 57 },
};

/** Celular: los nombres de fila van arriba de cada grupo y las piezas en tres renglones. */
const ANGOSTO: Plano = {
  cliente: nodos(ID_CLIENTE, TEXTO_CLIENTE, [
    { x: 20, y: 7 },
    { x: 50, y: 7 },
    { x: 80, y: 7 },
  ]),
  piezas: nodos(
    ID_PIEZAS,
    TEXTO_PIEZAS,
    ID_PIEZAS.map((_, k) => ({ x: [19, 50, 81][k % 3]!, y: [26, 34.5, 43][Math.floor(k / 3)]! })),
  ),
  panel: nodos(ID_PANEL, TEXTO_PANEL, [
    { x: 19, y: 75 },
    { x: 50, y: 75 },
    { x: 81, y: 75 },
  ]),
  dominio: { id: "dom", texto: DOMINIO, x: 50, y: 95 },
  filas: [
    { texto: "Tu cliente", y: 0.5 },
    { texto: "Tu sitio", y: 18.5 },
    { texto: "Panel Onvi", y: 67.5 },
    { texto: "Dominio", y: 88.5 },
  ],
  centroCliente: { x: 50, y: 15 },
  centroSitio: { x: 50, y: 55 },
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

type Estado = {
  clienteOn: boolean;
  piezaOn: (k: number) => boolean;
  panelOn: (k: number) => boolean;
  cuenta: number;
};

/** Qué pieza enciende cada ventana del panel: agenda → reservas, contacto → registros, Onvi → soporte. */
const PANEL_DESDE = [3, 4, 6];

/** El diagrama con sus curvas; el mismo dibujo con dos planos (escritorio y celular). */
function Diagrama({ plano, estado, className }: { plano: Plano; estado: Estado; className: string }) {
  const { cliente, piezas, panel, dominio, filas, centroCliente, centroSitio } = plano;
  const { clienteOn, piezaOn, panelOn, cuenta } = estado;
  const ultima = piezas[piezas.length - 1]!;
  return (
    <div className={`oh-dia ${className}`} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="oh-dia__lineas">
        {cliente.map((n) => (
          <path key={n.id} d={curva(n, centroCliente)} data-on={clienteOn ? "true" : "false"} />
        ))}
        {piezas.map((n, k) => (
          <path key={n.id} d={curva(centroCliente, n)} data-on={piezaOn(k) ? "true" : "false"} />
        ))}
        {piezas.map((n, k) => (
          <path key={`${n.id}-b`} d={curva(n, centroSitio)} data-on={piezaOn(k) ? "true" : "false"} />
        ))}
        {panel.map((n, k) => (
          <path key={n.id} d={curva(centroSitio, n)} data-on={panelOn(k) ? "true" : "false"} />
        ))}
        <path
          d={curva(ultima, dominio)}
          className="oh-dia__lateral"
          data-on={piezaOn(piezas.length - 1) ? "true" : "false"}
        />
      </svg>

      {filas.map((f) => (
        <span key={f.texto} className="oh-dia__fila" style={{ top: `${f.y}%` }}>
          {f.texto}
        </span>
      ))}
      {cliente.map((n) => (
        <Pildora key={n.id} n={n} on={clienteOn} />
      ))}
      {piezas.map((n, k) => (
        <Pildora key={n.id} n={n} on={piezaOn(k)} activa={cuenta === k + 1} />
      ))}
      {panel.map((n, k) => (
        <Pildora key={n.id} n={n} on={panelOn(k)} />
      ))}
      <Pildora n={dominio} on={piezaOn(piezas.length - 1)} />
    </div>
  );
}

/**
 * "Un sitio completo, pieza por pieza" como "The journey" de jeffmilanes:
 * escena fija en negro, un contador gigante que sube a 9 piezas mientras
 * el diagrama se enciende — tu cliente, cada pieza, el panel Onvi y tu
 * dominio.
 */
export default function Base() {
  const pista = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const q = Math.round(v * 200) / 200;
    setP((prev) => (prev === q ? prev : q));
  });

  const cuenta = Math.min(TOTAL, Math.floor(Math.max(0, p - 0.06) * 10.6));
  const clienteOn = p > 0.02;
  const piezaOn = (k: number) => cuenta > k;
  const panelOn = (k: number) => cuenta >= (PANEL_DESDE[k] ?? TOTAL);
  const e = cuenta === 0 ? INICIO : ETAPAS[cuenta - 1]!;
  const estado: Estado = { clienteOn, piezaOn, panelOn, cuenta };
  const titulo = webCore.title.join(" ");

  return (
    <section id="nucleo" className="oh-base" aria-labelledby="oh-base-titulo">
      <div className="oh-base__intro-movil">
        <Mono>Tu sitio, pieza por pieza</Mono>
        <h2 className="oh-base__h2">{titulo}</h2>
      </div>

      <div ref={pista} className="oh-base__pista">
        <div className="oh-base__stage">
          <pre className="oh-base__matriz" aria-hidden>
            {MATRIZ}
          </pre>

          <div className="oh-base__izq">
            <div className="oh-base__intro">
              <Mono>Tu sitio, pieza por pieza</Mono>
              <h2 id="oh-base-titulo" className="oh-base__h2">
                {titulo}
              </h2>
            </div>
            <p className="oh-base__num" aria-hidden>
              {cuenta}
            </p>
            <Mono className="oh-base__unidad">Piezas listas para tu marca</Mono>
            <div className="oh-base__etapa">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={e.nombre}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p className="oh-base__nombre">
                    <span aria-hidden>◇</span> {e.nombre}
                  </p>
                  <p className="oh-base__frase">{e.frase}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="oh-base__cuerpo">{CUERPO}</p>
          </div>

          <Diagrama plano={ANCHO} estado={estado} className="oh-dia--ancho" />
          <Diagrama plano={ANGOSTO} estado={estado} className="oh-dia--angosto" />
        </div>
      </div>

      <p className="oh-base__cuerpo-movil">{CUERPO}</p>
    </section>
  );
}
