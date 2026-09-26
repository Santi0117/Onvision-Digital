"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { companyWalkthrough } from "@/lib/company";
import { digitalHero, digitalMeeting } from "@/lib/digital";
import { site } from "@/lib/site";
import { wa } from "../od/data";
import { Check, Flecha } from "./ui";
import { oracion } from "./data";

/**
 * "Cualquier idea que tengas, la volvemos realidad" como las preguntas
 * frecuentes de wisprflow: caja clara con el panel verde-azul de lo que
 * entregamos y el formulario al lado.
 *
 * No se finge un envío: el formulario abre WhatsApp con los datos ya
 * escritos. Para elegir fecha y hora está la agenda de /digital.
 */
export default function Registro() {
  const [servicio, setServicio] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [nota, setNota] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [antes, despues = ""] = companyWalkthrough.title.split(", ");

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = [
      "Hola, quiero hablar de un proyecto con Onvision Digital.",
      `Servicio: ${servicio}`,
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      nota.trim() ? `Idea: ${nota.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(wa(texto), "_blank", "noopener,noreferrer");
    setEnviado(true);
  };

  return (
    <section id="registro" className="oh-registro" aria-labelledby="oh-registro-titulo">
      <div className="oh-registro__head">
        <p className="oh-eyebrow">Empezá hoy</p>
        <h2 id="oh-registro-titulo" className="oh-serif-h2">
          {antes}, <em>{despues}.</em>
        </h2>
      </div>

      <div className="oh-caja">
        <div className="oh-caja__izq">
          <p className="oh-caja__titulo">Lo que entregamos</p>
          <p className="oh-caja__texto">{digitalHero.lead}</p>
          <ul className="oh-caja__filas">
            {companyWalkthrough.points.map((b) => (
              <li key={b}>
                <span className="oh-caja__check">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {oracion(b)}
              </li>
            ))}
          </ul>
          <p className="oh-caja__nota">{digitalMeeting.hint} · Te respondemos por WhatsApp o correo</p>
        </div>

        <form className="oh-caja__der" onSubmit={enviar}>
          <p className="oh-caja__titulo oh-caja__titulo--tinta">Contanos tu idea</p>
          <label className="oh-campo">
            <span>{digitalMeeting.serviceLabel}</span>
            <select required value={servicio} onChange={(e) => setServicio(e.target.value)}>
              <option value="" disabled>
                Elegí uno
              </option>
              {digitalMeeting.services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="oh-campo">
            <span>{digitalMeeting.fields.name}</span>
            <input
              type="text"
              required
              autoComplete="name"
              placeholder={digitalMeeting.fields.namePlaceholder}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>
          <label className="oh-campo">
            <span>{digitalMeeting.fields.email}</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={digitalMeeting.fields.emailPlaceholder}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </label>
          <label className="oh-campo">
            <span>{digitalMeeting.fields.note}</span>
            <textarea
              rows={3}
              placeholder={digitalMeeting.fields.notePlaceholder}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </label>

          {enviado ? (
            <p className="oh-caja__aviso" role="status">
              Abrimos WhatsApp con tus datos. Si no se abrió, escribinos a {site.email}.
            </p>
          ) : null}

          <button type="submit" className="oh-boton-lila oh-boton-lila--ancho">
            Enviar por WhatsApp
            <Flecha className="h-4 w-4" />
          </button>
          <p className="oh-caja__pie">
            ¿Preferís elegir fecha y hora? <Link href="/digital#agendar">Agendá una reunión</Link> · o escribinos a{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </form>
      </div>
    </section>
  );
}
