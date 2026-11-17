import type { Metadata } from "next";
import { digitalFaq, type planesFaq } from "@/lib/digital";
import { site } from "@/lib/site";

/** La dirección pública del sitio: canonical, sitemap, Open Graph y schema salen de acá. */
export const SITIO_URL = site.parentUrl;

/** Las páginas que van al sitemap (las de pago no: son noindex). */
export const PAGINAS_PUBLICAS = [
  { ruta: "/", prioridad: 1 },
  { ruta: "/digital", prioridad: 0.9 },
  { ruta: "/planes", prioridad: 0.9 },
  { ruta: "/empresas", prioridad: 0.8 },
  { ruta: "/sobre-nosotros", prioridad: 0.6 },
] as const;

type Ruta = (typeof PAGINAS_PUBLICAS)[number]["ruta"];

/**
 * La imagen que sale al compartir un enlace del sitio (public/og.png). El
 * "?v=" cambia cuando cambia la imagen, para que WhatsApp y las redes no
 * sigan mostrando la vieja.
 */
export const IMAGEN_REDES = {
  url: "/og.png?v=2",
  width: 1200,
  height: 630,
  alt: "Onvision Digital: tu página web lista para vender, desde $35 al mes. Hecho en Costa Rica, hosting incluido.",
};

/**
 * Título, descripción, canonical y tarjeta para redes de una página. Cada
 * página arma la suya: si no, heredan el Open Graph del inicio. La imagen va
 * explícita porque el Open Graph de una página reemplaza al del layout.
 */
export function metaPagina({ ruta, titulo, descripcion }: { ruta: Ruta; titulo: string; descripcion: string }): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      locale: "es_CR",
      siteName: site.parentName,
      url: ruta,
      title: titulo,
      description: descripcion,
      images: [IMAGEN_REDES],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: [IMAGEN_REDES] },
  };
}

const ORGANIZACION_ID = `${SITIO_URL}/#organizacion`;

/** Quiénes somos, para Google y los buscadores con IA (en todas las páginas). */
export const schemaSitio = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZACION_ID,
      name: site.parentName,
      alternateName: site.name,
      url: SITIO_URL,
      logo: { "@type": "ImageObject", url: `${SITIO_URL}/logo-eye.png`, width: 532, height: 282 },
      image: `${SITIO_URL}${IMAGEN_REDES.url}`,
      description:
        "Equipo de Costa Rica que crea páginas web, tiendas en línea, software a medida y apps móviles para negocios en Costa Rica y Latinoamérica.",
      email: site.email,
      telephone: site.phone.replace(/[\s-]/g, ""),
      address: { "@type": "PostalAddress", addressCountry: "CR" },
      areaServed: [
        { "@type": "Country", name: "Costa Rica" },
        { "@type": "Place", name: "Latinoamérica" },
      ],
      sameAs: [site.instagram],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: site.phone.replace(/[\s-]/g, ""),
        email: site.email,
        availableLanguage: ["es"],
      },
      knowsAbout: ["Páginas web", "Tiendas en línea", "Software a medida", "Apps móviles", "Facturación electrónica"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITIO_URL}/#sitio`,
      url: SITIO_URL,
      name: site.parentName,
      inLanguage: "es",
      publisher: { "@id": ORGANIZACION_ID },
    },
  ],
};

type PreguntaFaq = (typeof digitalFaq.items)[number] | (typeof planesFaq.items)[number];

/** Preguntas frecuentes (las de Servicios o las de Planes), tal como se leen en la página. */
export const schemaFaq = (items: readonly PreguntaFaq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: [it.a, ...("groups" in it ? it.groups.map((g) => `${g.title}: ${g.points.join(" ")}`) : [])].join(" "),
    },
  })),
});

/** Para <script type="application/ld+json">: sin "<" crudos dentro. */
export const jsonLd = (dato: object) => JSON.stringify(dato).replace(/</g, "\\u003c");
