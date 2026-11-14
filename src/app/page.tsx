import Home from "@/components/home/Home";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  ruta: "/",
  titulo: "Onvision Digital — Soluciones digitales hechas para vender",
  descripcion:
    "Páginas web, tiendas en línea, software a medida y apps para negocios en Costa Rica y Latinoamérica. Con Onvi IA y el Panel incluidos, desde $35 al mes.",
});

export default function Inicio() {
  return <Home />;
}
