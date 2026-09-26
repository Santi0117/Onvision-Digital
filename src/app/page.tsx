import type { Metadata } from "next";
import Casos from "@/components/inicio/Casos";
import Chats from "@/components/inicio/Chats";
import Cinetica from "@/components/inicio/Cinetica";
import Confianza from "@/components/inicio/Confianza";
import Funciones from "@/components/inicio/Funciones";
import IndiceServicios from "@/components/inicio/IndiceServicios";
import Ofertas from "@/components/inicio/Ofertas";
import Onvi from "@/components/inicio/Onvi";
import Panel from "@/components/inicio/Panel";
import Piezas from "@/components/inicio/Piezas";
import Portada from "@/components/inicio/Portada";
import QueHacemos from "@/components/inicio/QueHacemos";
import Sistema from "@/components/inicio/Sistema";
import Cierre from "@/components/od/Cierre";
import "@/components/inicio/inicio.css";

export const metadata: Metadata = {
  title: "Onvision Digital — Tu sitio, pieza por pieza",
  description: "Construimos lo que tu negocio necesita para vender y operar en digital.",
};

export default function Inicio() {
  return (
    <>
      <Portada />
      <Confianza />
      <div className="od-bloque od-bloque--pegado">
        <QueHacemos />
        <IndiceServicios />
      </div>
      <Piezas />
      <div className="od-bloque od-bloque--hielo">
        <Funciones />
      </div>
      <Onvi />
      <div className="od-bloque">
        <Chats />
        <Cinetica />
        <Casos />
      </div>
      <Sistema />
      <div className="od-bloque">
        <Panel />
        <Ofertas />
      </div>
      <Cierre secundario={{ label: "Ver planes", href: "/digital#planes" }} />
    </>
  );
}
