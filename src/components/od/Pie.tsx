"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { irA, navegacion, servicios, SISTEMA_URL, wa } from "./data";
import { Flecha, IconoInstagram, IconoWhatsApp, Ojo } from "./ui";

function esCorreo(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** La hora de Costa Rica, como el reloj del pie de sibal/hobro. */
function Hora() {
  const [hora, setHora] = useState<string | null>(null);
  useEffect(() => {
    const f = new Intl.DateTimeFormat("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Costa_Rica",
    });
    const tic = () => setHora(f.format(new Date()));
    const primera = window.setTimeout(tic, 0);
    const id = window.setInterval(tic, 30_000);
    return () => {
      window.clearTimeout(primera);
      window.clearInterval(id);
    };
  }, []);
  return <span suppressHydrationWarning>{hora ?? "--:--"}</span>;
}

/**
 * El pie: la tarjeta redondeada con la marca gigante de driveberry, los
 * datos en mono de hobro y el "Mantente al tanto" del sitio oficial.
 */
export default function Pie() {
  const [correo, setCorreo] = useState("");
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");
  const año = new Date().getFullYear();

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const v = correo.trim();
    if (!esCorreo(v)) {
      setError("Ingresá un correo válido.");
      setListo(false);
      return;
    }
    setError("");
    setListo(true);
  };

  return (
    <footer className="od-pie">
      <div className="od-pie__tarjeta">
        <div className="od-pie__arriba">
          <div className="od-pie__intro">
            <p className="od-pie__lema">
              Sitios, tiendas, software y el sistema Onvision. Una empresa, varias soluciones<span className="od-punto">.</span>
            </p>
            <form className="od-pie__form" onSubmit={enviar} noValidate>
              <label className="od-pie__rotulo" htmlFor="od-pie-correo">
                Mantente al tanto
              </label>
              <div className="od-pie__campo">
                <input
                  id="od-pie-correo"
                  type="email"
                  autoComplete="email"
                  placeholder="Tu correo"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (listo) setListo(false);
                    if (error) setError("");
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "od-pie-error" : undefined}
                />
                <button type="submit">
                  {listo ? "Listo" : "Avísame"}
                  <Flecha />
                </button>
              </div>
              {error ? (
                <p id="od-pie-error" className="od-pie__error" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          </div>

          <div className="od-pie__columnas">
            <div>
              <p className="od-pie__col-titulo">Navegación</p>
              <ul>
                <li>
                  <Link href="/">Inicio</Link>
                </li>
                {navegacion.map((l) => (
                  <li key={l.href}>
                    {l.externo ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label} ↗
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="od-pie__col-titulo">Servicios</p>
              <ul>
                {servicios.map((s) => (
                  <li key={s.id}>
                    <Link href="/digital#servicios">{s.label}</Link>
                  </li>
                ))}
                <li>
                  <a href={SISTEMA_URL} target="_blank" rel="noopener noreferrer">
                    Sistema Onvision ↗
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="od-pie__col-titulo">Contacto</p>
              <ul className="od-pie__mono">
                <li>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
                <li>
                  <a href={wa()} target="_blank" rel="noopener noreferrer">
                    WhatsApp {site.phone}
                  </a>
                </li>
                <li>
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
                <li>{site.location}</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="od-pie__gigante" aria-hidden>
          <Ojo className="od-pie__ojo" />
          onvision
        </p>

        <div className="od-pie__abajo">
          <span>© {año} Onvision Digital · Latinoamérica</span>
          <span className="od-pie__estado">
            <i aria-hidden /> Hora CR <Hora />
          </span>
          <span className="od-pie__redes">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconoInstagram className="h-4 w-4" />
            </a>
            <a href={wa()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <IconoWhatsApp className="h-4 w-4" />
            </a>
          </span>
          <button type="button" className="od-pie__subir" onClick={() => irA(0)}>
            Ir arriba <Flecha dir="arriba" />
          </button>
        </div>
      </div>
    </footer>
  );
}
