import type { Metadata } from "next";
import Agenda from "@/components/planes/Agenda";
import Planes from "@/components/planes/Planes";
import Registro from "@/components/planes/Registro";
import "@/components/digital/digital.css";
import "@/components/home/home.css";
import "@/components/home/home-secciones.css";
import "@/components/planes/planes.css";

export const metadata: Metadata = {
  title: "Planes — Onvision Digital",
  description:
    "Planes claros para sitios, tiendas, software y apps, con Onvi IA y el Panel incluidos. Pagá la mensualidad, agendá una reunión o contanos tu idea.",
};

/**
 * Planes, en una sola página: elegir la línea y el plan (y pagarlo),
 * agendar una reunión y, si se prefiere, contar la idea por WhatsApp.
 */
export default function PlanesRuta() {
  return (
    <div className="oh oh--incrustado pl-pagina">
      <div className="od-bloque">
        <Planes />
      </div>
      <div className="od-bloque od-bloque--hielo">
        <Agenda />
      </div>
      <div className="od-bloque">
        <Registro />
      </div>
    </div>
  );
}
