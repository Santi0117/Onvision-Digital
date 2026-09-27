import type { Metadata } from "next";
import Agenda from "@/components/digital/Agenda";
import CintaOnvi from "@/components/digital/CintaOnvi";
import Impacto from "@/components/digital/Impacto";
import Incluye from "@/components/digital/Incluye";
import Planes from "@/components/digital/Planes";
import Showreel, { ShowreelCabeza } from "@/components/digital/Showreel";
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
      <Showreel />
      <div className="od-bloque">
        <Incluye />
        <Planes />
      </div>
      <Impacto />
      <div className="od-bloque od-bloque--hielo">
        <Agenda />
      </div>
      <div className="od-bloque od-faq-bloque">
        <Faq />
      </div>
      <Cierre
        pregunta="¿Seguís con dudas?"
        palabra="ESCRIBINOS"
        lead="Contanos el negocio, el plazo y si preferís mensualidad o pago único."
        primario={{ label: "Agendar reunión", href: "/digital#agendar" }}
        secundario={{ label: "Ver empresas", href: "/empresas" }}
      />
    </>
  );
}
