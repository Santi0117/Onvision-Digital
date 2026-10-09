import type { Metadata } from "next";
import Agenda from "@/components/planes/Agenda";
import Planes from "@/components/planes/Planes";
import "@/components/digital/digital.css";
import "@/components/home/home.css";
import "@/components/home/home-secciones.css";
import "@/components/planes/planes.css";

export const metadata: Metadata = {
  title: "Planes — Onvision Digital",
  description:
    "Planes claros para páginas web, tiendas, software y apps, con Onvi IA y el Panel incluidos. Paga mes a mes o agenda una reunión.",
};

/** Planes, en una sola página: elegir la línea y el plan (y pagarlo) o agendar una reunión. */
export default function PlanesRuta() {
  return (
    <div className="oh oh--incrustado pl-pagina">
      <div className="od-bloque">
        <Planes />
      </div>
      <div className="od-bloque od-bloque--hielo">
        <Agenda />
      </div>
    </div>
  );
}
