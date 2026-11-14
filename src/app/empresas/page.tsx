import Muestrario from "@/components/empresas/Muestrario";
import Cierre from "@/components/od/Cierre";
import { empresasPage } from "@/lib/empresas";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  ruta: "/empresas",
  titulo: "Proyectos hechos para empresas reales — Onvision Digital",
  descripcion:
    "Proyectos reales de Onvision Digital: sitios web, tiendas en línea y software a medida para empresas de Costa Rica y Estados Unidos, con el enlace a cada uno.",
});

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
