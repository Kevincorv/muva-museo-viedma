import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { type MuseumRoom } from "../../data/museumLayout";
import { FLOOR_TILE_METERS } from "./textures";

/**
 * Piso de una sala. La textura se repite en unidades de mundo
 * (FLOOR_TILE_METERS) escalando los UV de cada plano.
 * El techo a dos aguas lo genera `MuseumCeiling`.
 */
export default function MuseumRoom({
  room,
  floorTexture,
  roughnessTexture,
}: {
  room: MuseumRoom;
  floorTexture: THREE.Texture;
  roughnessTexture: THREE.Texture;
}) {
  const { minX, minZ, maxX, maxZ } = room.bounds;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const floorGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(width, depth);
    const uv = geometry.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(
        i,
        (uv.getX(i) * width) / FLOOR_TILE_METERS,
        (uv.getY(i) * depth) / FLOOR_TILE_METERS
      );
    }
    uv.needsUpdate = true;
    return geometry;
  }, [width, depth]);

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: room.floorTone,
        map: floorTexture,
        bumpMap: floorTexture,
        bumpScale: 0.008,
        roughnessMap: roughnessTexture,
        roughness: 0.18,
        metalness: 0.12,
        envMapIntensity: 1.1,
      }),
    [room.floorTone, floorTexture, roughnessTexture]
  );

  useEffect(
    () => () => {
      floorGeometry.dispose();
      floorMaterial.dispose();
    },
    [floorGeometry, floorMaterial]
  );

  return (
    <mesh
      position={[centerX, 0, centerZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={floorGeometry}
      material={floorMaterial}
      receiveShadow
    />
  );
}
