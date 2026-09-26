"use client";

import { useEffect, useRef, useState } from "react";

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function rellenar(p: string, largo: number) {
  const t = p.toUpperCase().slice(0, largo);
  const antes = Math.floor((largo - t.length) / 2);
  return (" ".repeat(antes) + t).padEnd(largo, " ").split("");
}

/**
 * El letrero de fichas que giran del sitio oficial ("HACEMOS SOFTWARE",
 * "SITIOS Y TIENDAS"…), en versión compacta: cada ficha pasa por letras al
 * azar antes de quedar. Se detiene fuera de pantalla y, con movimiento
 * reducido, solo cambia la palabra.
 */
export default function Letrero({
  palabras,
  largo = 16,
  intervalo = 2800,
  className = "",
}: {
  palabras: readonly string[];
  largo?: number;
  intervalo?: number;
  className?: string;
}) {
  const [fichas, setFichas] = useState(() => rellenar(palabras[0] ?? "", largo));
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el || palabras.length < 2) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let indice = 0;
    let visible = true;
    let cuadro = 0;
    let giro = 0;

    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
    });
    io.observe(el);

    const siguiente = () => {
      if (!visible || document.hidden) return;
      indice = (indice + 1) % palabras.length;
      const meta = rellenar(palabras[indice]!, largo);
      if (quieto) {
        setFichas(meta);
        return;
      }
      let f = 0;
      window.clearInterval(giro);
      giro = window.setInterval(() => {
        f += 1;
        let listo = true;
        const nuevas = meta.map((c, i) => {
          const fin = 3 + i * 0.9 + (c === " " ? 0 : 5);
          if (f >= fin) return c;
          listo = false;
          return c === " " && f > 3 + i * 0.9 ? " " : LETRAS[Math.floor(Math.random() * LETRAS.length)]!;
        });
        setFichas(nuevas);
        if (listo) window.clearInterval(giro);
      }, 48);
    };

    cuadro = window.setInterval(siguiente, intervalo);
    return () => {
      window.clearInterval(cuadro);
      window.clearInterval(giro);
      io.disconnect();
    };
  }, [palabras, largo, intervalo]);

  return (
    <div ref={raiz} className={`od-letrero ${className}`} aria-hidden>
      {fichas.map((c, i) => (
        <span key={i} className={`od-letrero__ficha${c === " " ? " is-vacia" : ""}`}>
          <span key={c} className="od-letrero__letra">
            {c}
          </span>
        </span>
      ))}
    </div>
  );
}
