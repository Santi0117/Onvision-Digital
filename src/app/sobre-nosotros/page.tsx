import Nosotros from "@/components/nosotros/Nosotros";
import Cierre from "@/components/od/Cierre";
import { aboutPage } from "@/lib/about";
import { metaPagina } from "@/lib/seo";
import "@/components/nosotros/nosotros.css";

export const metadata = metaPagina({
  ruta: "/sobre-nosotros",
  titulo: "Sobre nosotros: un equipo de Costa Rica — Onvision Digital",
  descripcion:
    "Somos Onvision Digital, un equipo de Costa Rica que crea páginas web, tiendas, sistemas y apps con pagos mensuales: buen diseño, rapidez y soporte.",
});

export default function SobreNosotros() {
  return (
    <>
      <Nosotros />
      <Cierre
        pregunta={aboutPage.cta.title}
        palabra="EMPECEMOS"
        lead={null}
        primario={{ label: aboutPage.cta.primary.label, href: aboutPage.cta.primary.href }}
        secundario={{ label: aboutPage.cta.secondary.label, href: aboutPage.cta.secondary.href }}
      />
    </>
  );
}
