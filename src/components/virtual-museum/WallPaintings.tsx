import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  PAINTING_HEIGHT,
  paintings,
  type PaintingSpec,
} from "../../data/paintings";
import { isConstrainedDevice } from "../../lib/capabilities";
import { focusDim } from "./focusDim";

/**
 * Cuadros colgados de los muros: marco de madera oscura con filo dorado,
 * lienzo con la textura de la obra y luminaria de latón sobre cada cuadro.
 *
 * Rendimiento:
 *  · Marcos, filos y luminarias se fusionan en 4 mallas estáticas
 *    (4 draw calls); cada lienzo suma 1 mesh con su propia textura.
 *  · Las texturas se cargan a demanda (TextureLoader) sin Suspense: si una
 *    imagen falta, el marco queda igual y solo se omite el lienzo.
 *  · El lienzo lleva `emissiveMap` sutil: simula la iluminación de la
 *    luminaria sin agregar luces dinámicas al shader.
 */

const FRAME_BORDER = 0.18;
const LINER_OVERHANG = 0.06;
const FRAME_DEPTH = 0.05;
const LINER_Z = FRAME_DEPTH + 0.001;
const CANVAS_Z = FRAME_DEPTH + 0.003;
const LIGHT_RISE = 0.13;
const PAINTING_EMISSIVE = 0.25;
const LENS_BASE_COLOR = new THREE.Color("#fff0d0");
const LENS_DIM_COLOR = new THREE.Color("#6f6350");

/**
 * En dispositivos con poca RAM solo se mantienen decodificadas las texturas
 * de los lienzos cercanos: 21 imágenes en simultáneo superan los 100 MB de
 * memoria de textura y, junto con los modelos, tumban el tab del navegador.
 */
const GATED = isConstrainedDevice();
const PAINTING_LOAD_DISTANCE = 16;
const PAINTING_UNLOAD_DISTANCE = 19;

function paintingSize(spec: PaintingSpec): { w: number; h: number } {
  const h = spec.height ?? PAINTING_HEIGHT;
  return { w: h * (spec.aspect ?? 0.75), h };
}

function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (!parts.length) return new THREE.BoxGeometry(0, 0, 0);
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  return merged;
}

interface MergedPaintings {
  frameGeometry: THREE.BufferGeometry;
  linerGeometry: THREE.BufferGeometry;
  fixtureGeometry: THREE.BufferGeometry;
  lensGeometry: THREE.BufferGeometry;
}

function buildMerged(specs: readonly PaintingSpec[]): MergedPaintings {
  const frames: THREE.BufferGeometry[] = [];
  const liners: THREE.BufferGeometry[] = [];
  const fixtures: THREE.BufferGeometry[] = [];
  const lenses: THREE.BufferGeometry[] = [];

  for (const spec of specs) {
    const { w, h } = paintingSize(spec);

    const matrix = new THREE.Matrix4()
      .makeRotationY(spec.rotationY)
      .setPosition(spec.position[0], spec.position[1], spec.position[2]);

    // Marco de madera (caja maciza) + filo dorado (plano justo delante).
    const frame = new THREE.BoxGeometry(w + FRAME_BORDER, h + FRAME_BORDER, FRAME_DEPTH);
    frame.translate(0, 0, FRAME_DEPTH / 2);
    frame.applyMatrix4(matrix);
    frames.push(frame);

    const liner = new THREE.PlaneGeometry(w + LINER_OVERHANG, h + LINER_OVERHANG);
    liner.translate(0, 0, LINER_Z);
    liner.applyMatrix4(matrix);
    liners.push(liner);

    // Luminaria: brazo desde el muro + cabezal horizontal de latón.
    const lightY = h / 2 + FRAME_BORDER / 2 + LIGHT_RISE;
    const arm = new THREE.BoxGeometry(0.022, 0.022, 0.17);
    arm.translate(0, lightY, 0.1);
    arm.applyMatrix4(matrix);
    fixtures.push(arm);

    const headLength = Math.min(w * 0.62, 1);
    const head = new THREE.CylinderGeometry(0.028, 0.028, headLength, 12);
    head.rotateZ(Math.PI / 2);
    head.translate(0, lightY, 0.2);
    head.applyMatrix4(matrix);
    fixtures.push(head);

    const lens = new THREE.CircleGeometry(0.023, 16);
    lens.rotateX(Math.PI / 2);
    lens.translate(0, lightY - 0.028, 0.2);
    lens.applyMatrix4(matrix);
    lenses.push(lens);
  }

  return {
    frameGeometry: mergeParts(frames),
    linerGeometry: mergeParts(liners),
    fixtureGeometry: mergeParts(fixtures),
    lensGeometry: mergeParts(lenses),
  };
}

/** Lienzo con su textura (carga tolerante a fallos). */
function PaintingCanvas({
  spec,
  registry,
}: {
  spec: PaintingSpec;
  registry: { current: THREE.MeshStandardMaterial[] };
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { w, h } = paintingSize(spec);

  useEffect(() => {
    let cancelled = false;
    new THREE.TextureLoader().load(
      spec.src,
      (loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 8;
        setTexture(loaded);
      },
      undefined,
      () => {
        /* imagen no disponible: queda solo el marco */
      }
    );
    return () => {
      cancelled = true;
    };
  }, [spec.src]);

  const material = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: PAINTING_EMISSIVE,
      roughness: 0.62,
      metalness: 0,
    });
  }, [texture]);

  // Registra el material para que el padre lo atenúe con el foco.
  useEffect(() => {
    if (!material) return;
    const list = registry.current;
    list.push(material);
    return () => {
      const index = list.indexOf(material);
      if (index >= 0) list.splice(index, 1);
    };
  }, [material, registry]);

  useEffect(
    () => () => {
      texture?.dispose();
      material?.dispose();
    },
    [texture, material]
  );

  if (!material) return null;

  return (
    <group position={spec.position} rotation={[0, spec.rotationY, 0]}>
      <mesh position={[0, 0, CANVAS_Z]} material={material} receiveShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}

export default function WallPaintings() {
  const merged = useMemo(() => buildMerged(paintings), []);
  const canvasMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const nearRef = useRef<Set<string> | null>(GATED ? new Set() : null);
  const [nearIds, setNearIds] = useState<Set<string> | null>(nearRef.current);
  const sampleAcc = useRef(0);

  // Sincroniza el atenuado de los lienzos y lentes con el foco de obra.
  // En móviles, muestrea ~2 veces por segundo qué lienzos están cerca.
  useFrame((_state, delta) => {
    const dim = focusDim.current;
    const emissive = PAINTING_EMISSIVE * (1 - 0.8 * dim);
    for (const material of canvasMaterials.current) {
      material.emissiveIntensity = emissive;
    }
    lensMaterial.color.lerpColors(LENS_BASE_COLOR, LENS_DIM_COLOR, dim);

    if (!GATED) return;
    sampleAcc.current += Math.min(delta, 0.5);
    if (sampleAcc.current < 0.5) return;
    sampleAcc.current = 0;
    const previous = nearRef.current;
    if (!previous) return;
    const { x, y, z } = _state.camera.position;
    const next = new Set<string>();
    let changed = false;
    for (const spec of paintings) {
      const distance = Math.hypot(
        spec.position[0] - x,
        spec.position[1] - y,
        spec.position[2] - z
      );
      const wasNear = previous.has(spec.id);
      const near = wasNear
        ? distance < PAINTING_UNLOAD_DISTANCE
        : distance < PAINTING_LOAD_DISTANCE;
      if (near) next.add(spec.id);
      if (near !== wasNear) changed = true;
    }
    if (changed) {
      nearRef.current = next;
      setNearIds(next);
    }
  });

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#463420",
        roughness: 0.52,
        metalness: 0.08,
        envMapIntensity: 0.3,
      }),
    []
  );
  const linerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c9a24b",
        roughness: 0.34,
        metalness: 0.8,
        envMapIntensity: 0.8,
      }),
    []
  );
  const fixtureMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7d5f34",
        roughness: 0.42,
        metalness: 0.65,
        envMapIntensity: 0.6,
      }),
    []
  );
  const lensMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#fff0d0", toneMapped: false }),
    []
  );

  useEffect(
    () => () => {
      merged.frameGeometry.dispose();
      merged.linerGeometry.dispose();
      merged.fixtureGeometry.dispose();
      merged.lensGeometry.dispose();
      frameMaterial.dispose();
      linerMaterial.dispose();
      fixtureMaterial.dispose();
      lensMaterial.dispose();
    },
    [merged, frameMaterial, linerMaterial, fixtureMaterial, lensMaterial]
  );

  return (
    <group>
      <mesh
        geometry={merged.frameGeometry}
        material={frameMaterial}
        castShadow
        receiveShadow
      />
      <mesh geometry={merged.linerGeometry} material={linerMaterial} receiveShadow />
      <mesh geometry={merged.fixtureGeometry} material={fixtureMaterial} castShadow />
      <mesh geometry={merged.lensGeometry} material={lensMaterial} />

      {paintings.map((spec) =>
        nearIds && !nearIds.has(spec.id) ? null : (
          <PaintingCanvas key={spec.id} spec={spec} registry={canvasMaterials} />
        )
      )}
    </group>
  );
}
