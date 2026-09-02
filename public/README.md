# Cómo agregar imágenes y modelos 3D

Este sitio web está preparado para que **agregar contenido visual sea muy sencillo**.

## Imágenes de la landing

| Carpeta | Contenido |
|---|---|
| `public/images/hero/` | Imagen principal del Hero |
| `public/images/museum/` | Sección "El Museo" |
| `public/images/experience/` | Sección "Guaraní – Jesuítica" |
| `public/images/exhibitions/` | Exposiciones |
| `public/images/news/` | Noticias |

> **Formato recomendado:** `.webp` (calidad 80), relación 4:5 vertical o 16:9 horizontal según el caso.

## Esculturas 3D

| Carpeta | Contenido |
|---|---|
| `public/models/sculptures/` | Archivos `.glb` |
| `public/images/sculptures/` | Thumbnails `.webp` |

> Convención: `obra-01.glb` + `obra-01.webp` + `obra-01` (id en `sculptures.ts`).

Para instrucciones detalladas, ver el archivo principal [`README.md`](./README.md).
