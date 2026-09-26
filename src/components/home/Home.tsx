"use client";

import { useState } from "react";
import Pago, { type Seleccion } from "../digital/Pago";
import Activar from "./Activar";
import Base from "./Base";
import Chrome from "./Chrome";
import Detalle from "./Detalle";
import Hero from "./Hero";
import Hud from "./Hud";
import Listas from "./Listas";
import Nucleo from "./Nucleo";
import Pasos from "./Pasos";
import Precios from "./Precios";
import Problema from "./Problema";
import Registro from "./Registro";
import Showcase from "./Showcase";
import { irA, planDeLinea, planPorId, seleccionDe, type Linea, type PlanPago } from "./data";
import "./home.css";
import "./home-secciones.css";

/**
 * El inicio de Onvision Digital con la estructura del de verticales:
 * portada con muesca, cinta, franja de clientes, piezas, escenas fijas en
 * negro, Onvi, cómo funciona, trabajos, HUD, planes, contacto y el cobro.
 * Todo en el color de Onvision. El pago es el mismo de /digital#planes.
 */
export default function Home() {
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
      <Hero />
      <Listas />
      <Nucleo />
      <div className="oh-negro">
        <Showcase alElegir={elegirLinea} />
        <Base />
      </div>
      <Problema />
      <div className="oh-negro">
        <Pasos />
      </div>
      <Detalle alElegir={elegirLinea} />
      <Hud />
      <Precios alElegirPlan={elegirYPagar} />
      <Registro />
      <div className="oh-negro">
        <Activar elegido={elegido} alElegir={setElegidoId} alPagar={pagar} />
      </div>

      <Chrome elegido={elegido} />
      <Pago seleccion={pago} alCerrar={() => setPago(null)} />
    </div>
  );
}
