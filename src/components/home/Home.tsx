"use client";

import { useCallback, useState } from "react";
import Pago, { type Seleccion } from "../digital/Pago";
import Acto from "../vision/Acto";
import VisionBoot from "../vision/VisionBoot";
import Chrome from "./Chrome";
import Cinetica from "./Cinetica";
import Hud from "./Hud";
import PanelOnvi from "./PanelOnvi";
import Precios from "./Precios";
import Registro from "./Registro";
import { seleccionDe, type PlanPago } from "./data";
import "./home.css";
import "./home-secciones.css";

/**
 * El inicio de Onvision Digital: la preview oficial (la laptop 3D que se
 * abre pieza por pieza y "Lo que hacemos") como primer acto, y después tu
 * marca en movimiento, el Panel Onvi, Onvision vs el mercado, los planes y
 * el contacto, con detalles de jeffmilanes, nordpixel, driveberry y hobro.
 * Elegir un plan abre directo el pago.
 */
export default function Home() {
  const [ready, setReady] = useState(false);
  const alListo = useCallback(() => setReady(true), []);
  const [pago, setPago] = useState<Seleccion | null>(null);

  const elegir = (plan: PlanPago) => setPago(seleccionDe(plan));

  return (
    <div className="oh">
      <Acto ready={ready} />

      <div className="oh-resto">
        <Cinetica />
        <PanelOnvi />
        <Hud />
        <Precios alElegirPlan={elegir} />
        <Registro />
      </div>

      <Chrome />
      <Pago seleccion={pago} alCerrar={() => setPago(null)} />
      <VisionBoot onReady={alListo} />
    </div>
  );
}
