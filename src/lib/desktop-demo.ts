export type DesktopStepId =
  | "landing"
  | "software"
  | "webs"
  | "sistema";

export type DesktopStep = {
  id: DesktopStepId;
  title: string;
  detail: string;
  file?: string;
};

export const desktopSteps: DesktopStep[] = [
  {
    id: "landing",
    title: "Building landing page",
    detail: "Armar una landing que explique Onvision Digital y lo que construimos.",
    file: "app/page.tsx +52",
  },
  {
    id: "software",
    title: "Software a medida",
    detail: "Sistemas y apps hechos a la operación de cada negocio.",
    file: "app/software.tsx +18",
  },
  {
    id: "webs",
    title: "Páginas web",
    detail: "Sitios y tiendas con la marca del cliente, listos para vender.",
    file: "app/sitios.tsx +24",
  },
  {
    id: "sistema",
    title: "Sistema para tu empresa",
    detail: "Onvision: facturación, inventario y módulos por industria.",
    file: "app/sistema.tsx +31",
  },
];
