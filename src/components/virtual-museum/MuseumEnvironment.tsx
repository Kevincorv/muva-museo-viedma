import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { museumSculptures } from "../../data/sculptures";
import {
  buildCeilingPanels,
  buildWallSegments,
  entranceDoor,
  roomAt,
  rooms,
  signs,
  type SignSpec,
} from "../../data/museumLayout";
import { focusDim } from "./focusDim";
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
import WallPaintings from "./WallPaintings";

const SIGN_BASE_COLOR = new THREE.Color("#d9d2c6");
const SIGN_DIM_COLOR = new THREE.Color("#837c70");

function SignPlaque({ sign, label }: { sign: SignSpec; label: string }) {
  const texture = useMemo(
    () => createPlaqueTexture(label, sign.sub),
    [label, sign.sub]
  );
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Los carteles son emisivos (toneMapped=false): se atenúan con el foco.
  useFrame(() => {
    materialRef.current?.color.lerpColors(
      SIGN_BASE_COLOR,
      SIGN_DIM_COLOR,
      focusDim.current
    );
  });

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={sign.position} rotation={[0, sign.rotationY, 0]}>
      <planeGeometry args={[sign.width, sign.height]} />
      <meshBasicMaterial
        ref={materialRef}
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
/** Intensidad (canela, ~3000 K) de cada spotlight de obra: es la luz
 *  principal de la sala — el resto de la galería queda a media penumbra.
 *  El cono es estrecho para que la luz abrace la obra y no inunde el piso. */
const SPOT_INTENSITY = 12;

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

  // Al enfocar una obra, las demás luces bajan para que destaque la luminaria.
  useFrame(() => {
    const light = lightRef.current;
    if (light) {
      light.intensity = SPOT_INTENSITY * (1 - 0.75 * focusDim.current);
    }
  });

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
      angle={0.34}
      penumbra={0.55}
      intensity={SPOT_INTENSITY}
      distance={7}
      decay={1.6}
      color="#ffcf94"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Luminaria de foco: spotlight cálido dedicado a la escultura         */
/* seleccionada. Siempre está montada (intensidad 0 sin selección)     */
/* para no recompilar shaders al abrir la ficha.                       */
/* ------------------------------------------------------------------ */

const FOCUS_SPOT_INTENSITY = 24;

interface FocusSpotSpec {
  origin: [number, number, number];
  target: [number, number, number];
}

function computeFocusSpot(target: [number, number, number]): FocusSpotSpec {
  const room = roomAt(target[0], target[2]);
  const cx = room ? (room.bounds.minX + room.bounds.maxX) / 2 : 0;
  const cz = room ? (room.bounds.minZ + room.bounds.maxZ) / 2 : 0;

  // La luminaria se coloca hacia el centro de la sala (cara visible).
  const dx = cx - target[0];
  const dz = cz - target[2];
  const len = Math.hypot(dx, dz);
  const ux = len > 0.001 ? dx / len : 0;
  const uz = len > 0.001 ? dz / len : 0;

  return {
    origin: [target[0] + ux * SPOT_OFFSET, CEILING_Y, target[2] + uz * SPOT_OFFSET],
    target: [target[0], target[1], target[2]],
  };
}

/**
 * Tono de sala (siempre activo): galería a media penumbra con luz cálida
 * concentrada en las obras. `LIGHT_DIM` es el paso extra de oscuridad que se
 * aplica al seleccionar una escultura (un punto más, sin exagerar).
 */
const LIGHT_BASE = {
  ambient: 0.1,
  hemi: 0.12,
  key: 0.16,
  fill: 0.06,
  environment: 0.25,
  background: new THREE.Color("#4f4436"),
  panel: new THREE.Color("#6b5a40"),
  lens: new THREE.Color("#6b5c46"),
  haloOpacity: 0.3,
} as const;

const LIGHT_DIM = {
  ambient: 0.065,
  hemi: 0.08,
  key: 0.11,
  fill: 0.04,
  environment: 0.17,
  background: new THREE.Color("#3b3327"),
  panel: new THREE.Color("#4e4331"),
  lens: new THREE.Color("#4d4534"),
  haloOpacity: 0.18,
} as const;

/**
 * Arquitectura del museo: pisos, muros generados desde el plano, molduras,
 * columnas, mobiliario, techos, paneles de luz, señalización e iluminación.
 *
 * Ambientación de galería (tono Prado a media penumbra):
 *  · Luz base mínima (ambient + hemisférica tenues): la sala vive oscura.
 *  · Un spotlight cálido (~3000 K) por obra es la fuente de luz principal.
 *  · IBL local (`RoomEnvironment`) a baja intensidad para reflejos suaves.
 *  · Una luz clave con sombra suave; el mapa de sombra se dibuja una vez y
 *    solo se refresca cuando entra o sale una obra (`autoUpdate = false`).
 *  · Aparatos de techo fusionados (cuerpo + lente emisiva + halo).
 *  · Al seleccionar una escultura todo baja un punto más y su luminaria de
 *    foco enciende sobre la obra.
 *  · `refreshKey` avisa al sistema que hay que refrescar las sombras.
 */
export default function MuseumEnvironment({
  refreshKey,
  focus,
}: {
  refreshKey: number;
  /** Centro de la escultura seleccionada (atenúa el entorno y la ilumina). */
  focus?: [number, number, number] | null;
}) {
  const { gl, scene } = useThree();
  const t = useVmText();

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const focusSpotRef = useRef<THREE.SpotLight>(null);
  const lastFocusRef = useRef<[number, number, number] | null>(null);

  // Recuerda el último foco para que la luminaria no se teletransporte ni
  // desaparezca al cerrar la ficha (se mantiene mientras se atenúa).
  useEffect(() => {
    if (focus) lastFocusRef.current = focus;
  }, [focus]);

  const focusSpec = useMemo(
    () => computeFocusSpot(focus ?? lastFocusRef.current ?? [0, 1.5, 12]),
    [focus]
  );

  useEffect(() => {
    const light = focusSpotRef.current;
    if (!light) return;
    light.position.set(
      focusSpec.origin[0],
      focusSpec.origin[1],
      focusSpec.origin[2]
    );
    light.target.position.set(
      focusSpec.target[0],
      focusSpec.target[1],
      focusSpec.target[2]
    );
    light.target.updateMatrixWorld();
    scene.add(light.target);
    return () => {
      scene.remove(light.target);
    };
  }, [scene, focusSpec]);

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
    scene.environmentIntensity = LIGHT_BASE.environment;
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

  /**
   * Transición de foco: atenúa luces, entorno IBL, fondo, niebla, paneles y
   * halos mientras rampa el spotlight de la obra seleccionada. `damp` es
   * exponencial (sin rebotes) y el delta se recorta para que una pestaña en
   * segundo plano no provoque saltos al volver.
   */
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const target = focus ? 1 : 0;
    const dim = THREE.MathUtils.damp(focusDim.current, target, 5.5, delta);
    focusDim.current = dim;

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        LIGHT_BASE.ambient,
        LIGHT_DIM.ambient,
        dim
      );
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(
        LIGHT_BASE.hemi,
        LIGHT_DIM.hemi,
        dim
      );
    }
    if (keyRef.current) {
      keyRef.current.intensity = THREE.MathUtils.lerp(
        LIGHT_BASE.key,
        LIGHT_DIM.key,
        dim
      );
    }
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(
        LIGHT_BASE.fill,
        LIGHT_DIM.fill,
        dim
      );
    }
    if (focusSpotRef.current) {
      focusSpotRef.current.intensity = FOCUS_SPOT_INTENSITY * dim;
    }

    scene.environmentIntensity = THREE.MathUtils.lerp(
      LIGHT_BASE.environment,
      LIGHT_DIM.environment,
      dim
    );
    if (scene.background instanceof THREE.Color) {
      scene.background.lerpColors(
        LIGHT_BASE.background,
        LIGHT_DIM.background,
        dim
      );
    }
    if (scene.fog) {
      scene.fog.color.lerpColors(LIGHT_BASE.background, LIGHT_DIM.background, dim);
    }

    panelMaterial.color.lerpColors(LIGHT_BASE.panel, LIGHT_DIM.panel, dim);
    lensMaterial.color.lerpColors(LIGHT_BASE.lens, LIGHT_DIM.lens, dim);
    haloMaterial.opacity = THREE.MathUtils.lerp(
      LIGHT_BASE.haloOpacity,
      LIGHT_DIM.haloOpacity,
      dim
    );
  });

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
      <WallPaintings />
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

      {/* Luz base tenue: la sala queda a media penumbra. */}
      <ambientLight ref={ambientRef} intensity={LIGHT_BASE.ambient} color="#f5e6c8" />
      <hemisphereLight
        ref={hemiRef}
        color="#fff0d0"
        groundColor="#5a4028"
        intensity={LIGHT_BASE.hemi}
      />
      {/* Clave cálida con sombra suave (mapa estático) + relleno. */}
      <directionalLight
        ref={keyRef}
        castShadow
        position={[7, 14, 9]}
        intensity={LIGHT_BASE.key}
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
      <directionalLight
        ref={fillRef}
        position={[-8, 9, -10]}
        intensity={LIGHT_BASE.fill}
        color="#e8d4b0"
      />

      {/* Acento: un spotlight cálido por obra (sin sombra, sin costo de pass). */}
      {gallerySpots.map((spot, index) => (
        <GallerySpot key={`spot-${index}`} spec={spot} />
      ))}

      {/* Luminaria de foco: ilumina solo la escultura seleccionada. */}
      <spotLight
        ref={focusSpotRef}
        position={focusSpec.origin}
        angle={0.38}
        penumbra={0.65}
        intensity={0}
        distance={12}
        decay={1.4}
        color="#ffd6a6"
      />
    </group>
  );
}
