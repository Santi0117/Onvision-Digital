"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clientChats } from "@/lib/client-chats";
import { companyChats } from "@/lib/company";
import { ConPunto, Flecha } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * "Los clientes piden el sistema. Nosotros lo dejamos corriendo." — la
 * bandeja de chats del sitio oficial en tarjetas blancas de nordpixel. Los
 * mensajes caen uno por uno y la bandeja pasa sola de cliente en cliente.
 */
export default function Chats() {
  const [i, setI] = useState(0);
  const [vistos, setVistos] = useState(1);
  const caja = useRef<HTMLDivElement>(null);
  const enVista = useInView(caja, { amount: 0.35 });
  const chat = clientChats[i]!;

  useEffect(() => {
    if (!enVista) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t0 = window.setTimeout(() => setVistos(chat.messages.length), 0);
      return () => window.clearTimeout(t0);
    }
    const t = window.setTimeout(
      () => {
        if (vistos < chat.messages.length) setVistos((v) => v + 1);
        else {
          setI((n) => (n + 1) % clientChats.length);
          setVistos(1);
        }
      },
      vistos < chat.messages.length ? 1300 : 3600,
    );
    return () => window.clearTimeout(t);
  }, [enVista, vistos, chat.messages.length]);

  const elegir = (k: number) => {
    setI(k);
    setVistos(1);
  };

  return (
    <section className="od-chats od-claro" aria-labelledby="od-chats-titulo">
      <div className="od-chats__copy">
        <p className="od-eyebrow">(04) Clientes</p>
        <h2 id="od-chats-titulo" className="od-h2">
          <ConPunto>{companyChats.title}</ConPunto>
        </h2>
        <ul className="od-chats__puntos">
          {companyChats.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <Link href={companyChats.cta.href} className="od-boton od-boton--negro">
          {companyChats.cta.label} <Flecha />
        </Link>
      </div>

      <div ref={caja} className="od-bandeja">
        <div className="od-bandeja__barra" aria-hidden>
          <i />
          <i />
          <i />
          <span>Clientes Onvision</span>
        </div>
        <div className="od-bandeja__cuerpo">
          <ul className="od-bandeja__lista" aria-label="Conversaciones">
            {clientChats.map((c, k) => (
              <li key={c.id}>
                <button type="button" aria-pressed={k === i} onClick={() => elegir(k)}>
                  <span className="od-bandeja__avatar" style={{ background: c.color }}>
                    {c.initials}
                  </span>
                  <span className="od-bandeja__info">
                    <b>{c.name}</b>
                    <em>{c.preview}</em>
                  </span>
                  <span className="od-bandeja__hora">{c.time}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="od-bandeja__hilo">
            <p className="od-bandeja__quien">
              <b>{chat.name}</b>
              {chat.status ? <span>{chat.status}</span> : null}
            </p>
            <div className="od-bandeja__mensajes">
              <AnimatePresence initial={false}>
                {chat.messages.slice(0, vistos).map((m, k) => (
                  <motion.div
                    key={`${chat.id}-${k}`}
                    className={`od-bandeja__msj od-bandeja__msj--${m.role}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {m.name ? (
                      <span className="od-bandeja__autor" style={{ color: m.color }}>
                        {m.name}
                      </span>
                    ) : null}
                    <p>{m.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
