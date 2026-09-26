import type { Metadata } from "next";
import Nosotros from "@/components/nosotros/Nosotros";
import Cierre from "@/components/od/Cierre";
import { aboutPage } from "@/lib/about";
import "@/components/nosotros/nosotros.css";

export const metadata: Metadata = {
  title: "Sobre nosotros — Onvision Digital",
  description: aboutPage.hero.lead,
};

export default function SobreNosotros() {
  return (
    <>
      <Nosotros />
      <Cierre
        pregunta={aboutPage.cta.title}
        palabra="EMPECEMOS"
        lead="Sitios, tiendas y software a medida — calidad seria, precios que se pueden sostener."
        primario={{ label: aboutPage.cta.primary.label, href: aboutPage.cta.primary.href }}
        secundario={{ label: aboutPage.cta.secondary.label, href: aboutPage.cta.secondary.href }}
      />
    </>
  );
}
