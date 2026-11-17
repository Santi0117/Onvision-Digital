import Faq from "@/components/od/Faq";
import Agenda from "@/components/planes/Agenda";
import Planes from "@/components/planes/Planes";
import { planesFaq } from "@/lib/digital";
import { jsonLd, metaPagina, schemaFaq } from "@/lib/seo";
import "@/components/digital/digital.css";
import "@/components/home/home.css";
import "@/components/home/home-secciones.css";
import "@/components/planes/planes.css";

export const metadata = metaPagina({
  ruta: "/planes",
  titulo: "Planes y precios: sitios, tiendas y apps — Onvision Digital",
  descripcion:
    "Planes claros para páginas web, tiendas, software y apps, con Onvi IA y el Panel incluidos. Paga mes a mes o agenda una reunión.",
});

/**
 * Planes, en una sola página: elegir la línea y el plan (y pagarlo), las
 * preguntas frecuentes (cerradas: se abren al tocar) y agendar una reunión.
 */
export default function PlanesRuta() {
  return (
    <div className="oh oh--incrustado pl-pagina">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemaFaq(planesFaq.items)) }} />
      <div className="od-bloque">
        <Planes />
      </div>
      <div className="od-bloque od-faq-bloque">
        <Faq datos={planesFaq} abiertaInicial={null} />
      </div>
      <div className="od-bloque od-bloque--hielo">
        <Agenda />
      </div>
    </div>
  );
}
