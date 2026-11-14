import type { MetadataRoute } from "next";
import { SITIO_URL } from "@/lib/seo";

/** Todos pueden leer el sitio (buscadores y asistentes con IA), menos la API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITIO_URL}/sitemap.xml`,
  };
}
