"use client";

import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from "react";
import type { Vivo } from "./mas";
import "./sistemas.css";

/**
 * Los dos sistemas de Software que se ven funcionando en "Más información"
 * (en vez de una captura): la agenda de los negocios con citas y el resumen
 * de ventas de los que venden y producen. Cada uno tiene una pestaña por
 * industria que cambia sola; las mismas industrias son las etiquetas del
 * texto de la sección, y tocar cualquiera de las dos cambia el sistema.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

const Ok = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M4 8.5l2.6 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── La agenda: negocios con citas y clientes ─────────────────────────── */

type EstadoCita = "confirmada" | "recordatorio" | "pagada" | "libre";

const ESTADO_CITA: Record<EstadoCita, string> = {
  confirmada: "Confirmada",
  recordatorio: "Recordatorio enviado",
  pagada: "Pagada",
  libre: "Libre",
};

type Cita = { hora: string; quien: string; que: string; estado: EstadoCita };

type DiaAgenda = {
  pestaña: string;
  dia: string;
  citas: readonly Cita[];
  numeros: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
};

const libre = (hora: string, que = "Disponible para reservar en línea"): Cita => ({ hora, quien: "Espacio libre", que, estado: "libre" });

export const AGENDA: readonly DiaAgenda[] = [
  {
    pestaña: "Clínicas",
    dia: "Jueves · 12 citas · 2 espacios libres",
    citas: [
      { hora: "09:00", quien: "Laura Méndez", que: "Consulta general · Historial actualizado", estado: "confirmada" },
      { hora: "10:30", quien: "Carlos Ruiz", que: "Control mensual", estado: "recordatorio" },
      { hora: "11:15", quien: "Ana Torres", que: "Primera visita · Pago en línea", estado: "pagada" },
      libre("14:00"),
    ],
    numeros: [
      ["Citas de la semana", "64"],
      ["Recordatorios enviados", "118"],
      ["Facturado hoy", "$1.480"],
    ],
  },
  {
    pestaña: "Salones",
    dia: "Viernes · 18 citas · 3 espacios libres",
    citas: [
      { hora: "09:00", quien: "Valeria Solís", que: "Corte y color · Con Andrea", estado: "confirmada" },
      { hora: "10:00", quien: "Diego Mora", que: "Barba y corte", estado: "recordatorio" },
      { hora: "11:30", quien: "Sofía Vargas", que: "Manicure · Pago con SINPE", estado: "pagada" },
      libre("13:00"),
    ],
    numeros: [
      ["Citas de la semana", "92"],
      ["Recordatorios enviados", "156"],
      ["Facturado hoy", "$860"],
    ],
  },
  {
    pestaña: "Gimnasios",
    dia: "Lunes · 6 clases · 40 cupos libres",
    citas: [
      { hora: "06:00", quien: "Clase funcional", que: "18 de 20 cupos · Con Pablo", estado: "confirmada" },
      { hora: "07:30", quien: "Marco Jiménez", que: "Evaluación física", estado: "recordatorio" },
      { hora: "12:00", quien: "Paula Rojas", que: "Renovación de membresía", estado: "pagada" },
      libre("18:00", "Spinning · 4 cupos para reservar"),
    ],
    numeros: [
      ["Clases de la semana", "42"],
      ["Recordatorios enviados", "210"],
      ["Facturado hoy", "$640"],
    ],
  },
  {
    pestaña: "Talleres",
    dia: "Martes · 9 citas · 1 espacio libre",
    citas: [
      { hora: "08:00", quien: "Toyota Hilux · BCD-123", que: "Cambio de aceite", estado: "confirmada" },
      { hora: "09:30", quien: "Kia Rio · MNP-456", que: "Revisión de frenos", estado: "recordatorio" },
      { hora: "11:00", quien: "Honda CR-V · ZXY-789", que: "Listo para entregar · Pago en línea", estado: "pagada" },
      libre("15:00"),
    ],
    numeros: [
      ["Citas de la semana", "38"],
      ["Recordatorios enviados", "75"],
      ["Facturado hoy", "$2.150"],
    ],
  },
  {
    pestaña: "Escuelas",
    dia: "Miércoles · 8 clases · 2 tutorías libres",
    citas: [
      { hora: "08:00", quien: "Inglés intermedio", que: "Grupo B · 14 estudiantes", estado: "confirmada" },
      { hora: "10:00", quien: "Mateo Brenes", que: "Tutoría de matemática", estado: "recordatorio" },
      { hora: "13:00", quien: "Lucía Pérez", que: "Matrícula · Pago de mensualidad", estado: "pagada" },
      libre("16:00", "Tutoría para reservar en línea"),
    ],
    numeros: [
      ["Clases de la semana", "56"],
      ["Recordatorios enviados", "190"],
      ["Facturado hoy", "$1.120"],
    ],
  },
  {
    pestaña: "Despachos",
    dia: "Jueves · 7 citas · 2 espacios libres",
    citas: [
      { hora: "09:00", quien: "Andrés Rojas", que: "Consulta legal · Expediente al día", estado: "confirmada" },
      { hora: "10:30", quien: "Empresa Sol S.A.", que: "Revisión de contrato", estado: "recordatorio" },
      { hora: "12:00", quien: "María Quesada", que: "Declaración de renta · Pago en línea", estado: "pagada" },
      libre("15:30"),
    ],
    numeros: [
      ["Citas de la semana", "28"],
      ["Recordatorios enviados", "61"],
      ["Facturado hoy", "$1.900"],
    ],
  },
];

/* ── Ventas e inventario: negocios que venden y producen ──────────────── */

type Tono = "alerta" | "ok" | "info";

type Pendiente = { que: string; detalle: string; estado: string; tono: Tono };

type DiaVentas = {
  pestaña: string;
  numeros: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  semana: readonly number[];
  pendientes: readonly [Pendiente, Pendiente, Pendiente];
};

const aviso = (cliente: string, detalle = "Factura pendiente"): Pendiente => ({
  que: `Cliente: ${cliente}`,
  detalle,
  estado: "Aviso enviado",
  tono: "info",
});

export const VENTAS: readonly DiaVentas[] = [
  {
    pestaña: "Restaurante",
    numeros: [
      ["Ventas del día", "$1.860"],
      ["Órdenes", "128"],
      ["Por cobrar", "$90"],
    ],
    semana: [40, 52, 46, 60, 58, 92, 70],
    pendientes: [
      { que: "Pollo a la plancha", detalle: "Quedan 6 porciones", estado: "Reponer", tono: "alerta" },
      { que: "Pedido #218", detalle: "Express · Llega en 20 min", estado: "En camino", tono: "ok" },
      aviso("Hotel Arenal"),
    ],
  },
  {
    pestaña: "Tienda",
    numeros: [
      ["Ventas del día", "$2.340"],
      ["Pedidos", "47"],
      ["Por cobrar", "$560"],
    ],
    semana: [34, 44, 38, 52, 46, 80, 40],
    pendientes: [
      { que: "Camiseta azul · M", detalle: "Quedan 3", estado: "Reponer", tono: "alerta" },
      { que: "Pedido #1042", detalle: "Entrega hoy · Ruta 2", estado: "En camino", tono: "ok" },
      aviso("Super Sol"),
    ],
  },
  {
    pestaña: "Distribuidora",
    numeros: [
      ["Ventas del día", "$8.920"],
      ["Pedidos", "63"],
      ["Por cobrar", "$3.150"],
    ],
    semana: [60, 72, 66, 84, 78, 96, 58],
    pendientes: [
      { que: "Leche entera 1 L", detalle: "Quedan 24 cajas", estado: "Reponer", tono: "alerta" },
      { que: "Pedido #3310", detalle: "Ruta 5 · 12 entregas", estado: "En camino", tono: "ok" },
      aviso("Abastecedor La Esquina"),
    ],
  },
  {
    pestaña: "Finca",
    numeros: [
      ["Ventas del día", "$3.410"],
      ["Pedidos", "18"],
      ["Por cobrar", "$1.200"],
    ],
    semana: [20, 36, 28, 64, 40, 88, 52],
    pendientes: [
      { que: "Fertilizante 15-15-15", detalle: "Quedan 4 sacos", estado: "Reponer", tono: "alerta" },
      { que: "Envío #88", detalle: "265 kg de plátano · Guápiles", estado: "En camino", tono: "ok" },
      aviso("Mercado Central"),
    ],
  },
  {
    pestaña: "Inmobiliaria",
    numeros: [
      ["Cobrado hoy", "$4.800"],
      ["Visitas", "9"],
      ["Por cobrar", "$12.400"],
    ],
    semana: [30, 22, 48, 36, 58, 74, 44],
    pendientes: [
      { que: "Apartamento 4B", detalle: "2 interesados", estado: "Visita hoy", tono: "alerta" },
      { que: "Reserva #57", detalle: "Firma el viernes", estado: "En trámite", tono: "ok" },
      aviso("Familia Araya", "Cuota pendiente"),
    ],
  },
  {
    pestaña: "Autos",
    numeros: [
      ["Ventas del día", "$26.500"],
      ["Consultas", "31"],
      ["Por cobrar", "$8.200"],
    ],
    semana: [44, 56, 40, 70, 62, 90, 48],
    pendientes: [
      { que: "Toyota Corolla 2020", detalle: "Prueba de manejo · 3 p. m.", estado: "Agendada", tono: "alerta" },
      { que: "Traspaso #77", detalle: "Papeles en el registro", estado: "En trámite", tono: "ok" },
      aviso("Andrés Solano", "Prima pendiente"),
    ],
  },
];

export const INDUSTRIAS: Record<Vivo, number> = { agenda: AGENDA.length, ventas: VENTAS.length };

/* ── La tarjeta ───────────────────────────────────────────────────────── */

function Pestañas({ nombres, activa, alElegir }: { nombres: readonly string[]; activa: number; alElegir: (i: number) => void }) {
  const fila = useRef<HTMLDivElement>(null);
  // La pestaña activa siempre a la vista (la fila corre de lado, la página no se mueve).
  useEffect(() => {
    const el = fila.current;
    const boton = el?.children[activa] as HTMLElement | undefined;
    if (!el || !boton) return;
    const fuera = boton.offsetLeft + boton.offsetWidth > el.scrollLeft + el.clientWidth - 24 || boton.offsetLeft < el.scrollLeft;
    if (fuera) el.scrollTo({ left: boton.offsetLeft - 8, behavior: "smooth" });
  }, [activa]);
  return (
    <div ref={fila} className="sv__pestañas" role="group" aria-label="Tipo de negocio">
      {nombres.map((n, i) => (
        <button key={n} type="button" aria-pressed={i === activa} onClick={() => alElegir(i)}>
          {n}
        </button>
      ))}
    </div>
  );
}

function Lado({ items, activo }: { items: readonly string[]; activo: string }) {
  return (
    <aside className="sv__lado" aria-hidden>
      <b>
        Onvi ·<br />
        Sistema
      </b>
      <ul>
        {items.map((it) => (
          <li key={it} data-on={it === activo || undefined}>
            {it}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Agenda({ activa, alElegir }: { activa: number; alElegir: (i: number) => void }) {
  const d = AGENDA[activa]!;
  return (
    <>
      <Lado items={["Agenda", "Clientes", "Recordatorios", "Cobros", "Facturas", "Reportes"]} activo="Agenda" />
      <div className="sv__main">
        <Pestañas nombres={AGENDA.map((x) => x.pestaña)} activa={activa} alElegir={alElegir} />
        <div key={activa} className="sv__cambia">
          <p className="sv__titulo">
            <b>Agenda de hoy</b>
            <small>{d.dia}</small>
          </p>
          <ul className="sv__citas">
            {d.citas.map((c, i) => (
              <li key={c.hora} style={v({ "--i": i })}>
                <time>{c.hora}</time>
                <span>
                  <b>{c.quien}</b>
                  <small>{c.que}</small>
                </span>
                <em data-e={c.estado}>{ESTADO_CITA[c.estado]}</em>
              </li>
            ))}
          </ul>
          <div className="sv__numeros">
            {d.numeros.map(([etiqueta, valor], i) => (
              <p key={etiqueta} data-oscuro={i === 2 || undefined} style={v({ "--i": i })}>
                <small>{etiqueta}</small>
                <b>{valor}</b>
              </p>
            ))}
          </div>
        </div>
      </div>
      <div key={`a-${activa}`} className="sv-toasts" aria-hidden>
        <p className="pz-pop sv-toast sv-toast--arriba" style={v({ "--d": "500ms", "--z": 22 })}>
          <i className="sv-toast__ok">
            <Ok />
          </i>
          Recordatorio enviado por WhatsApp
        </p>
        <p className="pz-pop sv-toast sv-toast--abajo" style={v({ "--d": "1300ms", "--z": 16 })}>
          <i className="sv-toast__ok">
            <Ok />
          </i>
          Factura electrónica emitida
        </p>
      </div>
    </>
  );
}

function Ventas({ activa, alElegir }: { activa: number; alElegir: (i: number) => void }) {
  const d = VENTAS[activa]!;
  const max = Math.max(...d.semana);
  return (
    <>
      <Lado items={["Caja", "Resumen", "Inventario", "Pedidos", "Cobros", "Reportes"]} activo="Resumen" />
      <div className="sv__main">
        <Pestañas nombres={VENTAS.map((x) => x.pestaña)} activa={activa} alElegir={alElegir} />
        <div key={activa} className="sv__cambia">
          <p className="sv__titulo">
            <b>Resumen de hoy</b>
            <small>Todo se actualiza con cada venta</small>
          </p>
          <div className="sv__numeros sv__numeros--ventas">
            {d.numeros.map(([etiqueta, valor], i) => (
              <p key={etiqueta} data-oscuro={i === 0 || undefined} style={v({ "--i": i })}>
                <small>{etiqueta}</small>
                <b>{valor}</b>
              </p>
            ))}
          </div>
          <div className="sv__abajo">
            <div className="sv__grafico">
              <small>Ventas de la semana</small>
              <span className="sv__barras">
                {d.semana.map((n, i) => (
                  <i key={i} data-max={n === max || undefined} style={v({ "--h": n / max, "--i": i })} />
                ))}
              </span>
            </div>
            <ul className="sv__pendientes">
              {d.pendientes.map((p, i) => (
                <li key={p.que} style={v({ "--i": i })}>
                  <span>
                    <b>{p.que}</b>
                    <small>{p.detalle}</small>
                  </span>
                  <em data-t={p.tono}>{p.estado}</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div key={`v-${activa}`} className="sv-toasts" aria-hidden>
        <p className="pz-pop sv-toast sv-toast--arriba sv-toast--derecha" style={v({ "--d": "500ms", "--z": 22 })}>
          <i className="sv-toast__ok">
            <Ok />
          </i>
          Inventario actualizado
        </p>
        <p className="pz-pop sv-toast sv-toast--abajo" style={v({ "--d": "1300ms", "--z": 16 })}>
          <i className="sv-toast__ok sv-toast__ok--plata">$</i>
          Venta registrada · factura emitida
        </p>
      </div>
    </>
  );
}

/** La tarjeta de la sección: el sistema armado en la página, con su industria activa. */
export default function Sistema({
  vivo,
  activa,
  alElegir,
  etiqueta,
  ...resto
}: {
  vivo: Vivo;
  activa: number;
  alElegir: (i: number) => void;
  etiqueta: string;
} & Pick<HTMLAttributes<HTMLDivElement>, "onPointerEnter" | "onPointerLeave">) {
  return (
    <div className={`sv sv--${vivo}`} role="group" aria-label={etiqueta} {...resto}>
      {vivo === "agenda" ? <Agenda activa={activa} alElegir={alElegir} /> : <Ventas activa={activa} alElegir={alElegir} />}
    </div>
  );
}
