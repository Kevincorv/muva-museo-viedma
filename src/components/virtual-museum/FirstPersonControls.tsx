import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildCollisionBoxes, buildPropColliders, buildWallSegments, museumBounds } from "../../data/museumLayout";
import { museumSculptures } from "../../data/sculptures";
import { findSculptureId, inputState, interactables, playerState } from "./state";

const EYE_HEIGHT = 1.65;
const PLAYER_RADIUS = 0.34;
const WALK_SPEED = 3.1;
const MOUSE_SENSITIVITY = 0.0022;
const TOUCH_SENSITIVITY = 0.0045;
const MAX_INTERACTION_DISTANCE = 14;
const PITCH_LIMIT = 1.45;

interface FirstPersonControlsProps {
  /** false ⇒ controles pausados (bienvenida, panel o modal abierto). */
  enabled: boolean;
  isTouch: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onLockChange: (locked: boolean) => void;
}

/**
 * Navegación en primera persona.
 *
 * · PC: pointer lock + WASD, con clic para mirar y clic para seleccionar.
 * · Táctil: arrastrar para mirar, tocar para seleccionar; el joystick
 *   virtual (fuera del canvas) escribe en `inputState`.
 * · Colisión por segmentos de muro y radio de cada pedestal.
 */
export default function FirstPersonControls({
  enabled,
  isTouch,
  onHover,
  onSelect,
  onLockChange,
}: FirstPersonControlsProps) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const gl = useThree((state) => state.gl);

  const keys = useRef(new Set<string>());
  const bobPhase = useRef(0);
  const velocity = useRef(new THREE.Vector2());
  const hoveredRef = useRef<string | null>(null);
  const touchRef = useRef<{
    id: number;
    x: number;
    y: number;
    moved: number;
    at: number;
  } | null>(null);
  const dragRef = useRef({ active: false, moved: 0, at: 0 });

  const enabledRef = useRef(enabled);
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  const onLockChangeRef = useRef(onLockChange);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const center = useMemo(() => new THREE.Vector2(0, 0), []);

  // Muros como ocluyentes: no se puede apuntar (ni seleccionar) una obra a
  // través de una pared, aunque el rayo la alcance.
  const occluders = useMemo(
    () =>
      buildWallSegments().map((segment) =>
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(
            segment.position[0],
            segment.position[1],
            segment.position[2]
          ),
          new THREE.Vector3(
            segment.size[0],
            segment.size[1],
            segment.size[2]
          )
        )
      ),
    []
  );
  const occlusionPoint = useMemo(() => new THREE.Vector3(), []);

  const isOccluded = (maxDistance: number): boolean => {
    const ray = raycaster.ray;
    for (const box of occluders) {
      const point = ray.intersectBox(box, occlusionPoint);
      if (!point) continue;
      if (point.distanceTo(ray.origin) < maxDistance - 0.05) return true;
    }
    return false;
  };

  /** Devuelve la obra apuntada por el rayo actual, si no hay muro de por medio. */
  const pickFromScene = (): string | null => {
    raycaster.far = MAX_INTERACTION_DISTANCE;
    const hits = raycaster.intersectObjects(interactables, true);
    for (const hit of hits) {
      const id = findSculptureId(hit.object);
      if (!id) continue;
      if (isOccluded(hit.distance)) return null;
      return id;
    }
    return null;
  };

  const collisionBoxes = useMemo(
    () => [...buildCollisionBoxes(), ...buildPropColliders(museumSculptures)],
    []
  );
  const sculptureColliders = useMemo(
    () =>
      museumSculptures.map((sculpture) => ({
        x: sculpture.position[0],
        z: sculpture.position[2],
        r: sculpture.collisionRadius ?? 0.6,
      })),
    []
  );

  const blocked = useMemo(() => {
    return (x: number, z: number): boolean => {
      if (
        x < museumBounds.minX ||
        x > museumBounds.maxX ||
        z < museumBounds.minZ ||
        z > museumBounds.maxZ
      ) {
        return true;
      }
      for (const box of collisionBoxes) {
        if (
          x > box.minX - PLAYER_RADIUS &&
          x < box.maxX + PLAYER_RADIUS &&
          z > box.minZ - PLAYER_RADIUS &&
          z < box.maxZ + PLAYER_RADIUS
        ) {
          return true;
        }
      }
      for (const sculpture of sculptureColliders) {
        const dx = x - sculpture.x;
        const dz = z - sculpture.z;
        const radius = sculpture.r + PLAYER_RADIUS;
        if (dx * dx + dz * dz < radius * radius) return true;
      }
      return false;
    };
  }, [collisionBoxes, sculptureColliders]);

  useEffect(() => {
    enabledRef.current = enabled;
    onHoverRef.current = onHover;
    onSelectRef.current = onSelect;
    onLockChangeRef.current = onLockChange;
  });

  useEffect(() => {
    camera.rotation.order = "YXZ";
  }, [camera]);

  // Teclado
  useEffect(() => {
    if (!enabled) {
      keys.current.clear();
      return;
    }
    const handled = new Set([
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
    ]);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (handled.has(event.code)) event.preventDefault();
      keys.current.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };
    const onBlur = () => keys.current.clear();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      keys.current.clear();
    };
  }, [enabled]);

  // Puntero (ratón + táctil) sobre el canvas
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = "none";

    const look = (dx: number, dy: number, sensitivity: number) => {
      playerState.yaw -= dx * sensitivity;
      playerState.pitch = THREE.MathUtils.clamp(
        playerState.pitch - dy * sensitivity,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
    };

    const pickAt = (ndc: THREE.Vector2): string | null => {
      raycaster.setFromCamera(ndc, camera);
      return pickFromScene();
    };

    const requestLock = () => {
      if (isTouch || !enabledRef.current) return;
      try {
        const result = canvas.requestPointerLock() as unknown as
          | Promise<void>
          | undefined;
        if (result && typeof result.catch === "function") {
          result.catch(() => {});
        }
      } catch {
        /* el navegador puede rechazar el pointer lock */
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!enabledRef.current) return;
      if (event.pointerType === "touch") {
        touchRef.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          moved: 0,
          at: performance.now(),
        };
        canvas.setPointerCapture?.(event.pointerId);
      } else {
        dragRef.current = {
          active: true,
          moved: 0,
          at: performance.now(),
        };
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!enabledRef.current) return;
      const locked = document.pointerLockElement === canvas;

      if (event.pointerType === "touch") {
        const touch = touchRef.current;
        if (!touch || touch.id !== event.pointerId) return;
        const dx = event.clientX - touch.x;
        const dy = event.clientY - touch.y;
        touch.x = event.clientX;
        touch.y = event.clientY;
        touch.moved += Math.abs(dx) + Math.abs(dy);
        look(dx, dy, TOUCH_SENSITIVITY);
        return;
      }

      const drag = dragRef.current;
      if (!locked && !drag.active) return;
      const dx = event.movementX ?? 0;
      const dy = event.movementY ?? 0;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      look(dx, dy, MOUSE_SENSITIVITY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        const touch = touchRef.current;
        if (!touch || touch.id !== event.pointerId) return;
        touchRef.current = null;
        if (!enabledRef.current) return;
        if (touch.moved < 14 && performance.now() - touch.at < 600) {
          const rect = canvas.getBoundingClientRect();
          const ndc = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
          );
          const id = pickAt(ndc);
          if (id) onSelectRef.current(id);
        }
        return;
      }

      const drag = dragRef.current;
      const wasDrag = drag.active;
      drag.active = false;
      if (!wasDrag || !enabledRef.current) return;

      const isQuickClick =
        performance.now() - drag.at < 450 && drag.moved < 6;
      if (!isQuickClick) return;

      if (document.pointerLockElement === canvas) {
        if (hoveredRef.current) onSelectRef.current(hoveredRef.current);
      } else {
        requestLock();
      }
    };

    const onLockChange = () => {
      onLockChangeRef.current(document.pointerLockElement === canvas);
    };

    const onLockError = () => onLockChangeRef.current(false);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("pointerlockerror", onLockError);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("pointerlockerror", onLockError);
      touchRef.current = null;
      dragRef.current = { active: false, moved: 0, at: 0 };
      canvas.style.touchAction = "";
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock?.();
      }
    };
  }, [camera, gl, isTouch, raycaster]);

  // Pausa el pointer lock cuando se abre un panel o modal.
  useEffect(() => {
    if (enabled) return;
    if (document.pointerLockElement === gl.domElement) {
      document.exitPointerLock?.();
    }
    inputState.joyX = 0;
    inputState.joyY = 0;
  }, [enabled, gl]);

  useEffect(() => {
    return () => {
      inputState.joyX = 0;
      inputState.joyY = 0;
      playerState.moving = false;
    };
  }, []);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    const active = enabledRef.current;

    let inputX = 0;
    let inputZ = 0;
    if (active) {
      if (keys.current.has("KeyW") || keys.current.has("ArrowUp")) inputZ += 1;
      if (keys.current.has("KeyS") || keys.current.has("ArrowDown")) inputZ -= 1;
      if (keys.current.has("KeyA") || keys.current.has("ArrowLeft")) inputX -= 1;
      if (keys.current.has("KeyD") || keys.current.has("ArrowRight")) inputX += 1;
      inputX += inputState.joyX;
      inputZ += inputState.joyY;
      const magnitude = Math.hypot(inputX, inputZ);
      if (magnitude > 1) {
        inputX /= magnitude;
        inputZ /= magnitude;
      }
    }

    const yaw = playerState.yaw;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const speed =
      WALK_SPEED *
      (keys.current.has("ShiftLeft") || keys.current.has("ShiftRight")
        ? 1.4
        : 1);
    const desiredX = (-sin * inputZ + cos * inputX) * speed;
    const desiredZ = (-cos * inputZ - sin * inputX) * speed;

    const blend = 1 - Math.exp(-11 * dt);
    velocity.current.x += (desiredX - velocity.current.x) * blend;
    velocity.current.y += (desiredZ - velocity.current.y) * blend;

    const position = playerState.position;
    const stepX = velocity.current.x * dt;
    const stepZ = velocity.current.y * dt;

    if (stepX !== 0) {
      const nextX = position.x + stepX;
      if (!blocked(nextX, position.z)) position.x = nextX;
      else velocity.current.x = 0;
    }
    if (stepZ !== 0) {
      const nextZ = position.z + stepZ;
      if (!blocked(position.x, nextZ)) position.z = nextZ;
      else velocity.current.y = 0;
    }

    const planarSpeed = Math.hypot(velocity.current.x, velocity.current.y);
    playerState.moving = planarSpeed > 0.3;
    if (playerState.moving) bobPhase.current += dt * (6.2 + planarSpeed);
    const bob = playerState.moving ? Math.sin(bobPhase.current) * 0.016 : 0;

    camera.position.set(position.x, EYE_HEIGHT + bob, position.z);
    camera.rotation.set(playerState.pitch, playerState.yaw, 0, "YXZ");
    camera.updateMatrixWorld();

    if (active) {
      raycaster.setFromCamera(center, camera);
      const next = pickFromScene();
      if (next !== hoveredRef.current) {
        hoveredRef.current = next;
        onHoverRef.current(next);
      }
    } else if (hoveredRef.current !== null) {
      hoveredRef.current = null;
      onHoverRef.current(null);
    }
  });

  return null;
}
