import type { Metadata } from "next";
import ResultadoPago from "@/components/od/ResultadoPago";

export const metadata: Metadata = {
  title: "Pago recibido — Onvision Digital",
  robots: { index: false },
};

export default function PagoExito() {
  return <ResultadoPago variante="success" />;
}
