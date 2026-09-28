import type { NextConfig } from "next";
import path from "path";

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
      { source: "/contacto", destination: "/planes#agendar", permanent: true },
      { source: "/faq", destination: "/digital#faq", permanent: true },
      { source: "/proceso", destination: "/digital", permanent: true },
      { source: "/portafolio", destination: "/empresas", permanent: true },
      { source: "/cobertura", destination: "/empresas", permanent: true },
      { source: "/galeria-stack", destination: "/empresas", permanent: true },
      { source: "/studio", destination: "/digital", permanent: false },
      { source: "/web", destination: "/", permanent: false },
      { source: "/landing", destination: "/", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/activar", destination: "https://sistema.onvisiondigital.com/activar", permanent: false },
      { source: "/producto", destination: "https://sistema.onvisiondigital.com/producto", permanent: false },
    ];
  },
};

export default nextConfig;
