/**
 * Íconos de píxeles como los de las tarjetas de precios de nordpixel.
 * Cada figura es una grilla de 7×7: "#" lleno, "+" medio tono, "." vacío.
 */
const FIGURAS = {
  web: ["#######", "#.#.#.#", "#######", "#.....#", "#.###.#", "#.....#", "#######"],
  tienda: [".......", "#......", ".######", ".#++++#", ".#++++#", ".######", "..#..#."],
  software: ["###.###", "#+#.#+#", "###.###", ".......", "###.###", "#+#.#+#", "###.###"],
  movil: ["..###..", "..#+#..", "..#+#..", "..#+#..", "..#+#..", "..###..", "...#..."],
} as const;

export type FiguraPixel = keyof typeof FIGURAS;

export default function Pixel({ figura, className = "" }: { figura: FiguraPixel; className?: string }) {
  const filas = FIGURAS[figura];
  return (
    <svg viewBox="0 0 7 7" className={`od-pixel ${className}`} aria-hidden focusable="false" shapeRendering="crispEdges">
      {filas.flatMap((fila, y) =>
        fila.split("").map((c, x) =>
          c === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" opacity={c === "+" ? 0.35 : 1} />
          ),
        ),
      )}
    </svg>
  );
}
