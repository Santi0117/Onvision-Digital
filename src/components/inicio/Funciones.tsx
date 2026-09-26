"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { webFeatures, webOutro } from "@/lib/web";
import { irA } from "../od/data";
import { Check, ConPunto, Flecha, Ojo } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const CORTO: Record<string, string> = {
  agenda: "Agenda",
  seo: "SEO",
  contacto: "Software",
  chatbot: "IA",
  animaciones: "Animaciones",
  tienda: "Pagos",
};

/** Una pantallita por función, sobre el campo de color difuso de driveberry. */
function Muestra({ id }: { id: string }) {
  switch (id) {
    case "agenda":
      return (
        <div className="od-muestra od-muestra--agenda">
          <p className="od-muestra__titulo">Reservas</p>
          <div className="od-muestra__dias">
            {["L", "K", "M", "J", "V"].map((d, i) => (
              <span key={d} data-sel={i === 2 ? "si" : undefined}>
                {d}
                <b>{12 + i}</b>
              </span>
            ))}
          </div>
          <div className="od-muestra__horas">
            {["9:00", "10:30", "12:00", "2:00", "3:30"].map((h, i) => (
              <span key={h} data-sel={i === 0 ? "si" : undefined}>
                {h}
              </span>
            ))}
          </div>
          <p className="od-muestra__fila">
            <Ojo className="od-muestra__ojo" /> Se vincula con tu panel Onvi
          </p>
        </div>
      );
    case "seo":
      return (
        <div className="od-muestra od-muestra--seo">
          {[
            ["98", "Rendimiento"],
            ["100", "SEO"],
          ].map(([n, t]) => (
            <div key={t} className="od-muestra__aro">
              <svg viewBox="0 0 80 80" aria-hidden>
                <circle cx="40" cy="40" r="33" className="od-aro-fondo" />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="33"
                  className="od-aro-valor"
                  pathLength={100}
                  initial={{ strokeDashoffset: 100 }}
                  whileInView={{ strokeDashoffset: 100 - Number(n) }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 1.6, ease: EASE }}
                />
              </svg>
              <b>{n}</b>
              <span>{t}</span>
            </div>
          ))}
        </div>
      );
    case "contacto":
      return (
        <div className="od-muestra od-muestra--foto">
          <Image src="/web/panel/registros.png" alt="Panel administrativo de un software a medida" fill sizes="(min-width: 900px) 520px, 90vw" className="object-cover object-left-top" />
        </div>
      );
    case "chatbot":
      return (
        <div className="od-muestra od-muestra--chat">
          <p className="od-muestra__burbuja od-muestra__burbuja--yo">¿Tienen citas mañana?</p>
          <p className="od-muestra__burbuja">
            <Ojo className="od-muestra__ojo" /> Sí, mañana a las 9:00 hay espacio. ¿Te lo reservo?
          </p>
          <p className="od-muestra__voz" aria-hidden>
            <span>▶</span>
            {Array.from({ length: 22 }, (_, i) => (
              <i key={i} style={{ height: `${6 + Math.abs(Math.sin(i * 1.3)) * 16}px` }} />
            ))}
            <em>0:04</em>
          </p>
        </div>
      );
    case "animaciones":
      return (
        <div className="od-muestra od-muestra--anim" aria-hidden>
          <span className="od-muestra__orbita">
            <i />
            <i />
            <i />
          </span>
          <span className="od-muestra__bloque" />
        </div>
      );
    default:
      return (
        <div className="od-muestra od-muestra--pago">
          <p className="od-muestra__titulo">Checkout</p>
          <div className="od-muestra__metodos">
            <span data-sel="si">SINPE Móvil</span>
            <span>Tarjeta</span>
          </div>
          <p className="od-muestra__total">
            <span>Total</span>
            <b>₡24.900</b>
          </p>
          <span className="od-muestra__pagar">Pagar</span>
        </div>
      );
  }
}

/**
 * "Comment ça marche ?" de driveberry: pestañas pegadas arriba y filas
 * alternadas — tarjeta blanca con el texto y tarjeta de color con la
 * pantalla y sus sellos. Son las seis funciones del sitio oficial.
 */
export default function Funciones() {
  const [activa, setActiva] = useState(webFeatures[0]!.id);

  useEffect(() => {
    const filas = webFeatures.map((f) => document.getElementById(`od-f-${f.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActiva(e.target.id.replace("od-f-", ""));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    filas.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);

  return (
    <section className="od-funciones od-claro" aria-labelledby="od-funciones-titulo">
      <div className="od-funciones__cabeza">
        <p className="od-eyebrow">{webOutro.eyebrow} · Cómo funciona</p>
        <h2 id="od-funciones-titulo" className="od-h2">
          <ConPunto>{webOutro.modulesTitle}</ConPunto>
        </h2>
        <p className="od-lede">Cada pieza llega lista, conectada a tu panel y a Onvi.</p>
      </div>

      <nav className="od-funciones__tabs" aria-label="Funciones">
        {webFeatures.map((f) => (
          <a
            key={f.id}
            href={`#od-f-${f.id}`}
            className={activa === f.id ? "is-on" : undefined}
            aria-current={activa === f.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              irA(`#od-f-${f.id}`, -160);
            }}
          >
            {CORTO[f.id] ?? f.title}
          </a>
        ))}
      </nav>

      <div className="od-funciones__filas">
        {webFeatures.map((f, i) => (
          <motion.article
            key={f.id}
            id={`od-f-${f.id}`}
            className={`od-funcion${i % 2 ? " od-funcion--invertida" : ""}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="od-funcion__texto">
              <p className="od-funcion__chip">Pieza {String(i + 1).padStart(2, "0")}</p>
              <h3 className="od-funcion__titulo">{f.title}</h3>
              <p className="od-funcion__lead">{f.lead}</p>
              <ul className="od-funcion__lista">
                {f.bullets.map((b) => (
                  <li key={b}>
                    <Check className="h-4 w-4" /> {b}
                  </li>
                ))}
              </ul>
              <pre className="od-funcion__codigo" aria-hidden>
                {f.snippet.join("\n")}
              </pre>
              <Link href="/digital#planes" className="od-boton od-boton--negro od-boton--chico">
                Ver planes <Flecha />
              </Link>
            </div>
            <div className="od-funcion__media">
              <Muestra id={f.id} />
              <span className="od-funcion__sello od-funcion__sello--a">
                <Check className="h-3.5 w-3.5" /> {f.bullets[0]}
              </span>
              <span className="od-funcion__sello od-funcion__sello--b">
                <Check className="h-3.5 w-3.5" /> {f.bullets[2]}
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
