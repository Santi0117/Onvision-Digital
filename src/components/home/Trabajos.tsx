"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as TecladoReact,
  type PointerEvent as PunteroReact,
} from "react";
import { Flecha } from "../od/ui";
import { visionStore } from "../vision/store";
import { pedirServicio } from "./data";
import "./trabajos.css";

type Trabajo = {
  id: string;
  n: string;
  servicio: string;
  /** El nombre de la pestaña en el celular. */
  corto: string;
  /** Quiénes salen en el video. */
  proyectos: string;
  /** Lo que dice la barra del navegador. */
  direccion: string;
  titulo: string;
  texto: string;
  /** En la compu, en vez del texto: una sola frase. */
  resumen: string;
  incluye: readonly string[];
  ideal: string;
  /** Con qué servicio llega "Quiero uno así" al formulario de contacto. */
  quiero: string;
  /** A dónde lleva "Ir a Servicios": su "Más información" si lo tiene; si no, Servicios. */
  servicios: string;
  /**
   * Los archivos en /trabajos: .mp4 (H.264) en calidad alta, .webm (VP9) de
   * respaldo y la imagen .webp. Con `movil`, también un -movil.mp4 más
   * liviano para pantallas chicas.
   */
  video: string;
  movil?: boolean;
  forma: "navegador" | "telefono";
  tono: string;
};

/** Los videos del sitio anterior, cada uno con lo que se ve en él. */
const TRABAJOS: readonly Trabajo[] = [
  {
    id: "web",
    n: "01",
    servicio: "Sitios web",
    corto: "Web",
    proyectos: "Helio · Toksu · Alchemy",
    direccion: "helio · toksu · alchemy",
    titulo: "Páginas con carácter propio.",
    texto:
      "Cada marca, con su sitio desde cero: el teléfono 3D de Helio que se abre al bajar, las reservas de mesa de Toksu y las sesiones que Alchemy agenda en línea.",
    resumen: "Sitios desde cero con 3D, reservas de mesa y sesiones que se agendan solas.",
    incluye: ["Diseño desde cero", "Animaciones y 3D", "Reservas y formularios", "Rápida en el celular"],
    ideal: "restaurantes, tiendas, estudios y servicios.",
    quiero: "Página web",
    servicios: "/digital?servicio=web",
    video: "web",
    movil: true,
    forma: "navegador",
    tono: "#34d3ee",
  },
  {
    id: "tienda",
    n: "02",
    servicio: "E-commerce",
    corto: "Tienda",
    proyectos: "Firstdown",
    direccion: "firstdown",
    titulo: "Una tienda lista para vender.",
    texto:
      "Firstdown vende jerseys originales: catálogo por liga y por equipo, un probador 3D para armar el outfit y un carrito con tallas, colores y precios en colones.",
    resumen: "Catálogo por liga, probador 3D y carrito con precios en colones.",
    incluye: ["Catálogo con filtros", "Carrito y pagos", "Probador 3D", "Ofertas y envíos"],
    ideal: "ropa, accesorios y todo lo que se vende por catálogo.",
    quiero: "Tienda online",
    servicios: "/digital?servicio=web",
    video: "ecommerce",
    forma: "navegador",
    tono: "#4d7cff",
  },
  {
    id: "software",
    n: "03",
    servicio: "Software a medida",
    corto: "Software",
    proyectos: "Meridiano · Santa Elena · aula virtual",
    direccion: "meridiano · santa elena · aula",
    titulo: "Tu operación, en un solo lugar.",
    texto:
      "Sistemas hechos a la medida de cómo trabajás: la mesa de operaciones de Meridiano, la agenda y el inventario de la Clínica Santa Elena y un aula virtual con cursos y entregas.",
    resumen: "Operaciones, agenda, inventario y cursos, cada uno a la medida de su equipo.",
    incluye: ["Agenda y citas", "Inventario con alertas", "Reportes en vivo", "Usuarios y roles"],
    ideal: "clínicas, empresas de servicios y educación.",
    quiero: "Software a medida",
    servicios: "/digital?servicio=software",
    video: "software",
    movil: true,
    forma: "navegador",
    tono: "#ff7a1a",
  },
  {
    id: "apps",
    n: "04",
    servicio: "Apps móviles",
    corto: "Apps",
    proyectos: "Tappy",
    direccion: "tappy",
    titulo: "Tu negocio, en el bolsillo.",
    texto:
      "Tappy convierte un sticker NFC en avisos para la familia: recordatorios de medicamentos, metas de agua y luces de la casa, con hogar compartido y plan Premium.",
    resumen: "Stickers NFC que avisan a la familia, con hogar compartido y plan Premium.",
    incluye: ["iPhone y Android", "Avisos al instante", "Cuentas y planes", "Stickers NFC"],
    ideal: "salud, hogar, suscripciones y clientes frecuentes.",
    quiero: "App móvil",
    servicios: "/digital#servicios",
    video: "apps",
    forma: "telefono",
    tono: "#b65cff",
  },
];

const TOTAL = TRABAJOS.length;

const MQ_QUIETO = "(prefers-reduced-motion: reduce)";
const suscribirQuieto = (avisar: () => void) => {
  const mq = window.matchMedia(MQ_QUIETO);
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
};
const quietoAhora = () => window.matchMedia(MQ_QUIETO).matches;
const quietoServidor = () => false;

type VideoWebkit = HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitDisplayingFullscreen?: boolean };

const enGrande = (v: VideoWebkit) => document.fullscreenElement === v || Boolean(v.webkitDisplayingFullscreen);

const conI = (i: number) => ({ "--i": i }) as CSSProperties;

/** Las flechas mueven entre pestañas, como en cualquier lista de pestañas. */
const FLECHAS: Partial<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

function IconoPlay() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false">
      <path d="M5 3.2v9.6l7.6-4.8z" fill="currentColor" />
    </svg>
  );
}

function IconoPausa() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false">
      <path d="M4.2 3.2h2.6v9.6H4.2zM9.2 3.2h2.6v9.6H9.2z" fill="currentColor" />
    </svg>
  );
}

function IconoAmpliar() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
      <path
        d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9.2 6.8M2.5 13.5l4.3-4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Candado() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden focusable="false">
      <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * "Trabajos": los videos de la versión anterior del sitio, ahora en el
 * inicio, justo después de la laptop. Una sola pantalla grande que cambia
 * de forma (navegador para sitios, tienda y sistemas; teléfono para la app),
 * con la luz de su color detrás y nada encima del video; las pestañas llevan
 * una rayita que avanza con el video y, al terminar, pasa el próximo. Si la
 * persona elige uno, ese se repite. Debajo de cada video, siempre en el mismo
 * lugar, "Ir a Servicios". Solo se reproduce mientras se ve; con movimiento
 * reducido no arranca solo. En el celular también se cambia deslizando la
 * pantalla, y cualquiera se puede ver en pantalla completa.
 *
 * La sección se anota en la escena 3D: la laptop se apaga mientras esta entra.
 */
export default function Trabajos() {
  const seccion = useRef<HTMLElement>(null);
  const escenario = useRef<HTMLDivElement>(null);
  const giro = useRef<HTMLDivElement>(null);
  const anillo = useRef<SVGCircleElement>(null);
  const videos = useRef<(VideoWebkit | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const rieles = useRef<(HTMLElement | null)[]>([]);
  const activoRef = useRef(0);
  const manual = useRef(false);
  const toque = useRef<{ x: number; y: number; id: number } | null>(null);

  const [activo, setActivo] = useState(0);
  /** Lo que eligió la persona con el botón; sin elegir, con movimiento reducido queda quieto. */
  const [pausa, setPausa] = useState<boolean | null>(null);
  const [sonando, setSonando] = useState(false);
  const [enVista, setEnVista] = useState(false);
  const [visto, setVisto] = useState(false);
  const quieto = useSyncExternalStore(suscribirQuieto, quietoAhora, quietoServidor);
  const detenido = pausa ?? quieto;
  const t = TRABAJOS[activo]!;

  useLayoutEffect(() => {
    const el = seccion.current;
    if (!el) return;
    visionStore.featuresEl = el;
    visionStore.featureCount = 1;
    return () => {
      if (visionStore.featuresEl === el) visionStore.featuresEl = null;
    };
  }, []);

  useEffect(() => {
    activoRef.current = activo;
  }, [activo]);

  // La cabeza y las pestañas entran la primera vez que la sección se ve.
  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        setVisto(true);
        io.disconnect();
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A la vista: se reproduce. Cerca: el video que toca ya empieza a cargar.
  useEffect(() => {
    const el = escenario.current;
    if (!el) return;
    const vista = new IntersectionObserver(([e]) => setEnVista(Boolean(e?.isIntersecting)), { threshold: 0.3 });
    const cerca = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        const v = videos.current[activoRef.current];
        if (v && v.preload === "none" && !quietoAhora()) v.preload = "auto";
        cerca.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    vista.observe(el);
    cerca.observe(el);
    return () => {
      vista.disconnect();
      cerca.disconnect();
    };
  }, []);

  // Suena solo el que se ve, y solo mientras la pantalla está a la vista.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (v && i !== activo && !v.paused) v.pause();
    });
    const v = videos.current[activo];
    if (!v) return;
    if (enVista && !detenido) {
      v.muted = true;
      v.play().catch(() => {});
    } else if (!v.paused && !enGrande(v)) v.pause();
  }, [activo, enVista, detenido]);

  // La rayita de la pestaña y el anillo del botón avanzan con el video.
  useEffect(() => {
    if (!enVista) return;
    let raf = 0;
    let previo = "";
    const pintar = () => {
      raf = requestAnimationFrame(pintar);
      const i = activoRef.current;
      const v = videos.current[i];
      const d = v?.duration ?? 0;
      const p = v && d > 0 && Number.isFinite(d) ? Math.min(1, v.currentTime / d) : 0;
      const valor = p.toFixed(4);
      if (valor === previo) return;
      previo = valor;
      rieles.current[i]?.style.setProperty("--p", valor);
      anillo.current?.style.setProperty("--p", valor);
    };
    raf = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(raf);
  }, [enVista]);

  // Al entrar, la pantalla se endereza con el scroll (sin medir en cada cuadro).
  useEffect(() => {
    const g = giro.current;
    const esc = escenario.current;
    if (!g || !esc || quietoAhora()) return;
    let top = 0;
    let raf = 0;
    let previo = "";
    const pintar = () => {
      raf = 0;
      const vh = window.innerHeight;
      const k = Math.min(1, Math.max(0, (window.scrollY + vh - top) / (vh * 0.6)));
      const valor = k.toFixed(3);
      if (valor === previo) return;
      previo = valor;
      g.style.setProperty("--tb-in", valor);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(pintar);
    };
    const medir = () => {
      top = esc.getBoundingClientRect().top + window.scrollY;
      pedir();
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(document.body);
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  // Al salir de la pantalla completa, los videos vuelven a no tener controles.
  useEffect(() => {
    const alCambiar = () => {
      if (document.fullscreenElement) return;
      videos.current.forEach((v) => {
        if (v) v.controls = false;
      });
    };
    document.addEventListener("fullscreenchange", alCambiar);
    return () => document.removeEventListener("fullscreenchange", alCambiar);
  }, []);

  /** Pasa a otro trabajo (o reinicia el que se ve): su video arranca desde el principio. */
  const mostrar = useCallback((i: number) => {
    const v = videos.current[i];
    if (v) v.currentTime = 0;
    rieles.current[i]?.style.setProperty("--p", "0");
    anillo.current?.style.setProperty("--p", "0");
    if (i === activoRef.current) return;
    if (v && v.preload === "none") v.preload = "auto";
    setSonando(false);
    setActivo(i);
  }, []);

  const elegir = (i: number) => {
    manual.current = true;
    mostrar(i);
  };

  /** Termina un video: sigue el próximo; si la persona eligió uno (o lo mira en grande), se repite. */
  const alTerminar = (i: number) => {
    const v = videos.current[i];
    if (!v || i !== activoRef.current) return;
    if (manual.current || enGrande(v)) {
      v.currentTime = 0;
      v.play().catch(() => {});
      return;
    }
    if (!quietoAhora()) mostrar((i + 1) % TOTAL);
  };

  const alternar = () => {
    const v = videos.current[activo];
    if (!v) return;
    if (sonando) {
      setPausa(true);
      v.pause();
      return;
    }
    setPausa(false);
    if (v.ended) v.currentTime = 0;
    v.muted = true;
    v.play().catch(() => {});
  };

  const ampliar = () => {
    const v = videos.current[activo];
    if (!v) return;
    setPausa(false);
    v.muted = true;
    v.play().catch(() => {});
    if (typeof v.requestFullscreen === "function" && document.fullscreenEnabled) {
      v.controls = true;
      v.requestFullscreen().catch(() => {
        v.controls = false;
      });
      return;
    }
    try {
      // iPhone: el reproductor del sistema.
      v.webkitEnterFullscreen?.();
    } catch {
      // Sin pantalla completa: sigue en la página.
    }
  };

  const alTeclado = (e: TecladoReact<HTMLDivElement>) => {
    const paso = FLECHAS[e.key];
    const k = paso ? (activo + paso + TOTAL) % TOTAL : e.key === "Home" ? 0 : e.key === "End" ? TOTAL - 1 : -1;
    if (k < 0) return;
    e.preventDefault();
    elegir(k);
    tabs.current[k]?.focus();
  };

  // Deslizar la pantalla con el dedo pasa al trabajo de al lado.
  const alTocar = (e: PunteroReact<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    toque.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const alSoltar = (e: PunteroReact<HTMLDivElement>) => {
    const inicio = toque.current;
    toque.current = null;
    if (!inicio || inicio.id !== e.pointerId) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    elegir((activo + (dx < 0 ? 1 : TOTAL - 1)) % TOTAL);
  };

  /** Con el mouse, la pantalla se inclina apenas hacia el cursor. */
  const alMover = (e: PunteroReact<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || quieto) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    e.currentTarget.style.setProperty("--my", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  const alSalir = (e: PunteroReact<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  return (
    <section
      id="trabajos"
      ref={seccion}
      className="tb"
      data-tema="oscuro"
      data-visto={visto ? "" : undefined}
      style={{ "--tb-tono": t.tono } as CSSProperties}
      aria-labelledby="tb-titulo"
    >
      <div className="tb__dentro">
        <div className="tb__cabeza">
          <div>
            <p className="oh-indice">(03) Trabajos</p>
            <h2 id="tb-titulo" className="tb__h2">
              <span>Así se ven</span> <span>funcionando.</span>
            </h2>
          </div>
          <p className="tb__lede">
            Cuatro proyectos reales, grabados tal cual se usan: sitios, una tienda, sistemas y una app. Elegí uno y
            miralo funcionar.
          </p>
        </div>

        <div className="tb__cuerpo">
          <div className="tb__lista" role="tablist" aria-label="Trabajos" onKeyDown={alTeclado}>
            {TRABAJOS.map((x, i) => {
              const on = i === activo;
              return (
                <button
                  key={x.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tb-tab-${x.id}`}
                  aria-selected={on}
                  aria-controls={`tb-panel-${x.id}`}
                  aria-label={x.servicio}
                  tabIndex={on ? 0 : -1}
                  className="tb__tab"
                  onClick={() => elegir(i)}
                >
                  <span className="tb__tab-n">{x.n}</span>
                  <span className="tb__tab-nombre">
                    <span className="tb__tab-largo">{x.servicio}</span>
                    <span className="tb__tab-corto">{x.corto}</span>
                  </span>
                  <span className="tb__tab-ojo" />
                  <span className="tb__riel">
                    <i
                      ref={(el) => {
                        rieles.current[i] = el;
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="tb__lado">
            <div
              ref={escenario}
              className="tb__escenario"
              data-forma={t.forma}
              onPointerDown={alTocar}
              onPointerUp={alSoltar}
              onPointerCancel={() => {
                toque.current = null;
              }}
              onPointerMove={alMover}
              onPointerLeave={alSalir}
            >
              <div className="tb__auras" aria-hidden>
                {TRABAJOS.map((x, i) => (
                  <Image
                    key={x.id}
                    className="tb__aura"
                    src={`/trabajos/${x.video}.webp`}
                    alt=""
                    fill
                    sizes="40vw"
                    unoptimized
                    data-on={i === activo ? "" : undefined}
                  />
                ))}
              </div>

              <div ref={giro} className="tb__giro">
                <div className="tb__cuadro" data-forma={t.forma}>
                  <div className="tb__marco">
                    <div className="tb__barra" aria-hidden>
                      <span className="tb__luces">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="tb__url">
                        <Candado />
                        <span key={t.id}>{t.direccion}</span>
                      </span>
                    </div>
                    <div className="tb__pantalla">
                      {TRABAJOS.map((x, i) => (
                        <video
                          key={x.id}
                          ref={(el) => {
                            videos.current[i] = el;
                          }}
                          className="tb__video"
                          data-on={i === activo ? "" : undefined}
                          poster={`/trabajos/${x.video}.webp`}
                          muted
                          playsInline
                          preload="none"
                          aria-hidden={i !== activo}
                          aria-label={`${x.servicio}: ${x.proyectos}, en video`}
                          onPlay={() => {
                            if (i !== activo) return;
                            setSonando(true);
                            // Mientras suena, el próximo ya carga.
                            const sig = videos.current[(i + 1) % TOTAL];
                            if (sig && sig.preload === "none") sig.preload = "auto";
                          }}
                          onPause={() => {
                            if (i === activo) setSonando(false);
                          }}
                          onEnded={() => alTerminar(i)}
                        >
                          <source
                            src={`/trabajos/${x.video}.mp4`}
                            type="video/mp4"
                            media={x.movil ? "(min-width: 768px)" : undefined}
                          />
                          {x.movil ? <source src={`/trabajos/${x.video}-movil.mp4`} type="video/mp4" /> : null}
                          <source src={`/trabajos/${x.video}.webm`} type="video/webm" />
                        </video>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tb__pie">
              {/* Con carga completa: Servicios abre su "Más información" leyendo la dirección al entrar. */}
              <a href={t.servicios} className="tb__ir" aria-label={`Ir a Servicios: ${t.servicio}`}>
                Ir a Servicios
                <i aria-hidden>
                  <Flecha />
                </i>
              </a>
              <div className="tb__control">
                <button
                  type="button"
                  className="tb__boton"
                  onClick={alternar}
                  aria-label={sonando ? "Pausar el video" : "Reproducir el video"}
                >
                  <svg className="tb__anillo" viewBox="0 0 36 36" aria-hidden focusable="false">
                    <circle className="tb__anillo-fondo" cx="18" cy="18" r="16.5" />
                    <circle ref={anillo} className="tb__anillo-avance" cx="18" cy="18" r="16.5" pathLength={100} />
                  </svg>
                  {sonando ? <IconoPausa /> : <IconoPlay />}
                </button>
                <button type="button" className="tb__boton" onClick={ampliar} aria-label="Ver el video en pantalla completa">
                  <IconoAmpliar />
                </button>
              </div>
            </div>
          </div>

          <div className="tb__paneles">
            {TRABAJOS.map((x, i) => (
              <div
                key={x.id}
                role="tabpanel"
                id={`tb-panel-${x.id}`}
                aria-labelledby={`tb-tab-${x.id}`}
                className="tb__panel"
                data-on={i === activo ? "" : undefined}
              >
                <p className="tb__en">
                  En pantalla · <b>{x.proyectos}</b>
                </p>
                <h3 className="tb__titulo" style={conI(1)}>
                  {x.titulo}
                </h3>
                <p className="tb__texto" style={conI(2)}>
                  <span className="tb__texto-largo">{x.texto}</span>
                  <span className="tb__texto-corto">{x.resumen}</span>
                </p>
                <ul className="tb__incluye" style={conI(3)}>
                  {x.incluye.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="tb__ideal" style={conI(4)}>
                  <span>Ideal para</span> {x.ideal}
                </p>
                <button type="button" className="tb__quiero" style={conI(5)} onClick={() => pedirServicio(x.quiero)}>
                  Quiero uno así <Flecha />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
