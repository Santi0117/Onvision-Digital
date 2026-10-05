"use client";

import type { CSSProperties, JSX } from "react";
import { Cuenta } from "./Popups";

/**
 * Los pop-ups de las secciones de "Más información": cada sección tiene su
 * mundo, sacado del diseño de su captura (la tienda deportiva, la página de
 * bienes raíces, el sistema de la clínica, el chat del taller, la finca y el
 * restaurante), y sus pop-ups hablan ese idioma. Son decorado: lo que
 * cuentan también está en el texto de la sección.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

const Ok = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M4 8.5l2.6 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Flecha = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

/* ── Páginas web · componentes: bienes raíces, marfil y dorado ────────── */

function Cuotas() {
  return (
    <>
      <svg className="pz-pop pz-trazo mc-marco" viewBox="0 0 100 100" preserveAspectRatio="none" style={v({ "--d": "200ms", "--z": 4 })} aria-hidden>
        <rect x="1" y="1" width="98" height="98" rx="4" pathLength={1} />
      </svg>
      <div className="pz-pop mc-cuota" style={v({ "--d": "340ms", "--z": 20 })}>
        <small>Cuota mensual</small>
        <b>
          <Cuenta antes="₡" hasta={532837} retraso={700} dur={1300} />
        </b>
        <span>BAC · 15 años · tasa fija 7,80 %</span>
      </div>
      <div className="pz-pop mc-plazo" style={v({ "--d": "120ms", "--z": 14 })}>
        <small>Plazo</small>
        <span>
          {["10", "15", "20", "25"].map((a) => (
            <i key={a} data-on={a === "15" || undefined}>
              {a} años
            </i>
          ))}
        </span>
      </div>
      <div className="pz-pop mc-idiomas" style={v({ "--d": "560ms", "--z": 22 })}>
        <span className="mc-bandera mc-bandera--es" />
        <span className="mc-bandera mc-bandera--us" />
        <span className="mc-bandera mc-bandera--br" />
        <b>ES · EN · PT</b>
      </div>
      <div className="pz-pop mc-visita" style={v({ "--d": "820ms", "--z": 26 })}>
        Agendar visita
        <Flecha />
        <Puntero className="mc-visita__puntero" />
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

/* ── Software · la finca: verde salvia y tarjetas de colores suaves ────── */

function Finca() {
  return (
    <>
      <div className="pz-pop mf-kpi" style={v({ "--d": "120ms", "--z": 18 })}>
        <small>Valor cosecha</small>
        <b>
          <Cuenta antes="₡" hasta={8119140} retraso={600} dur={1400} />
        </b>
        <svg viewBox="0 0 120 30" className="mf-kpi__linea" preserveAspectRatio="none" aria-hidden>
          <path d="M0 26 C 14 24, 22 18, 34 20 S 52 24, 64 14 S 86 6, 98 9 S 112 6, 120 2" pathLength={1} />
        </svg>
      </div>
      <div className="pz-pop mf-producto" style={v({ "--d": "360ms", "--z": 22 })}>
        <span className="mf-producto__cabeza">
          <b>Plátano verde</b>
          <i />
        </span>
        <small>PLA-001</small>
        <b className="mf-producto__kg">
          <Cuenta hasta={265} retraso={800} dur={1000} /> <span>kg</span>
        </b>
        <span className="mf-producto__barra">
          <i />
        </span>
        <span className="mf-producto__pie">
          <small>₡620/kg</small>
          <small>En bodega</small>
        </span>
      </div>
      <div className="pz-pop mf-toast" style={v({ "--d": "620ms", "--z": 26 })}>
        <span className="mf-toast__ok">
          <Ok />
        </span>
        Cosecha registrada · +265 kg
      </div>
      <div className="pz-pop mf-merma" style={v({ "--d": "860ms", "--z": 14 })}>
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M2 4l5 5 3-3 4 4M14 7v3h-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Merma −3 %
      </div>
    </>
  );
}

/* ── Software · el restaurante: cuadrícula, rojo y la comanda ─────────── */

function Salon() {
  return (
    <>
      <div className="pz-pop ms-comanda" style={v({ "--d": "160ms", "--z": 20 })}>
        <span className="ms-comanda__papel">
          <b>Comanda · Mesa 2</b>
          <small>#1 · 12:41 p. m.</small>
          <span className="ms-comanda__fila">
            <span>2× Casado</span>
            <span>₡7.000</span>
          </span>
          <span className="ms-comanda__fila">
            <span>1× Fresco natural</span>
            <span>₡1.500</span>
          </span>
          <span className="ms-comanda__fila ms-comanda__fila--total">
            <span>Total</span>
            <span>₡8.500</span>
          </span>
        </span>
      </div>
      <div className="pz-pop ms-toast" style={v({ "--d": "420ms", "--z": 24 })}>
        <span className="ms-toast__icono">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M8 2.2a4 4 0 0 0-4 4v2.6L2.8 11h10.4L12 8.8V6.2a4 4 0 0 0-4-4zM6.6 12.6a1.5 1.5 0 0 0 2.8 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
        <span>
          <b>Orden en la cocina</b>
          <small>Mesa 2 · hace 1 s</small>
        </span>
      </div>
      <div className="pz-pop ms-boton" style={v({ "--d": "680ms", "--z": 28 })}>
        Ir a cobrar
        <Flecha />
        <Puntero className="ms-boton__puntero" />
      </div>
      <div className="pz-pop ms-fe" style={v({ "--d": "900ms", "--z": 16 })}>
        <span>
          <Ok />
        </span>
        Factura electrónica aceptada
      </div>
    </>
  );
}

const SECCIONES: Record<string, () => JSX.Element> = {
  "web-tienda": Tienda,
  "web-componentes": Cuotas,
  "onvi-software": Guia,
  "onvi-pagina": Chat,
  "software-cosecha": Finca,
  "software-mesas": Salon,
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
