import CintaOnvi from "@/components/digital/CintaOnvi";
import Piezas from "@/components/digital/piezas/Piezas";
import { ShowreelCabeza } from "@/components/digital/Showreel";
import Cierre from "@/components/od/Cierre";
import Faq from "@/components/od/Faq";
import { digitalFaq } from "@/lib/digital";
import { jsonLd, metaPagina, schemaFaq } from "@/lib/seo";
import "@/components/digital/digital.css";

export const metadata = metaPagina({
  ruta: "/digital",
  titulo: "Páginas web, tiendas y software a medida — Onvision Digital",
  descripcion:
    "Páginas web, tiendas en línea, software a medida y apps. Diseño a tu marca, Onvi incluido y entrega lista para revisar.",
});

export default function Digital() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemaFaq(digitalFaq.items)) }} />
      <ShowreelCabeza />
      <CintaOnvi />
      <Piezas />
      <div className="od-bloque od-faq-bloque">
        <Faq />
      </div>
      <Cierre
        pregunta="¿Sigues con dudas?"
        palabra="ESCRÍBENOS"
        lead="Cuéntanos sobre tu negocio, para cuándo lo necesitas y si prefieres pagar mes a mes o en un solo pago. Te respondemos en menos de 24 horas."
        primario={{ label: "Agendar reunión", href: "/planes#agendar" }}
        secundario={{ label: "Ver planes", href: "/planes" }}
      />
    </>
  );
}
