import type { Metadata } from "next";
import Home from "@/components/home/Home";

export const metadata: Metadata = {
  title: "Onvision Digital — Tu sitio, pieza por pieza",
  description: "Construimos lo que tu negocio necesita para vender y operar en digital.",
};

export default function Inicio() {
  return <Home />;
}
