# MUVA – Museo Viedma

> Landing page institucional con **Entorno Virtual 3D** para la colección de esculturas de Manuel Viedma.
> React + TypeScript + Vite + Tailwind + React Three Fiber.

**Experiencia Guaraní – Jesuítica** · San Ignacio Guazú, Misiones, Paraguay

---

## Tabla de contenidos

1. [Stack y requisitos](#stack-y-requisitos)
2. [Instalación y desarrollo](#instalación-y-desarrollo)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Sistema de diseño (paleta y tipografía)](#sistema-de-diseño)
5. [Cómo agregar esculturas (3D)](#cómo-agregar-esculturas-3d)
6. [Cómo optimizar modelos `.glb`](#cómo-optimizar-modelos-glb)
7. [Cómo agregar / reemplazar imágenes](#cómo-agregar--reemplazar-imágenes)
8. [Cómo modificar la información institucional](#cómo-modificar-la-información-institucional)
9. [Cómo agregar exposiciones](#cómo-agregar-exposiciones)
10. [Cómo agregar noticias / agenda](#cómo-agregar-noticias--agenda)
11. [Rendimiento y carga diferida](#rendimiento-y-carga-diferida)
12. [Visor 3D · Características](#visor-3d--características)
13. [SEO, accesibilidad y responsive](#seo-accesibilidad-y-responsive)
14. [Build y deploy](#build-y-deploy)
15. [Comandos disponibles](#comandos-disponibles)

---

## Stack y requisitos

- **Node.js** ≥ 20
- **npm** ≥ 10
- **React 18** + **TypeScript 5**
- **Vite 5**
- **Tailwind CSS 3**
- **React Three Fiber** + **Three.js** (cargado de forma diferida)
- **@react-three/drei**
- **lucide-react** (iconos)

No se utiliza ninguna otra dependencia pesada. El bundle inicial no incluye Three.js.

---

## Instalación y desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo
npm run dev
# Abre automáticamente http://localhost:5173

# 3. Verificar tipos
npm run lint

# 4. Build de producción
npm run build

# 5. Vista previa del build
npm run preview
```

---

## Estructura del proyecto

```
museo_muva/
├── public/
│   ├── favicon.svg
│   ├── models/
│   │   └── sculptures/           ← colocar aquí los archivos .glb
│   └── images/
│       ├── hero/                 ← imagen principal del Hero
│       ├── museum/               ← sección "El Museo"
│       ├── experience/           ← sección "Guaraní – Jesuítica"
│       ├── exhibitions/          ← imágenes de muestras
│       ├── news/                 ← imágenes de noticias
│       └── sculptures/           ← thumbnails de las esculturas
│
├── src/
│   ├── components/               ← componentes de UI
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── AboutMuseum.tsx
│   │   ├── History.tsx
│   │   ├── Collection.tsx
│   │   ├── GuaraniExperience.tsx
│   │   ├── VirtualEnvironment.tsx
│   │   ├── SculptureCard.tsx
│   │   ├── SculptureViewer.tsx   ← visor 3D (lazy)
│   │   ├── ViewerControls.tsx
│   │   ├── Exhibitions.tsx
│   │   ├── News.tsx
│   │   ├── Visit.tsx
│   │   ├── Contact.tsx
│   │   ├── Footer.tsx
│   │   └── LoadingScreen.tsx
│   │
│   ├── data/                     ← contenido editable (sin tocar componentes)
│   │   ├── museum.ts
│   │   ├── sculptures.ts
│   │   ├── exhibitions.ts
│   │   └── news.ts
│   │
│   ├── hooks/
│   │   └── useScrollReveal.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Sistema de diseño

Toda la paleta está centralizada en dos lugares:

### 1. Variables CSS (`src/index.css`)

```css
:root {
  --muva-dark:    #1a1410;   /* marrón muy oscuro, textos sobre fondo claro */
  --muva-brown:   #3d2f22;   /* marrón profundo */
  --muva-earth:   #6b4f35;   /* tierra, acentos */
  --muva-stone:   #8a7560;   /* piedra, textos secundarios */
  --muva-sand:    #c9b89a;   /* arena, hover / divisor */
  --muva-beige:   #e8dcc4;   /* beige cálido, secciones */
  --muva-cream:   #f5ecda;   /* crema, fondos sobre dark */
  --muva-ivory:   #faf6ee;   /* marfil, fondo principal */
  --muva-green:   #4a5d3a;   /* verde natural, acentos */
  --muva-olive:   #6b7048;   /* oliva, acentos */
  --muva-white:   #fdfaf3;   /* blanco cálido */

  --muva-font-serif: "Cormorant Garamond", Georgia, serif;
  --muva-font-sans:  "Inter", system-ui, sans-serif;
}
```

### 2. Tokens de Tailwind (`tailwind.config.js`)

La paleta está expuesta como utilidades: `bg-muva-dark`, `text-muva-earth`, `border-muva-sand/40`, etc.

> **Regla:** no usar colores fuera de la paleta `muva-*` en los componentes.

### Tipografía

- **Títulos:** `Cormorant Garamond` (serif, editorial, cultural) — clase `font-serif`
- **Textos:** `Inter` (sans, moderna, legible) — clase `font-sans`
- Cargadas vía Google Fonts en `index.html`.

### Botones

- `btn-primary` — fondo oscuro, texto crema
- `btn-ghost` — borde oscuro
- `btn-cream` — fondo crema (sobre secciones oscuras)

---

## Cómo agregar esculturas (3D)

El sistema está diseñado para que **agregar una obra sea un proceso de 3 pasos**. El visor (`SculptureViewer.tsx`) **no se modifica nunca**.

### Paso 1 — Copiar el modelo 3D

```text
obra-04.glb
         ↓
public/models/sculptures/obra-04.glb
```

### Paso 2 — Copiar la imagen miniatura

```text
obra-04.webp
         ↓
public/images/sculptures/obra-04.webp
```

Recomendado: `800 × 1100 px` o relación `3:4`, formato `.webp` para mejor compresión.

### Paso 3 — Agregar el objeto en `src/data/sculptures.ts`

```ts
export const sculptures: Sculpture[] = [
  // ... obras existentes
  {
    id: "obra-04",
    title: "Memoria de la Tierra",
    artist: "Manuel Viedma",
    year: "2018",
    material: "Piedra y bronce",
    dimensions: "150 × 100 × 100 cm",
    inventoryNumber: "MVP-004",
    description: "Descripción breve y curada de la obra.",
    historicalContext: "Contexto histórico opcional.",
    thumbnail: "/images/sculptures/obra-04.webp",
    model: "/models/sculptures/obra-04.glb",
  },
];
```

Eso es todo. La obra aparecerá automáticamente en:

- **Colección Viedma Paoli** (sección editorial)
- **Entorno Virtual** (galería 3D)

Y al pulsar **Explorar en 3D** se abrirá el visor con el modelo correspondiente.

> **Importante:** no crear componentes individuales como `Sculpture01.tsx`, `Sculpture02.tsx`, etc. Todo es dinámico a través de `SculptureViewer.tsx`.

---

## Cómo optimizar modelos `.glb`

Los modelos `.glb` deben estar **optimizados** antes de subirse a `public/models/sculptures/`. La web está preparada para:

- **Draco** (compresión de geometría)
- **Compresión de mallas**
- **Texturas WebP / KTX2** (recomendado para producción)
- **Mipmaps** para diferentes densidades de pantalla

### Herramientas recomendadas

| Herramienta | Uso |
|---|---|
| [gltf-transform](https://gltf-transform.dev/) | CLI/script para comprimir `.glb` |
| [gltfpack](https://github.com/zeux/meshoptimizer/tree/master/gltf) | Empaquetado óptimo |
| [Blender](https://www.blender.org/) | Edición + exportación `.glb` con Draco |
| [Squoosh](https://squoosh.app/) | Conversión de texturas a WebP |

### Ejemplo con `gltf-transform`

```bash
# Instalar
npm install -g @gltf-transform/cli

# Optimizar geometría con Draco y comprimir texturas
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp
```

### Tamaño objetivo

- **< 5 MB** por modelo para una experiencia fluida
- **< 15 MB** como máximo absoluto
- Texturas máximo **2048 × 2048 px** (en la mayoría de los casos basta con **1024 × 1024 px**)

---

## Cómo agregar / reemplazar imágenes

Todas las rutas de imagen son **relativas a `public/`**. Solo colocar el archivo en la carpeta correspondiente.

| Sección | Carpeta | Convención |
|---|---|---|
| Hero | `public/images/hero/` | `muva-hero.webp` |
| Museo | `public/images/museum/` | `interior.webp` |
| Experiencia | `public/images/experience/` | `mural.webp`, `jardin.webp`, `escultura.webp`, `arquitectura.webp` |
| Exposiciones | `public/images/exhibitions/` | `permanente.webp`, `murales.webp`, `pasionaria.webp`, `mujeres.webp` |
| Noticias | `public/images/news/` | `viedma-legado.webp`, `fundacion.webp`, `pasionaria.webp`, `educativo.webp` |
| Esculturas | `public/images/sculptures/` | `obra-XX.webp` |

Si la imagen no existe, el componente mostrará un gradiente cálido de respaldo (no se rompe la página).

> **Formato recomendado:** `.webp` (calidad 80), con fallback `.jpg` opcional.

---

## Cómo modificar la información institucional

Toda la información del museo se encuentra en **`src/data/museum.ts`**:

```ts
museum.name           // "MUVA"
museum.fullName       // "Museo Viedma"
museum.tagline        // "Experiencia Guaraní – Jesuítica"
museum.mission        // Texto largo de misión
museum.founded        // Año de fundación
museum.schedule       // Array de horarios
museum.contact        // Teléfono, email, dirección, redes
museum.access         // Entradas individuales, grupales, vehículos
museum.navLinks       // Links de navegación
```

Edita ese archivo y los cambios se reflejan en toda la landing sin tocar componentes.

---

## Cómo agregar exposiciones

Editar **`src/data/exhibitions.ts`**:

```ts
{
  id: "temporal-mixta",
  title: "Título de la muestra",
  subtitle: "Subtítulo opcional",
  type: "temporary",         // "permanent" | "temporary"
  description: "...",
  image: "/images/exhibitions/mixta.webp",
  startDate: "Octubre 2026",
  endDate: "Diciembre 2026",
  location: "Sala Temporal",
  cta: "Conocer la muestra",
  href: "#",
}
```

Las exposiciones marcadas como `"permanent"` se renderizan en la sección **Exposición permanente**, y las `"temporary"` en **Muestras temporales**.

---

## Cómo agregar noticias / agenda

Editar **`src/data/news.ts`**:

```ts
{
  id: "n-05",
  title: "Título de la noticia",
  excerpt: "Extracto breve (2-3 líneas).",
  date: "Septiembre 2026",
  category: "Noticia",     // "Noticia" | "Agenda" | "Educación" | "Cultura"
  image: "/images/news/noticia-05.webp",
  href: "#",
}
```

---

## Rendimiento y carga diferida

La landing está optimizada para ser **muy rápida**.

- **Three.js**, **@react-three/fiber** y **`SculptureViewer.tsx`** se cargan **únicamente cuando el usuario abre el visor 3D** (lazy + Suspense + chunks separados).
- **No se renderiza ningún `<Canvas>` ni se carga ningún `.glb`** en la landing ni en la galería.
- Solo se carga el `.glb` de la obra seleccionada en el visor.
- Al cerrar el visor, los recursos se liberan automáticamente.
- Imágenes con `loading="lazy"` salvo el Hero.
- Chunking manual en `vite.config.ts` (`three`, `fiber` como chunks separados).

### Tamaño de bundles (`npm run build`)

| Chunk | Tamaño | Notas |
|---|---|---|
| `index.html` | ~2 kB | |
| `index.css` | ~30 kB | Tailwind purgado |
| `index.js` (app) | ~70 kB | Toda la landing sin 3D |
| `SculptureViewer.js` | ~12 kB | **Lazy** |
| `fiber.js` (R3F + drei) | ~420 kB | **Lazy** |
| `three.js` | ~680 kB | **Lazy** |

La primera carga (sin 3D) pesa **~100 kB** total. Three.js se descarga solo al abrir el visor.

---

## Visor 3D · Características

`SculptureViewer.tsx` ofrece:

- **Rotación 360°** con mouse / touch (drag)
- **Zoom** (scroll / pinch)
- **Reset** de cámara
- **Pantalla completa** (`requestFullscreen`)
- **Botón volver** (Escape también cierra)
- **Carga diferida** del `.glb` seleccionado
- **Auto-centrado y escalado** del modelo a un marco visual consistente
- **Fondo y luces con colores MUVA** (no el azul/negro genérico de Three.js)
- **Punto de luz cálido** + sombra suave (`ContactShadows`)
- **Iluminación de apartamento** (`<Environment preset="apartment" />`)
- **Loader** mientras se carga: *"Preparando la experiencia…"*
- **Error state** con botón *"Intentar nuevamente"* si el `.glb` no existe
- **Limpieza de recursos** al cerrar (liberación de geometrías, materiales, contexto WebGL al desmontar el `<Canvas>`)

### Atajos

| Acción | Control |
|---|---|
| Rotar | Click + arrastrar |
| Zoom | Scroll / pinch |
| Cerrar | `Esc` o botón *Volver* |
| Reset cámara | Botón `↺` |
| Pantalla completa | Botón `⛶` |

---

## SEO, accesibilidad y responsive

- **Title y meta tags** completos en `index.html` (Open Graph, Twitter, descripción, locale `es_PY`).
- **HTML semántico**: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`, `<ol>`, `<dl>`.
- **`aria-label`** en regiones, landmarks, botones de iconos.
- **`role="dialog"`** y `aria-modal="true"` en el visor 3D.
- **Cierre con `Escape`** del visor.
- **Focus visible** con outline accesible (`focus-visible`).
- **`alt` text** en todas las imágenes (con `aria-hidden` en las decorativas).
- **Contraste** verificado sobre la paleta de la marca.
- **Responsive** en breakpoints: mobile, tablet (≥640), laptop (≥1024), desktop (≥1280).
- **Navbar hamburguesa** en móvil con animación de entrada.
- **Touch & pinch zoom** soportados en el visor.
- **Preconnect** a Google Fonts para mejorar FCP.

---

## Build y deploy

```bash
# Build de producción
npm run build

# El resultado se genera en /dist
# Servidor de previsualización local
npm run preview
```

`/dist` es estático y puede desplegarse en cualquier hosting:

- **Vercel** / **Netlify** (drag & drop de `/dist`)
- **Cloudflare Pages**
- **GitHub Pages**
- Servidor tradicional (Nginx, Apache)

Configurar el servidor para que **todas las rutas sirvan `index.html`** (SPA fallback). En Netlify/Vercel esto es automático.

> Si se sube la web a un subdirectorio (por ejemplo `https://sitio.com/muva/`), actualizar `base` en `vite.config.ts`.

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila TypeScript y construye para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta el type-check de TypeScript |

---

## Licencia y créditos

Sitio web del **MUVA – Museo Viedma** · Fundación Viedma Paoli · San Ignacio Guazú, Paraguay.

Diseño y desarrollo basado en la identidad cultural guaraní–jesuítica del museo.

Para consultas sobre el código: abrir un issue o contactar al equipo técnico.

> *"Un espacio para encontrarnos con nuestra historia, nuestro arte y nuestro legado."*
