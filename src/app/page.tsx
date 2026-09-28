import type { Metadata } from "next";
import Home from "@/components/home/Home";

export const metadata: Metadata = {
  title: "Onvision Digital — Soluciones digitales hechas para vender",
  description: "Construimos lo que tu negocio necesita para vender y operar en digital.",
};

export default function Inicio() {
  return <Home />;
}
