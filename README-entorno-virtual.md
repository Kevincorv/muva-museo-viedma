# Entorno Virtual del MUVA

Recorrido 3D en primera persona por las salas del museo, con fichas de obra,
vista 360°, mapa y controles táctiles.

- **Ruta:** `/entorno-virtual` (agregada en `src/App.tsx`, carga con `lazy`)
- **Página:** `src/pages/VirtualMuseumPage.tsx`
- **Módulo:** `src/components/virtual-museum/`
- **Plano del museo:** `src/data/museumLayout.ts`
- **Obras del recorrido:** `src/data/sculptures.ts` → `museumSculptures`

El módulo es independiente del sitio: no modifica `i18n/translations.ts`,
ni el `Navbar`/`Footer` (solo se le agregó un enlace de entrada), ni
`vercel.json`.

## Cómo verlo

```bash
npm run dev          # http://localhost:5173/entorno-virtual
npm run build        # tsc -b + vite build
npm run lint         # solo typecheck
```

Verificación local sobre el build (headless Chrome + CDP):

```bash
node .vm-serve.cjs                 # sirve dist/ en el puerto 8100 (con fallback SPA)
node .vm-verify.cjs                # recorre home → bienvenida → visita → panel → 360 → mapa → ayuda
                                   # y guarda capturas en .vm-shots/
node .vm-inspect.cjs               # recorrido por capturas + test de parpadeo (diff de píxeles)
                                   # y guarda imágenes en .vm-shots-inspect/
node .vm-paths.cjs                 # comprueba que cada .glb referenciado exista
node .vm-thumbs.cjs                # lista miniaturas faltantes en public/images/sculptures/
node .vm-sala4.cjs                  # recorre hasta la Sala IV navegando por lazo cerrado
                                   # (lee posición y rumbo del marcador del mapa)
                                   # y guarda imágenes en .vm-shots-sala4/
```

## Controles

| Escritorio                    | Táctil                       |
| ----------------------------- | ---------------------------- |
| `W A S D` / flechas: caminar  | Joystick inferior izquierdo  |
| Ratón: mirar (clic para fijar el puntero) | Arrastrar para mirar |
| Clic: abrir ficha de la obra  | Tocar obra / botón ✋: ficha  |
| `ESC`: cerrar ficha, mapa o ayuda | igual                     |
| `F`: pantalla completa        | Botón del HUD                |

Botones del HUD: mapa, controles, pantalla completa y salir.

## Arquitectura

```
virtual-museum/
├─ VirtualMuseum.tsx        orquestador: canvas, HUD, estados (carga/bienvenida/visita), paneles
├─ FirstPersonControls.tsx  movimiento, colisión, raycast central, pointer lock / táctil
├─ MuseumEnvironment.tsx    muros, techos, pisos, señalización, luces
├─ MuseumRoom.tsx           piso + zócalo de una sala
├─ SculptureObject.tsx      pedestal, sombra de contacto, anillo de hover, modelo .glb
├─ SculptureInfoPanel.tsx   ficha lateral (inferior en móvil)
├─ SculptureViewer360.tsx   visor orbitable a pantalla completa
├─ MuseumMap.tsx            plano cenital + marcador del jugador
├─ ControlsHelp.tsx         modal de controles + lista reutilizable
├─ WelcomeScreen.tsx        pantalla de bienvenida (una vez por visita)
├─ LoadingScreen.tsx        espera de que el canvas esté listo
├─ MobileControls.tsx       joystick virtual + botón de interacción
├─ MuseumErrorBoundary.tsx  delimitador de errores dentro/fuera del canvas
├─ hud.tsx                  botones de icono + capacidades del dispositivo
├─ state.ts                 estado mutable a 60 fps (posición, mirada, joystick, apuntados)
├─ modelCache.ts            refcount de modelos descargados + `/draco/`
├─ textures.ts              texturas procedurales (piso, cartel, sombra)
├─ texts.ts                 textos es/en/pt del módulo (no toca translations.ts)
└─ (cada componente vive en su propio archivo)
```

> `state.ts` vive fuera de React a propósito: el movimiento y el raycast se
> actualizan cada frame sin provocar re-renders. React solo se entera de los
> cambios de sala, obra apuntada y paneles abiertos.

## Ambientación e iluminación

Estética de galería de arte: cálida, luminosa y profesional. Solo cambian
materiales, colores, texturas y luces; **ninguna estructura** (muros, salas,
puertas, columnas, bancos, cercas, posiciones de obra) ni la paleta del sitio.
Sin verdes, azules, violetas ni colores saturados/neón.

**Paleta** (`MuseumEnvironment.tsx`, `MuseumRoom.tsx`):

| Superficie            | Color       |
| --------------------- | ----------- |
| Muros                 | `#f4eede`   |
| Muro de acento (sala principal) | `#efe6d0` |
| Techo                 | `#f7f2e6`   |
| Paneles de luz        | `#fff8ec`   |
| Moldura / zócalo      | tonos madera `#6b4f35` … |
| Lente de foco         | `#ffeccb`   |

**Piso:** tablones de madera procedurales (`textures.ts` →
`createFloorTexture` / `createFloorRoughnessTexture`): 10 filas con juntas
escalonadas, veta y un roughness por tablón (centro mate, juntas más mates);
`envMapIntensity 0.42` en `MuseumRoom.tsx`. El tono por sala (`floorTone` en
`museumLayout.ts`) no se tocó.

**Rig de luces** (todo en `MuseumEnvironment.tsx`):

| Luz | Parámetros |
| --- | ---------- |
| Ambient | `#f8f0df`, `0.36` — esquinas claras, sin negros |
| Hemisférica | cielo `#fff6e6` / suelo `#6b4f35`, `0.44` |
| Direccional clave | con sombra **estática** 2048² (`shadowMap.autoUpdate = false`; se repinta solo al cambiar el contenido, vía `refreshKey`) |
| Direccional relleno | sin sombra, `0.28` |
| 10 × spotlight de obra | `#ffd9a4`, `intensity 13`, `angle 0.42`, `penumbra 0.6`, `distance 8`, `decay 1.6`, sin sombra |
| IBL local | `RoomEnvironment` + PMREM, `environmentIntensity 0.55`, sin descargas |
| Exposición | `toneMappingExposure = 1.08` (`VirtualMuseum.tsx`) |

Los focos de obra se derivan **solo leyendo** `museumSculptures` + `rooms`
(`buildGallerySpots()`): boca del focal desplazada `SPOT_OFFSET 0.9` hacia el
centro de su sala y `SPOT_DROP 0.16` por debajo del techo, apuntando a
`[x, 1.45, z]`. Cada `GallerySpot` añade su `light.target` a la escena en un
`useEffect`. El resultado es un acento cálido sobre la forma y un lavado nulo
del muro (medido: +20/+12/+8 de media RGB sobre la obra, +0 en el muro).

Los aparatos de techo se fusionan en **tres mallas** (3 draw calls): cuerpo de
bronce `#3a2f24`, lente emisiva `#ffeccb` y halo aditivo.

> `pointLights` sigue exportándose en `museumLayout.ts` como dato, pero el rig
> ya no lo consume: los acentos salen de las posiciones de las obras.

## Agregar una sala

Todo en `src/data/museumLayout.ts`:

1. Agregar el rectángulo a `rooms`:

   ```ts
   {
     id: "sala-5",
     nameKey: "room.sala5",        // texto en virtual-museum/texts.ts
     bounds: { minX: 14, minZ: -4, maxX: 22, maxZ: 6 },
     floorTone: "#ece5d5",
     edges: {
       west: { wall: false },      // borde compartido: lo genera la vecina
       east: { openings: [[0, 2.6]] },
     },
   }
   ```

2. Reglas: `norte = minZ`, `sur = maxZ`, `oeste = minX`, `este = maxX`.
   Un borde sin declarar genera un muro macizo; `wall: false` evita duplicar
   el muro compartido; `openings` son vanos en unidades absolutas (el dintel
   se genera solo hasta `WALL_HEIGHT`).
3. Si la sala queda fuera de `museumBounds`, ampliar ese objeto (es el
   límite físico del jugador).
4. Agregar `room.sala5` a los tres idiomas de `virtual-museum/texts.ts`.
5. Opcional: carteles en `signs`. El foco de acento de la nueva obra se crea
   solo (se deriva de `museumSculptures`); no hay que declarar luces.

## Agregar una escultura

1. Copiar el `.glb` a `public/models/sculptures/`
   (o `public/models/museum/sculptures/`) y, si pesa mucho, comprimirlo:

   ```bash
   npx gltf-transform optimize "entrada.glb" "salida.glb" --compress draco
   ```

2. Agregar una entrada en `museumSculptures` (`src/data/sculptures.ts`):

   ```ts
   {
     id: "ev-obra-21",
     ref: "obra-21",              // reutiliza la ficha traducida de sculptures
     inventoryNumber: "MUVA-011", // N.° de inventario (ver nota abajo)
     model: "/models/sculptures/obra-21.glb",
     position: [6.5, 0, 1.2],     // punto de apoyo sobre el piso
     rotation: [0, -0.7, 0],
     height: 1.15,                // metros finales (el .glb se escala solo)
     room: "sala-2",
   }
   ```

3. Miniatura para la ficha (`public/images/sculptures/obra-21.webp`).
   Se puede generar desde el propio `.glb`:

   ```bash
   node .thumb-cdp.cjs obra-21     # usa .bright-test.html + Chrome headless
   ```

   Sin miniatura, la ficha muestra el estado «Imagen no disponible».

4. Texto de la obra: si se reutiliza `ref`, no hay nada que escribir; si es
   una obra nueva, completar `title`, `description`, etc. en la misma entrada.

Las obras se montan y desmontan según la distancia (carga < 24 m,
descarga > 42 m), así que agregar obras no obliga a cargar todo el museo.

## Notas

- **Números de inventario de ejemplo:** `MUVA-001…010` son de muestra;
  reemplazarlos por los reales cuando estén disponibles.
- **Modelos pesados excluidos del recorrido:** `SANTA ANA.glb` (37 MB),
  `obra-06` (65 MB) y `La Pasionaria` (56 MB) no se usan aquí; el resto de
  los `.glb` del recorrido pesan entre 0,4 y 1,3 MB.
- **Rendimiento:** sombras estáticas (un único repintado del mapa de sombra),
  spots de obra sin sombra, aparatos de techo fusionados en 3 draw calls,
  `dpr` limitado y `frameloop="never"` mientras el visor 360° está abierto.
  Medido en el recorrido de `.vm-inspect.cjs`: 73–120 fps según carga de la
  máquina (referencia previa: ~68 fps), parpadeo < 0.02 % de píxeles.
- **Sin WebGL:** se muestra la pantalla de error con opción de volver al
  inicio (no se monta el canvas).
- **Idioma:** los textos del módulo viven en `virtual-museum/texts.ts`
  (`es`/`en`/`pt`); `i18n/translations.ts` queda intacto.
- **Imágenes de la home:** se corrigieron dos rutas 404 moviendo los
  archivos a la carpeta que el código ya esperaba:
  `public/images/hero/muva-hero.webp` y `public/images/museum/interior.webp`.
- **Cercas de obra:** cada escultura queda dentro de una cerca cuadrada
  (semilado 0.88 m) con postes y cinta; el perímetro tiene colisión, así el
  visitante queda afuera y la obra queda protegida.
