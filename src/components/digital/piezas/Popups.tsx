"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { Ojo } from "../../od/ui";
import type { IdPieza } from "./datos";

/**
 * Los pop-ups de cada escena, alrededor de la tarjeta activa: notas pegadas
 * y flechas a mano en el cuaderno, ventanas de píxeles con Onvi, piezas de
 * interfaz en el software, avisos y widgets de iPhone en las apps, los datos
 * del panel en vidrio oscuro y la marca conectada con Google e Instagram.
 * Son decorado: el contenido real está en el texto de la escena.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;
const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Un número que sube hasta su valor cuando aparece. */
export function Cuenta({ hasta, antes = "", despues = "", dur = 1100, retraso = 0 }: {
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

/** Dibujo de píxeles: "X" tinta, "." vacío. */
function Bitmap({ filas, className, tinta }: { filas: readonly string[]; className?: string; tinta: string }) {
  const ancho = filas[0]?.length ?? 0;
  return (
    <svg viewBox={`0 0 ${ancho} ${filas.length}`} className={className} shapeRendering="crispEdges" aria-hidden>
      {filas.flatMap((fila, y) =>
        fila.split("").map((c, x) =>
          c === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={tinta} />
          ),
        ),
      )}
    </svg>
  );
}

const CORAZON = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."] as const;
const CHISPA = ["..X..", "..X..", "XXXXX", "..X..", "..X.."] as const;

const Lupa = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="M10.6 10.6 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

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
      <div className="pz-pop pz-nota pz-nota--rosa pz-pop--cel" style={v({ "--d": "290ms", "--z": 22 })}>
        <span className="pz-nota__cinta" />
        <svg viewBox="0 0 24 40" className="pz-nota__cel" aria-hidden>
          <rect x="2.5" y="2.5" width="19" height="35" rx="4" />
          <path d="M9 33.5h6" />
        </svg>
        <b>Se ve perfecta en el celular</b>
      </div>
      <div className="pz-pop pz-sello pz-pop--sello" style={v({ "--d": "840ms", "--z": 14 })}>
        <b>Aprobado</b>
        <span>listo para publicar</span>
      </div>
    </>
  );
}

/* ── 02 Onvi: la ventana de píxeles y el cliente nuevo, en cian ───────── */

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
      <div className="pz-pop pz-px pz-px-lead pz-pop--lead" style={v({ "--d": "720ms", "--z": 24 })}>
        <Bitmap filas={CORAZON} tinta="#06080b" className="pz-px-lead__icono" />
        <b>+1 CLIENTE NUEVO</b>
      </div>
      {(["a", "b", "c"] as const).map((k, i) => (
        <span key={k} className={`pz-pop pz-pop--chispa-${k}`} style={v({ "--d": `${240 + i * 210}ms`, "--z": 30 })}>
          <Bitmap filas={CHISPA} tinta="#34d3ee" className="pz-px-chispa" />
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

/* ── 04 Apps: avisos, widgets y la isla del iPhone, en vidrio ───────── */

const Gota = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M8 1.8C8 1.8 3.4 7 3.4 10a4.6 4.6 0 0 0 9.2 0C12.6 7 8 1.8 8 1.8z" fill="currentColor" />
  </svg>
);

function Apps() {
  return (
    <>
      <div className="pz-pop pz-ios pz-ios--isla pz-pop--isla" style={v({ "--d": "120ms", "--z": 22 })}>
        <span className="pz-ios__gota">
          <Gota />
        </span>
        <span className="pz-ios__isla-txt">
          <b>Hidratación</b>
          <small>
            <Cuenta hasta={1500} retraso={700} dur={1400} despues=" ml" /> de 2 L
          </small>
        </span>
        <svg viewBox="0 0 36 36" className="pz-ios__aro" aria-hidden>
          <circle cx="18" cy="18" r="14" />
          <circle cx="18" cy="18" r="14" pathLength={1} />
        </svg>
      </div>
      <div className="pz-pop pz-ios pz-ios--aviso pz-pop--aviso" style={v({ "--d": "330ms", "--z": 18 })}>
        <span className="pz-ios__icono">
          <Gota />
        </span>
        <span className="pz-ios__cuerpo">
          <span className="pz-ios__cabeza">
            <span>Hidratación</span>
            <small>ahora</small>
          </span>
          <b>Hora de tomar agua 💧</b>
          <span>Te faltan 2 vasos para tu meta de hoy.</span>
        </span>
      </div>
      <div className="pz-pop pz-ios pz-ios--widget pz-pop--anillo" style={v({ "--d": "540ms", "--z": 26 })}>
        <svg viewBox="0 0 64 64" className="pz-ios__anillo" aria-hidden>
          <circle cx="32" cy="32" r="26" />
          <circle cx="32" cy="32" r="26" pathLength={1} />
        </svg>
        <b className="pz-ios__vasos">
          <Cuenta hasta={6} retraso={900} dur={1000} />
          <small>de 8</small>
        </b>
        <span className="pz-ios__meta">Vasos hoy · 2 L</span>
      </div>
      <div className="pz-pop pz-ios pz-ios--fila pz-pop--familia" style={v({ "--d": "760ms", "--z": 14 })}>
        <span>Notificar a mi familia</span>
        <i className="pz-ios__switch" />
      </div>
      <div className="pz-pop pz-tiendas pz-pop--tiendas" style={v({ "--d": "940ms", "--z": 20 })}>
        <span className="pz-tienda">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path
              d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6C4.4 4.8 3.3 5.5 2.7 6.6c-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.2-.5 2.2-.5s1.3.5 2.2.5c.9 0 1.5-.8 2-1.7.7-1 .9-1.9.9-2-.1 0-1.8-.7-1.8-3zM9.6 3.6c.5-.6.8-1.4.7-2.2-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2.1.8.1 1.5-.4 2-1z"
              fill="currentColor"
            />
          </svg>
          <span>
            <small>Descargalo en</small>
            App Store
          </span>
        </span>
        <span className="pz-tienda">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M2.6 1.6 9.4 8l-6.8 6.4c-.3-.2-.5-.5-.5-.9V2.5c0-.4.2-.7.5-.9z" fill="#34d3ee" />
            <path d="M11.6 5.9 9.4 8l2.2 2.1 2.6-1.5c.6-.4.6-1.2 0-1.6z" fill="#fbbf24" />
            <path d="M2.6 1.6c.2-.1.6-.1.9 0l8.1 4.3L9.4 8z" fill="#4ade80" />
            <path d="M9.4 8l2.2 2.1-8.1 4.3c-.3.2-.6.2-.9 0z" fill="#f87171" />
          </svg>
          <span>
            <small>Disponible en</small>
            Google Play
          </span>
        </span>
      </div>
    </>
  );
}

/* ── 05 Panel Onvi: los datos del panel, en vidrio oscuro ────────────── */

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path d="M4 8.4l2.6 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const MONITOR = [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

function Panel() {
  return (
    <>
      <div className="pz-pop pz-pn pz-pn--toast pz-pop--preserva" style={v({ "--d": "120ms", "--z": 20 })}>
        <span className="pz-pn__vivo" />
        <span>
          <b>Nueva reserva</b> Tatiana Mora · 11:15 a. m.
        </span>
      </div>
      <div className="pz-pop pz-pn pz-pop--pcita" style={v({ "--d": "300ms", "--z": 24 })}>
        <span className="pz-pn__icono pz-pn__icono--ok">
          <Check />
        </span>
        <span className="pz-pn__txt">
          <b>Karla Cordero</b>
          <small>Atendida · 8:45 a. m.</small>
        </span>
      </div>
      <div className="pz-pop pz-pn pz-pop--pconfirmar" style={v({ "--d": "480ms", "--z": 16 })}>
        <span className="pz-pn__icono">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M2 11.5 6 7.5l2.6 2.6L14 4.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="pz-pn__txt">
          <b>
            <Cuenta hasta={7} retraso={800} dur={900} /> por confirmar
          </b>
          <small>Próximos 30 días</small>
        </span>
      </div>
      <div className="pz-pop pz-pn pz-pn--monitor pz-pop--pmonitor" style={v({ "--d": "660ms", "--z": 12 })}>
        <span className="pz-pn__cabeza">
          <span className="pz-pn__vivo pz-pn__vivo--ok" />
          <b>Todo en línea</b>
          <em>99,91 %</em>
        </span>
        <span className="pz-pn__barras">
          {MONITOR.map((ok, i) => (
            <i key={i} data-ok={ok ? "1" : "0"} style={v({ "--i": i })} />
          ))}
        </span>
        <small>Revisado cada 10 minutos</small>
      </div>
      <div className="pz-pop pz-pn pz-pn--wa pz-pop--pwa" style={v({ "--d": "860ms", "--z": 28 })}>
        <span className="pz-pn__icono pz-pn__icono--wa">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path
              d="M8 1.6a6.3 6.3 0 0 0-5.4 9.5L1.7 14.4l3.4-.9A6.3 6.3 0 1 0 8 1.6Zm3.2 8.9c-.1.4-.8.8-1.1.8-.3 0-.6.2-2.1-.4a7 7 0 0 1-2.8-2.5c-.3-.4-.7-1-.7-1.7s.4-1.1.5-1.3c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .4.3l.6 1.4c0 .1 0 .2 0 .3l-.3.4c-.1.1-.2.3-.1.4.2.3.6.9 1.2 1.4.7.6 1.3.8 1.5.9.2.1.3 0 .4-.1l.5-.6c.1-.2.3-.2.4-.1l1.3.6c.2.1.3.2.3.2.1.1.1.5-.1.9Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <b>Escribir por WhatsApp</b>
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
          <span className="pz-g__desc">Páginas web, tiendas y software a medida en Latinoamérica.</span>
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

const ESCENAS: Record<IdPieza, () => React.JSX.Element> = {
  web: Papel,
  onvi: Pixeles,
  software: Software,
  apps: Apps,
  panel: Panel,
  marca: Marca,
};

export default function Popups({ escena, saliendo }: { escena: IdPieza; saliendo: boolean }) {
  const Escena = ESCENAS[escena];
  return (
    <div className="pz-pops" data-escena={escena} data-sale={saliendo || undefined} aria-hidden>
      <Escena />
    </div>
  );
}
