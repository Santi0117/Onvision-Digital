import type { Metadata, Viewport } from "next";
import Marco from "@/components/od/Marco";
import { site } from "@/lib/site";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Antes de pintar: la intro sale una sola vez por visita y nunca con
 * movimiento reducido (Next 16, "preventing flash before hydration").
 */
const ARRANQUE = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("od-boot")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-boot","off")}else{sessionStorage.setItem("od-boot","1")}}catch(e){}})()`;

export const metadata: Metadata = {
  title: `${site.parentName} — Sitios, software y SaaS`,
  description:
    "Onvision Digital construye sitios, tiendas y software a medida, y el SaaS Onvision para empresas en Costa Rica.",
  keywords: [
    "páginas web Costa Rica",
    "tiendas online Costa Rica",
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
    title: `${site.parentName} — Tu sitio, pieza por pieza`,
    description: "Construimos lo que tu negocio necesita para vender y operar en digital.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fontVariables} data-boot="on" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ARRANQUE }} />
      </head>
      <body>
        <Marco>{children}</Marco>
      </body>
    </html>
  );
}
