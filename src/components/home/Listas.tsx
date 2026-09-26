import Link from "next/link";
import type { CSSProperties } from "react";
import { clientChats } from "@/lib/client-chats";
import { companyChats } from "@/lib/company";
import { iniciales } from "../od/data";
import { Flecha } from "./ui";
import { empresas, oracion } from "./data";

/** Las marcas que ya están corriendo, con su sigla. */
function Marcas({ oculta = false }: { oculta?: boolean }) {
  return (
    <ul className="oh-marquee__fila" aria-hidden={oculta || undefined}>
      {empresas.map((e) => (
        <li key={e.id}>
          <a href={`#${e.id}`} tabIndex={oculta ? -1 : undefined}>
            <span className="oh-marquee__sigla" aria-hidden>
              {iniciales(e.name)}
            </span>
            <span>{e.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Los chats de clientes pidiendo su sistema (el "cada chat es un brief" oficial). */
function Chats({ oculta = false }: { oculta?: boolean }) {
  return (
    <ul className="oh-marquee__fila oh-marquee__fila--chats" aria-hidden={oculta || undefined}>
      {clientChats.map((c) => (
        <li key={c.id} className="oh-chatcard" style={{ "--tono": c.color } as CSSProperties}>
          <span className="oh-chatcard__avatar" aria-hidden>
            {c.initials}
          </span>
          <span className="oh-chatcard__txt">
            <span className="oh-chatcard__fila">
              <b>{c.name}</b>
              <time>{c.time}</time>
            </span>
            <span className="oh-chatcard__msj">{c.preview}</span>
            {c.status ? <span className="oh-chatcard__estado">{c.status}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Los clientes piden el sistema": la franja de logos de wisprflow sobre el
 * bloque de tinta redondeado. Arriba pasan las marcas que ya están
 * corriendo; abajo, en sentido contrario, los chats de clientes.
 */
export default function Listas() {
  return (
    <section id="clientes" className="oh-listas" aria-labelledby="oh-listas-titulo">
      <h2 id="oh-listas-titulo" className="oh-listas__eyebrow">
        {companyChats.title}
      </h2>
      <ol className="oh-listas__puntos">
        {companyChats.points.map((p, i) => (
          <li key={p}>
            <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            {oracion(p)}
          </li>
        ))}
      </ol>

      <div className="oh-marquee">
        <div className="oh-marquee__pista">
          <Marcas />
          <Marcas oculta />
        </div>
      </div>
      <div className="oh-marquee oh-marquee--reves" aria-label="Chats de clientes">
        <div className="oh-marquee__pista">
          <Chats />
          <Chats oculta />
        </div>
      </div>

      <Link href="/empresas" className="oh-listas__ver">
        Ver todas las empresas
        <span className="oh-listas__circ">
          <Flecha className="h-3.5 w-3.5" />
        </span>
      </Link>
    </section>
  );
}
