# Onvision Digital — sitio nuevo

El sitio de [onvisiondigital.com](https://onvisiondigital.com) rediseñado desde
cero, con toda su información, sus partes y sus productos. Es un proyecto
**aparte**: no toca la landing oficial (`onvision-landing`) ni la página de
verticales (`verticales`).

El diseño mezcla cuatro referencias:

- **hobro.digital** — el nombre gigante a todo lo ancho, la serif itálica que
  choca con la grotesca ("Lo que HACEMOS"), el índice de servicios con "(01)",
  "Selected Cases", el menú a pantalla completa, el cursor y el cierre
  "(HABLEMOS)".
- **jeffmilanes.com** — las escenas fijas en negro: el contador gigante que arma
  el sitio pieza por pieza, la consola y los números huecos del showreel.
- **nordpixel.ch** — la barra blanca flotante, el punto de color al final de los
  títulos, la tipografía cinética maciza/hueca, las tarjetas de precios con
  íconos de píxeles, el sello que gira y las preguntas en tarjetas.
- **driveberry.fr** — las tarjetas redondeadas con campo de color difuso, la
  intro con porcentaje y círculo que se abre, las pestañas pegadas de "cómo
  funciona", el teléfono con tarjetas de vidrio y el pie con la marca gigante.

## Correrlo en tu compu

```bash
npm install
npm run dev
```

Abrí [http://localhost:3040](http://localhost:3040). Necesita Node 20.9 o más nuevo.

## Páginas

| Ruta              | Qué tiene                                                                 |
| ----------------- | ------------------------------------------------------------------------- |
| `/`               | "Soluciones digitales hechas para vender": la laptop 3D que se arma pieza por pieza, lo que hacemos (las seis piezas en puntos blancos que se arman en un instante y se apartan del cursor o del dedo, como jeffmilanes; en el celular la escena queda fija y abre con un globo de puntos), tu marca en movimiento, la puerta a Planes y "Contanos tu idea" (un formulario en tres pasos que se guarda para el equipo) |
| `/digital`        | Servicios: "onvision." y la cinta, las seis piezas una por una (web, Onvi, software, apps, Panel Onvi y marca; con "Más información" (por ahora en web, Onvi y software), cada una se abre entera con más trabajos, cada uno en su propio mundo según el diseño de su captura, y el menú de las seis abajo, que toma la piel de la sección; también en `/digital?servicio=web`) y preguntas frecuentes |
| `/planes`         | Los planes en una sola sección (la línea, las tarjetas de cada plan con pago por Onvo y el ojo de Onvision que cuida el resto) y la agenda |
| `/empresas`       | El muestrario de los 10 proyectos: por línea, con su pantalla, ficha y señal |
| `/sobre-nosotros` | Manifiesto, objetivo, stack y habilidades                                 |
| `/pago/exito`, `/pago/cancelado` | La vuelta desde Onvo                                       |

En todas: el menú, Onvi (la IA, a la derecha), WhatsApp y el pie. "Sistema"
lleva a `sistema.onvisiondigital.com`, como en el sitio oficial. Las
direcciones viejas (`/agendar`, `/cotizar`, `/portafolio`…) redirigen igual que antes; `/agendar` y `/cotizar` llevan a la agenda de Planes, y `/contacto` a "Contanos tu idea".

## Qué hay adentro

```
src/
├── app/                 páginas y APIs
│   ├── api/booking      guarda la reunión (Supabase)
│   ├── api/contact      guarda "Contanos tu idea" (Supabase, la misma tabla del sitio oficial)
│   ├── api/checkout/onvo  abre el pago de la mensualidad (Onvo)
│   └── api/chat         Onvi (OpenAI o sus respuestas de siempre)
├── components/
│   ├── od/              lo común: marco, intro, menú, Onvi, pie, cierre, piezas chicas
│   ├── vision/          la laptop 3D, la portada y la línea de avance del inicio
│   ├── home/            las demás secciones del inicio y "Contanos tu idea"
│   ├── digital/         las secciones de servicios
│   ├── planes/          planes, pago y agenda
│   ├── empresas/        el muestrario de empresas
│   └── nosotros/        sobre nosotros
└── lib/                 los textos, planes y proyectos (los mismos del sitio oficial)
```

Los textos salen de `src/lib/` y son los mismos de la landing oficial: se
cambian ahí.

## Variables

Copiá `.env.example` a `.env.local` y llenalo. Sin llaves, el sitio funciona
igual: "Pagar" avisa que Onvo no está configurado, la agenda pide escribir por
WhatsApp, "Contanos tu idea" pide escribir al correo y Onvi contesta con sus
respuestas de siempre.

## Publicarlo en Vercel

1. **Add New → Project** e importá este repositorio.
2. Cargá las variables de `.env.example` en **Settings → Environment Variables**.
3. Probalo primero en la dirección de Vercel. Para ponerlo en
   `onvisiondigital.com`, mové el dominio a este proyecto; `sistema.onvisiondigital.com`
   puede seguir apuntando al proyecto de la landing oficial.

En el plan Hobby, Vercel solo publica los commits cuyo autor es el dueño de la
cuenta: los de otro autor los salta sin avisar (no aparece ningún deploy). Los
commits de este repositorio van a nombre de `Santi0117`.

Con "reducir movimiento" activado en el sistema no hay intro, ni scroll suave,
ni animaciones.
