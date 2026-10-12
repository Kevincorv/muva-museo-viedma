import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  buildCeilingPanels,
  ridgeY,
  roofHeightAt,
  roomRoof,
  rooms,
} from "../../data/museumLayout";
import { WOOD_TILE_METERS } from "./textures";

/**
 * Techo a dos aguas de madera para TODAS las salas del museo.
 *
 *  · Dos faldones de tablas que se encuentran en una cumbrera central
 *    a lo largo del eje Z de cada sala (eje largo del plano).
 *  · Vigas de herradura (transversales a la cumbrera), pares longitudinales
 *    en cada falda, viga de cumbrera y piezas dobles sobre los muros largos.
 *  · Aletas triangulares (mismo enlucido que los muros) cierran los testeros
 *    para que no se vean huecos entre salas.
 *
 * Todo se fusiona en 3 mallas (tablas, vigas, aletas) ⇒ 3 draw calls.
 * La geometría se adapta a los `bounds` de cada sala, así que no hay
 * elementos flotantes ni que atraviesen muros.
 */

/** Distancia de las vigas respecto al plano del tablón. */
const BEAM_DROP = 0.14;
/** Fracciones de la pendiente donde se apoyan los pares longitudinales. */
const PURLIN_STEPS = [0.38, 0.72];

function mergeAll(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (!parts.length) return new THREE.BufferGeometry();
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  return merged;
}

function buildCeilingGeometries() {
  const planks: THREE.BufferGeometry[] = [];
  const beams: THREE.BufferGeometry[] = [];
  const gables: THREE.BufferGeometry[] = [];

  for (const room of rooms) {
    const roof = roomRoof(room);
    const { centerX, centerZ, halfSpan, depth, eaveY, rise } = roof;
    const angle = Math.atan2(rise, halfSpan);
    const slopeLen = Math.hypot(halfSpan, rise);

    // --- Faldones de tablas (el plano exacto del techo) -----------------
    for (const sx of [-1, 1]) {
      const plane = new THREE.PlaneGeometry(slopeLen, depth);
      const uv = plane.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(
          i,
          (uv.getX(i) * slopeLen) / WOOD_TILE_METERS,
          (uv.getY(i) * depth) / WOOD_TILE_METERS
        );
      }
      uv.needsUpdate = true;
      plane.rotateX(Math.PI / 2); // horizontal, la cara mira hacia el suelo
      plane.rotateZ(-sx * angle); // la caída hacia su alero
      plane.translate(centerX + (sx * halfSpan) / 2, eaveY + rise / 2, centerZ);
      planks.push(plane);
    }

    // --- Viga de la cumbrera -------------------------------------------
    const ridge = new THREE.BoxGeometry(0.22, 0.24, depth);
    ridge.translate(centerX, ridgeY(roof) - 0.13, centerZ);
    beams.push(ridge);

    // --- Piezas dobles sobre los muros largos (aleros) -----------------
    for (const sx of [-1, 1]) {
      const plate = new THREE.BoxGeometry(0.18, 0.15, depth);
      plate.translate(centerX + sx * (halfSpan - 0.09), eaveY - 0.055, centerZ);
      beams.push(plate);
    }

    // --- Vigas de herradura (transversales, simétricas) ----------------
    const stations = THREE.MathUtils.clamp(Math.round(depth / 1.7), 3, 9);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let i = 0; i < stations; i++) {
      const z =
        centerZ - depth / 2 + ((i + 0.5) * depth) / stations;
      for (const sx of [-1, 1]) {
        const rafter = new THREE.BoxGeometry(slopeLen - 0.05, 0.14, 0.12);
        rafter.rotateZ(-sx * angle);
        // La viga queda pegada por debajo del tablón (BEAM_DROP sobre su normal).
        rafter.translate(
          centerX + (sx * halfSpan) / 2 - sx * sin * BEAM_DROP,
          eaveY + rise / 2 - cos * BEAM_DROP,
          z
        );
        beams.push(rafter);
      }
    }

    // --- Pares longitudinales (una por fracción y por falda) ------------
    for (const f of PURLIN_STEPS) {
      for (const sx of [-1, 1]) {
        const x = centerX + sx * halfSpan * f;
        const y = roofHeightAt(roof, x, centerZ) - BEAM_DROP * 0.62;
        const purlin = new THREE.BoxGeometry(0.13, 0.14, depth);
        purlin.translate(x, y, centerZ);
        beams.push(purlin);
      }
    }

    // --- Aletas de testero (mismo enlucido que los muros) --------------
    for (const zEdge of [room.bounds.minZ, room.bounds.maxZ]) {
      const shape = new THREE.Shape();
      shape.moveTo(room.bounds.minX, eaveY);
      shape.lineTo(room.bounds.maxX, eaveY);
      shape.lineTo(centerX, eaveY + rise);
      shape.closePath();
      const gable = new THREE.ShapeGeometry(shape);
      gable.translate(0, 0, zEdge);
      gables.push(gable);
    }
  }

  // --- Barbones de los paneles de luz (cuelgan de la cumbrera) ---------
  for (const panel of buildCeilingPanels()) {
    const [px, py, pz] = panel.position;
    const half = Math.min(0.7, panel.size[0] / 2 - 0.25);
    // La cumbrera de la sala que contiene el panel (mismo eje X).
    const room = rooms.find(
      (r) =>
        Math.abs((r.bounds.minX + r.bounds.maxX) / 2 - px) < 0.01 &&
        pz >= r.bounds.minZ &&
        pz <= r.bounds.maxZ
    );
    const roof = room ? roomRoof(room) : null;
    if (!roof) continue;
    const beamBottom = ridgeY(roof) - 0.26;
    const rodLen = Math.max(0.02, beamBottom - (py + 0.03));
    for (const side of [-1, 1]) {
      const rod = new THREE.CylinderGeometry(0.014, 0.014, rodLen, 6);
      rod.translate(px + side * half, py + 0.03 + rodLen / 2, pz);
      beams.push(rod);
    }
  }

  return {
    planksGeometry: mergeAll(planks),
    beamsGeometry: mergeAll(beams),
    gablesGeometry: mergeAll(gables),
  };
}

export default function MuseumCeiling({
  woodTexture,
  bumpTexture,
}: {
  woodTexture: THREE.Texture;
  bumpTexture: THREE.Texture;
}) {
  const geometries = useMemo(() => buildCeilingGeometries(), []);

  const planksMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.82,
        metalness: 0,
        envMapIntensity: 0.18,
        side: THREE.DoubleSide,
      }),
    [woodTexture]
  );

  const beamsMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5b3d24",
        roughness: 0.78,
        metalness: 0,
        envMapIntensity: 0.22,
      }),
    []
  );

  const gablesMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e6d9be",
        roughness: 0.92,
        metalness: 0,
        bumpMap: bumpTexture,
        bumpScale: 0.015,
        envMapIntensity: 0.1,
        side: THREE.DoubleSide,
      }),
    [bumpTexture]
  );

  useEffect(
    () => () => {
      geometries.planksGeometry.dispose();
      geometries.beamsGeometry.dispose();
      geometries.gablesGeometry.dispose();
      planksMaterial.dispose();
      beamsMaterial.dispose();
      gablesMaterial.dispose();
    },
    [geometries, planksMaterial, beamsMaterial, gablesMaterial]
  );

  return (
    <group>
      <mesh
        geometry={geometries.planksGeometry}
        material={planksMaterial}
      />
      <mesh geometry={geometries.beamsGeometry} material={beamsMaterial} />
      <mesh geometry={geometries.gablesGeometry} material={gablesMaterial} />
    </group>
  );
}
