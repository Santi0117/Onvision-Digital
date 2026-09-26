import Link from "next/link";
import { webFeatures } from "@/lib/web";
import { Ojo } from "../od/ui";

const ACCIONES = [
  { label: "Ver servicios", href: "/digital" },
  { label: "Agendar reunión", href: "/digital#agendar" },
  { label: "Empresas", href: "/empresas" },
] as const;

/** Arco i de n alrededor del ojo (el sello de la preview). */
function arco(i: number, n: number) {
  const gap = 0.22;
  const step = (Math.PI * 2) / n;
  const a0 = -Math.PI / 2 + i * step + gap / 2;
  const a1 = a0 + step - gap;
  const r = 28;
  const p = (a: number) => `${(32 + Math.cos(a) * r).toFixed(2)} ${(32 + Math.sin(a) * r).toFixed(2)}`;
  return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
}

/**
 * El cierre de la preview oficial: el ojo dentro del anillo que gira, las
 * seis piezas y los tres caminos para seguir.
 */
export default function Sello() {
  return (
    <div className="oh-sello">
      <div className="oh-sello__marca">
        <span className="oh-sello__ojo" aria-hidden>
          <svg className="oh-sello__anillo" viewBox="0 0 64 64">
            {webFeatures.map((f, i) => (
              <path key={f.id} d={arco(i, webFeatures.length)} />
            ))}
          </svg>
          <Ojo className="oh-sello__icono" />
        </span>
        <ul className="oh-sello__piezas">
          {webFeatures.map((f) => (
            <li key={f.id}>
              <i aria-hidden />
              {f.id === "contacto" ? "software" : f.id === "tienda" ? "pagos" : f.id}
            </li>
          ))}
        </ul>
      </div>
      <nav className="oh-sello__acciones" aria-label="Seguir explorando">
        {ACCIONES.map((a) => (
          <Link key={a.href} href={a.href} className="oh-sello__boton">
            {a.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
