import type { ReactNode } from "react";

/** Etiqueta de consola en mono con espaciado ancho (jeffmilanes, sibaldesign). */
export function Mono({
  children,
  className = "",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return <Tag className={`oh-mono ${className}`}>{children}</Tag>;
}

/** Cabecera de panel de HUD: cuadrito que brilla + etiqueta (sibaldesign). */
export function Tag({ children, derecha }: { children: ReactNode; derecha?: ReactNode }) {
  return (
    <div className="oh-tag">
      <span className="oh-tag__izq">
        <i aria-hidden />
        {children}
      </span>
      {derecha ? <span className="oh-tag__der">{derecha}</span> : null}
    </div>
  );
}

/** Las cuatro esquinas de retícula (sibaldesign). */
export function Esquinas({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`oh-corners ${className}`}>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/** Encabezado de sección de HUD: índice, título espaciado y regla (sibaldesign). */
export function Seccion({ indice, children }: { indice: string; children: ReactNode }) {
  return (
    <div className="oh-sechead">
      <span className="oh-sechead__idx">{indice}</span>
      <span className="oh-sechead__title">{children}</span>
      <span className="oh-sechead__rule" aria-hidden />
    </div>
  );
}

const FLECHAS = {
  derecha: "M5 12h14M13 6l6 6-6 6",
  izquierda: "M19 12H5M11 6l-6 6 6 6",
  abajo: "M12 5v14M6 13l6 6 6-6",
  arriba: "M12 19V5M6 11l6-6 6 6",
  diagonal: "M7 17 17 7M8 7h9v9",
  esquina: "M6 5v8a3 3 0 0 0 3 3h9M14 12l4 4-4 4",
} as const;

export function Flecha({ dir = "derecha", className = "h-4 w-4" }: { dir?: keyof typeof FLECHAS; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={FLECHAS[dir]} />
    </svg>
  );
}

export function Check({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Onda de voz dentro de una cápsula (wisprflow): Onvi escuchando. */
export function Onda({ barras = 11, className = "" }: { barras?: number; className?: string }) {
  return (
    <span className={`oh-onda ${className}`} aria-hidden>
      {Array.from({ length: barras }, (_, i) => (
        <i key={i} style={{ animationDelay: `${(i % 5) * -0.18}s` }} />
      ))}
    </span>
  );
}

/** Ícono de trazo para las píldoras negras de clarvos. */
export function Icono({ nombre, className = "h-[18px] w-[18px]" }: { nombre: IconoNombre; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICONOS[nombre]}
    </svg>
  );
}

const ICONOS = {
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2.5M13.5 14H16M8 17h2.5" />
    </>
  ),
  rayo: <path d="M13.5 3 5.5 13.5h6L10.5 21l8-10.5h-6l1-7.5Z" />,
  codigo: <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" />,
  chispa: (
    <>
      <path d="M12 3.5 13.4 9l5.1 1.5-5.1 1.5L12 17.5 10.6 12 5.5 10.5 10.6 9 12 3.5Z" />
      <path d="M18.5 15.5 19 17.3l1.8.5-1.8.5-.5 1.8-.5-1.8-1.8-.5 1.8-.5.5-1.8Z" />
    </>
  ),
  curva: (
    <>
      <path d="M3.5 19c7 0 6-14 17-14" />
      <circle cx="3.5" cy="19" r="1.4" />
      <circle cx="20.5" cy="5" r="1.4" />
    </>
  ),
  tarjeta: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  ventana: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 9h18M6.5 6.8h.01M9 6.8h.01" />
    </>
  ),
} as const;

export type IconoNombre = keyof typeof ICONOS;
