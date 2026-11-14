import type { MetadataRoute } from "next";
import { PAGINAS_PUBLICAS, SITIO_URL } from "@/lib/seo";

/** Las páginas públicas, con la fecha de la última publicación del sitio. */
export default function sitemap(): MetadataRoute.Sitemap {
  const hoy = new Date();
  return PAGINAS_PUBLICAS.map(({ ruta, prioridad }) => ({
    url: ruta === "/" ? SITIO_URL : `${SITIO_URL}${ruta}`,
    lastModified: hoy,
    changeFrequency: "monthly",
    priority: prioridad,
  }));
}
