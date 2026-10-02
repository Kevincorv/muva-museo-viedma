import * as THREE from "three";

interface OrbitControlsLike {
  target?: THREE.Vector3;
  minDistance?: number;
  maxDistance?: number;
  update?: () => void;
  saveState?: () => void;
}

export interface FitCameraParams {
  camera: THREE.PerspectiveCamera;
  canvasSize: { width: number; height: number };
  /** Mitades de la caja del modelo ya normalizado (centrado en el origen). */
  halfExtents: THREE.Vector3;
  controls?: OrbitControlsLike | null;
  /** Holgura para que el modelo no toque los bordes del marco. */
  margin?: number;
  invalidate?: () => void;
}

/**
 * Acomoda la cámara para que el modelo llene el marco disponible.
 *
 * El fov de PerspectiveCamera es vertical: en pantallas angostas (celulares)
 * el cuello de botella es el ancho, y en paneles apaisados la altura. Se
 * calcula la distancia mínima que cumple ambas restricciones y se respeta el
 * rango de zoom del OrbitControls correspondiente.
 */
export function fitCameraToModel({
  camera,
  canvasSize,
  halfExtents,
  controls,
  margin = 1.12,
  invalidate,
}: FitCameraParams): void {
  const aspect =
    Math.max(canvasSize.width, 1) / Math.max(canvasSize.height, 1);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  const target = controls?.target ?? new THREE.Vector3();
  const direction = camera.position.clone().sub(target);
  if (direction.lengthSq() < 1e-6) direction.set(3.5, 2.2, 4.5);
  direction.normalize();

  // Extensión vertical proyectada según la inclinación de la cámara, usando
  // el mayor de los dos ejes horizontales para no recortar si el usuario
  // rota la pieza.
  const elevation = Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1));
  const horizontalHalf = Math.max(halfExtents.x, halfExtents.z);
  const verticalHalf =
    halfExtents.y * Math.cos(elevation) +
    horizontalHalf * Math.abs(Math.sin(elevation));

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

  const distanceByHeight = verticalHalf / Math.tan(vFov / 2);
  const distanceByWidth = horizontalHalf / Math.tan(hFov / 2);

  const minDistance = controls?.minDistance ?? 2;
  const maxDistance = controls?.maxDistance ?? 9;
  const distance = THREE.MathUtils.clamp(
    Math.max(distanceByHeight, distanceByWidth) * margin,
    minDistance,
    maxDistance
  );

  camera.position.copy(target).addScaledVector(direction, distance);
  camera.updateProjectionMatrix();

  controls?.update?.();
  // Deja la posición ajustada como punto de partida del botón "restablecer".
  controls?.saveState?.();
  invalidate?.();
}
