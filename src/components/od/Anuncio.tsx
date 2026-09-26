import { Flecha } from "./ui";

/** La franja de arriba de wisprflow, solo en el inicio. */
export default function Anuncio() {
  return (
    <div className="od-anuncio">
      <p>
        Sitios desde $35/mes<span className="od-anuncio__mas"> · Onvi IA incluida en cada proyecto</span>.
      </p>
      <a href="#precios">
        Ver planes
        <Flecha />
      </a>
    </div>
  );
}
