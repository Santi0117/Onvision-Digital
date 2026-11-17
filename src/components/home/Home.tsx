"use client";

import { useCallback, useState } from "react";
import Acto from "../vision/Acto";
import VisionBoot from "../vision/VisionBoot";
import Chrome from "./Chrome";
import Cinetica from "./Cinetica";
import Contacto from "./Contacto";
import Pasos from "./Pasos";
import Proyectos from "./Proyectos";
import "./home.css";
import "./home-secciones.css";

/**
 * El inicio de Onvision Digital: la preview oficial (la laptop 3D que se
 * abre pieza por pieza) y los trabajos en video como primer acto, y después
 * tu marca en movimiento, los proyectos más recientes, cómo trabajamos y
 * "Cuéntanos tu idea", con detalles de jeffmilanes, nordpixel, driveberry y hobro.
 */
export default function Home() {
  const [ready, setReady] = useState(false);
  const alListo = useCallback(() => setReady(true), []);

  return (
    <div className="oh">
      <Acto ready={ready} />

      <div className="oh-resto">
        <Cinetica />
        <Proyectos />
        <Pasos />
        <Contacto />
      </div>

      <Chrome />
      <VisionBoot onReady={alListo} />
    </div>
  );
}
