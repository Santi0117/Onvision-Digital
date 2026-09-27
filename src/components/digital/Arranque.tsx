"use client";

import Cinta from "../home/Cinta";
import Showcase from "../home/Showcase";
import type { Linea } from "../home/data";
import { irA } from "../od/data";
import { ELEGIR_LINEA } from "./Planes";
import "../home/home.css";
import "../home/home-secciones.css";

type ConLenis = {
  __odLenis?: { scrollTo: (t: HTMLElement, o?: { offset?: number; onComplete?: () => void }) => void };
};

/**
 * El principio de Servicios: la cinta de wisprflow ("Onvi incluida", lo
 * que cobra el mercado entra y sale tu sitio) y las líneas en la escena
 * fija de jeffmilanes, con sus capturas. "Elegir este plan" baja a los
 * planes con la pestaña de esa línea abierta.
 */
export default function Arranque() {
  const elegir = (linea: Linea) => {
    let hecho = false;
    const abrir = () => {
      if (hecho) return;
      hecho = true;
      window.dispatchEvent(new CustomEvent(ELEGIR_LINEA, { detail: linea }));
    };
    const planes = document.getElementById("planes");
    const lenis = (window as unknown as ConLenis).__odLenis;
    // Primero se llega y después cambia la pestaña, para que el cambio se vea.
    // Sin offset: Lenis ya respeta el scroll-margin-top de #planes (80 px).
    if (planes && lenis) {
      lenis.scrollTo(planes, { onComplete: abrir });
      window.setTimeout(abrir, 2600);
      return;
    }
    abrir();
    irA("#planes");
  };

  return (
    <div className="oh oh--incrustado">
      <div className="oh-abre oh-abre--portada">
        <Cinta />
      </div>
      <div className="oh-negro" data-tema="oscuro">
        <Showcase alElegir={elegir} detalle="#trabajo" />
      </div>
    </div>
  );
}
