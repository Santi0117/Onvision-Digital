import Image from "next/image";
import type { ReactNode } from "react";
import { Ojo } from "../od/ui";
import { Check, Flecha } from "./ui";

/**
 * Las tarjetas de producto de cada pieza (agenda, SEO, software, IA,
 * animaciones y pagos), a la manera de las de clarvos. Las usan el dial del
 * inicio y cualquier fila que muestre una pieza.
 */

function VisualAgenda() {
  return (
    <div className="oh-ui">
      <div className="oh-ui__head">
        <p>Agenda · Panel Onvi</p>
        <span className="oh-chip oh-chip--negro">En vivo</span>
      </div>
      <div className="oh-ui__bloque">
        <div className="oh-card__fila">
          <p className="oh-card__titulo">Consulta · mañana 9:00</p>
          <span className="oh-chip oh-chip--menta">
            <Check className="h-3 w-3" />
            Confirmada
          </span>
        </div>
        <div className="oh-barra">
          <i style={{ width: "92%" }} />
        </div>
        <p className="oh-card__mono">agenda.reservar(&#123; servicio: &apos;Consulta&apos; &#125;)</p>
      </div>
      <ul className="oh-ui__lista">
        {[
          ["9:00 a.m.", "Consulta", "Reservada", "menta"],
          ["10:30 a.m.", "Limpieza", "Por confirmar", "sol"],
          ["2:00 p.m.", "Libre", "Disponible", "violeta"],
        ].map(([hora, que, estado, tono], i) => (
          <li key={hora}>
            <span className="oh-rango">{i + 1}</span>
            <span className="oh-ui__nombre">
              {hora}
              <small>{que}</small>
            </span>
            <span className={`oh-chip oh-chip--${tono}`}>{estado}</span>
          </li>
        ))}
      </ul>
      <p className="oh-ui__pie">
        <i className="oh-punto" /> Confirmación en segundos por WhatsApp
      </p>
    </div>
  );
}

function VisualSeo() {
  const barras = [42, 58, 49, 71, 66, 92, 60];
  return (
    <div className="oh-ui">
      <div className="oh-ui__metricas">
        <div className="oh-ui__metrica">
          <p className="oh-card__label">Rendimiento</p>
          <p className="oh-card__grande oh-verde">98</p>
          <p className="oh-card__chico">carga en menos de 1 s</p>
        </div>
        <div className="oh-ui__metrica">
          <p className="oh-card__label">SEO</p>
          <p className="oh-card__grande">100</p>
          <p className="oh-card__chico">Google te encuentra</p>
        </div>
      </div>
      <div className="oh-ui__grafico" aria-hidden>
        {barras.map((h, i) => (
          <span key={i}>
            <i style={{ height: `${h}%` }} data-alta={h > 80 ? "true" : "false"} />
            <small>{"LMKJVSD"[i]}</small>
          </span>
        ))}
      </div>
      <p className="oh-chip oh-chip--violeta oh-chip--ancho">sitio.medir() → rendimiento 98 · seo 100</p>
    </div>
  );
}

const SISTEMAS = [
  { src: "/digital/saas-clinicos-cut2.png", nombre: "Clinic OS" },
  { src: "/digital/saas-unilearn-cut2.png", nombre: "UniLearn" },
  { src: "/digital/saas-sistemagan-cut2.png", nombre: "Sistema Gan" },
  { src: "/digital/saas-fasamar-mock.png", nombre: "Fasamar" },
];

function VisualSoftware() {
  const chips = ["Panel", "Inventario", "Pedidos", "Roles", "Reportes", "Rutas"];
  return (
    <div className="oh-ui">
      <div className="oh-ui__tags">
        {chips.map((c, i) => (
          <span key={c} className={`oh-tagc oh-tagc--${i % 4}`}>
            {c}
          </span>
        ))}
      </div>
      <div className="oh-ui__mini">
        {SISTEMAS.map((s) => (
          <figure key={s.src}>
            <span>
              <Image src={s.src} alt="" fill sizes="220px" className="object-contain" />
            </span>
            <figcaption>{s.nombre}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function VisualIa() {
  return (
    <div className="oh-ui oh-ui--chat">
      <div className="oh-ui__head">
        <p>
          <span className="oh-avatar">
            <Ojo className="h-2.5 w-auto" />
          </span>
          ONVI
        </p>
        <span className="oh-chip oh-chip--violeta">IA · 24/7</span>
      </div>
      <p className="oh-burbuja oh-burbuja--onvi">Hola, soy Onvi. Conozco el catálogo y la agenda del negocio.</p>
      <p className="oh-burbuja oh-burbuja--yo">¿Tienen citas mañana?</p>
      <p className="oh-burbuja oh-burbuja--onvi">Sí: 9:00 y 10:30. ¿Te reservo la de las 9:00?</p>
      <p className="oh-escribiendo" aria-hidden>
        <i />
        <i />
        <i />
      </p>
    </div>
  );
}

function VisualAnimaciones() {
  return (
    <div className="oh-ui">
      <div className="oh-ui__head">
        <p>animar(&apos;.hero&apos;)</p>
        <span className="oh-chip oh-chip--negro">entrada: suave</span>
      </div>
      <div className="oh-ui__curva" aria-hidden>
        <svg viewBox="0 0 200 110">
          <path className="oh-ui__curva-guia" d="M10 100 L190 10" />
          <path className="oh-ui__curva-trazo" d="M10 100 C 70 100, 80 10, 190 10" pathLength={1} />
          <circle className="oh-ui__curva-punto" cx="190" cy="10" r="6" />
        </svg>
      </div>
      <ul className="oh-ui__lista">
        {["Scroll con escenas", "Micro-interacciones", "Fluido en móvil"].map((t, i) => (
          <li key={t}>
            <span className="oh-rango">{i + 1}</span>
            <span className="oh-ui__nombre">{t}</span>
            <span className="oh-chip oh-chip--menta">60 fps</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VisualPagos() {
  return (
    <div className="oh-ui">
      <div className="oh-ui__head">
        <p>Checkout</p>
        <span className="oh-chip oh-chip--menta">
          <Check className="h-3 w-3" />
          Seguro
        </span>
      </div>
      <div className="oh-ui__bloque oh-ui__producto">
        <span className="oh-ui__foto" aria-hidden />
        <span className="oh-ui__nombre">
          Jersey Cowboys · M<small>Stock: 12 · sincronizado</small>
        </span>
        <b>₡28.000</b>
      </div>
      <div className="oh-ui__medios" aria-hidden>
        {["SINPE Móvil", "Tarjeta", "Transferencia"].map((m, i) => (
          <span key={m} data-on={i === 0 ? "true" : "false"}>
            <i />
            {m}
          </span>
        ))}
      </div>
      <p className="oh-ui__pagar" aria-hidden>
        Pagar ₡28.000
        <Flecha className="h-4 w-4" />
      </p>
      <p className="oh-ui__pie">
        <i className="oh-punto" /> Conectado a tu inventario
      </p>
    </div>
  );
}

export const VISUALES: Record<string, () => ReactNode> = {
  agenda: VisualAgenda,
  seo: VisualSeo,
  contacto: VisualSoftware,
  chatbot: VisualIa,
  animaciones: VisualAnimaciones,
  tienda: VisualPagos,
};
