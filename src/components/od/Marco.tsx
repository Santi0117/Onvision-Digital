"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Boot from "./Boot";
import Cursor from "./Cursor";
import Nav from "./Nav";
import OnviChat from "./OnviChat";
import Pie from "./Pie";
import { wa } from "./data";
import { IconoWhatsApp } from "./ui";
import "./od.css";

/**
 * Lo que comparten todas las páginas: scroll suave (Lenis, como
 * jeffmilanes, driveberry y hobro), intro, cursor, menú, Onvi, WhatsApp y
 * el pie. Con movimiento reducido no hay Lenis ni intro.
 */
export default function Marco({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Los enlaces "#…" de la misma página respetan el scroll-margin de su destino (90 px, debajo del menú).
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
    const w = window as unknown as { __odLenis?: Lenis };
    w.__odLenis = lenis;
    return () => {
      lenis.destroy();
      delete w.__odLenis;
    };
  }, []);

  // Al cambiar de página, arriba; si trae #ancla, hasta la sección: siempre a
  // 90 px del borde, debajo del menú. Lenis ya descuenta el scroll-margin del
  // destino, así que el corrimiento es lo que falta para llegar a 90.
  useEffect(() => {
    const w = window as unknown as { __odLenis?: Lenis };
    const hash = window.location.hash;
    const el = hash ? document.querySelector<HTMLElement>(hash) : null;
    if (el) {
      const t = window.setTimeout(() => {
        const margen = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        if (w.__odLenis) w.__odLenis.scrollTo(el, { offset: margen - 90, immediate: true });
        else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90 });
      }, 120);
      return () => window.clearTimeout(t);
    }
    w.__odLenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      {/* El inicio trae su propia intro: la de la preview, que termina en la laptop. */}
      {pathname === "/" ? null : <Boot />}
      <Cursor />
      <a href="#contenido" className="od-saltar">
        Saltar al contenido
      </a>
      <Nav />
      <main id="contenido" tabIndex={-1}>
        {children}
      </main>
      <Pie />
      <OnviChat />
      <a href={wa()} target="_blank" rel="noopener noreferrer" className="od-wa" aria-label="Escríbenos por WhatsApp">
        <IconoWhatsApp className="h-6 w-6" />
      </a>
    </MotionConfig>
  );
}
