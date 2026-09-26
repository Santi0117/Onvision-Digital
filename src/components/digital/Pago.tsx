"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { digitalPlans } from "@/lib/digital";
import { Cerrar, Flecha } from "../od/ui";

export type Seleccion = {
  planId: string;
  planName: string;
  categoryLabel: string;
  price: string;
  priceAlt?: string;
  period: string;
};

const COPY = digitalPlans.paySheet;

/**
 * "Continuar al pago": la hoja de la mensualidad del sitio oficial. Abre
 * el checkout de Onvo con POST /api/checkout/onvo. Atrapa el foco, cierra
 * con Escape y devuelve el foco al botón que la abrió.
 */
export default function Pago({ seleccion, alCerrar }: { seleccion: Seleccion | null; alCerrar: () => void }) {
  const titulo = useId();
  const nota = useId();
  const panel = useRef<HTMLDivElement>(null);
  const previo = useRef<HTMLElement | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState("");
  const abierta = seleccion !== null;

  // Al cerrar, todo vuelve a cero.
  const cerrar = () => {
    if (cargando) return;
    setError(null);
    setEmpresa("");
    alCerrar();
  };
  const alEscape = useEffectEvent(() => cerrar());

  useEffect(() => {
    if (!abierta) return;
    previo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const p = panel.current;
    p?.querySelector<HTMLElement>("[data-pago-primario]")?.focus();

    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        alEscape();
        return;
      }
      if (e.key !== "Tab" || !p) return;
      const f = Array.from(
        p.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      );
      if (!f.length) return;
      const primero = f[0]!;
      const ultimo = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTecla);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", alTecla);
      previo.current?.focus();
    };
  }, [abierta]);

  // Si se vuelve con "atrás" desde Onvo, el botón no se queda cargando.
  useEffect(() => {
    const alMostrar = (e: PageTransitionEvent) => {
      if (e.persisted) setCargando(false);
    };
    window.addEventListener("pageshow", alMostrar);
    return () => window.removeEventListener("pageshow", alMostrar);
  }, []);

  const pagar = async () => {
    if (!seleccion || cargando) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/onvo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: seleccion.planId,
          planName: seleccion.planName,
          categoryLabel: seleccion.categoryLabel,
          companyName: empresa.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || COPY.errorGeneric);
        setCargando(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(COPY.errorGeneric);
      setCargando(false);
    }
  };

  return (
    <AnimatePresence>
      {seleccion ? (
        <motion.div className="od-pago" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="od-pago__velo" aria-label={COPY.closeAria} onClick={cerrar} tabIndex={-1} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titulo}
            aria-describedby={nota}
            className="od-pago__panel"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
          >
            <div className="od-pago__cabeza">
              <div>
                <p className="od-mono od-pago__rotulo">{COPY.monthlyLabel}</p>
                <h2 id={titulo} className="od-pago__titulo">
                  {COPY.title}
                </h2>
              </div>
              <button type="button" onClick={cerrar} disabled={cargando} className="od-pago__cerrar" aria-label={COPY.closeAria}>
                <Cerrar className="h-4 w-4" />
              </button>
            </div>

            <div className="od-pago__resumen">
              <p className="od-pago__plan">
                {seleccion.categoryLabel}
                {COPY.categorySeparator}
                <b>{seleccion.planName}</b>
              </p>
              <p className="od-pago__precio">
                <b>{seleccion.price}</b>
                <span>{seleccion.period}</span>
              </p>
              {seleccion.priceAlt ? <p className="od-pago__alt">{seleccion.priceAlt}</p> : null}
            </div>

            <label className="od-campo">
              <span>{COPY.companyNameLabel}</span>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder={COPY.companyNamePlaceholder}
                disabled={cargando}
                autoComplete="organization"
              />
            </label>

            <p id={nota} className="od-pago__nota">
              {COPY.note}
            </p>

            {error ? (
              <p role="alert" className="od-pago__error">
                {error}
              </p>
            ) : null}

            <div className="od-pago__acciones">
              <button type="button" data-pago-primario onClick={pagar} disabled={cargando} className="od-boton od-boton--negro">
                {cargando ? COPY.continueLoading : COPY.continueCta} {cargando ? null : <Flecha />}
              </button>
              <button type="button" onClick={cerrar} disabled={cargando} className="od-boton od-boton--linea">
                {COPY.cancelCta}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
