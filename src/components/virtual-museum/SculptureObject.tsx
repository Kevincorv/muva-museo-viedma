import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MuseumSculpture } from "../../data/sculptures";
import { museumTitle } from "../../data/sculptures";
import { useLanguage } from "../../i18n/LanguageContext";
import { DRACO_PATH, releaseModel, retainModel } from "./modelCache";
import { registerInteractable, unregisterInteractable } from "./state";
import { createPlaqueTexture, createShadowTexture } from "./textures";

/** Altura útil del pedestal (plinto + cuerpo). */
export const PEDESTAL_TOP = 1.05;
const DEFAULT_HEIGHT = 1.15;
const DEFAULT_COLLISION_RADIUS = 0.6;

class ModelErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function Pedestal() {
  const [plinthMaterial, bodyMaterial] = useMemo(
    () => [
      new THREE.MeshStandardMaterial({
        color: "#ddd3bd",
        roughness: 0.9,
        metalness: 0,
      }),
      new THREE.MeshStandardMaterial({
        color: "#efe8db",
        roughness: 0.85,
        metalness: 0,
      }),
    ],
    []
  );

  useEffect(
    () => () => {
      plinthMaterial.dispose();
      bodyMaterial.dispose();
    },
    [plinthMaterial, bodyMaterial]
  );

  return (
    <group>
      <mesh position={[0, 0.05, 0]} material={plinthMaterial} castShadow receiveShadow>
        <boxGeometry args={[1, 0.1, 1]} />
      </mesh>
      <mesh
        position={[0, 0.1 + 0.475, 0]}
        material={bodyMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.72, 0.95, 0.72]} />
      </mesh>
    </group>
  );
}

function ContactShadow({ radius }: { radius: number }) {
  const texture = useMemo(() => createShadowTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  const size = radius * 2.6;
  return (
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        opacity={0.6}
      />
    </mesh>
  );
}

function HoverRing({ active, radius }: { active: boolean; radius: number }) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#6b4f35",
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.opacity = active ? 0.85 : 0.2;
  }, [active, material]);

  return (
    <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <ringGeometry args={[radius + 0.02, radius + 0.1, 56]} />
    </mesh>
  );
}

function SculptureModel({
  sculpture,
}: {
  sculpture: MuseumSculpture;
}) {
  const url = sculpture.model;
  const { scene } = useGLTF(url, DRACO_PATH);
  const fitRef = useRef<THREE.Group>(null);
  const height = sculpture.height ?? DEFAULT_HEIGHT;
  const scale = sculpture.scale ?? 1;

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    retainModel(url);
    return () => releaseModel(url, cloned);
  }, [url, cloned]);

  // Ajusta el .glb (cualquiera sea su escala original) a una altura de
  // museo realista, apoyado sobre el pedestal.
  useEffect(() => {
    const group = fitRef.current;
    if (!group) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const safeHeight = Math.max(size.y, 1e-4);
    const footprint = Math.max(size.x, size.z, 1e-4);
    const fitted = Math.min(height / safeHeight, 0.76 / footprint) * scale;
    if (!Number.isFinite(fitted) || fitted <= 0) return;
    group.scale.setScalar(fitted);
    group.position.set(
      -center.x * fitted,
      -box.min.y * fitted,
      -center.z * fitted
    );
  }, [cloned, height, scale]);

  return (
    <group position={[0, PEDESTAL_TOP, 0]}>
      <group ref={fitRef}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

function FallbackPlaque({ sculpture }: { sculpture: MuseumSculpture }) {
  const { locale } = useLanguage();
  const title = museumTitle(sculpture, locale);
  const texture = useMemo(() => createPlaqueTexture(title), [title]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh
      position={[0, PEDESTAL_TOP + 0.008, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[0.64, 0.36]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

/**
 * Una obra colocada en el museo: pedestal + modelo .glb.
 * El modelo solo se monta cuando está suficientemente cerca (streaming) y se
 * libera cuando el visitante se aleja demasiado.
 */
export default function SculptureObject({
  sculpture,
  loaded,
  hovered,
}: {
  sculpture: MuseumSculpture;
  loaded: boolean;
  hovered: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [failed, setFailed] = useState(false);
  const hasModel = Boolean(sculpture.model);
  const radius = sculpture.collisionRadius ?? DEFAULT_COLLISION_RADIUS;

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.userData.sculptureId = sculpture.id;
    registerInteractable(group);
    return () => unregisterInteractable(group);
  }, [sculpture.id]);

  return (
    <group ref={groupRef} position={sculpture.position}>
      <Pedestal />
      <ContactShadow radius={radius} />
      <HoverRing active={hovered} radius={radius} />

      {loaded && hasModel && !failed && (
        <Suspense fallback={null}>
          <ModelErrorBoundary onError={() => setFailed(true)}>
            <SculptureModel sculpture={sculpture} />
          </ModelErrorBoundary>
        </Suspense>
      )}

      {(!hasModel || failed) && <FallbackPlaque sculpture={sculpture} />}
    </group>
  );
}
