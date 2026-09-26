"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cliWelcomeReply, companyOnvi } from "@/lib/company";
import { abrirOnvi } from "../od/OnviChat";
import { ConPunto, Flecha, Ojo } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
/** La bienvenida de Onvi: el saludo y lo que hace en cada proyecto. */
const TEXTOS = cliWelcomeReply.steps.filter((s) => s.kind === "text");
const MENSAJES = [TEXTOS[0], TEXTOS[TEXTOS.length - 1]].filter(Boolean) as typeof TEXTOS;

const AVISOS = [
  { icono: "⚡", titulo: "Onvi activa", texto: "Atiende 24/7 en español", clase: "a" },
  { icono: "✓", titulo: "Cita agendada", texto: "Confirmación en segundos", clase: "b" },
  { icono: "◎", titulo: "Nuevo lead", texto: "Te pasa los leads", clase: "c" },
];

/**
 * Onvi como el teléfono de driveberry: el celular con la conversación y
 * tarjetas de vidrio flotando alrededor ("IA activée", "Garage trouvé").
 */
export default function Onvi() {
  return (
    <section className="od-onvisec" aria-labelledby="od-onvi-titulo">
      <div className="od-onvisec__copy">
        <p className="od-eyebrow">(03) Onvi · IA incluida</p>
        <h2 id="od-onvi-titulo" className="od-h2">
          <ConPunto>{companyOnvi.title}</ConPunto>
        </h2>
        <ul className="od-onvisec__puntos">
          {companyOnvi.points.map((p, i) => (
            <li key={p}>
              <span className="od-mono">{String(i + 1).padStart(2, "0")}</span>
              {p}
            </li>
          ))}
        </ul>
        <div className="od-onvisec__botones">
          <button type="button" className="od-boton od-boton--cian" onClick={abrirOnvi}>
            Hablar con Onvi <Flecha />
          </button>
          <Link href={companyOnvi.cta.href} className="od-boton od-boton--linea-d">
            {companyOnvi.cta.label}
          </Link>
        </div>
      </div>

      <div className="od-onvisec__escena" aria-hidden>
        <i className="od-onvisec__halo" />
        <motion.div
          className="od-telefono"
          initial={{ y: 60, opacity: 0, rotate: -4 }}
          whileInView={{ y: 0, opacity: 1, rotate: -2 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <span className="od-telefono__isla" />
          <div className="od-telefono__pantalla">
            <p className="od-telefono__cabeza">
              <Ojo className="od-telefono__ojo" /> Onvi <i />
            </p>
            <div className="od-telefono__hilo">
              {MENSAJES.map((m) => (
                <p key={m.text} className="od-telefono__msj">
                  {m.text}
                </p>
              ))}
              <p className="od-telefono__msj od-telefono__msj--yo">¿Tienen citas mañana?</p>
              <p className="od-telefono__escribe">
                <i />
                <i />
                <i />
              </p>
            </div>
          </div>
        </motion.div>

        {AVISOS.map((a, i) => (
          <motion.div
            key={a.titulo}
            className={`od-vidrio od-vidrio--${a.clase}`}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.4 + i * 0.18 }}
          >
            <span className="od-vidrio__icono">{a.icono}</span>
            <span>
              <b>{a.titulo}</b>
              {a.texto}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
