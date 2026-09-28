import type { Metadata } from "next";
import Muestrario from "@/components/empresas/Muestrario";
import Cierre from "@/components/od/Cierre";
import { empresasPage } from "@/lib/empresas";

export const metadata: Metadata = {
  title: "Empresas — Onvision Digital",
  description: empresasPage.lead,
};

export default function EmpresasRuta() {
  return (
    <>
      <Muestrario />
      <Cierre
        pregunta={empresasPage.cta.title}
        palabra="EL TUYO"
        lead={empresasPage.cta.lead}
        primario={{ label: empresasPage.cta.label, href: empresasPage.cta.href }}
        secundario={{ label: "Ver los servicios", href: "/digital" }}
      />
    </>
  );
}
