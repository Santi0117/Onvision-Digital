"use client";

import dynamic from "next/dynamic";
import LoQueHacemos from "../home/LoQueHacemos";
import Portada from "./Portada";
import VisionCore from "./VisionCore";
import "./vision.css";

const VisionScene = dynamic(() => import("./VisionScene"), { ssr: false });

/**
 * El primer acto del inicio, en oscuro: la escena 3D fija detrás (la laptop
 * de la preview oficial), la portada, el núcleo que se abre pieza por pieza
 * y "Lo que hacemos", las seis piezas en puntos. Después sigue el resto de
 * la página, encima.
 */
export default function Acto({ ready }: { ready: boolean }) {
  return (
    <div className="oh-acto">
      <VisionScene kind="laptop" />
      <div className="oh-acto__main">
        <Portada ready={ready} />
        <VisionCore />
        <LoQueHacemos />
      </div>
    </div>
  );
}
