"use client";

import { useCallback, useState } from "react";
import Pago, { type Seleccion } from "../digital/Pago";
import Acto from "../vision/Acto";
import VisionBoot from "../vision/VisionBoot";
import Activar from "./Activar";
import BaseComun from "./BaseComun";
import Chrome from "./Chrome";
import Cinetica from "./Cinetica";
import Cinta from "./Cinta";
import Detalle from "./Detalle";
import Hud from "./Hud";
import Listas from "./Listas";
import Precios from "./Precios";
import Problema from "./Problema";
import Registro from "./Registro";
import Sello from "./Sello";
import Showcase from "./Showcase";
import { irA, planDeLinea, planPorId, seleccionDe, type Linea, type PlanPago } from "./data";
import "./home.css";
import "./home-secciones.css";

/**
 * El inicio de Onvision Digital: la preview oficial (la laptop 3D que se
 * abre pieza por pieza y el dial de los detalles) como primer acto, y
 * después el recorrido del inicio anterior — clientes, servicios, Onvi,
 * cómo funciona, trabajos, el HUD, planes, contacto y el cobro —, con
 * detalles de jeffmilanes, nordpixel, driveberry y hobro.
 */
export default function Home() {
  const [ready, setReady] = useState(false);
  const alListo = useCallback(() => setReady(true), []);
  const [elegidoId, setElegidoId] = useState<string | null>(null);
  const [pago, setPago] = useState<Seleccion | null>(null);
  const elegido = planPorId(elegidoId);

  const elegirYPagar = (plan: PlanPago) => {
    setElegidoId(plan.id);
    irA("activar", "oh-pagar");
  };
  const elegirLinea = (linea: Linea) => elegirYPagar(planDeLinea(linea));
  const pagar = () => {
    if (elegido) setPago(seleccionDe(elegido));
  };

  return (
    <div className="oh">
      <Acto ready={ready} />

      <div className="oh-resto">
        <BaseComun />
        <Listas />
        {/* Servicios arranca con la cinta ("Onvi incluida") y sigue con las líneas. */}
        <div id="servicios">
          <div className="oh-abre">
            <Cinta />
          </div>
          <div className="oh-negro" data-tema="oscuro">
            <Showcase alElegir={elegirLinea} />
          </div>
        </div>
        <Problema />
        <Detalle alElegir={elegirLinea} />
        <Cinetica />
        <Hud />
        <Precios alElegirPlan={elegirYPagar} />
        <Registro />
        <div className="oh-negro" data-tema="oscuro">
          <Activar elegido={elegido} alElegir={setElegidoId} alPagar={pagar} />
          <Sello />
        </div>
      </div>

      <Chrome elegido={elegido} />
      <Pago seleccion={pago} alCerrar={() => setPago(null)} />
      <VisionBoot onReady={alListo} />
    </div>
  );
}
