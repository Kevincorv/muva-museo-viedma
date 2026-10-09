import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

/** Decoder Draco servido desde /public/draco (mismo que el resto del sitio. */
export const DRACO_PATH = "/draco/";

/**
 * Conteo de referencias por URL.
 *
 * Varios componentes pueden mostrar el mismo .glb a la vez (recorrido y
 * visor 360°). Solo cuando el último se desmonta se libera la geometría,
 * los materiales y la caché de `useGLTF`, evitando acumular memoria GPU
 * durante la visita sin romper a los demás usuarios del modelo.
 */
const refCounts = new Map<string, number>();

export function retainModel(url: string) {
  refCounts.set(url, (refCounts.get(url) ?? 0) + 1);
}

export function releaseModel(url: string, root: THREE.Object3D | null) {
  const next = (refCounts.get(url) ?? 1) - 1;
  if (next > 0) {
    refCounts.set(url, next);
    return;
  }
  refCounts.delete(url);
  if (root) disposeObject3D(root);
  try {
    useGLTF.clear(url);
  } catch {
    /* la caché ya fue liberada */
  }
}

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
}
