import type { NextConfig } from "next";
import path from "path";

/** La página del Sistema (Verticales, el diseño nuevo). */
const SISTEMA = "https://sistema.onvisiondigital.com";
/**
 * El sistema anterior (proyecto onvision-landing), que antes estaba en
 * sistema.onvisiondigital.com: sigue cobrando los verticales y atendiendo el
 * aviso de TiloPay.
 */
const SISTEMA_ANTERIOR = "https://onvision-landing.vercel.app";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  /** Las direcciones viejas del sitio oficial siguen funcionando. */
  async redirects() {
    return [
      { source: "/servicios", destination: "/digital", permanent: true },
      { source: "/cotizar", destination: "/planes#agendar", permanent: true },
      { source: "/agendar", destination: "/planes#agendar", permanent: true },
      { source: "/contacto", destination: "/#contacto", permanent: true },
      { source: "/faq", destination: "/digital#faq", permanent: true },
      { source: "/proceso", destination: "/digital", permanent: true },
      { source: "/portafolio", destination: "/empresas", permanent: true },
      { source: "/cobertura", destination: "/empresas", permanent: true },
      { source: "/galeria-stack", destination: "/empresas", permanent: true },
      { source: "/studio", destination: "/digital", permanent: false },
      { source: "/web", destination: "/", permanent: false },
      { source: "/landing", destination: "/", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/vision", destination: "/", permanent: false },
      // Activar y el producto: la página del Sistema (allá /activar?vertical=… abre Activar con esa industria).
      { source: "/activar", destination: `${SISTEMA}/activar`, permanent: false },
      { source: "/activar/:path+", destination: `${SISTEMA}/activar/:path+`, permanent: false },
      { source: "/producto", destination: SISTEMA, permanent: false },
      // El portal de demostración ahora se muestra en el Panel Onvi de Servicios.
      { source: "/portal", destination: "/digital?servicio=panel", permanent: false },
      { source: "/portal/:path+", destination: "/digital?servicio=panel", permanent: false },
    ];
  },
  /**
   * El cobro de los verticales y el aviso de TiloPay los atiende el sistema
   * anterior: si llegan acá, pasan tal cual. (El aviso de Onvo sí se atiende
   * acá, en /api/webhooks/onvo.)
   */
  async rewrites() {
    return [
      { source: "/api/pagos/:path+", destination: `${SISTEMA_ANTERIOR}/api/pagos/:path+` },
      { source: "/api/checkout", destination: `${SISTEMA_ANTERIOR}/api/checkout` },
    ];
  },
};

export default nextConfig;
