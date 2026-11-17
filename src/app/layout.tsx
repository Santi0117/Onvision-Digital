import type { Metadata, Viewport } from "next";
import Marco from "@/components/od/Marco";
import { IMAGEN_REDES, jsonLd, schemaSitio, SITIO_URL } from "@/lib/seo";
import { site } from "@/lib/site";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Antes de pintar: la intro sale una sola vez por visita y nunca con
 * movimiento reducido (Next 16, "preventing flash before hydration").
 */
const ARRANQUE = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("od-boot")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-boot","off")}else{sessionStorage.setItem("od-boot","1")}}catch(e){}})()`;

/**
 * Guardia de copias viejas: Safari a veces reabre una pestaña con el HTML de
 * antes de la última versión, y sus archivos de JavaScript ya no existen.
 * Si uno de ellos no carga, o la página no arranca (Marco marca `__odVivo`)
 * a los 6 s de cargar o al volver del historial, recarga una sola vez.
 */
const GUARDIA = `(function(){try{var K="od-recarga",w=window;function r(){if(w.__odVivo)return;try{if(sessionStorage.getItem(K))return;sessionStorage.setItem(K,"1")}catch(e){return}location.reload()}w.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="SCRIPT"&&String(t.src).indexOf("/_next/")>-1)r()},true);w.addEventListener("load",function(){setTimeout(r,6000)});w.addEventListener("pageshow",function(e){if(e.persisted)r()})}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: `${site.parentName} — Sitios, tiendas, software y apps`,
  description:
    "Onvision Digital construye sitios, tiendas y software a medida para empresas en Latinoamérica, y el Sistema Onvision.",
  keywords: [
    "páginas web Latinoamérica",
    "tiendas en línea Latinoamérica",
    "páginas web Costa Rica",
    "tiendas en línea Costa Rica",
    "software a medida",
    "apps móviles",
    "facturación electrónica Costa Rica",
    "SINPE Móvil",
    "Onvision",
    "Onvision Digital",
  ],
  icons: { icon: [{ url: "/logo-eye-accent.png", type: "image/png" }] },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: site.parentName,
    title: `${site.parentName} — Tu página web lista para vender, desde $35 al mes`,
    description:
      "Páginas web, tiendas en línea, software y apps para negocios en Costa Rica. Desde $35 al mes, hosting incluido y respuesta en menos de 24 horas.",
    images: [IMAGEN_REDES],
  },
  twitter: { card: "summary_large_image", images: [IMAGEN_REDES] },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fontVariables} data-boot="on" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ARRANQUE }} />
        <script dangerouslySetInnerHTML={{ __html: GUARDIA }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemaSitio) }} />
        <Marco>{children}</Marco>
      </body>
    </html>
  );
}
