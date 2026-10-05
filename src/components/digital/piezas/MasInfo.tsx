"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as PunteroReact,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { celda, pintar, type Pintura } from "./cortina";
import { PIEZAS, type IdPieza, type Pieza } from "./datos";
import { MAS, tieneMas, type Extra, type Mas } from "./mas";
import Popups from "./Popups";
import PopupsMas from "./PopupsMas";
import { BotonAccion, TextoPieza } from "./Texto";
import "./masinfo.css";
import "./mundos.css";

type Punto = { x: number; y: number };
type ConLenis = { __odLenis?: { stop: () => void; start: () => void } };

const lenis = () => (window as unknown as ConLenis).__odLenis;
const piezaDe = (id: IdPieza) => PIEZAS.find((p) => p.id === id)!;
const quieto = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sinCambios = () => () => {};

/** La dirección lleva el servicio abierto (?servicio=web): se puede compartir y "atrás" lo cierra. */
const PARAM = "servicio";

function delUrl(): IdPieza | null {
  const id = new URLSearchParams(window.location.search).get(PARAM);
  const pieza = PIEZAS.find((p) => p.id === id);
  return pieza && tieneMas(pieza.id) ? pieza.id : null;
}

function urlCon(id: IdPieza | null) {
  const u = new URL(window.location.href);
  if (id) u.searchParams.set(PARAM, id);
  else u.searchParams.delete(PARAM);
  return `${u.pathname}${u.search}${u.hash}`;
}

/** Inclinación con el mouse y paralaje de los pop-ups, como en la escena de Servicios. */
const inclinar = {
  onPointerMove: (e: PunteroReact<HTMLElement>) => {
    if (e.pointerType !== "mouse" || quieto()) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    e.currentTarget.style.setProperty("--my", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  },
  onPointerLeave: (e: PunteroReact<HTMLElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  },
};

/** Una sección se anima la primera vez que se ve (el texto, la tarjeta y sus pop-ups). */
function useVisto<T extends Element>() {
  const ref = useRef<T>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        setVisto(true);
        io.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visto] as const;
}

function Fondo({ fantasma }: { fantasma: string }) {
  return (
    <div className="pz-fondo" aria-hidden>
      <span className="pz-fondo__textura" />
      <span className="pz-fondo__halo" />
      <span className="pz-fondo__fantasma">{fantasma}</span>
      <span className="pz-fondo__extra" />
      <span className="pz-fondo__extra pz-fondo__extra--b" />
    </div>
  );
}

function Tarjeta({ imagen, alt, children }: { imagen: string; alt: string; children: React.ReactNode }) {
  return (
    <div className="mi-rig">
      <div className="mi-marco">
        <figure className="pz-carta" data-lugar="activa">
          {/* Tal cual: ya vienen a su tamaño y comprimidas; otra pasada les borra el texto chico. */}
          <Image src={imagen} alt={alt} fill unoptimized className="pz-carta__img" />
        </figure>
        {children}
      </div>
    </div>
  );
}

/** Lo primero: la misma escena de Servicios, ahora con "bajá para ver más". */
function Portada({ pieza }: { pieza: Pieza }) {
  const [ref, visto] = useVisto<HTMLElement>();
  return (
    <section
      ref={ref}
      className="pz-escenario mi-escena mi-escena--portada"
      data-escena={pieza.id}
      data-tema={pieza.tema}
      data-carta="der"
      data-visto={visto || undefined}
      {...inclinar}
    >
      <Fondo fantasma={pieza.fantasma} />
      <span className="pz-grano" aria-hidden />
      <div className="mi-cuerpo">
        <div className="pz-texto">
          <TextoPieza pieza={pieza} />
        </div>
        <Tarjeta imagen={pieza.imagen} alt={pieza.alt}>
          {visto ? <Popups escena={pieza.id} saliendo={false} /> : null}
        </Tarjeta>
      </div>
      <p className="mi-bajar" aria-hidden>
        <span>Bajá para ver más</span>
        <i />
      </p>
    </section>
  );
}

/** Otro trabajo del mismo servicio, en su propio mundo: su captura, su texto y sus pop-ups. */
function SeccionExtra({ extra, carta }: { extra: Extra; carta: "izq" | "der" }) {
  const [ref, visto] = useVisto<HTMLElement>();
  const [antes, resalto] = extra.titulo;
  return (
    <section
      ref={ref}
      className="pz-escenario mi-escena"
      data-escena={extra.mundo}
      data-tema={extra.tema}
      data-carta={carta}
      data-visto={visto || undefined}
      aria-labelledby={`mi-${extra.id}`}
      {...inclinar}
    >
      <Fondo fantasma={extra.fantasma} />
      <span className="pz-grano" aria-hidden />
      <div className="mi-cuerpo">
        <div className="pz-texto">
          <p className="pz-texto__ante">{extra.antetitulo}</p>
          <h3 id={`mi-${extra.id}`} className="pz-texto__titulo">
            {antes}
            <em>{resalto}</em>
          </h3>
          <p className="pz-texto__bajada">{extra.bajada}</p>
          <ul className="pz-texto__etiquetas">
            {extra.etiquetas.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
        <Tarjeta imagen={extra.imagen} alt={extra.alt}>
          {visto ? <PopupsMas id={extra.id} /> : null}
        </Tarjeta>
      </div>
    </section>
  );
}

function Cierre({ pieza, mas, alCerrar }: { pieza: Pieza; mas: Mas; alCerrar: () => void }) {
  const [ref, visto] = useVisto<HTMLElement>();
  const [antes, resalto] = mas.cierre.titulo;
  return (
    <section
      ref={ref}
      className="pz-escenario mi-escena mi-escena--cierre"
      data-escena={pieza.id}
      data-tema={pieza.tema}
      data-visto={visto || undefined}
      aria-labelledby="mi-cierre-titulo"
    >
      <Fondo fantasma={pieza.fantasma} />
      <span className="pz-grano" aria-hidden />
      <div className="pz-texto mi-cierre">
        <p className="pz-texto__ante">{mas.cierre.antetitulo}</p>
        <h3 id="mi-cierre-titulo" className="pz-texto__titulo">
          {antes}
          <em>{resalto}</em>
        </h3>
        <p className="pz-texto__bajada">{mas.cierre.bajada}</p>
        <div className="pz-texto__botones">
          <BotonAccion accion={pieza.accion} />
          {pieza.accion.destino === "agendar" ? null : (
            <Link href="/planes#agendar" className="pz-texto__mas">
              <span>Agendar reunión</span>
            </Link>
          )}
        </div>
        <button type="button" className="mi-volver" onClick={alCerrar}>
          ← Volver a Servicios
        </button>
      </div>
    </section>
  );
}

/**
 * El menú de las seis piezas, siempre abajo: cambia de servicio o vuelve a
 * Servicios. Toma la piel de la sección que pasa por debajo.
 */
function Barra({
  actual,
  mundo,
  alElegir,
  alCerrar,
  riel,
}: {
  actual: IdPieza;
  mundo: string;
  alElegir: (id: IdPieza) => void;
  alCerrar: () => void;
  riel: RefObject<HTMLElement | null>;
}) {
  return (
    <div className="pz-escenario mi-barra" data-escena={mundo}>
      <nav className="pz-selector mi-selector" aria-label="Servicios">
        <button type="button" className="pz-selector__item mi-selector__volver" onClick={alCerrar} aria-label="Volver a Servicios">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M13 8H3M7 4 3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="pz-selector__nombre">Volver</span>
        </button>
        {PIEZAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="pz-selector__item"
            aria-current={p.id === actual ? "page" : undefined}
            onClick={() => alElegir(p.id)}
          >
            <span className="pz-selector__n">{p.n}</span>
            <span className="pz-selector__nombre">{p.corto}</span>
            <span className="pz-selector__riel" aria-hidden>
              <i ref={p.id === actual ? riel : undefined} />
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Detalle({ id, alElegir, alCerrar }: { id: IdPieza; alElegir: (id: IdPieza) => void; alCerrar: () => void }) {
  const pieza = piezaDe(id);
  const mas = MAS[id]!;
  const caja = useRef<HTMLDivElement>(null);
  const riel = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const [mundo, setMundo] = useState<string>(id);

  // El teclado queda en el detalle (flechas y espacio bajan) y el menú de arriba toma el tono.
  useEffect(() => {
    caja.current?.focus({ preventScroll: true });
    window.dispatchEvent(new Event("od:tema"));
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar();
    };
    window.addEventListener("keydown", alTecla);
    return () => {
      window.removeEventListener("keydown", alTecla);
      cancelAnimationFrame(raf.current);
    };
  }, [alCerrar]);

  // La rayita del servicio en el menú avanza con lo que se lleva leído.
  const alBajar = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = caja.current;
      if (!el) return;
      const p = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      if (riel.current) riel.current.style.transform = `scaleX(${Math.max(0.04, p).toFixed(3)})`;
      // La sección que está a la altura del menú le presta su piel.
      const y = el.clientHeight - 48;
      for (const s of el.querySelectorAll<HTMLElement>(".mi-escena")) {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) {
          setMundo(s.dataset.escena ?? id);
          break;
        }
      }
      window.dispatchEvent(new Event("od:tema"));
    });
  };

  return (
    <div
      ref={caja}
      className="mi"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mi-titulo"
      tabIndex={-1}
      data-lenis-prevent
      onScroll={alBajar}
    >
      <h2 id="mi-titulo" className="sr-only">
        {pieza.nombre}: más información
      </h2>
      <Portada pieza={pieza} />
      {mas.extras.map((x, i) => (
        <SeccionExtra key={x.id} extra={x} carta={i % 2 === 0 ? "izq" : "der"} />
      ))}
      <Cierre pieza={pieza} mas={mas} alCerrar={alCerrar} />
      <Barra actual={id} mundo={mundo} alElegir={alElegir} alCerrar={alCerrar} riel={riel} />
    </div>
  );
}

/**
 * "Más información" de Servicios. `abrir` cubre la pantalla con la cortina
 * de la escena (el resaltador de la página web, los píxeles de Onvi…) y
 * debajo aparece el servicio completo, con scroll normal; el menú de abajo
 * cambia de servicio con su cortina o vuelve a Servicios, que queda en la
 * pieza de la que se habla. `alVolver` lleva Servicios a esa pieza sin
 * animación mientras la cortina tapa todo.
 */
export function useMasInfo(alVolver: (id: IdPieza) => void) {
  // Entrando con ?servicio=web, el detalle ya está abierto (solo existe en el navegador).
  const [actual, setActual] = useState<IdPieza | null>(() => (typeof window === "undefined" ? null : delUrl()));
  const [vuelta, setVuelta] = useState(0);
  const enCliente = useSyncExternalStore(sinCambios, () => true, () => false);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const actualRef = useRef<IdPieza | null>(actual);
  const corriendo = useRef(false);
  const limpiarTras = useRef(false);
  const saltarA = useRef<IdPieza | null>(null);
  const volverA = useRef<IdPieza | null>(null);
  const empujado = useRef(false);
  const popPendiente = useRef(false);
  const boton = useRef<HTMLElement | null>(null);
  const alVolverRef = useRef(alVolver);

  useEffect(() => {
    alVolverRef.current = alVolver;
  }, [alVolver]);

  /** La cortina de la escena `tono` sobre toda la pantalla; cuando cubre, cambia lo de abajo. */
  const cubrir = useCallback((tono: IdPieza, origen: Punto | null, alCubrir: () => void) => {
    const c = lienzo.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || quieto()) {
      alCubrir();
      return;
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const movil = w < 768;
    const datos = piezaDe(tono);
    const lado = celda(movil);
    const azar = new Float32Array(Math.ceil(w / lado) * Math.ceil(h / lado)).map(() => Math.random());
    const pintura: Pintura = {
      tipo: datos.cortina,
      colores: datos.colores,
      adelante: true,
      cx: origen?.x ?? w / 2,
      cy: origen?.y ?? h / 2,
      azar,
    };
    corriendo.current = true;
    c.dataset.on = "1";
    const t0 = performance.now();
    const paso = (ahora: number) => {
      if (pintar(ctx, w, h, ahora - t0, pintura, movil)) alCubrir();
      else requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, []);

  /** Abre, cambia o cierra (destino null) con la cortina del servicio que queda a la vista. */
  const ir = useCallback(
    (destino: IdPieza | null, origen: Punto | null) => {
      const desde = actualRef.current;
      if (corriendo.current) {
        popPendiente.current = true;
        return;
      }
      if (destino === desde) return;
      const tono = destino ?? volverA.current ?? desde;
      if (!tono) return;
      cubrir(tono, origen, () => {
        actualRef.current = destino;
        if (!destino) saltarA.current = tono;
        volverA.current = null;
        limpiarTras.current = true;
        setActual(destino);
        setVuelta((n) => n + 1);
      });
    },
    [cubrir],
  );

  const abrir = useCallback(
    (id: IdPieza, el?: HTMLElement | null) => {
      if (actualRef.current || corriendo.current || !tieneMas(id)) return;
      boton.current = el ?? null;
      const r = el?.getBoundingClientRect();
      window.history.pushState(null, "", urlCon(id));
      empujado.current = true;
      ir(id, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null);
    },
    [ir],
  );

  /** Vuelve a Servicios; con `hacia`, a otra pieza (una que todavía no tiene su detalle). */
  const cerrar = useCallback(
    (hacia?: IdPieza) => {
      if (!actualRef.current || corriendo.current) return;
      volverA.current = hacia ?? null;
      if (empujado.current) {
        // "Atrás" saca el ?servicio= de la dirección; el popstate cierra.
        empujado.current = false;
        window.history.back();
        return;
      }
      window.history.replaceState(null, "", urlCon(null));
      ir(null, null);
    },
    [ir],
  );

  const alCerrar = useCallback(() => cerrar(), [cerrar]);

  const alElegir = useCallback(
    (id: IdPieza) => {
      if (corriendo.current || id === actualRef.current) return;
      if (!tieneMas(id)) {
        cerrar(id);
        return;
      }
      window.history.replaceState(null, "", urlCon(id));
      ir(id, null);
    },
    [cerrar, ir],
  );

  // "Atrás" y "adelante" del navegador abren o cierran según la dirección.
  useEffect(() => {
    const alPop = () => {
      empujado.current = false;
      const id = delUrl();
      if (id !== actualRef.current) ir(id, null);
    };
    window.addEventListener("popstate", alPop);
    return () => window.removeEventListener("popstate", alPop);
  }, [ir]);

  // Y Servicios queda detrás, en esa pieza, para cuando se cierre.
  useEffect(() => {
    if (actualRef.current) alVolverRef.current(actualRef.current);
  }, []);

  // Con el detalle abierto, la página de atrás no se mueve.
  const abierto = actual !== null;
  useEffect(() => {
    if (!abierto) return;
    const html = document.documentElement;
    html.classList.add("mi-abierto");
    lenis()?.stop();
    return () => {
      html.classList.remove("mi-abierto");
      lenis()?.start();
    };
  }, [abierto]);

  // Ya cambió lo de abajo: se lleva Servicios a su pieza y se levanta la cortina.
  useEffect(() => {
    if (!limpiarTras.current) return;
    limpiarTras.current = false;
    if (saltarA.current) {
      alVolverRef.current(saltarA.current);
      saltarA.current = null;
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const c = lienzo.current;
        if (c) {
          c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
          c.dataset.on = "0";
        }
        corriendo.current = false;
        if (!actualRef.current) boton.current?.focus({ preventScroll: true });
        window.dispatchEvent(new Event("od:tema"));
        // Un "atrás" que llegó con la cortina andando se atiende ahora.
        if (popPendiente.current) {
          popPendiente.current = false;
          const id = delUrl();
          if (id !== actualRef.current) ir(id, null);
        }
      }),
    );
  }, [vuelta, ir]);

  const portal = enCliente
    ? createPortal(
        <>
          {actual ? <Detalle key={actual} id={actual} alElegir={alElegir} alCerrar={alCerrar} /> : null}
          <canvas ref={lienzo} className="mi-cortina" data-on="0" aria-hidden />
        </>,
        document.body,
      )
    : null;

  return { abrir, portal };
}
