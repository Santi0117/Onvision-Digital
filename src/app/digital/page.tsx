import type { Metadata } from "next";
import CintaOnvi from "@/components/digital/CintaOnvi";
import Piezas from "@/components/digital/piezas/Piezas";
import Retos from "@/components/digital/retos/Retos";
import { ShowreelCabeza } from "@/components/digital/Showreel";
import Cierre from "@/components/od/Cierre";
import Faq from "@/components/od/Faq";
import "@/components/digital/digital.css";

export const metadata: Metadata = {
  title: "Onvision Digital — Sitios, tiendas y software a medida",
  description:
    "Sitios web, e-commerce, software a medida y apps. Diseño a tu marca, Onvi incluido y entrega lista para revisar.",
};

export default function Digital() {
  return (
    <>
      <ShowreelCabeza />
      <CintaOnvi />
      <Piezas />
      <Retos />
      <div className="od-bloque od-faq-bloque">
        <Faq />
      </div>
      <Cierre
        pregunta="¿Seguís con dudas?"
        palabra="ESCRIBINOS"
        lead="Contanos el negocio, el plazo y si preferís mensualidad o pago único."
        primario={{ label: "Agendar reunión", href: "/planes#agendar" }}
        secundario={{ label: "Ver planes", href: "/planes" }}
      />
    </>
  );
}
