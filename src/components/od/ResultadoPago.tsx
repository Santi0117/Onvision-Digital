import Link from "next/link";
import { wa } from "./data";
import { Flecha, Ojo } from "./ui";

const COPY = {
  success: {
    label: "Pago",
    title: "Listo. Recibimos tu mensualidad.",
    body: "Si acabás de completar el checkout de Onvo, tu plan quedó registrado. Te contactamos pronto para activar o continuar el proyecto.",
    primary: "Volver a planes",
    secondary: "Agendar reunión",
  },
  cancelled: {
    label: "Pago",
    title: "Pago cancelado",
    body: "No se cobró nada. Podés volver a los planes cuando quieras o escribirnos si necesitás ayuda.",
    primary: "Volver a planes",
    secondary: "Hablar por WhatsApp",
  },
} as const;

/** La vuelta desde Onvo: la misma copia del sitio oficial, en una tarjeta. */
export default function ResultadoPago({ variante }: { variante: "success" | "cancelled" }) {
  const c = COPY[variante];
  const ok = variante === "success";
  return (
    <section className="od-resultado" aria-labelledby="od-resultado-titulo">
      <div className="od-resultado__tarjeta" data-ok={ok ? "si" : "no"}>
        <Ojo className="od-resultado__ojo" />
        <p className="od-mono od-resultado__rotulo">{c.label}</p>
        <h1 id="od-resultado-titulo" className="od-resultado__titulo">
          {c.title}
        </h1>
        <p className="od-resultado__cuerpo">{c.body}</p>
        <div className="od-resultado__botones">
          <Link href="/digital#planes" className="od-boton od-boton--blanco">
            {c.primary} <Flecha />
          </Link>
          {ok ? (
            <Link href="/digital#agendar" className="od-boton od-boton--linea-d">
              {c.secondary}
            </Link>
          ) : (
            <a href={wa("Hola, tuve un problema con el pago de mi mensualidad.")} target="_blank" rel="noopener noreferrer" className="od-boton od-boton--linea-d">
              {c.secondary}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
