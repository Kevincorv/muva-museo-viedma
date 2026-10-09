import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { museumSculptures } from "../../data/sculptures";
import { benches, STANCHION_HALF } from "../../data/museumLayout";
import { createDustTexture } from "./textures";

/**
 * Mobiliario y ambiente del museo: bancos de sala, cerca de postes y cinta
 * alrededor de cada obra y partículas de polvo en suspensión.
 *
 * La cerca es un cuadrado que rodea el pedestal completo (la obra queda
 * SIEMPRE dentro) y su perímetro se agrega a la colisión del jugador.
 */

const POST_HEIGHT = 0.92;
const ROPE_HEIGHT = 0.84;
const DUST_COUNT = 260;

function translatedBox(
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

function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (!parts.length) return new THREE.BoxGeometry(0, 0, 0);
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  return merged;
}

function buildBenches(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  for (const bench of benches) {
    const local: THREE.BufferGeometry[] = [];
    const seatY = 0.44;
    const legInset = bench.length / 2 - 0.14;

    local.push(translatedBox(bench.length, 0.06, bench.depth, 0, seatY, 0));
    local.push(
      translatedBox(0.09, seatY, bench.depth - 0.14, -legInset, seatY / 2, 0)
    );
    local.push(
      translatedBox(0.09, seatY, bench.depth - 0.14, legInset, seatY / 2, 0)
    );

    const geometry = mergeParts(local);
    geometry.rotateY(bench.rotationY);
    geometry.translate(bench.position[0], 0, bench.position[1]);
    parts.push(geometry);
  }

  return mergeParts(parts);
}

function buildStanchions(): {
  metal: THREE.BufferGeometry;
  rope: THREE.BufferGeometry;
} {
  const metal: THREE.BufferGeometry[] = [];
  const rope: THREE.BufferGeometry[] = [];
  const topY = 0.04 + POST_HEIGHT;
  const h = STANCHION_HALF;
  const corners: [number, number][] = [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ];

  for (const sculpture of museumSculptures) {
    const [cx, , cz] = sculpture.position;
    const tops: THREE.Vector3[] = [];

    for (const [ox, oz] of corners) {
      const px = cx + ox;
      const pz = cz + oz;

      const base = new THREE.CylinderGeometry(0.1, 0.12, 0.04, 14);
      base.translate(px, 0.02, pz);
      metal.push(base);

      const shaft = new THREE.CylinderGeometry(0.032, 0.036, POST_HEIGHT, 12);
      shaft.translate(px, 0.04 + POST_HEIGHT / 2, pz);
      metal.push(shaft);

      const cap = new THREE.SphereGeometry(0.052, 14, 10);
      cap.translate(px, topY, pz);
      metal.push(cap);

      tops.push(new THREE.Vector3(px, ROPE_HEIGHT, pz));
    }

    for (let k = 0; k < 4; k++) {
      const a = tops[k];
      const b = tops[(k + 1) % 4];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y -= 0.09;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      rope.push(new THREE.TubeGeometry(curve, 12, 0.016, 6, false));
    }
  }

  return { metal: mergeParts(metal), rope: mergeParts(rope) };
}

function DustParticles() {
  const texture = useMemo(() => createDustTexture(), []);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.03,
        map: texture,
        color: "#fff6e2",
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        toneMapped: false,
      }),
    [texture]
  );

  const { geometry, base } = useMemo(() => {
    const base = new Float32Array(DUST_COUNT * 3);
    const positions = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      const x = THREE.MathUtils.randFloat(-12.4, 12.4);
      const y = THREE.MathUtils.randFloat(0.4, 3.3);
      const z = THREE.MathUtils.randFloat(-15.4, 13.4);
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.8, -1), 24);
    return { geometry, base };
  }, []);

  const phases = useMemo(
    () =>
      Float32Array.from({ length: DUST_COUNT }, () => Math.random() * Math.PI * 2),
    []
  );

  const pointsRef = useRef<THREE.Points>(null);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture]
  );

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const attribute = points.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const time = clock.elapsedTime;
    for (let i = 0; i < DUST_COUNT; i++) {
      const phase = phases[i];
      array[i * 3] = base[i * 3] + Math.sin(time * 0.09 + phase * 1.7) * 0.4;
      array[i * 3 + 1] =
        base[i * 3 + 1] + Math.sin(time * 0.35 + phase) * 0.22;
      array[i * 3 + 2] =
        base[i * 3 + 2] + Math.cos(time * 0.07 + phase * 1.3) * 0.4;
    }
    attribute.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}

export default function MuseumProps() {
  const benchGeometry = useMemo(() => buildBenches(), []);
  const stanchions = useMemo(() => buildStanchions(), []);

  const benchMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#6f5844",
        roughness: 0.72,
        metalness: 0.04,
        envMapIntensity: 0.35,
      }),
    []
  );
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#9a8a6a",
        roughness: 0.34,
        metalness: 0.72,
        envMapIntensity: 0.9,
      }),
    []
  );
  const ropeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4a3b2f",
        roughness: 0.95,
        metalness: 0,
        envMapIntensity: 0.15,
      }),
    []
  );

  useEffect(
    () => () => {
      benchGeometry.dispose();
      stanchions.metal.dispose();
      stanchions.rope.dispose();
      benchMaterial.dispose();
      brassMaterial.dispose();
      ropeMaterial.dispose();
    },
    [
      benchGeometry,
      stanchions,
      benchMaterial,
      brassMaterial,
      ropeMaterial,
    ]
  );

  return (
    <group>
      <mesh
        geometry={benchGeometry}
        material={benchMaterial}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={stanchions.metal}
        material={brassMaterial}
        castShadow
        receiveShadow
      />
      <mesh geometry={stanchions.rope} material={ropeMaterial} castShadow />
      <DustParticles />
    </group>
  );
}
