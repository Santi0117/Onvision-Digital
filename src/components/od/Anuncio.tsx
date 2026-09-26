import { Flecha } from "./ui";

/** La franja de arriba de wisprflow, solo en el inicio. */
export default function Anuncio() {
  return (
    <div className="od-anuncio">
      <p>Sitios desde $35/mes · Onvi IA incluida en cada proyecto.</p>
      <a href="#precios">
        Ver planes
        <Flecha />
      </a>
    </div>
  );
}
