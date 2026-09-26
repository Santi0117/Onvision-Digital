"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { scenes, type SceneKind } from "./scene";
import { disposeGeometries, makeMats, type CameraPose } from "./scene/kit";
import {
  clamp01,
  explodeAt,
  hexToRgb,
  mixRgb,
  phoneLidAt,
  rgbToCss,
  smoothstep,
  themeColor,
  visionStore,
  type Anchor,
  type Rgb,
} from "./store";

type Props = {
  kind?: SceneKind;
};

const SCREEN_RGB = hexToRgb("#0b2a36");

/**
 * Escena Three.js fija detrás del DOM. Lee el scroll de las secciones pinned
 * desde `visionStore`, anima el modelo (explosión, cámara, tema) y publica
 * cada frame las anclas proyectadas para los callouts y el logo de la tapa.
 * `visionStore.reveal` (lo mueve el boot) enciende la laptop: colores desde
 * el fondo, líneas que aparecen y la cámara que se acerca.
 */
export default function VisionScene({ kind = "laptop" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const cfg = scenes[kind];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mobile = () => window.innerWidth < 768;
    // Sin WebGL (equipos viejos, bloqueos) la página sigue: no se dibuja la
    // laptop, pero el scroll sigue publicando cuadros para el dial y la línea.
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !mobile(),
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      });
    } catch {
      renderer = null;
    }
    if (renderer) {
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.transform = "translateZ(0)";
      host.appendChild(renderer.domElement);
    } else {
      visionStore.sceneReady = true;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(cfg.fov, 1, 0.1, 100);
    const pose: CameraPose = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    cfg.camera(0, false, pose);
    camera.position.copy(pose.pos);
    camera.lookAt(pose.look);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 1.35);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.7);
    rim.position.set(-6, -3, -4);
    scene.add(rim);

    const mats = makeMats();
    const built = cfg.build(mats);
    const modules = built.modules;

    // tilt (inclinación fija) → spinner (giro global sobre un eje)
    const tilt = new THREE.Group();
    const spinner = new THREE.Group();
    tilt.add(spinner);
    modules.forEach((mod) => spinner.add(mod.group));
    scene.add(tilt);

    // Estado de interacción
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let width = 1;
    let height = 1;
    let stableH = 0;
    let lastOpacity = "";
    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = host.clientWidth || window.innerWidth;
      const nextH = host.clientHeight || window.innerHeight;
      // La barra de Safari cambia innerHeight al scrollear y reescala el
      // canvas: la laptop parpadea / se come. Ignorar jitters chicos.
      if (!mobile() || !stableH || Math.abs(nextH - stableH) > 96) {
        stableH = nextH;
      }
      height = mobile() ? stableH : nextH;
      renderer?.setPixelRatio(pixelRatio());
      renderer?.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const anchors: Anchor[] = modules.map(() => ({ x: 0, y: 0, visible: false, l: 0, t: 0, r: 0, b: 0 }));
    visionStore.frame.anchors = anchors;

    const tmpV = new THREE.Vector3();
    const tmpV2 = new THREE.Vector3();
    const tmpTarget = new THREE.Vector3();
    const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
    const tmpColor = new THREE.Color();
    const setColor = (mat: { color: THREE.Color }, rgb: Rgb) => {
      tmpColor.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
      mat.color.copy(tmpColor);
    };
    const scaleRgb = (c: Rgb, k: number): Rgb => [
      Math.min(255, c[0] * k),
      Math.min(255, c[1] * k),
      Math.min(255, c[2] * k),
    ];
    const toScreen = (obj: THREE.Object3D, out: THREE.Vector3) => {
      obj.getWorldPosition(out);
      out.project(camera);
      return out;
    };

    const clock = new THREE.Clock();
    let lastProgress = -1;
    let lastReveal = -1;
    let lastEnter = -1;

    // Posición en el documento, no el rect de cada frame: getBoundingClientRect
    // en el loop obliga layout y el scroll del círculo se siente con fricción.
    type PinBox = { el: HTMLElement | null; top: number; height: number };
    const pinOf = (el: HTMLElement | null): PinBox => {
      if (!el) return { el: null, top: 0, height: 1 };
      const rect = el.getBoundingClientRect();
      return { el, top: rect.top + window.scrollY, height: rect.height };
    };
    let corePin = pinOf(null);
    let featPin = pinOf(null);
    let docScroll = 1;
    let actionsDocBottom = 0;
    const syncPins = () => {
      corePin = pinOf(visionStore.sectionEl);
      featPin = pinOf(visionStore.featuresEl);
      docScroll = document.documentElement.scrollHeight;
      const actions = document.querySelector(".vision-hero__actions");
      if (actions) actionsDocBottom = actions.getBoundingClientRect().bottom + window.scrollY;
    };
    const pinObserver = new ResizeObserver(() => syncPins());
    const watchPins = () => {
      pinObserver.disconnect();
      syncPins();
      // El largo de la página cambia con lo que carga debajo del acto (la línea de avance).
      pinObserver.observe(document.body);
      if (corePin.el) pinObserver.observe(corePin.el);
      if (featPin.el) pinObserver.observe(featPin.el);
    };
    watchPins();
    window.addEventListener("resize", syncPins);
    document.fonts?.ready.then(syncPins).catch(() => {});

    const pinRaw = (pin: PinBox, vhNow: number) => {
      if (!pin.el) return -1;
      const travel = Math.max(pin.height - vhNow, 1);
      return (window.scrollY - pin.top) / travel;
    };

    const loop = () => {
      const t = clock.getElapsedTime();
      const vh = window.innerHeight;
      const reveal = clamp01(visionStore.reveal);
      const phone = kind === "laptop" && width < 768;
      visionStore.phone = phone;
      if (phone && actionsDocBottom === 0) {
        const actions = document.querySelector(".vision-hero__actions");
        if (actions) actionsDocBottom = actions.getBoundingClientRect().bottom + window.scrollY;
      }
      if (visionStore.sectionEl !== corePin.el || visionStore.featuresEl !== featPin.el) watchPins();

      // ---- progreso del scroll en las secciones pinned ----
      // En iPhone innerHeight salta con la barra. Misma altura estable que el canvas,
      // leída del scroll (sin layout) para que el círculo y los títulos vayan con el dedo.
      const measureVh = phone && stableH ? stableH : vh;
      const raw = pinRaw(corePin, measureVh);
      const p = clamp01(raw);
      // Teléfono: tapa primero; las piezas entran cuando ya está casi abierta.
      const explode = phone ? explodeAt(raw, -0.12, 0.3) : explodeAt(p);
      const lidDrive = phone ? phoneLidAt(raw) : explode;
      const entering = kind === "laptop" ? 1 : smoothstep(-0.26, -0.03, raw);

      // Sección de detalles: `enter` sube mientras su tope viaja del pie al
      // tope del viewport (el dial crece desde el logo en ese tramo).
      // En teléfono no medimos el dial mientras abre la laptop: es layout extra.
      const watchFeatures = !phone || raw > 0.4;
      const fTop = watchFeatures && featPin.el ? featPin.top - window.scrollY : Infinity;
      const enterVh = measureVh;
      const enter = watchFeatures ? smoothstep(enterVh * 0.98, enterVh * 0.04, fTop) : 0;
      const fRaw = watchFeatures ? pinRaw(featPin, measureVh) : -1;
      // Los detalles llegan casi al final del pin. La salida del círculo es corta,
      // para que el cierre entre enseguida.
      const play = clamp01(fRaw / 0.94);
      const fP = play;
      const fOpacity = smoothstep(0.02, 0.2, enter) * (1 - smoothstep(0.94, 1, fRaw));
      const nFeat = Math.max(1, visionStore.featureCount);
      // -0.5 … n-0.5: el primero y el último duran lo mismo que los del medio.
      const fX = play * nFeat - 0.5;

      // La laptop se va cuando el dial ya la reemplazó.
      const opacity = entering * (1 - smoothstep(0.62, 0.96, enter));
      // En el círculo la laptop ya no se ve: saltar el 3D deja el scroll del dial libre.
      const showLaptop = opacity >= 0.005;
      const bg = themeColor("bg", 0);
      const ink = themeColor("ink", 0);
      const f = visionStore.frame;

      if (showLaptop) {
      // ---- paleta fija (oscuro + celeste) encendida por `reveal` ----
      const kFill = smoothstep(0.12, 0.82, reveal);
      const kAccent = smoothstep(0.3, 0.95, reveal);
      const fill = themeColor("fill", 0);
      setColor(mats.fill, mixRgb(bg, fill, kFill));
      setColor(mats.shade, mixRgb(bg, scaleRgb(fill, 0.68), kFill));
      setColor(mats.key, mixRgb(bg, scaleRgb(fill, 1.35), kFill));
      setColor(mats.accent, mixRgb(bg, themeColor("accent", 0), kAccent));
      setColor(mats.glass, mixRgb(bg, themeColor("glass", 0), kAccent));
      setColor(mats.screen, mixRgb(bg, SCREEN_RGB, kAccent));
      setColor(mats.line, themeColor("line", 0));
      setColor(mats.tickLine, themeColor("line", 0));
      setColor(mats.glow, themeColor("line", 0));
      const kLine = smoothstep(0.0, 0.55, reveal);
      mats.line.opacity = 0.9 * kLine;
      mats.tickLine.opacity = 0.4 * smoothstep(0.05, 0.7, reveal);
      mats.accentLine.opacity = 0.9 * smoothstep(0.25, 0.8, reveal);
      mats.glass.opacity = 0.55 * kAccent;
      mats.glow.opacity = 0.55 * smoothstep(0.35, 0.85, reveal);
      built.tick?.(reveal, t);

      // ---- interacción / orientación ----
      const isPortrait = camera.aspect < 1;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      tilt.rotation.set(...cfg.tilt(isPortrait, mouse));
      const portraitScale = isPortrait ? (cfg.portraitScale ?? 1) : 1;
      let baseScale = isPortrait ? portraitScale : (cfg.desktopScale ?? 1);
      let tx = isPortrait ? 0 : cfg.offsetX;
      let ty = 0;
      let heroMix = 0;
      if (kind === "laptop") {
        heroMix = 1 - smoothstep(width < 768 ? -0.7 : -0.4, width < 768 ? -0.48 : 0.04, raw);
        if (width < 768) {
          // El asiento vertical termina ANTES de que abra la tapa. Si no,
          // la laptop sube y abre a la vez y en el celu se traba.
          // En Safari la pantalla es más baja: la tapa se baja y se achica
          // mientras los botones siguen encima, y vuelve a su lugar al scrollear.
          const actionsScreen = actionsDocBottom - window.scrollY;
          const cover = actionsDocBottom > 0 ? smoothstep(height * 0.08, height * 0.36, actionsScreen) : 1;
          const short = clamp01((860 - height) / 180);
          ty = -0.92 - 0.28 * heroMix - 1.15 * short * cover;
          baseScale *= 1 - 0.16 * short * cover;
          tx = 0;
        } else if (width < 1024) {
          ty = -1.15 * heroMix;
          tx = 0;
        } else {
          // En la portada la laptop va más a la derecha y un poco más chica:
          // el titular de cuatro renglones y la bajada quedan fuera del anillo.
          // En pantallas más cuadradas (1024×768) el anillo ocupa más ancho: más aún.
          const cuadrada = clamp01((1.6 - camera.aspect) / 0.3);
          tx += (0.36 + 0.3 * cuadrada) * heroMix;
          baseScale *= 1 - (0.06 + 0.06 * cuadrada) * heroMix;
        }
      }
      tilt.position.set(tx, ty, 0);
      tilt.scale.setScalar(baseScale);
      // Al encender, el modelo termina de girar hasta su pose.
      spinner.rotation[cfg.spinAxis] = cfg.spin(p, t, reduceMotion) + (1 - smoothstep(0, 1, reveal)) * 0.55;
      built.fit?.(isPortrait);
      built.landscapeOnly?.forEach((o) => {
        o.visible = !isPortrait;
      });

      // ---- módulos ----
      const [sx, sy] = cfg.portraitSquash;
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const delay = phone ? Math.max(0, mod.delay - 0.06) : mod.delay;
        const local = smoothstep(0, 1, clamp01(explode * 1.35 - delay));
        mod.update?.(phone ? raw : p, explode, local, t);
        tmpTarget.copy(mod.exploded);
        if (isPortrait) {
          // Menos dispersión: la pantalla es angosta y las etiquetas van a los lados.
          tmpTarget.x *= sx;
          tmpTarget.y *= sy;
          tmpTarget.z *= 0.7;
        }
        mod.group.position.lerpVectors(mod.home, tmpTarget, local);
        mod.group.rotation.set(
          mod.rotHome.x + (mod.rotExploded.x - mod.rotHome.x) * local,
          mod.rotHome.y + (mod.rotExploded.y - mod.rotHome.y) * local,
          mod.rotHome.z + (mod.rotExploded.z - mod.rotHome.z) * local,
        );
        const endScale = isPortrait && portraitScale < 1 ? 0.86 : 1;
        mod.group.scale.setScalar(mod.scaleHome + (endScale - mod.scaleHome) * local);
      }

      // ---- cámara (con el acercamiento del encendido) ----
      cfg.camera(phone && isPortrait ? lidDrive : explode, isPortrait, pose);
      const push = (1 - smoothstep(0, 1, reveal)) * (isPortrait ? 7 : 5.5);
      camera.position.copy(pose.pos);
      camera.position.z += push;
      camera.position.y += push * 0.12;
      camera.lookAt(pose.look);

      // ---- anclas y recuadros proyectados para los callouts ----
      // En móvil los callouts no se pintan: el AABB por mesh traba el scroll.
      const projectAnchors = width >= 768;
      for (let i = 0; i < modules.length; i++) {
        const obj = modules[i].anchor ?? modules[i].group;
        toScreen(obj, tmpV);
        const a = anchors[i];
        a.x = ((tmpV.x + 1) / 2) * width;
        a.y = ((1 - tmpV.y) / 2) * height;
        a.visible = tmpV.z < 1;

        if (!projectAnchors) {
          a.l = a.r = a.x;
          a.t = a.b = a.y;
          continue;
        }

        // Recuadro en pantalla de las mallas reales (no el AABB mundo, que
        // se infla con la rotación y tapa teclado / piezas vecinas).
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        modules[i].group.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.geometry || !child.visible) return;
          const geom = mesh.geometry;
          if (!geom.boundingBox) geom.computeBoundingBox();
          const bb = geom.boundingBox;
          if (!bb || bb.isEmpty()) return;
          const { min, max } = bb;
          corners[0].set(min.x, min.y, min.z);
          corners[1].set(min.x, min.y, max.z);
          corners[2].set(min.x, max.y, min.z);
          corners[3].set(min.x, max.y, max.z);
          corners[4].set(max.x, min.y, min.z);
          corners[5].set(max.x, min.y, max.z);
          corners[6].set(max.x, max.y, min.z);
          corners[7].set(max.x, max.y, max.z);
          child.updateWorldMatrix(true, false);
          for (const c of corners) {
            c.applyMatrix4(child.matrixWorld);
            c.project(camera);
            const px = ((c.x + 1) / 2) * width;
            const py = ((1 - c.y) / 2) * height;
            if (px < minX) minX = px;
            if (py < minY) minY = py;
            if (px > maxX) maxX = px;
            if (py > maxY) maxY = py;
          }
        });
        if (!Number.isFinite(minX)) {
          a.l = a.r = a.x;
          a.t = a.b = a.y;
        } else {
          a.l = minX;
          a.t = minY;
          a.r = maxX;
          a.b = maxY;
        }
      }

      // ---- logo de la tapa: centro y radio en px (boot y dial nacen ahí) ----
      if (built.logo) {
        toScreen(built.logo.center, tmpV);
        toScreen(built.logo.edge, tmpV2);
        const lx = ((tmpV.x + 1) / 2) * width;
        const ly = ((1 - tmpV.y) / 2) * height;
        const ex = ((tmpV2.x + 1) / 2) * width;
        const ey = ((1 - tmpV2.y) / 2) * height;
        f.logo.x = lx;
        f.logo.y = ly;
        f.logo.r = Math.hypot(ex - lx, ey - ly);
        f.logo.visible = tmpV.z < 1 && opacity > 0.01;
      }
      }

      // ---- publicar frame ----
      f.raw = raw;
      f.progress = p;
      f.explode = explode;
      f.opacity = opacity;
      f.theme.bg = rgbToCss(bg);
      f.theme.ink = rgbToCss(ink);
      f.theme.muted = rgbToCss(ink, 0.55);
      f.features.raw = fRaw;
      f.features.progress = fP;
      f.features.opacity = fOpacity;
      f.features.x = fX;
      f.features.index = Math.min(visionStore.featureCount - 1, Math.max(0, Math.floor(fX)));
      f.features.enter = enter;
      f.page = clamp01(window.scrollY / Math.max(1, docScroll - measureVh));
      visionStore.emit();

      const nextOpacity = opacity.toFixed(3);
      if (nextOpacity !== lastOpacity) {
        lastOpacity = nextOpacity;
        host.style.opacity = nextOpacity;
      }
      const idle =
        opacity < 0.005 &&
        Math.abs((phone ? raw : p) - lastProgress) < 1e-4 &&
        Math.abs(reveal - lastReveal) < 1e-4 &&
        Math.abs(enter - lastEnter) < 1e-4;
      if (idle || !showLaptop) return;
      lastProgress = phone ? raw : p;
      lastReveal = reveal;
      lastEnter = enter;
      if (!renderer) return;
      renderer.render(scene, camera);
      if (!visionStore.sceneReady) visionStore.sceneReady = true;
    };

    // Con WebGL, el lazo del renderer; sin él, requestAnimationFrame.
    let raf = 0;
    const tick = () => {
      loop();
      raf = requestAnimationFrame(tick);
    };
    const correr = (on: boolean) => {
      if (renderer) {
        renderer.setAnimationLoop(on ? loop : null);
        return;
      }
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(tick);
    };
    correr(true);

    const onVisibility = () => correr(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      correr(false);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", syncPins);
      pinObserver.disconnect();
      ro.disconnect();
      disposeGeometries();
      built.dispose?.();
      mats.glow.map?.dispose();
      mats.fill.gradientMap?.dispose();
      Object.values(mats).forEach((m) => m.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
      visionStore.sceneReady = false;
    };
  }, [kind]);

  return <div ref={hostRef} className="vision-scene" aria-hidden />;
}
