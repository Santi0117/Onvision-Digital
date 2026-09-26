"use client";

import { useEffect, useRef } from "react";

/**
 * El cursor de hobro: un punto de color que va pegado al mouse y un aro
 * que lo sigue con retraso y crece sobre lo que se puede tocar.
 * Solo con mouse fino y sin movimiento reducido.
 */
export default function Cursor() {
  const punto = useRef<HTMLDivElement>(null);
  const aro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = punto.current;
    const a = aro.current;
    if (!fino || quieto || !p || !a) return;

    let x = -100;
    let y = -100;
    let ax = x;
    let ay = y;
    let raf = 0;
    let visto = false;

    const mover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visto) {
        visto = true;
        ax = x;
        ay = y;
        document.documentElement.classList.add("od-con-cursor");
      }
      const t = e.target instanceof Element ? e.target.closest("a, button, [role='button'], input, select, textarea, label") : null;
      a.dataset.sobre = t ? "si" : "no";
    };
    const salir = () => {
      a.dataset.fuera = "si";
      p.dataset.fuera = "si";
    };
    const entrar = () => {
      a.dataset.fuera = "no";
      p.dataset.fuera = "no";
    };
    const cuadro = () => {
      ax += (x - ax) * 0.18;
      ay += (y - ay) * 0.18;
      p.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      a.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
      raf = requestAnimationFrame(cuadro);
    };

    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", salir);
    document.addEventListener("pointerenter", entrar);
    raf = requestAnimationFrame(cuadro);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", salir);
      document.removeEventListener("pointerenter", entrar);
      document.documentElement.classList.remove("od-con-cursor");
    };
  }, []);

  return (
    <>
      <div ref={aro} className="od-cursor-aro" aria-hidden />
      <div ref={punto} className="od-cursor-punto" aria-hidden />
    </>
  );
}
