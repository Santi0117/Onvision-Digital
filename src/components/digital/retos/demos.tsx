"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Ojo } from "../../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 145000 → "145.000", como se escriben los montos en el sitio. */
const miles = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Timeouts que se limpian solos al desmontar. */
function useLuego() {
  const ids = useRef<number[]>([]);
  useEffect(() => {
    const lista = ids.current;
    return () => lista.forEach((id) => window.clearTimeout(id));
  }, []);
  return useCallback((ms: number, fn: () => void) => {
    ids.current.push(window.setTimeout(fn, ms));
  }, []);
}

/* ── 01 · Páginas web: la cuota en varios bancos, sin salir del sitio ─── */

const BANCOS = [
  { nombre: "Banco A", tasa: 7.95 },
  { nombre: "Cooperativa", tasa: 8.6 },
  { nombre: "Banco B", tasa: 8.95 },
  { nombre: "Banco C", tasa: 9.75 },
];

export function Calculadora() {
  const [precio, setPrecio] = useState(145000);
  const [prima, setPrima] = useState(20);
  const [anos, setAnos] = useState(25);
  const [enviado, setEnviado] = useState(false);
  const monto = precio * (1 - prima / 100);
  const filas = BANCOS.map((b) => {
    const r = b.tasa / 100 / 12;
    return { ...b, cuota: (monto * r) / (1 - Math.pow(1 + r, -anos * 12)) };
  }).sort((a, b) => a.cuota - b.cuota);
  const cambiar = (fn: () => void) => {
    fn();
    setEnviado(false);
  };

  return (
    <div className="rt-calc">
      <div className="rt-calc__casa">
        <svg viewBox="0 0 64 48" aria-hidden>
          <path d="M6 24 32 6l26 18" />
          <path d="M12 20v22h40V20" />
          <path d="M27 42V30h10v12" />
          <path d="M17 26h6v6h-6zM41 26h6v6h-6z" />
        </svg>
        <div>
          <p className="rt-calc__lugar">Casa moderna · Tejar, Cartago</p>
          <p className="rt-calc__datos">3 habitaciones · 2 baños · 180 m²</p>
        </div>
      </div>

      <label className="rt-rango">
        <span className="rt-rango__cabeza">
          <span>Precio de la propiedad</span>
          <b>${miles(precio)}</b>
        </span>
        <input type="range" min={60000} max={400000} step={5000} value={precio} onChange={(ev) => cambiar(() => setPrecio(Number(ev.target.value)))} />
      </label>

      <div className="rt-calc__opciones">
        <div className="rt-grupo" role="group" aria-label="Prima">
          <span>Prima</span>
          {[10, 15, 20, 30].map((p) => (
            <button key={p} type="button" aria-pressed={prima === p} onClick={() => cambiar(() => setPrima(p))}>
              {p}%
            </button>
          ))}
        </div>
        <div className="rt-grupo" role="group" aria-label="Plazo">
          <span>Plazo</span>
          {[15, 20, 25, 30].map((a) => (
            <button key={a} type="button" aria-pressed={anos === a} onClick={() => cambiar(() => setAnos(a))}>
              {a} años
            </button>
          ))}
        </div>
      </div>

      <ol className="rt-bancos" aria-live="polite">
        {filas.map((f, i) => (
          <motion.li key={f.nombre} layout transition={{ duration: 0.4, ease: EASE }} data-mejor={i === 0 ? "true" : undefined}>
            <span className="rt-bancos__nombre">
              {f.nombre}
              <small>{f.tasa.toFixed(2).replace(".", ",")}%</small>
            </span>
            {i === 0 ? <em>la más baja</em> : null}
            <b>
              ${miles(f.cuota)}
              <small>/mes</small>
            </b>
          </motion.li>
        ))}
      </ol>

      <div className="rt-calc__pie">
        <button type="button" className="rt-accion" onClick={() => setEnviado(true)} disabled={enviado}>
          {enviado ? `✓ El asesor recibió tu cuota de ${filas[0]!.nombre}` : "Quiero esta cuota"}
        </button>
        <p className="rt-nota">Tasas de ejemplo</p>
      </div>
    </div>
  );
}

/* ── 02 · Onvi: a las 11:48 p. m., con la agenda de verdad ──────────── */

type Mensaje = { de: "cliente" | "onvi" | "sistema"; texto: string };
const HORAS = ["9:00 a. m.", "11:30 a. m.", "4:15 p. m."];

export function Chat({ enVista }: { enVista: boolean }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [escribe, setEscribe] = useState(false);
  const [opciones, setOpciones] = useState(false);
  const [vuelta, setVuelta] = useState(0);
  const arrancada = useRef(-1);
  const luego = useLuego();
  const lista = useRef<HTMLDivElement>(null);

  // El principio de la charla arranca cuando se ve. Si se va de la pantalla a
  // la mitad, al volver empieza de nuevo (y cada arranque limpia sus tiempos).
  useEffect(() => {
    if (!enVista || arrancada.current === vuelta) return;
    const ids = [
      window.setTimeout(() => {
        setEscribe(false);
        setMensajes([{ de: "cliente", texto: "Hola, ¿tienen espacio mañana para una limpieza dental?" }]);
      }, 350),
      window.setTimeout(() => setEscribe(true), 1000),
      window.setTimeout(() => {
        setEscribe(false);
        setMensajes((m) => [...m, { de: "onvi", texto: "¡Hola! Sí 🙂 Mañana me quedan tres espacios. ¿Cuál te sirve?" }]);
        setOpciones(true);
        arrancada.current = vuelta;
      }, 2200),
    ];
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [enVista, vuelta]);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, escribe]);

  const elegir = (hora: string) => {
    setOpciones(false);
    setMensajes((m) => [...m, { de: "cliente", texto: hora }]);
    luego(450, () => setEscribe(true));
    luego(1500, () => {
      setEscribe(false);
      setMensajes((m) => [
        ...m,
        { de: "onvi", texto: `Listo, te agendé mañana a las ${hora}. Te llega un recordatorio por WhatsApp dos horas antes.` },
        { de: "sistema", texto: `Cita creada en el Panel · Limpieza dental · mañana ${hora}` },
      ]);
    });
  };

  const otraVez = () => {
    setMensajes([]);
    setOpciones(false);
    setEscribe(false);
    setVuelta((v) => v + 1);
  };

  const listo = mensajes.some((m) => m.de === "sistema");

  return (
    <div className="rt-chat">
      <div className="rt-chat__cabeza">
        <span className="rt-chat__avatar">
          <Ojo />
        </span>
        <span>
          <b>Onvi</b>
          <small>
            <i aria-hidden /> en línea · 11:48 p. m.
          </small>
        </span>
      </div>
      <div ref={lista} className="rt-chat__lista" aria-live="polite">
        <AnimatePresence initial={false}>
          {mensajes.map((m, i) => (
            <motion.p
              key={`${vuelta}-${i}`}
              className={`rt-chat__msg rt-chat__msg--${m.de}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {m.de === "sistema" ? <span aria-hidden>✓ </span> : null}
              {m.texto}
            </motion.p>
          ))}
        </AnimatePresence>
        {escribe ? (
          <p className="rt-chat__msg rt-chat__msg--onvi rt-chat__escribe" aria-label="Onvi está escribiendo">
            <i />
            <i />
            <i />
          </p>
        ) : null}
      </div>
      <div className="rt-chat__pie">
        {opciones ? (
          <div className="rt-grupo rt-grupo--horas" role="group" aria-label="Elegí una hora">
            {HORAS.map((h) => (
              <button key={h} type="button" onClick={() => elegir(h)}>
                {h}
              </button>
            ))}
          </div>
        ) : listo ? (
          <button type="button" className="rt-otra" onClick={otraVez}>
            ↻ Otra vez
          </button>
        ) : (
          <p className="rt-nota">Onvi lee la agenda y responde solo…</p>
        )}
      </div>
    </div>
  );
}

/* ── 03 · Software: rutas, facturación electrónica e inventario en un lugar ── */

type Conteo = { leche: number; yogurt: number; queso: number };
const PRODUCTOS: { id: keyof Conteo; nombre: string }[] = [
  { id: "leche", nombre: "Leche 1 L" },
  { id: "yogurt", nombre: "Yogurt" },
  { id: "queso", nombre: "Queso" },
];
const PRECIO: Conteo = { leche: 950, yogurt: 1200, queso: 2800 };
const CARGA: Conteo = { leche: 60, yogurt: 24, queso: 12 };
const PARADA: Conteo = { leche: 20, yogurt: 8, queso: 4 };
const PARADAS = ["Pulpería La Esquina", "Súper Don Beto", "Soda El Parque"];
const suma = (c: Conteo) => c.leche + c.yogurt + c.queso;
const valor = (c: Conteo) => c.leche * PRECIO.leche + c.yogurt * PRECIO.yogurt + c.queso * PRECIO.queso;
const menos = (a: Conteo, b: Conteo): Conteo => ({ leche: a.leche - b.leche, yogurt: a.yogurt - b.yogurt, queso: a.queso - b.queso });
const hora = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

type Parada = { nombre: string; entregada: boolean; factura?: { numero: string; aceptada: boolean } };
const nuevaRuta = (): Parada[] => PARADAS.map((nombre) => ({ nombre, entregada: false }));

export function TodoEnUno() {
  const [bodega, setBodega] = useState<Conteo>({ leche: 120, yogurt: 72, queso: 36 });
  const [camion, setCamion] = useState<Conteo>({ ...CARGA });
  const [paradas, setParadas] = useState<Parada[]>(nuevaRuta);
  const [numero, setNumero] = useState(128);
  const [facturas, setFacturas] = useState(0);
  const [log, setLog] = useState<string[]>(["08:02 · Ruta 03 cargó 96 productos", "07:58 · Bodega abrió con 324 productos"]);
  const [reloj, setReloj] = useState(8 * 60 + 2);
  const luego = useLuego();

  const anotar = (texto: string) => {
    const t = reloj + 4;
    setReloj(t);
    setLog((l) => [`${hora(t)} · ${texto}`, ...l].slice(0, 3));
  };

  const vacio = suma(camion) === 0;
  const siguiente = paradas.findIndex((p) => !p.entregada);
  const puedeEntregar = !vacio && siguiente >= 0;
  const puedeCargar = vacio && bodega.leche >= CARGA.leche && bodega.yogurt >= CARGA.yogurt && bodega.queso >= CARGA.queso;

  // Al entregar baja el camión y la factura electrónica sale sola, con lo que se bajó.
  const entregar = () => {
    if (!puedeEntregar) return;
    const k = siguiente;
    const fe = `FE-${String(numero).padStart(5, "0")}`;
    setNumero((n) => n + 1);
    setFacturas((f) => f + 1);
    setCamion((c) => menos(c, PARADA));
    setParadas((ps) => ps.map((p, i) => (i === k ? { ...p, entregada: true, factura: { numero: fe, aceptada: false } } : p)));
    anotar(`${PARADAS[k]}: 32 productos y ${fe}`);
    luego(1000, () => setParadas((ps) => ps.map((p, i) => (i === k && p.factura ? { ...p, factura: { ...p.factura, aceptada: true } } : p))));
  };

  const cargar = () => {
    if (!puedeCargar) return;
    setBodega((b) => menos(b, CARGA));
    setCamion({ ...CARGA });
    setParadas(nuevaRuta());
    anotar("Ruta 03 cargó 96 productos");
  };

  const reponer = () => {
    setBodega((b) => ({ leche: b.leche + 120, yogurt: b.yogurt + 48, queso: b.queso + 24 }));
    anotar("Planta pasó 192 productos a bodega");
  };

  const columnas: { nombre: string; conteo: Conteo }[] = [
    { nombre: "Bodega", conteo: bodega },
    { nombre: "Camión · ruta 03", conteo: camion },
  ];

  return (
    <div className="rt-inv">
      <div className="rt-inv__columnas">
        {columnas.map((c) => (
          <div key={c.nombre} className="rt-inv__col">
            <p className="rt-inv__nombre">
              {c.nombre}
              <b>{suma(c.conteo)}</b>
            </p>
            <ul>
              {PRODUCTOS.map((p) => (
                <li key={p.id}>
                  <span>{p.nombre}</span>
                  <motion.b key={c.conteo[p.id]} initial={{ opacity: 0.2, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {c.conteo[p.id]}
                  </motion.b>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="rt-inv__col rt-inv__col--facturas">
          <p className="rt-inv__nombre">Facturación electrónica</p>
          <motion.b key={facturas} className="rt-inv__monto" initial={{ opacity: 0.2, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            ₡{miles(facturas * valor(PARADA))}
          </motion.b>
          <small>
            {facturas} {facturas === 1 ? "factura" : "facturas"} hoy
          </small>
        </div>
      </div>

      <ol className="rt-inv__paradas" aria-live="polite">
        {paradas.map((p, i) => (
          <li key={p.nombre} data-entregada={p.entregada ? "true" : undefined} data-siguiente={i === siguiente && !vacio ? "true" : undefined}>
            <span className="rt-inv__parada">
              <i aria-hidden>{i + 1}</i>
              {p.nombre}
            </span>
            <span className="rt-inv__estado">{p.entregada ? "✓ Entregada" : i === siguiente && !vacio ? "Siguiente" : "Pendiente"}</span>
            <span className="rt-inv__factura" data-aceptada={p.factura?.aceptada ? "true" : undefined} data-vacia={p.factura ? undefined : "true"}>
              {p.factura ? `${p.factura.numero} · ₡${miles(valor(PARADA))} · ${p.factura.aceptada ? "Aceptada ✓" : "Enviando…"}` : "—"}
            </span>
          </li>
        ))}
      </ol>

      <div className="rt-inv__acciones">
        <button type="button" onClick={entregar} disabled={!puedeEntregar}>
          Entregar en la siguiente parada
        </button>
        <button type="button" onClick={cargar} disabled={!puedeCargar}>
          Cargar ruta 03
        </button>
        <button type="button" onClick={reponer}>
          Reponer bodega
        </button>
      </div>

      <div className="rt-inv__pie">
        <p className="rt-inv__cuadra">
          <i aria-hidden /> Inventario, ruta y facturas cuadran: 0 de diferencia
        </p>
        <ol className="rt-inv__log">
          {log.map((l, i) => (
            <li key={`${i}-${l}`}>{l}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ── 04 · Apps: sigue funcionando sin señal ─────────────────────────── */

type Gasto = { id: number; nombre: string; monto: number; estado: "ok" | "pendiente" | "subiendo" };
const ATAJOS = [
  { nombre: "Almuerzo", monto: 4500 },
  { nombre: "Bus", monto: 650 },
  { nombre: "Café", monto: 1200 },
];

export function SinSenal() {
  const [senal, setSenal] = useState(true);
  const [gastos, setGastos] = useState<Gasto[]>([
    { id: 1, nombre: "Supermercado", monto: 18450, estado: "ok" },
    { id: 2, nombre: "Gasolina", monto: 25000, estado: "ok" },
  ]);
  const siguiente = useRef(3);
  const luego = useLuego();
  const pendientes = gastos.filter((g) => g.estado !== "ok").length;
  const total = gastos.reduce((s, g) => s + g.monto, 0);

  const subir = (ids: number[]) => {
    const poner = (estado: Gasto["estado"]) => setGastos((gs) => gs.map((g) => (ids.includes(g.id) ? { ...g, estado } : g)));
    poner("subiendo");
    luego(900, () => poner("ok"));
  };

  const agregar = (a: (typeof ATAJOS)[number]) => {
    const id = siguiente.current++;
    const nuevo: Gasto = { id, nombre: a.nombre, monto: a.monto, estado: "pendiente" };
    setGastos((gs) => [nuevo, ...gs].slice(0, 6));
    if (senal) luego(50, () => subir([id]));
  };

  const alternar = () => {
    const nueva = !senal;
    setSenal(nueva);
    if (nueva) subir(gastos.filter((g) => g.estado === "pendiente").map((g) => g.id));
  };

  return (
    <div className="rt-app">
      <div className="rt-app__lado">
        <button type="button" className="rt-app__senal" aria-pressed={!senal} onClick={alternar}>
          <span className="rt-app__switch" aria-hidden>
            <i />
          </span>
          {senal ? "Quitar la señal" : "Volver a tener señal"}
        </button>
        <p className="rt-nota">Agregá gastos con y sin señal: nada se pierde.</p>
        <div className="rt-grupo rt-grupo--columna" role="group" aria-label="Agregar un gasto">
          {ATAJOS.map((a) => (
            <button key={a.nombre} type="button" onClick={() => agregar(a)}>
              + {a.nombre} <small>₡{miles(a.monto)}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="rt-app__telefono" data-senal={senal ? "si" : "no"}>
        <p className="rt-app__barra">
          <span>9:41</span>
          <span aria-hidden>{senal ? "▂▄▆█" : "✈"}</span>
        </p>
        <p className="rt-app__titulo">Mis gastos</p>
        <p className="rt-app__total">
          ₡{miles(total)}
          <small>hoy</small>
        </p>
        <p className={`rt-app__aviso${!senal ? " is-sin" : ""}`} aria-live="polite">
          {!senal ? `Sin señal · ${pendientes} ${pendientes === 1 ? "cambio guardado" : "cambios guardados"} en el teléfono` : pendientes ? "Sincronizando…" : "✓ Todo al día"}
        </p>
        <ul className="rt-app__lista">
          <AnimatePresence initial={false}>
            {gastos.map((g) => (
              <motion.li
                key={g.id}
                layout
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                data-estado={g.estado}
              >
                <span>{g.nombre}</span>
                <b>₡{miles(g.monto)}</b>
                <i aria-label={g.estado === "ok" ? "sincronizado" : g.estado === "subiendo" ? "subiendo" : "guardado en el teléfono"} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

/* ── 05 · Panel Onvi: quién reservó, quién escribió y qué falta ─────── */

type Tipo = "reserva" | "formulario" | "soporte";
type Evento = { tipo: Tipo; quien: string; texto: string };
const EVENTOS: Evento[] = [
  { tipo: "reserva", quien: "Tatiana Mora", texto: "Limpieza dental · mañana 11:15 a. m." },
  { tipo: "formulario", quien: "Andrés Rojas", texto: "Cotización: sitio web con reservas" },
  { tipo: "soporte", quien: "Karla Cordero", texto: "¿Puedo cambiar el horario del sábado?" },
  { tipo: "reserva", quien: "Luis Vargas", texto: "Consulta general · jueves 4:30 p. m." },
  { tipo: "formulario", quien: "Diego Solano", texto: "Quiero una tienda para mi marca de café" },
  { tipo: "reserva", quien: "Sofía Jiménez", texto: "Ortodoncia · viernes 9:00 a. m." },
  { tipo: "soporte", quien: "Mario Quesada", texto: "No me llegó la factura de octubre" },
];
const NOMBRE_TIPO: Record<Tipo, string> = { reserva: "Reserva", formulario: "Formulario", soporte: "Soporte" };
const FILTROS: { id: Tipo | "todo"; nombre: string }[] = [
  { id: "todo", nombre: "Todo" },
  { id: "reserva", nombre: "Reservas" },
  { id: "formulario", nombre: "Formularios" },
  { id: "soporte", nombre: "Soporte" },
];

export function PanelVivo({ enVista }: { enVista: boolean }) {
  const [feed, setFeed] = useState<(Evento & { id: number; hecho: boolean })[]>(() =>
    EVENTOS.slice(0, 3)
      .reverse()
      .map((e, i) => ({ ...e, id: i, hecho: false })),
  );
  const [filtro, setFiltro] = useState<Tipo | "todo">("todo");
  const proximo = useRef(3);

  useEffect(() => {
    if (!enVista) return;
    const id = window.setInterval(() => {
      const n = proximo.current++;
      const e = EVENTOS[n % EVENTOS.length]!;
      setFeed((f) => [{ ...e, id: n, hecho: false }, ...f].slice(0, 7));
    }, 2600);
    return () => window.clearInterval(id);
  }, [enVista]);

  const visibles = feed.filter((e) => filtro === "todo" || e.tipo === filtro).slice(0, 5);
  const cuenta = (t: Tipo | "todo") => feed.filter((e) => (t === "todo" || e.tipo === t) && !e.hecho).length;
  const resolver = (id: number) => setFeed((f) => f.map((e) => (e.id === id ? { ...e, hecho: true } : e)));

  return (
    <div className="rt-panel">
      <div className="rt-panel__filtros" role="group" aria-label="Filtrar">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.nombre}
            <small>{cuenta(f.id)}</small>
          </button>
        ))}
      </div>
      <ul className="rt-panel__lista" aria-live="polite">
        <AnimatePresence initial={false}>
          {visibles.map((e) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              data-tipo={e.tipo}
              data-hecho={e.hecho ? "true" : undefined}
            >
              <span className="rt-panel__tipo">{NOMBRE_TIPO[e.tipo]}</span>
              <span className="rt-panel__texto">
                <b>{e.quien}</b>
                {e.texto}
              </span>
              <button type="button" onClick={() => resolver(e.id)} disabled={e.hecho}>
                {e.hecho ? "✓ Listo" : e.tipo === "reserva" ? "Confirmar" : "Responder"}
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="rt-panel__pie">
        <i aria-hidden /> Recordatorio automático 2 h antes de cada cita
      </p>
    </div>
  );
}

/* ── 06 · Tu marca: se lee igual en 16 px y en un rótulo de 6 m ─────── */

const ETAPAS = [
  { hasta: 25, nombre: "Pestaña del navegador", tamano: "16 px", version: "Ícono" },
  { hasta: 50, nombre: "Foto de perfil", tamano: "110 px", version: "Ícono en círculo" },
  { hasta: 75, nombre: "Encabezado del sitio", tamano: "240 px", version: "Horizontal" },
  { hasta: 101, nombre: "Rótulo del local", tamano: "6 m", version: "Completa" },
];

export function Marca() {
  const [valor, setValor] = useState(10);
  const k = ETAPAS.findIndex((e) => valor < e.hasta);
  const etapa = ETAPAS[k]!;

  return (
    <div className="rt-marca">
      <div className="rt-marca__escena" data-etapa={k}>
        <AnimatePresence mode="wait">
          <motion.div
            key={k}
            className="rt-marca__cuadro"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {k === 0 ? (
              <div className="rt-marca__pestanas">
                <span className="rt-marca__pestana is-on">
                  <Ojo className="rt-marca__fav" />
                  Onvision Digital
                </span>
                <span className="rt-marca__pestana">Correo</span>
                <span className="rt-marca__pestana">Mapas</span>
              </div>
            ) : k === 1 ? (
              <div className="rt-marca__perfil">
                <span className="rt-marca__avatar">
                  <Ojo />
                </span>
                <span>
                  <b>onvisiondigital</b>
                  <small>Sitios · Tiendas · Software</small>
                </span>
              </div>
            ) : k === 2 ? (
              <div className="rt-marca__sitio">
                <span className="rt-marca__horizontal">
                  <Ojo />
                  onvision<i>.</i>
                </span>
                <span className="rt-marca__menu">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            ) : (
              <div className="rt-marca__rotulo">
                <span className="rt-marca__letrero">
                  <Ojo />
                  onvision<i>.</i>
                </span>
                <span className="rt-marca__medida" aria-hidden>
                  6 m
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <label className="rt-rango">
        <span className="rt-rango__cabeza">
          <span>
            {etapa.nombre} · <small>versión {etapa.version.toLowerCase()}</small>
          </span>
          <b>{etapa.tamano}</b>
        </span>
        <input type="range" min={0} max={100} value={valor} onChange={(ev) => setValor(Number(ev.target.value))} style={{ "--v": `${valor}%` } as CSSProperties} />
      </label>
      <ol className="rt-marca__marcas" aria-hidden>
        {ETAPAS.map((e, i) => (
          <li key={e.nombre} data-on={i === k ? "true" : undefined}>
            {e.tamano}
          </li>
        ))}
      </ol>
      <p className="rt-nota">La versión chica no es la grande achicada: cada tamaño tiene la suya.</p>
    </div>
  );
}
