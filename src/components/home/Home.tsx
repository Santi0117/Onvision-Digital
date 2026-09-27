"use client";

import { useCallback, useState } from "react";
import Pago, { type Seleccion } from "../digital/Pago";
import Acto from "../vision/Acto";
import VisionBoot from "../vision/VisionBoot";
import Activar from "./Activar";
import BaseComun from "./BaseComun";
import Chrome from "./Chrome";
import Cinetica from "./Cinetica";
import Hud from "./Hud";
import Listas from "./Listas";
import Precios from "./Precios";
import Registro from "./Registro";
import Sello from "./Sello";
import { irA, planPorId, seleccionDe, type PlanPago } from "./data";
import "./home.css";
import "./home-secciones.css";

/**
 * El inicio de Onvision Digital: la preview oficial (la laptop 3D que se
 * abre pieza por pieza y "Lo que hacemos") como primer acto, y después la
 * base común, los clientes, Onvision vs el mercado, los planes, el
 * contacto y el cobro, con detalles de jeffmilanes, nordpixel, driveberry
 * y hobro. Los trabajos de cada empresa viven en /empresas.
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
  const pagar = () => {
    if (elegido) setPago(seleccionDe(elegido));
  };

  return (
    <div className="oh">
      <Acto ready={ready} />

      <div className="oh-resto">
        <BaseComun />
        <Listas />
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
