import Home from "@/components/home/Home";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  ruta: "/",
  titulo: "Páginas web en Costa Rica desde $35/mes | Onvision Digital",
  descripcion:
    "Páginas web, tiendas en línea, software y apps para negocios en Costa Rica. Desde $35 al mes, hosting incluido y respuesta en menos de 24 horas.",
});

export default function Inicio() {
  return <Home />;
}
