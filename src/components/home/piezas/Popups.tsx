"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { Ojo } from "../../od/ui";
import type { IdEscena } from "./datos";

/**
 * Los pop-ups de cada escena, alrededor de la tarjeta activa: notas pegadas
 * y flechas a mano en el cuaderno, ventanas de píxeles con Onvi, piezas de
 * interfaz en el software, controles elegantes en los componentes y la marca
 * conectada con Google e Instagram. Son decorado: el contenido real está en
 * el texto de la escena.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Un número que sube hasta su valor cuando aparece. */
function Cuenta({ hasta, antes = "", despues = "", dur = 1100, retraso = 0 }: {
  hasta: number;
  antes?: string;
  despues?: string;
  dur?: number;
  retraso?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now() + retraso;
    const paso = (ahora: number) => {
      const t = Math.min(1, Math.max(0, (ahora - t0) / dur));
      el.textContent = `${antes}${miles(hasta * (1 - (1 - t) ** 3))}${despues}`;
      if (t < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [hasta, antes, despues, dur, retraso]);
  return (
    <span ref={ref}>
      {antes}
      {miles(hasta)}
      {despues}
    </span>
  );
}

/** Dibujo de píxeles: "X" tinta, "O" relleno, "." vacío. */
function Bitmap({ filas, className, tinta, relleno }: {
  filas: readonly string[];
  className?: string;
  tinta: string;
  relleno?: string;
}) {
  const ancho = filas[0]?.length ?? 0;
  return (
    <svg viewBox={`0 0 ${ancho} ${filas.length}`} className={className} shapeRendering="crispEdges" aria-hidden>
      {filas.flatMap((fila, y) =>
        fila.split("").map((c, x) =>
          c === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={c === "O" ? relleno : tinta} />
          ),
        ),
      )}
    </svg>
  );
}

const CURSOR = [
  "X...........",
  "XX..........",
  "XOX.........",
  "XOOX........",
  "XOOOX.......",
  "XOOOOX......",
  "XOOOOOX.....",
  "XOOOOOOX....",
  "XOOOOOOOX...",
  "XOOOOOOOOX..",
  "XOOOOOOOOOX.",
  "XOOOOOOXXXXX",
  "XOOOXOOX....",
  "XOOXXOOX....",
  "XOX..XOOX...",
  "XX...XOOX...",
  "X.....XOOX..",
  "......XOOX..",
  ".......XX...",
] as const;

const CORAZON = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."] as const;
const CHISPA = ["..X..", "..X..", "XXXXX", "..X..", "..X.."] as const;

const Lupa = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M10.6 10.6 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* ── Portada: el cielo de noche con las cinco ─────────────────────────── */

function Intro() {
  return (
    <div className="pz-pop pz-pop--trabajo" style={v({ "--d": "880ms", "--z": 10 })}>
      <span>nuestro trabajo</span>
      <svg viewBox="0 0 120 70" className="pz-trazo" aria-hidden>
        <path d="M8 8 C 44 2, 86 14, 100 52" pathLength={1} />
        <path d="M86 44 L101 56 L108 38" pathLength={1} />
      </svg>
    </div>
  );
}

/* ── 01 Páginas web: cuaderno, notas pegadas y lapicero rojo ──────────── */

function Papel() {
  return (
    <>
      <span className="pz-pop pz-cinta pz-pop--cinta" style={v({ "--d": "50ms", "--z": 4 })} />
      <div className="pz-pop pz-nota pz-pop--dominio" style={v({ "--d": "130ms", "--z": 18 })}>
        <span className="pz-nota__cinta" />
        <b>tudominio.com</b>
        <span>con tu correo propio ✓</span>
      </div>
      <svg className="pz-pop pz-trazo pz-pop--circulo" viewBox="0 0 200 100" style={v({ "--d": "420ms", "--z": 6 })} aria-hidden>
        <path
          d="M40 70 C 5 50, 40 12, 100 10 C 160 8, 196 30, 186 56 C 176 84, 110 94, 60 86 C 26 80, 14 60, 36 40 C 56 22, 120 16, 150 24"
          pathLength={1}
        />
      </svg>
      <div className="pz-pop pz-pop--flecha" style={v({ "--d": "610ms", "--z": 12 })}>
        <span className="pz-mano">¡carga en 1 segundo!</span>
        <svg viewBox="0 0 160 200" className="pz-trazo" aria-hidden>
          <path d="M150 14 C 118 12, 84 30, 66 64 C 52 92, 44 128, 40 176" pathLength={1} />
          <path d="M24 160 L40 178 L56 162" pathLength={1} />
        </svg>
      </div>
      <div className="pz-pop pz-nota pz-nota--rosa pz-pop--cel" style={v({ "--d": "290ms", "--z": 22 })}>
        <span className="pz-nota__cinta" />
        <svg viewBox="0 0 24 40" className="pz-nota__cel" aria-hidden>
          <rect x="2.5" y="2.5" width="19" height="35" rx="4" />
          <path d="M9 33.5h6" />
        </svg>
        <b>Se ve perfecta en el cel</b>
      </div>
      <div className="pz-pop pz-sello pz-pop--sello" style={v({ "--d": "840ms", "--z": 14 })}>
        <b>Aprobado</b>
        <span>listo para publicar</span>
      </div>
    </>
  );
}

/* ── 02 Onvi: ventanas, burbujas y cursor de píxeles ──────────────────── */

function Pixeles() {
  return (
    <>
      <div className="pz-pop pz-px pz-px-ventana pz-pop--ventana" style={v({ "--d": "100ms", "--z": 20 })}>
        <div className="pz-px-ventana__barra">
          <span>ONVI.EXE</span>
          <i>_</i>
          <i>×</i>
        </div>
        <div className="pz-px-ventana__cuerpo">
          <p className="pz-px-tipea" style={v({ "--n": 17, "--t": "520ms" })}>
            &gt; ¡HOLA! SOY ONVI
          </p>
          <p className="pz-px-tipea" style={v({ "--n": 18, "--t": "1250ms" })}>
            &gt; ¿EN QUÉ TE AYUDO?
          </p>
          <span className="pz-px-cursor" />
        </div>
      </div>
      <div className="pz-pop pz-px pz-px-burbuja pz-pop--burbuja" style={v({ "--d": "340ms", "--z": 16 })}>
        <b>RESPONDO 24/7</b>
        <span>ES · EN</span>
      </div>
      <div className="pz-pop pz-px pz-px-lead pz-pop--lead" style={v({ "--d": "720ms", "--z": 24 })}>
        <Bitmap filas={CORAZON} tinta="#e8472d" className="pz-px-lead__icono" />
        <b>+1 CLIENTE NUEVO</b>
      </div>
      <div className="pz-pop pz-px-carga pz-pop--carga" style={v({ "--d": "210ms", "--z": 10 })}>
        <span>ESCRIBIENDO</span>
        <span className="pz-px-carga__barra">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={v({ "--i": i })} />
          ))}
        </span>
      </div>
      <div className="pz-pop pz-pop--cursor" style={v({ "--d": "560ms", "--z": 28 })}>
        <Bitmap filas={CURSOR} tinta="#0c0c0c" relleno="#f4ecd8" className="pz-px-flecha" />
      </div>
      {(["a", "b", "c"] as const).map((k, i) => (
        <span key={k} className={`pz-pop pz-pop--chispa-${k}`} style={v({ "--d": `${240 + i * 210}ms`, "--z": 30 })}>
          <Bitmap filas={CHISPA} tinta="#f2b705" className="pz-px-chispa" />
        </span>
      ))}
    </>
  );
}

/* ── 03 Software: interfaz moderna, números vivos ─────────────────────── */

const BARRAS = [38, 52, 44, 68, 60, 84, 100];

function Software() {
  return (
    <>
      <div className="pz-pop pz-ui pz-pop--kpi" style={v({ "--d": "100ms", "--z": 18 })}>
        <span className="pz-ui__label">Ventas del mes</span>
        <b className="pz-ui__kpi">
          <Cuenta antes="+" hasta={312} despues="%" retraso={380} />
        </b>
        <svg viewBox="0 0 120 36" className="pz-ui__linea" preserveAspectRatio="none" aria-hidden>
          <path className="pz-ui__area" d="M0 30 C 12 28, 18 22, 28 24 S 44 30, 54 20 S 72 8, 82 12 S 100 18, 120 4 L120 36 L0 36 Z" />
          <path d="M0 30 C 12 28, 18 22, 28 24 S 44 30, 54 20 S 72 8, 82 12 S 100 18, 120 4" pathLength={1} />
        </svg>
      </div>
      <div className="pz-pop pz-ui pz-ui--oscura pz-pop--barras" style={v({ "--d": "270ms", "--z": 22 })}>
        <span className="pz-ui__label">Pedidos · esta semana</span>
        <span className="pz-ui__barras">
          {BARRAS.map((h, i) => (
            <i key={i} style={v({ "--h": `${h}%`, "--i": i })} />
          ))}
          <em>128</em>
        </span>
        <span className="pz-ui__dias">
          <span>L</span>
          <span>K</span>
          <span>M</span>
          <span>J</span>
          <span>V</span>
          <span>S</span>
          <span>D</span>
        </span>
      </div>
      <div className="pz-pop pz-ui pz-ui--toast pz-pop--toast" style={v({ "--d": "760ms", "--z": 26 })}>
        <span className="pz-ui__ok">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M4 8.5l2.6 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <b>Reporte listo</b>
        <small>hace 1 s</small>
      </div>
      <div className="pz-pop pz-ui pz-ui--vidrio pz-pop--cmdk" style={v({ "--d": "450ms", "--z": 14 })}>
        <span className="pz-ui__buscar">
          <Lupa />
          <span className="pz-ui__tipea">facturas de hoy</span>
          <kbd>⌘K</kbd>
        </span>
        <span className="pz-ui__fila is-on">
          Factura #1043 <em>₡245.000</em>
        </span>
        <span className="pz-ui__fila">
          Clientes nuevos <em>12</em>
        </span>
      </div>
      <div className="pz-pop pz-ui pz-ui--ia pz-pop--ia" style={v({ "--d": "1000ms", "--z": 20 })}>
        <span className="pz-ui__orbe" />
        <span>
          <b>Onvi IA</b> Tus ventas subieron 12% esta semana.
        </span>
      </div>
    </>
  );
}

/* ── 04 Componentes: la calculadora elegante de Jopa ──────────────────── */

function Componentes() {
  return (
    <>
      <div className="pz-pop pz-lujo pz-pop--plazo" style={v({ "--d": "100ms", "--z": 18 })}>
        <span className="pz-lujo__label">Plazo</span>
        <span className="pz-lujo__seg">
          <i className="pz-lujo__pastilla" />
          <span>10 años</span>
          <span>15 años</span>
          <span>20 años</span>
          <span>25 años</span>
        </span>
      </div>
      <div className="pz-pop pz-lujo pz-pop--prima" style={v({ "--d": "300ms", "--z": 14 })}>
        <span className="pz-lujo__label">Prima</span>
        <b className="pz-lujo__monto">₡6.000.000</b>
        <span className="pz-lujo__riel">
          <i />
        </span>
      </div>
      <div className="pz-pop pz-lujo pz-lujo--cuota pz-pop--cuota" style={v({ "--d": "500ms", "--z": 24 })}>
        <span className="pz-lujo__label">Cuota mensual</span>
        <b className="pz-lujo__grande">
          <Cuenta antes="₡" hasta={532837} retraso={900} dur={1300} />
        </b>
        <span className="pz-lujo__nota">BAC · 7,80% · 15 años</span>
      </div>
      <div className="pz-pop pz-lujo pz-lujo--interruptor pz-pop--seguro" style={v({ "--d": "700ms", "--z": 12 })}>
        <span>Incluir seguro</span>
        <i className="pz-lujo__switch" />
      </div>
      <div className="pz-pop pz-lujo-boton pz-pop--agendar" style={v({ "--d": "880ms", "--z": 20 })}>
        Agendar visita <span aria-hidden>→</span>
      </div>
    </>
  );
}

/* ── 05 Tu marca: Google, Instagram y el kit, todo conectado ──────────── */

function Marca() {
  const quieto = useReducedMotion();
  const rutas = [
    "M236 34 C 330 40, 390 70, 430 150",
    "M806 170 C 740 170, 700 200, 660 250",
    "M250 470 C 300 450, 330 430, 360 400",
    "M140 -70 C 360 -200, 720 -170, 905 30",
    "M110 588 C 340 700, 760 690, 940 420",
  ];
  return (
    <>
      <svg className="pz-pop pz-red pz-pop--red" viewBox="0 0 1000 586" preserveAspectRatio="none" style={v({ "--d": "560ms", "--z": 6 })} aria-hidden>
        {rutas.map((d, i) => (
          <g key={d}>
            <path d={d} pathLength={1} style={v({ "--i": i })} />
            {quieto ? null : (
              <circle r="7">
                <animateMotion dur={`${2.6 + i * 0.4}s`} begin={`${1 + i * 0.3}s`} repeatCount="indefinite" path={d} />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <div className="pz-pop pz-g pz-pop--google" style={v({ "--d": "110ms", "--z": 20 })}>
        <p className="pz-g__logo">
          <span>G</span>
          <span>o</span>
          <span>o</span>
          <span>g</span>
          <span>l</span>
          <span>e</span>
        </p>
        <span className="pz-g__buscar">
          <Lupa />
          <span className="pz-g__tipea">onvision digital</span>
        </span>
        <span className="pz-g__res">
          <span className="pz-g__fav">
            <Ojo />
          </span>
          <span className="pz-g__url">onvisiondigital.com</span>
          <b className="pz-g__titulo">Onvision Digital — Sitios y software</b>
          <span className="pz-g__desc">Páginas web, tiendas y software a medida en Costa Rica.</span>
        </span>
        <span className="pz-g__uno">#1</span>
      </div>
      <div className="pz-pop pz-ig pz-pop--instagram" style={v({ "--d": "340ms", "--z": 24 })}>
        <span className="pz-ig__cabeza">
          <span className="pz-ig__avatar">
            <Ojo />
          </span>
          <b>onvision.digital</b>
          <i className="pz-ig__ok" />
        </span>
        <span className="pz-ig__foto">
          <Ojo />
          <span>
            onvision<em>.</em>
          </span>
          <span className="pz-ig__golpe">♥</span>
        </span>
        <span className="pz-ig__pie">
          <svg viewBox="0 0 16 16" className="pz-ig__like" aria-hidden>
            <path d="M8 13.6S2.4 10.3 2.4 6.4A2.9 2.9 0 0 1 8 4.9a2.9 2.9 0 0 1 5.6 1.5C13.6 10.3 8 13.6 8 13.6z" />
          </svg>
          <b>
            <Cuenta hasta={1248} retraso={1300} dur={1200} /> Me gusta
          </b>
        </span>
      </div>
      <div className="pz-pop pz-kit pz-pop--kit" style={v({ "--d": "510ms", "--z": 16 })}>
        <span className="pz-kit__titulo">
          <Ojo />
          Kit de marca
        </span>
        <span className="pz-kit__colores">
          {["#34d3ee", "#0a0d12", "#f3f6f9", "#0e7490"].map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
        <span className="pz-kit__letra">
          <b>Aa</b>
          <span>Archivo · Geist</span>
        </span>
      </div>
      <div className="pz-pop pz-chip pz-pop--conectado" style={v({ "--d": "800ms", "--z": 30 })}>
        <Ojo />
        todo conectado
      </div>
    </>
  );
}

const ESCENAS: Record<IdEscena, () => React.JSX.Element> = {
  intro: Intro,
  web: Papel,
  onvi: Pixeles,
  software: Software,
  componentes: Componentes,
  marca: Marca,
};

export default function Popups({ escena, saliendo }: { escena: IdEscena; saliendo: boolean }) {
  const Escena = ESCENAS[escena];
  return (
    <div className="pz-pops" data-escena={escena} data-sale={saliendo || undefined} aria-hidden>
      <Escena />
    </div>
  );
}
