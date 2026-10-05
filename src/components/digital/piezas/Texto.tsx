"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { abrirOnvi } from "../../od/OnviChat";
import type { Accion, Pieza } from "./datos";

/** Adónde lleva cada botón: a Planes, a su agenda o a Onvi (que se abre acá mismo). */
const DESTINO: Record<Exclude<Accion["destino"], "onvi">, string> = { planes: "/planes", agendar: "/planes#agendar" };

const Flecha = () => (
  <svg viewBox="0 0 16 16" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export function BotonAccion({ accion }: { accion: Accion }) {
  const contenido = (
    <>
      <span>{accion.texto}</span>
      <Flecha />
    </>
  );
  if (accion.destino === "onvi") {
    return (
      <button type="button" className="pz-texto__accion" onClick={abrirOnvi}>
        {contenido}
      </button>
    );
  }
  return (
    <Link href={DESTINO[accion.destino]} className="pz-texto__accion">
      {contenido}
    </Link>
  );
}

/**
 * El texto de una pieza: antetítulo, título con su resalte, bajada,
 * etiquetas y botones. Con `alMas`, suma "Más información", que abre la
 * vista completa del servicio.
 */
export function TextoPieza({ pieza, alMas }: { pieza: Pieza; alMas?: (e: MouseEvent<HTMLButtonElement>) => void }) {
  const [antes, resalto] = pieza.titulo;
  return (
    <>
      <p className="pz-texto__ante">{pieza.antetitulo}</p>
      <h3 className="pz-texto__titulo">
        {antes}
        <em>{resalto}</em>
      </h3>
      <p className="pz-texto__bajada">{pieza.bajada}</p>
      <ul className="pz-texto__etiquetas">
        {pieza.etiquetas.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      <div className="pz-texto__botones">
        {alMas ? (
          <button type="button" className="pz-texto__mas" onClick={alMas} aria-haspopup="dialog">
            <span>Más información</span>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
        <BotonAccion accion={pieza.accion} />
      </div>
    </>
  );
}
