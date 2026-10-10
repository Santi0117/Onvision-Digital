import { Ojo } from "../../od/ui";

/**
 * La tarjeta de Onvi en Servicios: solo el chat, como el del sitio, con un
 * cliente que pregunta y Onvi que responde (primero "escribiendo…" y después
 * la respuesta). Es una ilustración: se lee con `alt` y no se puede tocar.
 * Se anima cada vez que la tarjeta queda al frente (ver .oc en piezas.css).
 */
export default function ChatOnvi({ alt }: { alt: string }) {
  return (
    <div className="oc" role="img" aria-label={alt}>
      <div className="oc__cabeza">
        <span className="oc__avatar">
          <Ojo className="oc__ojo" />
          <i />
        </span>
        <span className="oc__quien">
          <b>Onvi</b>
          <span className="oc__estado">
            <span className="oc__estado-lista">lista para ayudarte</span>
            <span className="oc__estado-escribe">escribiendo…</span>
          </span>
        </span>
      </div>
      <p className="oc__rotulo">ONVI · ASISTENTE CON IA · 24/7</p>
      <div className="oc__hilo">
        <p className="oc__fila oc__fila--yo">
          <span className="oc__burbuja">Hola, ¿tienen espacio mañana en la tarde?</span>
        </p>
        <p className="oc__fila oc__fila--onvi">
          <span className="oc__puntos">
            <i />
            <i />
            <i />
          </span>
          <span className="oc__burbuja">
            ¡Hola! Sí, mañana tengo libre a las 3:00 y a las 4:30 p. m. ¿Cuál te reservo? Solo necesito tu nombre y tu WhatsApp.
          </span>
        </p>
        <span className="oc__chips">
          <span>3:00 p. m.</span>
          <span>4:30 p. m.</span>
          <span>Ver precios</span>
        </span>
      </div>
      <span className="oc__form">
        <span className="oc__prompt">›</span>
        <span className="oc__placeholder">Escríbele a Onvi…</span>
        <span className="oc__enviar">Enviar</span>
      </span>
    </div>
  );
}
