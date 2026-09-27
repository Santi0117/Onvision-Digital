"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { SISTEMA_URL, navegacion, wa } from "./data";
import { Cerrar, Flecha, IconoInstagram, IconoWhatsApp, Indice, Ojo } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

function esActivo(pathname: string, href: string) {
  if (href.startsWith("http")) return false;
  const [ruta, ancla] = href.split("#");
  if (ancla) return false;
  return ruta === pathname;
}

function Enlace({
  href,
  externo,
  className,
  children,
  onClick,
  current,
}: {
  href: string;
  externo?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  current?: boolean;
}) {
  if (externo) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}

/**
 * La tarjeta flotante de wisprflow con la marca espaciada de nordpixel, el
 * selector "Digital | Sistema", los enlaces, el botón "Menú" y el botón de
 * color; la línea de abajo es el avance de sibaldesign. En el inicio queda
 * encajada en la muesca de la portada. El menú a pantalla completa es el
 * de hobro.
 */
export default function Nav() {
  const pathname = usePathname();
  const inicio = pathname === "/";
  const [abierto, setAbierto] = useState(false);
  const { scrollYProgress } = useScroll();
  const avance = useSpring(scrollYProgress, { stiffness: 180, damping: 32, mass: 0.3 });

  // Sobre las secciones oscuras (las que dicen data-tema="oscuro") la tarjeta
  // pasa a vidrio oscuro; sobre las claras vuelve a blanco.
  useEffect(() => {
    const html = document.documentElement;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const barra = document.querySelector<HTMLElement>(".od-nav__barra");
      if (!barra) return;
      const r = barra.getBoundingClientRect();
      const y = r.top + r.height / 2;
      let tema = "claro";
      for (const el of document.elementsFromPoint(r.left + 8, y)) {
        // El menú mismo y las intros (que tapan todo un momento) no cuentan.
        if (el.closest(".od-nav, .od-boot, .vision-boot")) continue;
        const marcado = el.closest<HTMLElement>("[data-tema]");
        if (marcado) tema = marcado.dataset.tema ?? "claro";
        break;
      }
      if (html.dataset.navTema !== tema) html.dataset.navTema = tema;
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    // Una escena que cambia de tono sin scroll (las piezas del inicio) avisa.
    window.addEventListener("od:tema", pedir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      window.removeEventListener("od:tema", pedir);
      delete html.dataset.navTema;
    };
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", alTecla);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", alTecla);
    };
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <>
      <header className={`od-nav${inicio ? " od-nav--muesca" : ""}`}>
        <div className="od-nav__barra">
          <Link href="/" className="od-nav__marca" aria-label="Onvision Digital, inicio">
            <Ojo className="od-nav__ojo" />
            <span>
              ONVISION<span className="od-punto">.</span>
            </span>
          </Link>

          <div className="od-seg" role="group" aria-label="Productos">
            <span aria-current="true">Digital</span>
            <a href={`${SISTEMA_URL}/producto`} target="_blank" rel="noopener noreferrer">
              Sistema
              <Flecha dir="diagonal" className="od-seg__ext" />
            </a>
          </div>

          <nav className="od-nav__links" aria-label="Principal">
            {navegacion
              .filter((l) => !l.externo)
              .map((l) => {
                const activo = esActivo(pathname, l.href);
                return (
                  <Enlace
                    key={l.href}
                    href={l.href}
                    current={activo}
                    className={`od-nav__link${activo ? " is-on" : ""}`}
                  >
                    {l.label}
                  </Enlace>
                );
              })}
          </nav>

          <div className="od-nav__acciones">
            <button
              type="button"
              className="od-nav__menu"
              aria-label="Menú"
              aria-expanded={abierto}
              aria-controls="od-menu"
              onClick={() => setAbierto(true)}
            >
              <span className="od-nav__puntos" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="od-nav__menu-txt">Menú</span>
            </button>
            <Link href="/digital#agendar" className="od-nav__cta">
              <span className="od-nav__cta-txt">Agendar reunión</span>
              <Flecha className="od-nav__cta-ico" />
            </Link>
          </div>

          <motion.span className="od-nav__avance" style={{ scaleX: avance }} aria-hidden />
        </div>
      </header>

      <AnimatePresence>
        {abierto ? (
          <motion.div
            id="od-menu"
            className="od-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
            data-lenis-prevent
          >
            <div className="od-menu__arriba">
              <Link href="/" className="od-menu__marca" onClick={cerrar}>
                <Ojo className="od-menu__ojo" />
                <span>
                  onvision<span className="od-punto">.</span>
                </span>
              </Link>
              <button type="button" className="od-menu__cerrar" onClick={cerrar} autoFocus>
                Cerrar
                <Cerrar className="h-4 w-4" />
              </button>
            </div>

            <div className="od-menu__cuerpo">
              <ul className="od-menu__lista">
                {[{ label: "Inicio", href: "/", externo: false }, ...navegacion].map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.12 + i * 0.05 }}
                  >
                    <Enlace href={l.href} externo={l.externo} className="od-menu__link" onClick={cerrar}>
                      <Indice n={i + 1} />
                      <span className="od-menu__txt">{l.label}</span>
                      {l.externo ? <Flecha dir="diagonal" className="od-menu__ext" /> : null}
                    </Enlace>
                  </motion.li>
                ))}
              </ul>

              <div className="od-menu__lado">
                <div>
                  <p className="od-menu__rotulo">Contacto:</p>
                  <a href={`mailto:${site.email}`} className="od-menu__dato">
                    {site.email}
                  </a>
                  <a href={wa()} target="_blank" rel="noopener noreferrer" className="od-menu__dato">
                    WhatsApp {site.phone}
                  </a>
                </div>
                <div>
                  <p className="od-menu__rotulo">Ubicación:</p>
                  <p className="od-menu__dato">{site.location}</p>
                </div>
                <div>
                  <p className="od-menu__rotulo">Social:</p>
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="od-menu__dato od-menu__social">
                    <IconoInstagram className="h-4 w-4" /> Instagram
                  </a>
                </div>
                <div className="od-menu__botones">
                  <Link href="/digital#agendar" className="od-boton od-boton--cian" onClick={cerrar}>
                    Agendar reunión <Flecha />
                  </Link>
                  <a href={wa()} target="_blank" rel="noopener noreferrer" className="od-boton od-boton--linea-d">
                    <IconoWhatsApp className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
