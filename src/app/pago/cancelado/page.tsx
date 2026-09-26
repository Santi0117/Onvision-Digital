import type { Metadata } from "next";
import ResultadoPago from "@/components/od/ResultadoPago";

export const metadata: Metadata = {
  title: "Pago cancelado — Onvision Digital",
  robots: { index: false },
};

export default function PagoCancelado() {
  return <ResultadoPago variante="cancelled" />;
}
