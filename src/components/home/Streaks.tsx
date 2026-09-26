"use client";

import { useEffect, useRef } from "react";

type Estela = {
  x: number;
  y: number;
  largo: number;
  velocidad: number;
  vida: number;
  max: number;
};

/**
 * Estelas diagonales sobre el fondo oscuro: pocas, lentas, casi al fondo.
 * Se detienen cuando el lienzo sale de pantalla o la pestaña se oculta, y
 * no arrancan si la persona pidió menos movimiento.
 */
export default function Streaks({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const contexto = canvas.getContext("2d");
    if (!contexto) return;
    const ctx: CanvasRenderingContext2D = contexto;

    const angulo = Math.PI / 4.4;
    const dx = Math.cos(angulo);
    const dy = Math.sin(angulo);
    const estelas: Estela[] = [];
    let ancho = 0;
    let alto = 0;
    let raf = 0;
    let visible = true;
    let ultimo = performance.now();
    let proxima = 500;

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = r.width;
      alto = r.height;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const nacer = () => {
      const desdeArriba = Math.random() < 0.65;
      estelas.push({
        x: desdeArriba ? Math.random() * ancho * 0.9 : -30,
        y: desdeArriba ? -30 : Math.random() * alto * 0.55,
        largo: 90 + Math.random() * 120,
        velocidad: 0.16 + Math.random() * 0.2,
        vida: 0,
        max: 2600 + Math.random() * 2000,
      });
    };

    const cuadro = (ahora: number) => {
      const dt = Math.min(ahora - ultimo, 50);
      ultimo = ahora;
      proxima -= dt;
      if (proxima <= 0 && estelas.length < 3) {
        nacer();
        proxima = 1300 + Math.random() * 2400;
      }

      ctx.clearRect(0, 0, ancho, alto);
      for (let i = estelas.length - 1; i >= 0; i--) {
        const e = estelas[i]!;
        e.vida += dt;
        e.x += dx * e.velocidad * dt;
        e.y += dy * e.velocidad * dt;
        const t = e.vida / e.max;
        if (t >= 1 || e.x > ancho + 240 || e.y > alto + 240) {
          estelas.splice(i, 1);
          continue;
        }
        const alfa = t < 0.15 ? t / 0.15 : t > 0.7 ? Math.max(0, (1 - t) / 0.3) : 1;
        const colaX = e.x - dx * e.largo;
        const colaY = e.y - dy * e.largo;
        const degradado = ctx.createLinearGradient(colaX, colaY, e.x, e.y);
        degradado.addColorStop(0, "rgba(52, 211, 238, 0)");
        degradado.addColorStop(1, `rgba(126, 232, 250, ${0.5 * alfa})`);
        ctx.strokeStyle = degradado;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(colaX, colaY);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(214, 248, 255, ${0.85 * alfa})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = visible && !document.hidden ? requestAnimationFrame(cuadro) : 0;
    };

    const arrancar = () => {
      if (raf || !visible || document.hidden) return;
      ultimo = performance.now();
      raf = requestAnimationFrame(cuadro);
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entrada]) => {
      visible = Boolean(entrada?.isIntersecting);
      arrancar();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", arrancar);
    arrancar();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", arrancar);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
