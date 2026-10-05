"use client";

import type { CSSProperties, JSX } from "react";

/**
 * Los pop-ups de las secciones de "Más información": el mismo lenguaje de
 * cada escena (notas pegadas, lapicero rojo y sellos en el cuaderno de la
 * página web), apuntando a lo que tiene cada captura. Son decorado: lo que
 * cuentan también está en el texto de la sección.
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* ── Páginas web · la tienda ──────────────────────────────────────────── */

function WebTienda() {
  return (
    <>
      <span className="pz-pop pz-cinta mi-pop--t-cinta" style={v({ "--d": "40ms", "--z": 4 })} />
      <div className="pz-pop mi-pop--t-filtros" style={v({ "--d": "520ms", "--z": 12 })}>
        <span className="pz-mano">¡filtros por liga y equipo!</span>
        <svg viewBox="0 0 160 120" className="pz-trazo" aria-hidden>
          <path d="M120 10 C 104 40, 74 58, 40 92" pathLength={1} />
          <path d="M34 66 L36 98 L66 92" pathLength={1} />
        </svg>
      </div>
      <svg
        className="pz-pop pz-trazo mi-pop--t-oferta"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        style={v({ "--d": "360ms", "--z": 6 })}
        aria-hidden
      >
        <path
          d="M40 74 C 4 54, 30 10, 100 10 C 170 10, 198 36, 186 62 C 172 90, 100 96, 54 86 C 22 78, 16 52, 44 34 C 70 18, 130 16, 158 28"
          pathLength={1}
        />
      </svg>
      <div className="pz-pop pz-nota mi-pop--t-sinpe" style={v({ "--d": "150ms", "--z": 18 })}>
        <span className="pz-nota__cinta" />
        <b>Pagás con SINPE ✓</b>
        <span>o con tarjeta</span>
      </div>
      <div className="pz-pop pz-nota pz-nota--rosa mi-pop--t-pedido" style={v({ "--d": "300ms", "--z": 22 })}>
        <span className="pz-nota__cinta" />
        <b>Cada pedido te llega al cel</b>
      </div>
      <div className="pz-pop pz-sello mi-pop--t-sello" style={v({ "--d": "820ms", "--z": 14 })}>
        <b>Vendido</b>
        <span>pago confirmado</span>
      </div>
    </>
  );
}

/* ── Páginas web · componentes a medida ───────────────────────────────── */

function WebComponentes() {
  return (
    <>
      <span className="pz-pop pz-cinta mi-pop--c-cinta" style={v({ "--d": "40ms", "--z": 4 })} />
      <div className="pz-pop mi-pop--c-bancos" style={v({ "--d": "560ms", "--z": 12 })}>
        <span className="pz-mano">¡6 bancos a la vez!</span>
        <svg viewBox="0 0 160 120" className="pz-trazo" aria-hidden>
          <path d="M30 12 C 50 44, 80 66, 116 96" pathLength={1} />
          <path d="M92 98 L118 98 L114 72" pathLength={1} />
        </svg>
      </div>
      <svg
        className="pz-pop pz-trazo mi-pop--c-cuota"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        style={v({ "--d": "380ms", "--z": 6 })}
        aria-hidden
      >
        <path
          d="M36 76 C 2 56, 26 12, 100 9 C 172 7, 199 34, 188 60 C 176 90, 104 97, 56 88 C 20 80, 12 54, 40 34 C 66 16, 128 13, 160 26"
          pathLength={1}
        />
      </svg>
      <div className="pz-pop pz-nota mi-pop--c-calculo" style={v({ "--d": "160ms", "--z": 20 })}>
        <span className="pz-nota__cinta" />
        <b>₡532.837 al mes</b>
        <span>calculado al instante ✓</span>
      </div>
      <div className="pz-pop pz-nota pz-nota--rosa mi-pop--c-idiomas" style={v({ "--d": "300ms", "--z": 22 })}>
        <span className="pz-nota__cinta" />
        <b>En 3 idiomas</b>
        <span>ES · EN · PT</span>
      </div>
      <div className="pz-pop pz-sello mi-pop--c-sello" style={v({ "--d": "860ms", "--z": 14 })}>
        <b>A medida</b>
        <span>hecho para tu negocio</span>
      </div>
    </>
  );
}

const SECCIONES: Record<string, () => JSX.Element> = {
  "web-tienda": WebTienda,
  "web-componentes": WebComponentes,
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
