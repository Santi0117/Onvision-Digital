"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { scrollA } from "../../home/data";
import { celda, pintar, type Pintura } from "./cortina";
import { PIEZAS, type IdPieza } from "./datos";
import { tieneMas } from "./mas";
import { useMasInfo } from "./MasInfo";
import Popups from "./Popups";
import { TextoPieza } from "./Texto";
import "./piezas.css";

type ConLenis = { __odLenis?: { scrollTo: (y: number, o?: object) => void } };

const N = PIEZAS.length;
/** Pantallas de scroll por pieza. */
const TRAMO = 0.85;

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const fmt = (v: number) => Number(v.toFixed(2));

type Lugar = "oculta" | "activa" | "mazo" | "fuera";

/**
 * Dónde va la tarjeta i según la pieza activa. Los desplazamientos son en %
 * del tamaño de la propia tarjeta, así la coreografía es la misma en
 * cualquier pantalla.
 */
function lugarDe(i: number, estado: number, visto: boolean, movil: boolean) {
  if (!visto) {
    const k = i - 2;
    return {
      lugar: "oculta" as Lugar,
      transform: `translate3d(${fmt(k * 9 + 30)}%, ${fmt(-k * 12 + 46)}%, 0) rotate(6deg) scale(0.72)`,
      z: 10 - i,
      opacity: 0,
      niebla: 0,
      retraso: 0,
    };
  }
  if (i === estado) {
    return { lugar: "activa" as Lugar, transform: "translate3d(0, 0, 0) scale(1)", z: 40, opacity: 1, niebla: 0, retraso: 60 };
  }
  if (i > estado) {
    // Atrás, asomando arriba a la derecha como un mazo.
    const j = i - estado;
    const s = 1 - j * 0.07;
    const px = movil ? 2 : 3.2;
    const py = movil ? 5.5 : 5;
    const hundido = (1 - s) * 50;
    return {
      lugar: "mazo" as Lugar,
      transform: `translate3d(${fmt(hundido + j * px)}%, ${fmt(-(hundido + j * py))}%, 0) scale(${fmt(s)})`,
      z: 40 - j,
      opacity: j > 3 ? 0 : 1,
      niebla: Math.min(0.72, j * 0.22),
      retraso: 90 + j * 45,
    };
  }
  // Ya vista: sale volando hacia la izquierda.
  return {
    lugar: "fuera" as Lugar,
    transform: `translate3d(${movil ? -118 : -128}%, 16%, 0) rotate(-10deg) scale(0.86)`,
    z: 60,
    opacity: 0,
    niebla: 0,
    retraso: 0,
  };
}

/**
 * Servicios, pieza por pieza: la escena de barras de etílico llevada más
 * lejos. Con el scroll pasan una por una, desde la página web. Cada pieza
 * trae su mundo: el cuaderno de la página web, los píxeles de Onvi, el
 * tablero del software, el teléfono de las apps, el panel en oscuro y la
 * marca conectada con Google e Instagram. El fondo nuevo entra con una
 * cortina propia de cada escena mientras la tarjeta anterior sale volando y
 * la siguiente pasa al frente.
 */
export default function Piezas() {
  const pistaRef = useRef<HTMLElement>(null);
  const escenarioRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marcoRef = useRef<HTMLDivElement>(null);
  const fantasmaRef = useRef<HTMLSpanElement>(null);
  const lineasRef = useRef<(HTMLElement | null)[]>([]);

  const [objetivo, setObjetivo] = useState(0);
  const [mostrada, setMostrada] = useState(0);
  const [visto, setVisto] = useState(false);
  const [movil, setMovil] = useState(false);

  const mostradaRef = useRef(0);
  const estadoRef = useRef(0);
  const localRef = useRef(0);
  const iniciado = useRef(false);
  const quieto = useRef(false);
  const enPantalla = useRef(false);
  const movilRef = useRef(false);
  const tamano = useRef({ w: 1, h: 1 });
  const corrida = useRef({ raf: 0, destino: -1, corriendo: false });
  const limpieza = useRef(0);
  /** Un salto sin cortina (al volver de "Más información", con la pantalla tapada). */
  const directo = useRef(false);

  /** Subrayados del selector y deriva de la palabra de fondo, sin pasar por React. */
  const pintarAvance = useCallback(() => {
    const estado = estadoRef.current;
    const local = localRef.current;
    const pixel = escenarioRef.current?.dataset.escena === "onvi";
    lineasRef.current.forEach((el, i) => {
      if (!el) return;
      let w = i < estado ? 1 : i === estado ? 0.12 + local * 0.88 : 0;
      if (pixel) w = Math.round(w * 8) / 8;
      el.style.transform = `scaleX(${w.toFixed(3)})`;
    });
    if (fantasmaRef.current) fantasmaRef.current.style.translate = `${((0.5 - local) * 70).toFixed(1)}px 0`;
  }, []);

  const limpiar = useCallback(() => {
    if (corrida.current.corriendo) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, tamano.current.w, tamano.current.h);
    canvas.dataset.on = "0";
  }, []);

  /** Deja la escena puesta debajo y limpia la cortina cuando ya se pintó. */
  const fijar = useCallback(
    (destino: number) => {
      if (destino === mostradaRef.current) {
        cancelAnimationFrame(limpieza.current);
        limpieza.current = requestAnimationFrame(limpiar);
        return;
      }
      mostradaRef.current = destino;
      setMostrada(destino);
    },
    [limpiar],
  );

  const correrCortina = useCallback(
    (destino: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        fijar(destino);
        return;
      }
      cancelAnimationFrame(corrida.current.raf);
      cancelAnimationFrame(limpieza.current);
      const datos = PIEZAS[destino]!;
      const anterior = corrida.current.corriendo ? corrida.current.destino : mostradaRef.current;
      const { w, h } = tamano.current;
      let cx = w * 0.62;
      let cy = h * 0.5;
      const marco = marcoRef.current?.getBoundingClientRect();
      const esc = escenarioRef.current?.getBoundingClientRect();
      if (marco && esc) {
        cx = marco.left + marco.width / 2 - esc.left;
        cy = marco.top + marco.height / 2 - esc.top;
      }
      const lado = celda(movilRef.current);
      const azar = new Float32Array(Math.ceil(w / lado) * Math.ceil(h / lado)).map(() => Math.random());
      const pintura: Pintura = { tipo: datos.cortina, colores: datos.colores, adelante: destino > anterior, cx, cy, azar };
      const inicio = performance.now();
      corrida.current = { raf: 0, destino, corriendo: true };
      canvas.dataset.on = "1";
      const paso = (ahora: number) => {
        const listo = pintar(ctx, w, h, ahora - inicio, pintura, movilRef.current);
        if (listo) {
          corrida.current = { raf: 0, destino, corriendo: false };
          fijar(destino);
          return;
        }
        corrida.current.raf = requestAnimationFrame(paso);
      };
      corrida.current.raf = requestAnimationFrame(paso);
    },
    [fijar],
  );

  // El scroll decide qué pieza se ve.
  useLayoutEffect(() => {
    const pista = pistaRef.current;
    const escenario = escenarioRef.current;
    if (!pista || !escenario) return;
    quieto.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia("(max-width: 767px)");
    const alMq = () => {
      movilRef.current = mq.matches;
      setMovil(mq.matches);
    };
    alMq();
    mq.addEventListener("change", alMq);

    let top = 0;
    let recorrido = 1;
    let raf = 0;
    const medir = () => {
      top = pista.getBoundingClientRect().top + window.scrollY;
      recorrido = Math.max(1, pista.offsetHeight - escenario.offsetHeight);
    };
    const leer = () => {
      raf = 0;
      const p = c01((window.scrollY - top) / recorrido);
      const x = p * N;
      const k = Math.min(N - 1, Math.floor(x));
      estadoRef.current = k;
      localRef.current = c01(x - k);
      pintarAvance();
      setObjetivo(k);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(leer);
    };
    const alCambiar = () => {
      medir();
      pedir();
    };
    medir();
    leer();
    // Si la página abre ya dentro de la sección, la escena va sin cortina.
    const inicial = estadoRef.current;
    mostradaRef.current = inicial;
    setMostrada(inicial);
    iniciado.current = true;

    const ro = new ResizeObserver(alCambiar);
    ro.observe(document.body);
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", alCambiar);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mq.removeEventListener("change", alMq);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", alCambiar);
    };
  }, [pintarAvance]);

  // El lienzo de la cortina, del tamaño del escenario.
  useEffect(() => {
    const escenario = escenarioRef.current;
    const canvas = canvasRef.current;
    if (!escenario || !canvas) return;
    const ajustar = () => {
      const w = escenario.clientWidth;
      const h = escenario.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tamano.current = { w, h };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(escenario);
    return () => ro.disconnect();
  }, []);

  // Las tarjetas entran la primera vez que se ve la sección.
  useEffect(() => {
    const escenario = escenarioRef.current;
    if (!escenario) return;
    const io = new IntersectionObserver(
      ([e]) => {
        enPantalla.current = !!e?.isIntersecting;
        if (e && e.intersectionRatio >= 0.3) setVisto(true);
      },
      { threshold: [0, 0.3] },
    );
    io.observe(escenario);
    return () => io.disconnect();
  }, []);

  // Cambió el estado: cortina hacia la escena nueva (o cambio directo si no se ve).
  useEffect(() => {
    // Un render viejo (el scroll ya siguió) no mueve nada.
    if (!iniciado.current || objetivo !== estadoRef.current) return;
    if (quieto.current || !enPantalla.current || directo.current) {
      directo.current = false;
      cancelAnimationFrame(corrida.current.raf);
      corrida.current.corriendo = false;
      fijar(objetivo);
      return;
    }
    if (objetivo === mostradaRef.current && !corrida.current.corriendo) return;
    correrCortina(objetivo);
  }, [objetivo, correrCortina, fijar]);

  // La escena nueva ya está debajo: se limpia la cortina y el menú mira el tono.
  useEffect(() => {
    cancelAnimationFrame(limpieza.current);
    limpieza.current = requestAnimationFrame(() => {
      limpieza.current = requestAnimationFrame(limpiar);
    });
    pintarAvance();
    window.dispatchEvent(new Event("od:tema"));
  }, [mostrada, limpiar, pintarAvance]);

  useEffect(
    () => () => {
      cancelAnimationFrame(corrida.current.raf);
      cancelAnimationFrame(limpieza.current);
    },
    [],
  );

  /** Ir a la pieza k: un poco pasada la mitad de su tramo. */
  const irAEstado = useCallback((k: number) => {
    const pista = pistaRef.current;
    const escenario = escenarioRef.current;
    if (!pista || !escenario) return;
    const top = pista.getBoundingClientRect().top + window.scrollY;
    const recorrido = pista.offsetHeight - escenario.offsetHeight;
    scrollA(top + (recorrido * (k + 0.42)) / N);
  }, []);

  /** Lo mismo, sin animación: al cerrar "Más información", Servicios queda en esa pieza. */
  const irDirecto = useCallback((id: IdPieza) => {
    const pista = pistaRef.current;
    const escenario = escenarioRef.current;
    const k = PIEZAS.findIndex((p) => p.id === id);
    if (!pista || !escenario || k < 0) return;
    const top = pista.getBoundingClientRect().top + window.scrollY;
    const recorrido = pista.offsetHeight - escenario.offsetHeight;
    const dentro = window.scrollY >= top - 2 && window.scrollY <= top + recorrido + 2;
    if (dentro && k === estadoRef.current) return;
    const y = top + (recorrido * (k + 0.42)) / N;
    directo.current = true;
    const lenis = (window as unknown as ConLenis).__odLenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: "instant" });
    window.setTimeout(() => (directo.current = false), 600);
  }, []);

  const mas = useMasInfo(irDirecto);

  /** Inclinación con el mouse y paralaje de los pop-ups. */
  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || quieto.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    e.currentTarget.style.setProperty("--mx", mx.toFixed(3));
    e.currentTarget.style.setProperty("--my", my.toFixed(3));
  };
  const alSalir = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  const pieza = PIEZAS[mostrada]!;
  const escena = pieza.id;
  const saliendo = objetivo !== mostrada;

  return (
    <section
      id="servicios"
      ref={pistaRef}
      className="pz"
      aria-labelledby="pz-titulo"
      style={{ "--pz-alto": `${(N * TRAMO + 1) * 100}` } as CSSProperties}
    >
      <h2 id="pz-titulo" className="sr-only">
        Servicios: páginas web, Onvi, software, apps móviles, Panel Onvi y tu marca desde cero
      </h2>
      <div
        ref={escenarioRef}
        className="pz-escenario"
        data-escena={escena}
        data-objetivo={PIEZAS[objetivo]!.id}
        data-tema={pieza.tema}
        data-visto={visto || undefined}
        onPointerMove={alMover}
        onPointerLeave={alSalir}
      >
        <div key={escena} className="pz-fondo" aria-hidden>
          <span className="pz-fondo__textura" />
          <span className="pz-fondo__halo" />
          <span ref={fantasmaRef} className="pz-fondo__fantasma">
            {pieza.fantasma}
          </span>
          <span className="pz-fondo__extra" />
          <span className="pz-fondo__extra pz-fondo__extra--b" />
        </div>
        <canvas ref={canvasRef} className="pz-cortina" data-on="0" aria-hidden />
        <span className="pz-grano" aria-hidden />

        <div className="pz-cuerpo">
          <div key={escena} className="pz-texto" data-sale={saliendo || undefined}>
            <TextoPieza
              pieza={pieza}
              alMas={tieneMas(pieza.id) ? (e) => mas.abrir(pieza.id, e.currentTarget) : undefined}
            />
          </div>

          <div className="pz-rig">
            <div ref={marcoRef} className="pz-marco">
              {PIEZAS.map((p, i) => {
                const l = lugarDe(i, objetivo, visto, movil);
                return (
                  <figure
                    key={p.id}
                    className="pz-carta"
                    data-lugar={l.lugar}
                    style={
                      {
                        transform: l.transform,
                        zIndex: l.z,
                        opacity: l.opacity,
                        transitionDelay: `${l.retraso}ms`,
                        "--niebla": l.niebla,
                      } as CSSProperties
                    }
                  >
                    {/* Tal cual: ya vienen a su tamaño y comprimidas; otra pasada les borra el texto chico. */}
                    <Image src={p.imagen} alt={p.alt} fill unoptimized className="pz-carta__img" />
                  </figure>
                );
              })}
              <Popups key={escena} escena={escena} saliendo={saliendo} />
            </div>
          </div>
        </div>

        <nav className="pz-selector" aria-label="Las seis piezas">
          {PIEZAS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="pz-selector__item"
              aria-current={objetivo === i ? "step" : undefined}
              onClick={() => irAEstado(i)}
            >
              <span className="pz-selector__n">{p.n}</span>
              <span className="pz-selector__nombre">{p.corto}</span>
              <span className="pz-selector__riel" aria-hidden>
                <i
                  ref={(el) => {
                    lineasRef.current[i] = el;
                  }}
                />
              </span>
            </button>
          ))}
        </nav>
      </div>
      {mas.portal}
    </section>
  );
}
