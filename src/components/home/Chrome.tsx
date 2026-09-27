"use client";

import Linea from "../vision/Linea";
import { ESCENAS, irA } from "./data";

/** Lo que queda fijo sobre el inicio: la línea de avance de la preview con el contador de escenas de jeffmilanes. */
export default function Chrome() {
  return <Linea escenas={ESCENAS} alIr={(id) => irA(id)} />;
}
