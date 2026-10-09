/**
 * Factor global de atenuación del entorno (0 = normal, 1 = obra enfocada).
 *
 * Se escribe cada frame desde `MuseumEnvironment` cuando hay una escultura
 * seleccionada y lo leen los componentes con materiales emisivos o básicos
 * (carteles, lienzos, luminarias) que deben oscurecerse en la misma
 * transición, así toda la escena cambia de forma sincronizada y sin
 * parpadeos.
 */
export const focusDim = { current: 0 };
