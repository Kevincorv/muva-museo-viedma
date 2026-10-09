import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  DOOR_HEIGHT,
  WALL_HEIGHT,
  WALL_THICKNESS,
  buildDoorFrames,
  buildWallSegments,
  columns,
} from "../../data/museumLayout";

/**
 * Molduras y elementos fijos del edificio: zócalo, cornisa, marcos de puerta
 * y columnas de la galería.
 *
 * Cada familia se fusiona en UNA sola malla (`mergeGeometries`), así todo el
 * detalle añade solo 4 draw calls. Las cajas se construyen en coordenadas de
 * mundo y se fusionan sin transformar la cámara.
 */

function box(
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number
): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  geometry.translate(x, y, z);
  return geometry;
}

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (!parts.length) return new THREE.BoxGeometry(0, 0, 0);
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  return merged;
}

const BASEBOARD_HEIGHT = 0.1;
const CORNICE_HEIGHT = 0.08;
const FRAME_JAMB = 0.09;
const FRAME_DEPTH = WALL_THICKNESS + 0.06;

function useArchitecture() {
  return useMemo(() => {
    const baseboards: THREE.BufferGeometry[] = [];
    const cornices: THREE.BufferGeometry[] = [];
    const frames: THREE.BufferGeometry[] = [];
    const columnParts: THREE.BufferGeometry[] = [];

    for (const segment of buildWallSegments()) {
      const [px, py, pz] = segment.position;
      const [w, h, d] = segment.size;
      const alongX = Math.abs(d - WALL_THICKNESS) < 0.001;
      const proud = 0.04;
      const top = py + h / 2;
      const bottom = py - h / 2;

      // Zócalo: solo los tramos que arrancan en el piso.
      if (bottom <= 0.001) {
        baseboards.push(
          alongX
            ? box(w, BASEBOARD_HEIGHT, d + proud, px, BASEBOARD_HEIGHT / 2, pz)
            : box(w + proud, BASEBOARD_HEIGHT, d, px, BASEBOARD_HEIGHT / 2, pz)
        );
      }

      // Cornisa: todo tramo que llega al techo (macizos y dinteles).
      if (top >= WALL_HEIGHT - 0.001) {
        cornices.push(
          alongX
            ? box(w, CORNICE_HEIGHT, d + proud + 0.02, px, WALL_HEIGHT - CORNICE_HEIGHT / 2, pz)
            : box(w + proud + 0.02, CORNICE_HEIGHT, d, px, WALL_HEIGHT - CORNICE_HEIGHT / 2, pz)
        );
      }
    }

    for (const door of buildDoorFrames()) {
      const local: THREE.BufferGeometry[] = [];
      // El marco entra 3 cm en el vano: así la cara del muro queda cubierta
      // por el marco (cara a cara idénticas = parpadeo por z-fighting).
      const intrude = 0.03;
      const half = door.width / 2 + FRAME_JAMB / 2 - intrude;
      const jambTop = DOOR_HEIGHT;
      const lintelH = 0.15;

      local.push(box(FRAME_JAMB, jambTop, FRAME_DEPTH, -half, jambTop / 2, 0));
      local.push(box(FRAME_JAMB, jambTop, FRAME_DEPTH, half, jambTop / 2, 0));
      local.push(
        box(
          door.width + FRAME_JAMB * 2,
          lintelH,
          FRAME_DEPTH,
          0,
          DOOR_HEIGHT - intrude + lintelH / 2,
          0
        )
      );

      const frame = merge(local);
      if (door.axis === "z") frame.rotateY(Math.PI / 2);
      frame.translate(door.center[0], 0, door.center[1]);
      frames.push(frame);
    }

    for (const column of columns) {
      const [cx, cz] = column.position;
      const baseH = 0.14;
      const capH = 0.16;
      const shaftH = WALL_HEIGHT - baseH - capH;

      const base = new THREE.BoxGeometry(column.radius * 2.6, baseH, column.radius * 2.6);
      base.translate(cx, baseH / 2, cz);
      columnParts.push(base);

      const shaft = new THREE.CylinderGeometry(
        column.radius,
        column.radius * 1.08,
        shaftH,
        18
      );
      shaft.translate(cx, baseH + shaftH / 2, cz);
      columnParts.push(shaft);

      const cap = new THREE.BoxGeometry(column.radius * 2.4, capH, column.radius * 2.4);
      cap.translate(cx, baseH + shaftH + capH / 2, cz);
      columnParts.push(cap);
    }

    return {
      baseboardGeometry: merge(baseboards),
      corniceGeometry: merge(cornices),
      frameGeometry: merge(frames),
      columnGeometry: merge(columnParts),
    };
  }, []);
}

const useMaterial = (factory: () => THREE.MeshStandardMaterial) =>
  useMemo(factory, []);

export default function MuseumArchitecture() {
  const { baseboardGeometry, corniceGeometry, frameGeometry, columnGeometry } =
    useArchitecture();

  const baseboardMaterial = useMaterial(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5b4636",
        roughness: 0.7,
        metalness: 0.04,
        envMapIntensity: 0.25,
      })
  );
  const corniceMaterial = useMaterial(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f7f1e4",
        roughness: 0.9,
        metalness: 0,
        envMapIntensity: 0.18,
      })
  );
  const frameMaterial = useMaterial(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7a6448",
        roughness: 0.62,
        metalness: 0.05,
        envMapIntensity: 0.3,
      })
  );
  const columnMaterial = useMaterial(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ece4d2",
        roughness: 0.88,
        metalness: 0,
        envMapIntensity: 0.16,
      })
  );

  useEffect(
    () => () => {
      baseboardGeometry.dispose();
      corniceGeometry.dispose();
      frameGeometry.dispose();
      columnGeometry.dispose();
      baseboardMaterial.dispose();
      corniceMaterial.dispose();
      frameMaterial.dispose();
      columnMaterial.dispose();
    },
    [
      baseboardGeometry,
      corniceGeometry,
      frameGeometry,
      columnGeometry,
      baseboardMaterial,
      corniceMaterial,
      frameMaterial,
      columnMaterial,
    ]
  );

  return (
    <group>
      <mesh
        geometry={baseboardGeometry}
        material={baseboardMaterial}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={corniceGeometry}
        material={corniceMaterial}
        receiveShadow
      />
      <mesh
        geometry={frameGeometry}
        material={frameMaterial}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={columnGeometry}
        material={columnMaterial}
        castShadow
        receiveShadow
      />
    </group>
  );
}
