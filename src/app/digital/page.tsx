import type { Metadata } from "next";
import CintaOnvi from "@/components/digital/CintaOnvi";
import Piezas from "@/components/digital/piezas/Piezas";
import { ShowreelCabeza } from "@/components/digital/Showreel";
import Cierre from "@/components/od/Cierre";
import Faq from "@/components/od/Faq";
import "@/components/digital/digital.css";

export const metadata: Metadata = {
  title: "Onvision Digital — Sitios, tiendas y software a medida",
  description:
    "Páginas web, tiendas en línea, software a medida y apps. Diseño a tu marca, Onvi incluido y entrega lista para revisar.",
};

export default function Digital() {
  return (
    <>
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
