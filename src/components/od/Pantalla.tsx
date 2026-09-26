"use client";

import { useEffect, useRef } from "react";

/**
 * El video del servicio (el showreel del sitio oficial) sobre una tarjeta
 * con luz de color. Las capturas son maquetas de iMac + iPhone con fondo
 * transparente, así que van enteras, sin recortar. Solo carga y reproduce
 * cuando se ve; con movimiento reducido queda la imagen fija.
 */
export default function Pantalla({
  video,
  poster,
  titulo,
  className = "",
}: {
  video: string;
  poster: string;
  titulo: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          if (v.preload !== "auto") v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <figure className={`od-pantalla ${className}`}>
      <video ref={ref} src={video} poster={poster} muted loop playsInline preload="none" aria-label={titulo} />
    </figure>
  );
}
