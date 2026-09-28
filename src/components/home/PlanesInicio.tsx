import Link from "next/link";
import { digitalPlans } from "@/lib/digital";
import { planes } from "./data";
import { Flecha, Icono } from "./ui";

const [ANTES, DESPUES = ""] = digitalPlans.title.split(". ");

/**
 * El final del inicio: la píldora gigante con el precio de entrada y la
 * puerta a Planes, donde se elige, se paga o se agenda.
 */
export default function PlanesInicio() {
  const base = planes[0]!;
  return (
    <section id="planes-inicio" className="oh-precios oh-entrada" aria-labelledby="oh-entrada-titulo">
      <div className="oh-precios__head">
        <p className="oh-eyebrow">Planes</p>
        <h2 id="oh-entrada-titulo" className="oh-serif-h2">
          {ANTES}. <em>{DESPUES}</em>
        </h2>
      </div>

      <div className="oh-pildoras">
        <div className="oh-pildoras__fila">
          <p className="oh-pildora">
            <span className="oh-pildora__desde">desde</span>
            {base.precio}
            <span className="oh-pildora__icono" aria-hidden>
              <Icono nombre="calendario" className="h-[0.5em] w-[0.5em]" />
            </span>
            al mes
          </p>
          <Link href="/planes" className="oh-pildora__circulo" aria-label="Ver los planes">
            <Flecha dir="esquina" className="h-[0.6em] w-[0.6em]" />
          </Link>
        </div>
        <p className="oh-pildora oh-pildora--corrida">
          Onvi IA y el Panel incluidos en los <span className="oh-pildora__sol">{planes.length}</span> planes.
        </p>
      </div>

      <div className="oh-entrada__botones">
        <Link href="/planes" className="oh-boton-lila">
          Ver los planes
          <Flecha className="h-4 w-4" />
        </Link>
        <Link href="/planes#agendar" className="oh-entrada__agendar">
          Agendar una reunión
          <Flecha className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
