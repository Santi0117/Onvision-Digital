"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { empresaProjects, empresasPage } from "@/lib/empresas";
import { filtrosEmpresas } from "../od/data";
import { Flecha } from "../od/ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const ELEGIDOS = ["jopa-realestate", "clinicos", "firstdown", "la-pacifica", "unilearn", "alchemy"];
const CASOS = ELEGIDOS.map((id) => empresaProjects.find((p) => p.id === id)!).filter(Boolean);

/**
 * "Selected Cases" de hobro con el "Proof, not promises" de jeffmilanes:
 * los conteos en mono a la izquierda, el título grande y una grilla
 * escalonada con las capturas reales y su pie en mono.
 */
export default function Casos() {
  return (
    <section className="od-casos od-claro" aria-labelledby="od-casos-titulo">
      <div className="od-casos__cabeza">
        <ul className="od-casos__conteo">
          {filtrosEmpresas
            .filter((f) => f.id !== "all")
            .map((f) => (
              <li key={f.id}>
                {f.label} ({f.cantidad})
              </li>
            ))}
        </ul>
        <h2 id="od-casos-titulo" className="od-casos__titulo">
          Trabajos que ya <em className="od-serif">están corriendo</em>
        </h2>
        <Link href="/empresas" className="od-boton od-boton--linea od-casos__todos">
          Ver todas las empresas <Flecha />
        </Link>
      </div>

      <p className="od-casos__lead">{empresasPage.lead}</p>

      <div className="od-casos__grilla">
        {CASOS.map((c, i) => {
          const Tag = c.href ? "a" : "div";
          return (
            <motion.div
              key={c.id}
              className={`od-caso od-caso--${i % 3}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.08 }}
            >
              <Tag
                {...(c.href ? { href: c.href, target: "_blank", rel: "noopener noreferrer" } : {})}
                className="od-caso__vinculo"
              >
                <span className="od-caso__imagen">
                  <Image src={c.image} alt={`${c.name}: ${c.kindLabel.toLowerCase()} hecho por Onvision Digital`} fill sizes="(min-width: 900px) 30vw, 92vw" className="object-contain" />
                </span>
                <span className="od-caso__pie">
                  <span>{c.name}</span>
                  <span>{c.kindLabel}</span>
                </span>
                <span className="od-caso__sector">{c.sector}</span>
              </Tag>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
