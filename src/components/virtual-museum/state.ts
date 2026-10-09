import * as THREE from "three";
import { playerSpawn } from "../../data/museumLayout";

/**
 * Estado compartido mutuable del recorrido.
 *
 * Se mantiene fuera de React para que el movimiento a 60 fps (posición de la
 * cámara, joystick, mirada) no provoque re-renders: React solo se entera de
 * los cambios de sala, obra apuntada y paneles abiertos.
 */
export const playerState = {
  position: new THREE.Vector3(...playerSpawn.position),
  yaw: playerSpawn.yaw,
  pitch: playerSpawn.pitch,
  moving: false,
  reset() {
    this.position.set(...playerSpawn.position);
    this.yaw = playerSpawn.yaw;
    this.pitch = playerSpawn.pitch;
    this.moving = false;
  },
};

/** Entrada del joystick táctil, en el rango [-1, 1]. */
export const inputState = {
  joyX: 0,
  joyY: 0,
};

/** Objetos que el raycast central puede seleccionar (esculturas). */
export const interactables: THREE.Object3D[] = [];

export function registerInteractable(object: THREE.Object3D) {
  if (!interactables.includes(object)) interactables.push(object);
}

export function unregisterInteractable(object: THREE.Object3D) {
  const index = interactables.indexOf(object);
  if (index >= 0) interactables.splice(index, 1);
}

export function clearInteractables() {
  interactables.length = 0;
}

/** Sube por la jerarquía hasta encontrar el id de obra asociado. */
export function findSculptureId(object: THREE.Object3D | null): string | null {
  let current: THREE.Object3D | null = object;
  while (current) {
    const id = current.userData?.sculptureId;
    if (typeof id === "string") return id;
    current = current.parent;
  }
  return null;
}
