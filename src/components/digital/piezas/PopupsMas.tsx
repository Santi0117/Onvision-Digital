"use client";

import type { CSSProperties, JSX } from "react";
import { Cuenta } from "./Popups";

/**
 * Los pop-ups de las secciones de "Más información": cada sección tiene su
 * mundo, sacado del diseño de su captura (la tienda deportiva, el plano de
 * la página de bienes raíces, el sistema de la clínica, el chat del taller
 * y el monitor y el soporte del Panel Onvi), y sus pop-ups hablan ese
 * idioma. Son decorado: lo que cuentan también está en el texto de la
 * sección. Los dos de Software no tienen: su tarjeta es el sistema
 * funcionando (ver Sistemas).
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

const Ok = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M4 8.5l2.6 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Flecha de mouse, para los botones que "se tocan" solos. */
const Puntero = ({ className }: { className: string }) => (
  <svg viewBox="0 0 20 24" className={className} aria-hidden>
    <path d="M2 1.5v17.2l4.6-4.2 3 7 3.2-1.4-3-6.8 6.4-.2z" fill="#fff" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

/* ── Páginas web · la tienda: azul de camiseta, etiquetas de oferta ───── */

function Tienda() {
  return (
    <>
      <div className="pz-pop mt-oferta" style={v({ "--d": "120ms", "--z": 24 })}>
        <b>−17%</b>
        <span>oferta</span>
      </div>
      <div className="pz-pop mt-carrito" style={v({ "--d": "300ms", "--z": 18 })}>
        <span className="mt-carrito__icono">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M1.5 2.5h2l1.6 7.6h7.2l1.6-5.6H4.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="6.2" cy="13" r="1.1" fill="currentColor" />
            <circle cx="11.6" cy="13" r="1.1" fill="currentColor" />
          </svg>
          <i>1</i>
        </span>
        <span>
          <b>Agregado al carrito</b>
          <small>Lakers Dončić #77 · ₡48.000</small>
        </span>
      </div>
      <div className="pz-pop mt-tallas" style={v({ "--d": "520ms", "--z": 14 })}>
        <small>Talla</small>
        <span>
          {["S", "M", "L", "XL"].map((t) => (
            <i key={t} data-on={t === "L" || undefined}>
              {t}
            </i>
          ))}
        </span>
      </div>
      <div className="pz-pop mt-pago" style={v({ "--d": "760ms", "--z": 22 })}>
        <span className="mt-pago__ok">
          <Ok />
        </span>
        <span>
          <b>Pagado con SINPE</b>
          <small>₡48.000 · hace 1 s</small>
        </span>
      </div>
    </>
  );
}

/* ── Páginas web · componentes: el plano del arquitecto, azul y a mano ─── */

const BANCOS = [
  { banco: "BAC", tasa: "7,80 %", largo: 0.62 },
  { banco: "BN", tasa: "8,50 %", largo: 0.78 },
  { banco: "Davivienda", tasa: "9,25 %", largo: 0.94 },
] as const;

function Plano() {
  return (
    <>
      <div className="pz-pop mp-cota" style={v({ "--d": "120ms", "--z": 8 })}>
        <i className="mp-cota__linea" />
        <span>6 bancos · 1 clic</span>
      </div>
      <div className="pz-pop mp-cuota" style={v({ "--d": "360ms", "--z": 22 })}>
        <small>
          <i>A</i>
          Cuota mensual
        </small>
        <b>
          <Cuenta antes="₡" hasta={532837} retraso={700} dur={1300} />
        </b>
        <span>BAC · 15 años · tasa fija 7,80 %</span>
      </div>
      <div className="pz-pop mp-bancos" style={v({ "--d": "560ms", "--z": 16 })}>
        <small>
          <i>B</i>
          Compara tasas
        </small>
        {BANCOS.map((b, i) => (
          <span key={b.banco} className="mp-bancos__fila" data-mejor={i === 0 || undefined} style={v({ "--i": i, "--w": b.largo })}>
            <span>{b.banco}</span>
            <i />
            <span>{b.tasa}</span>
          </span>
        ))}
      </div>
      <div className="pz-pop mp-cajetin" style={v({ "--d": "780ms", "--z": 12 })}>
        <span>
          <small>Proyecto</small>
          JOPA · cuotas
        </span>
        <span>
          <small>Escala</small>
          1:1
        </span>
        <span>
          <small>Idiomas</small>
          ES · EN · PT
        </span>
        <span>
          <small>Hoja</small>
          03 / 03
        </span>
      </div>
      <div className="pz-pop mp-nota" style={v({ "--d": "1000ms", "--z": 28 })}>
        <span className="pz-mano">¡calcula solo!</span>
        <svg className="pz-trazo" viewBox="0 0 80 60" aria-hidden>
          <path d="M6 10 C 30 4, 58 16, 64 48" pathLength={1} />
          <path d="M54 40 L 64 50 L 71 37" pathLength={1} />
        </svg>
      </div>
    </>
  );
}

/* ── Onvi · dentro del software: vidrio oscuro y cian, como la clínica ── */

function Guia() {
  return (
    <>
      <div className="pz-pop mg-burbuja" style={v({ "--d": "120ms", "--z": 20 })}>
        <span className="mg-robot" />
        <span>
          <b>Onvi</b>
          Los servicios médicos llevan IVA del 4 %. Ya te lo dejo configurado.
        </span>
      </div>
      <div className="pz-pop mg-lista" style={v({ "--d": "320ms", "--z": 16 })}>
        <span className="mg-lista__cabeza">
          <b>Lista para facturar</b>
          <small>2 de 3</small>
        </span>
        <span className="mg-lista__barra">
          <i />
        </span>
        {["Cédula jurídica", "Actividad económica", "Código CABYS"].map((t, i) => (
          <span key={t} className="mg-lista__item" data-hecho={i < 2 || undefined} style={v({ "--i": i })}>
            <i>{i < 2 ? <Ok /> : null}</i>
            {t}
          </span>
        ))}
      </div>
      <div className="pz-pop mg-toast" style={v({ "--d": "620ms", "--z": 24 })}>
        <span className="mg-toast__ok">
          <Ok />
        </span>
        <span>
          <b>Cita confirmada</b>
          <small>Santiago · 9:00 a. m.</small>
        </span>
      </div>
      <div className="pz-pop mg-click" style={v({ "--d": "900ms", "--z": 30 })}>
        <i className="mg-click__onda" />
        <Puntero className="mg-click__puntero" />
      </div>
    </>
  );
}

/* ── Onvi · en tu página: crema, naranja y burbujas de chat ───────────── */

function Chat() {
  return (
    <>
      <div className="pz-pop mh-yo" style={v({ "--d": "120ms", "--z": 18 })}>
        ¿Hacen envíos a domicilio?
      </div>
      <div className="pz-pop mh-onvi" style={v({ "--d": "420ms", "--z": 22 })}>
        <span className="mh-avatar">O</span>
        <span className="mh-onvi__globo">
          <span className="mh-puntos" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="mh-onvi__txt">Sí, a todo San José. ¿Te paso los precios?</span>
        </span>
      </div>
      <div className="pz-pop mh-pin" style={v({ "--d": "640ms", "--z": 26 })}>
        <svg viewBox="0 0 24 30" className="mh-pin__icono" aria-hidden>
          <path d="M12 1.5C6.5 1.5 2.5 5.6 2.5 10.8c0 6.8 9.5 17 9.5 17s9.5-10.2 9.5-17c0-5.2-4-9.3-9.5-9.3z" fill="#e8402a" />
          <circle cx="12" cy="10.8" r="3.6" fill="#fff" />
        </svg>
        <span>
          <b>Cómo llegar</b>
          <small>Te mando la ubicación</small>
        </span>
      </div>
      <div className="pz-pop mh-wa" style={v({ "--d": "880ms", "--z": 20 })}>
        <svg viewBox="0 0 16 16" aria-hidden>
          <path
            d="M8 1.6a6.3 6.3 0 0 0-5.4 9.5L1.7 14.4l3.4-.9A6.3 6.3 0 1 0 8 1.6Zm3.2 8.9c-.1.4-.8.8-1.1.8-.3 0-.6.2-2.1-.4a7 7 0 0 1-2.8-2.5c-.3-.4-.7-1-.7-1.7s.4-1.1.5-1.3c.2-.2.4-.2.5-.2h.4c.1 0 .3 0 .4.3l.6 1.4c0 .1 0 .2 0 .3l-.3.4c-.1.1-.2.3-.1.4.2.3.6.9 1.2 1.4.7.6 1.3.8 1.5.9.2.1.3 0 .4-.1l.5-.6c.1-.2.3-.2.4-.1l1.3.6c.2.1.3.2.3.2.1.1.1.5-.1.9Z"
            fill="currentColor"
          />
        </svg>
        Seguir por WhatsApp
      </div>
    </>
  );
}

/* ── Panel Onvi · registros: el monitor, verde sobre negro ─────────────── */

const BARRAS = Array.from({ length: 30 }, (_, i) => (i === 11 ? "lento" : i === 22 ? "caido" : "ok"));

const LOG = [
  { hora: "10:00", texto: "Sitio en línea · 182 ms" },
  { hora: "10:10", texto: "Formulario recibido" },
  { hora: "10:20", texto: "Pago confirmado" },
] as const;

function Registros() {
  return (
    <>
      <div className="pz-pop mr-estado" style={v({ "--d": "120ms", "--z": 20 })}>
        <i className="mr-estado__punto" />
        <span>
          <b>Todo en línea</b>
          <small>99,91 % · últimos 90 días</small>
        </span>
      </div>
      <div className="pz-pop mr-barras" style={v({ "--d": "320ms", "--z": 14 })}>
        <small>
          Disponibilidad <b>90 días</b>
        </small>
        <span className="mr-barras__fila">
          {BARRAS.map((t, i) => (
            <i key={i} data-t={t} style={v({ "--i": i })} />
          ))}
        </span>
      </div>
      <div className="pz-pop mr-ms" style={v({ "--d": "560ms", "--z": 24 })}>
        <small>Respuesta media</small>
        <b>
          <Cuenta hasta={180} retraso={800} dur={900} /> <span>ms</span>
        </b>
        <svg viewBox="0 0 120 34" className="mr-ms__linea" preserveAspectRatio="none" aria-hidden>
          <path d="M0 24 C 10 22, 16 26, 26 20 S 42 14, 52 18 S 70 26, 80 16 S 98 8, 108 12 L 120 26" pathLength={1} />
        </svg>
      </div>
      <div className="pz-pop mr-log" style={v({ "--d": "800ms", "--z": 18 })}>
        {LOG.map((l, i) => (
          <span key={l.hora} style={v({ "--i": i })}>
            <time>{l.hora}</time>
            <Ok />
            {l.texto}
          </span>
        ))}
      </div>
    </>
  );
}

/* ── Panel Onvi · soporte: la mesa de ayuda, lila y con tickets ────────── */

const PASOS = [
  { paso: "Recibida", estado: "hecho" },
  { paso: "En curso", estado: "ahora" },
  { paso: "Lista", estado: "falta" },
] as const;

function Soporte() {
  return (
    <>
      <div className="pz-pop mo-ticket" style={v({ "--d": "120ms", "--z": 20 })}>
        <span className="mo-ticket__cabeza">
          <b>Solicitud #1024</b>
          <small>Cambio en el sitio</small>
        </span>
        <span className="mo-ticket__asunto">Cambiar el horario de atención</span>
        <span className="mo-ticket__sello">Recibida</span>
      </div>
      <div className="pz-pop mo-prioridad" style={v({ "--d": "340ms", "--z": 14 })}>
        <small>Prioridad</small>
        <span>
          {["Baja", "Normal", "Alta", "Urgente"].map((p) => (
            <i key={p} data-on={p === "Normal" || undefined}>
              {p}
            </i>
          ))}
        </span>
      </div>
      <div className="pz-pop mo-pasos" style={v({ "--d": "560ms", "--z": 22 })}>
        {PASOS.map((p, i) => (
          <span key={p.paso} data-e={p.estado} style={v({ "--i": i })}>
            <i>{p.estado === "hecho" ? <Ok /> : null}</i>
            {p.paso}
          </span>
        ))}
      </div>
      <div className="pz-pop mo-respuesta" style={v({ "--d": "820ms", "--z": 26 })}>
        <span className="mo-respuesta__avatar">O</span>
        <span>
          <b>
            Equipo Onvision <small>hace 5 min</small>
          </b>
          Recibido. Ya estamos cambiando el horario.
        </span>
      </div>
    </>
  );
}

/* ── Lo que se dibuja en el fondo de algunos mundos ────────────────────── */

/** El pulso del monitor: seis latidos seguidos, de punta a punta. */
const PULSO = `M0 70 ${Array.from({ length: 6 }, (_, k) => {
  const x = k * 200;
  return `L${x + 40} 70 Q${x + 52} 58 ${x + 64} 70 L${x + 84} 70 L${x + 92} 82 L${x + 102} 14 L${x + 112} 106 L${x + 120} 70 L${x + 142} 70 Q${x + 160} 52 ${x + 178} 70 L${x + 200} 70`;
}).join(" ")}`;

/**
 * El dibujo de fondo de un mundo, detrás del texto y la captura: la casa en
 * elevación del plano (se traza al llegar, con sus cotas) o el pulso del
 * monitor de Registros. Los demás mundos no tienen.
 */
export function ArteMas({ mundo }: { mundo: string }) {
  if (mundo === "plano") {
    return (
      <svg className="mp-dibujo" viewBox="0 0 520 400" aria-hidden>
        <g className="mp-dibujo__casa">
          <path d="M60 340 V180 L250 60 L440 180 V340 Z" pathLength={1} />
          <path d="M34 198 L250 44 L466 198" pathLength={1} />
          <path d="M210 340 V252 H290 V340" pathLength={1} />
          <path d="M100 212 H170 V266 H100 Z M135 212 V266 M100 239 H170" pathLength={1} />
          <path d="M330 212 H400 V266 H330 Z M365 212 V266 M330 239 H400" pathLength={1} />
          <path d="M356 116 V72 H390 V140" pathLength={1} />
          <path d="M8 340 H512" pathLength={1} />
        </g>
        <g className="mp-dibujo__cota">
          <path d="M60 366 H440 M60 356 V376 M440 356 V376 M60 366 l10 -5 M60 366 l10 5 M440 366 l-10 -5 M440 366 l-10 5" pathLength={1} />
          <path d="M486 180 V340 M476 180 H496 M476 340 H496" pathLength={1} />
          <text x="250" y="392">8,40 m</text>
          <text x="500" y="266" transform="rotate(90 500 266)">4,20 m</text>
        </g>
      </svg>
    );
  }
  if (mundo === "registros") {
    return (
      <svg className="mr-pulso" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden>
        <path className="mr-pulso__base" d={PULSO} />
        <path className="mr-pulso__luz" d={PULSO} pathLength={1} />
      </svg>
    );
  }
  return null;
}

const SECCIONES: Record<string, () => JSX.Element> = {
  "web-tienda": Tienda,
  "web-componentes": Plano,
  "onvi-software": Guia,
  "onvi-pagina": Chat,
  "panel-registros": Registros,
  "panel-soporte": Soporte,
};

export default function PopupsMas({ id }: { id: string }) {
  const Seccion = SECCIONES[id];
  if (!Seccion) return null;
  return (
    <div className="pz-pops" aria-hidden>
      <Seccion />
    </div>
  );
}
