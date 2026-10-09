import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { museumSculptures } from "../../data/sculptures";
import {
  buildCeilingPanels,
  buildWallSegments,
  entranceDoor,
  rooms,
  signs,
  type SignSpec,
} from "../../data/museumLayout";
import { useVmText } from "./texts";
import {
  createFloorRoughnessTexture,
  createFloorTexture,
  createHaloTexture,
  createPlaqueTexture,
  createWallBumpTexture,
} from "./textures";
import MuseumArchitecture from "./MuseumArchitecture";
import MuseumProps from "./MuseumProps";
import MuseumRoom from "./MuseumRoom";

function SignPlaque({ sign, label }: { sign: SignSpec; label: string }) {
  const texture = useMemo(
    () => createPlaqueTexture(label, sign.sub),
    [label, sign.sub]
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={sign.position} rotation={[0, sign.rotationY, 0]}>
      <planeGeometry args={[sign.width, sign.height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function EntranceDoor() {
  return (
    <group position={entranceDoor.position}>
      <mesh>
        <boxGeometry args={[entranceDoor.width, entranceDoor.height, 0.1]} />
        <meshStandardMaterial color="#3d2f22" roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.25, -0.08]}>
        <boxGeometry args={[entranceDoor.width * 0.9, 0.02, 0.03]} />
        <meshStandardMaterial color="#8a7560" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[entranceDoor.width * 0.32, 0, -0.08]}>
        <boxGeometry args={[0.04, 0.28, 0.04]} />
        <meshStandardMaterial color="#c9b89a" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Focos de galería: un spotlight cálido por obra, con accesorio de    */
/* techo fusionado. Solo LEE las posiciones de las esculturas.         */
/* ------------------------------------------------------------------ */

const CEILING_Y = 3.6;
/** Desplazamiento del focal hacia el centro de su sala (ilumina la cara visible). */
const SPOT_OFFSET = 0.9;
/** Longitud del accesorio: el cono nace en la boca del focal. */
const SPOT_DROP = 0.16;
/** Intensidad (canela, ~3000 K) de cada spotlight de obra. */
const SPOT_INTENSITY = 13;

interface GallerySpotSpec {
  attach: [number, number, number];
  origin: [number, number, number];
  target: [number, number, number];
  dir: [number, number, number];
}

function buildGallerySpots(): GallerySpotSpec[] {
  const spots: GallerySpotSpec[] = [];

  for (const sculpture of museumSculptures) {
    if (!sculpture.model) continue;
    const room = rooms.find((entry) => entry.id === sculpture.room);
    const cx = room ? (room.bounds.minX + room.bounds.maxX) / 2 : 0;
    const cz = room ? (room.bounds.minZ + room.bounds.maxZ) / 2 : 0;

    const dx = cx - sculpture.position[0];
    const dz = cz - sculpture.position[2];
    const len = Math.hypot(dx, dz);
    const ux = len > 0.001 ? dx / len : 0;
    const uz = len > 0.001 ? dz / len : 0;
    const ax = sculpture.position[0] + ux * SPOT_OFFSET;
    const az = sculpture.position[2] + uz * SPOT_OFFSET;

    const tx = sculpture.position[0] - ax;
    const ty = 1.45 - CEILING_Y;
    const tz = sculpture.position[2] - az;
    const tlen = Math.hypot(tx, ty, tz) || 1;
    const dir: [number, number, number] = [tx / tlen, ty / tlen, tz / tlen];

    spots.push({
      attach: [ax, CEILING_Y, az],
      origin: [
        ax + dir[0] * SPOT_DROP,
        CEILING_Y + dir[1] * SPOT_DROP,
        az + dir[2] * SPOT_DROP,
      ],
      target: [sculpture.position[0], 1.45, sculpture.position[2]],
      dir,
    });
  }

  return spots;
}

function mergeMeshes(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (!parts.length) return new THREE.BoxGeometry(0, 0, 0);
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  return merged;
}

/**
 * Aparatos de techo fusionados en tres mallas (3 draw calls): cuerpo de
 * bronce, lente emisiva cálida y halo aditivo bajo cada focal.
 */
function buildFixtureMeshes(spots: readonly GallerySpotSpec[]) {
  const bodies: THREE.BufferGeometry[] = [];
  const lenses: THREE.BufferGeometry[] = [];
  const glows: THREE.BufferGeometry[] = [];
  const localDown = new THREE.Vector3(0, -1, 0);

  for (const spot of spots) {
    const rotation = new THREE.Quaternion().setFromUnitVectors(
      localDown,
      new THREE.Vector3(...spot.dir)
    );

    const stem = new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8);
    stem.translate(0, -0.04, 0);
    const body = new THREE.CylinderGeometry(0.042, 0.06, 0.1, 12);
    body.translate(0, -0.13, 0);
    const fixture = mergeMeshes([stem, body]);
    fixture.applyQuaternion(rotation);
    fixture.translate(spot.attach[0], spot.attach[1], spot.attach[2]);
    bodies.push(fixture);

    const lens = new THREE.CircleGeometry(0.045, 18);
    lens.rotateX(Math.PI / 2);
    lens.translate(0, -0.181, 0);
    lens.applyQuaternion(rotation);
    lens.translate(spot.attach[0], spot.attach[1], spot.attach[2]);
    lenses.push(lens);

    const glow = new THREE.PlaneGeometry(0.4, 0.4);
    glow.rotateX(Math.PI / 2);
    glow.translate(0, -0.2, 0);
    glow.applyQuaternion(rotation);
    glow.translate(spot.attach[0], spot.attach[1], spot.attach[2]);
    glows.push(glow);
  }

  return {
    bodyGeometry: mergeMeshes(bodies),
    lensGeometry: mergeMeshes(lenses),
    glowGeometry: mergeMeshes(glows),
  };
}

/** Un spotlight cálido apuntando a su obra (objetivo estático, sin sombra). */
function GallerySpot({ spec }: { spec: GallerySpotSpec }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    light.target.position.set(spec.target[0], spec.target[1], spec.target[2]);
    light.target.updateMatrixWorld();
    scene.add(light.target);
    return () => {
      scene.remove(light.target);
    };
  }, [scene, spec]);

  return (
    <spotLight
      ref={lightRef}
      position={spec.origin}
      angle={0.42}
      penumbra={0.6}
      intensity={SPOT_INTENSITY}
      distance={8}
      decay={1.6}
      color="#ffcf94"
    />
  );
}

/**
 * Arquitectura del museo: pisos, muros generados desde el plano, molduras,
 * columnas, mobiliario, techos, paneles de luz, señalización e iluminación.
 *
 * Ambientación de galería:
 *  · IBL local (`RoomEnvironment`) para reflejos suaves: no descarga nada.
 *  · Luz base cálida (ambient + hemisférica): esquinas iluminadas, sin negros.
 *  · Una luz clave con sombra suave; el mapa de sombra se dibuja una vez y
 *    solo se refresca cuando entra o sale una obra (`autoUpdate = false`).
 *  · Un spotlight cálido (~3000 K) por obra, derivado de `museumSculptures`
 *    (solo lectura): acento sobre forma, volumen y textura. Sin sombra.
 *  · Aparatos de techo fusionados (cuerpo + lente emisiva + halo).
 *  · `refreshKey` avisa al sistema que hay que refrescar las sombras.
 */
export default function MuseumEnvironment({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const { gl, scene } = useThree();
  const t = useVmText();

  const floorTexture = useMemo(() => createFloorTexture(), []);
  const roughnessTexture = useMemo(() => createFloorRoughnessTexture(), []);
  const wallBumpTexture = useMemo(() => createWallBumpTexture(), []);
  const haloTexture = useMemo(() => createHaloTexture(), []);
  const wallSegments = useMemo(() => buildWallSegments(), []);
  const ceilingPanels = useMemo(() => buildCeilingPanels(), []);
  const gallerySpots = useMemo(() => buildGallerySpots(), []);
  const fixtures = useMemo(() => buildFixtureMeshes(gallerySpots), [gallerySpots]);

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e8dcc0",
        roughness: 0.92,
        metalness: 0,
        bumpMap: wallBumpTexture,
        bumpScale: 0.015,
        envMapIntensity: 0.12,
      }),
    [wallBumpTexture]
  );

  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ddd0b0",
        roughness: 0.92,
        metalness: 0,
        bumpMap: wallBumpTexture,
        bumpScale: 0.015,
        envMapIntensity: 0.12,
      }),
    [wallBumpTexture]
  );

  const panelMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffe4b8", toneMapped: false }),
    []
  );

  const fixtureMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a2f24",
        roughness: 0.5,
        metalness: 0.6,
        envMapIntensity: 0.6,
      }),
    []
  );

  const lensMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffdfb0", toneMapped: false }),
    []
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: haloTexture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [haloTexture]
  );

  // Entorno IBL: reflejos suaves en piso, molduras metálicas y esculturas.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const environment = new RoomEnvironment();
    const target = pmrem.fromScene(environment, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      environment.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      });
    };
  }, [gl, scene]);

  // Sombras estáticas: pintar una sola vez y al cambiar el contenido.
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
  }, [gl]);

  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
  }, [refreshKey, gl]);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    floorTexture.anisotropy = Math.min(8, maxAnisotropy);
    floorTexture.needsUpdate = true;
  }, [gl, floorTexture]);

  useEffect(
    () => () => {
      floorTexture.dispose();
      roughnessTexture.dispose();
      wallBumpTexture.dispose();
      haloTexture.dispose();
      wallMaterial.dispose();
      accentMaterial.dispose();
      panelMaterial.dispose();
      haloMaterial.dispose();
      fixtureMaterial.dispose();
      lensMaterial.dispose();
      fixtures.bodyGeometry.dispose();
      fixtures.lensGeometry.dispose();
      fixtures.glowGeometry.dispose();
    },
    [
      floorTexture,
      roughnessTexture,
      wallBumpTexture,
      haloTexture,
      wallMaterial,
      accentMaterial,
      panelMaterial,
      haloMaterial,
      fixtureMaterial,
      lensMaterial,
      fixtures,
    ]
  );

  return (
    <group>
      {rooms.map((room) => (
        <MuseumRoom
          key={room.id}
          room={room}
          floorTexture={floorTexture}
          roughnessTexture={roughnessTexture}
        />
      ))}

      {wallSegments.map((segment, index) => {
        // La sala principal usa un tono ligeramente distinto en sus muros.
        const isAccent =
          segment.position[0] >= -4 &&
          segment.position[0] <= 4 &&
          segment.position[2] <= -4;
        return (
          <mesh
            key={`wall-${index}`}
            position={segment.position}
            material={isAccent ? accentMaterial : wallMaterial}
            receiveShadow
          >
            <boxGeometry args={segment.size} />
          </mesh>
        );
      })}

      {ceilingPanels.map((panel, index) => (
        <group key={`panel-${index}`}>
          <mesh position={panel.position} material={panelMaterial}>
            <boxGeometry args={[panel.size[0], 0.06, panel.size[1]]} />
          </mesh>
          <mesh
            position={[
              panel.position[0],
              panel.position[1] - 0.07,
              panel.position[2],
            ]}
            rotation={[Math.PI / 2, 0, 0]}
            material={haloMaterial}
          >
            <planeGeometry
              args={[panel.size[0] * 2.7, panel.size[1] * 2.7]}
            />
          </mesh>
        </group>
      ))}

      <MuseumArchitecture />
      <MuseumProps />

      {/* Aparatos de galería: cuerpo + lente + halo (3 draw calls). */}
      <group>
        <mesh geometry={fixtures.bodyGeometry} material={fixtureMaterial} />
        <mesh geometry={fixtures.lensGeometry} material={lensMaterial} />
        <mesh geometry={fixtures.glowGeometry} material={haloMaterial} />
      </group>

      {signs.map((sign) => (
        <SignPlaque
          key={sign.id}
          sign={sign}
          label={sign.literal ?? (sign.textKey ? t(sign.textKey) : "")}
        />
      ))}

      <EntranceDoor />

      {/* Luz base cálida dorada: ambiente del Prado. */}
      <ambientLight intensity={0.32} color="#f5e6c8" />
      <hemisphereLight
        color="#fff0d0"
        groundColor="#5a4028"
        intensity={0.4}
      />
      {/* Clave cálida con sombra suave (mapa estático) + relleno. */}
      <directionalLight
        castShadow
        position={[7, 14, 9]}
        intensity={0.9}
        color="#ffe8c0"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-8, 9, -10]} intensity={0.22} color="#e8d4b0" />

      {/* Acento: un spotlight cálido por obra (sin sombra, sin costo de pass). */}
      {gallerySpots.map((spot, index) => (
        <GallerySpot key={`spot-${index}`} spec={spot} />
      ))}
    </group>
  );
}
