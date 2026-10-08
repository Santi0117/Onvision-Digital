import type { NextConfig } from "next";
import path from "path";

const SISTEMA = "https://sistema.onvisiondigital.com";

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
      // Lo del sistema (activar y producto) sigue en sistema.onvisiondigital.com.
      { source: "/activar", destination: `${SISTEMA}/activar`, permanent: false },
      { source: "/activar/:path+", destination: `${SISTEMA}/activar/:path+`, permanent: false },
      { source: "/producto", destination: `${SISTEMA}/producto`, permanent: false },
      // El portal de demostración ahora se muestra en el Panel Onvi de Servicios.
      { source: "/portal", destination: "/digital?servicio=panel", permanent: false },
      { source: "/portal/:path+", destination: "/digital?servicio=panel", permanent: false },
    ];
  },
  /**
   * El cobro de los verticales y el aviso de TiloPay los atiende el proyecto de
   * sistema.onvisiondigital.com: si llegan acá, pasan tal cual. (El aviso de
   * Onvo sí se atiende acá, en /api/webhooks/onvo.)
   */
  async rewrites() {
    return [
      { source: "/api/pagos/:path+", destination: `${SISTEMA}/api/pagos/:path+` },
      { source: "/api/checkout", destination: `${SISTEMA}/api/checkout` },
    ];
  },
};

export default nextConfig;
