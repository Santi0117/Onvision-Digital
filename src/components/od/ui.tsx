import type { CSSProperties, ReactNode } from "react";
import { EYE_PUPIL_R, eyeOutlinePath } from "@/lib/ojo";

/** El ojo oficial en vector: contorno + pupila hueca (viewBox 0 0 100 56). */
const S = 49;
const CX = 50;
const CY = 28;
const R = EYE_PUPIL_R * S;
export const OJO_CONTORNO = eyeOutlinePath(S, CX, CY);
const PUPILA = `M ${(CX - R).toFixed(2)} ${CY} a ${R.toFixed(2)} ${R.toFixed(2)} 0 1 0 ${(2 * R).toFixed(2)} 0 a ${R.toFixed(2)} ${R.toFixed(2)} 0 1 0 ${(-2 * R).toFixed(2)} 0 Z`;
export const OJO_D = `${OJO_CONTORNO} ${PUPILA}`;

export function Ojo({ className = "", titulo }: { className?: string; titulo?: string }) {
  return (
    <svg
      viewBox="0 0 100 56"
      className={className}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      <path d={OJO_D} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** "onvision." con el punto de color, como la marca en el menú. */
export function Marca({ className = "", conOjo = true }: { className?: string; conOjo?: boolean }) {
  return (
    <span className={`od-marca ${className}`}>
      {conOjo ? <Ojo className="od-marca__ojo" /> : null}
      <span className="od-marca__txt">
        onvision<span className="od-punto">.</span>
      </span>
    </span>
  );
}

/** El punto de color al final de cada título (nordpixel). */
export function Punto() {
  return (
    <span className="od-punto" aria-hidden>
      .
    </span>
  );
}

/** Título con punto final: el texto accesible queda completo. */
export function ConPunto({ children }: { children: string }) {
  const sinPunto = children.replace(/[.:]$/, "");
  const final = children.slice(sinPunto.length);
  return (
    <>
      {sinPunto}
      {final === ":" ? ":" : <Punto />}
    </>
  );
}

type DirFlecha = "derecha" | "abajo" | "diagonal" | "arriba" | "izquierda";

export function Flecha({ dir = "derecha", className = "" }: { dir?: DirFlecha; className?: string }) {
  const rot: Record<DirFlecha, number> = { derecha: 0, abajo: 90, izquierda: 180, arriba: -90, diagonal: -45 };
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`od-flecha ${className}`}
      style={{ transform: `rotate(${rot[dir]}deg)` }}
      aria-hidden
      focusable="false"
    >
      <path d="M2.5 8h10.5M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden focusable="false">
      <path d="M3.5 8.4l2.8 2.8L12.6 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Mas({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden focusable="false">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Cerrar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden focusable="false">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconoWhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"
      />
    </svg>
  );
}

export function IconoInstagram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** El globo de alambre de hobro, bajo el título de la portada. */
export function Globo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 22" fill="none" className={className} aria-hidden focusable="false">
      <path d="M2 21a18 18 0 0 1 36 0" stroke="currentColor" strokeWidth="1" />
      <path d="M11 21c0-9.4 4-17 9-17s9 7.6 9 17" stroke="currentColor" strokeWidth="1" />
      <path d="M20 4v17M4.5 14h31M8.5 8.5h23" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Etiqueta con rayas a los lados: "—— MARCAS EN MOVIMIENTO ——" (nordpixel). */
export function Eyebrow({ children, rayas = false, className = "" }: { children: ReactNode; rayas?: boolean; className?: string }) {
  return (
    <p className={`od-eyebrow${rayas ? " od-eyebrow--rayas" : ""} ${className}`}>
      {rayas ? <i aria-hidden /> : null}
      <span>{children}</span>
      {rayas ? <i aria-hidden /> : null}
    </p>
  );
}

/** Contador entre paréntesis de hobro: "(01)". */
export function Indice({ n, className = "" }: { n: number | string; className?: string }) {
  const t = typeof n === "number" ? String(n).padStart(2, "0") : n;
  return <span className={`od-indice ${className}`}>({t})</span>;
}

/** Texto en círculo que gira alrededor de una flecha (nordpixel). */
export function Sello({
  texto,
  href,
  className = "",
  etiqueta,
}: {
  texto: string;
  href: string;
  className?: string;
  etiqueta: string;
}) {
  const id = `od-sello-${texto.replace(/[^a-z]/gi, "").slice(0, 12).toLowerCase()}`;
  return (
    <a href={href} className={`od-sello ${className}`} aria-label={etiqueta}>
      <svg viewBox="0 0 120 120" className="od-sello__aro" aria-hidden focusable="false">
        <defs>
          <path id={id} d="M60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0" />
        </defs>
        <text>
          <textPath href={`#${id}`} startOffset="0">
            {texto}
          </textPath>
        </text>
      </svg>
      <span className="od-sello__centro">
        <Flecha dir="diagonal" />
      </span>
    </a>
  );
}

/** Tono de acento local para una pieza (variables CSS). */
export function tono(color: string): CSSProperties {
  return { "--tono": color } as CSSProperties;
}
