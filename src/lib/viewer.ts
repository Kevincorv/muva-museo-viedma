export function openSculptureViewer(id: string) {
  let event: Event;
  if (typeof CustomEvent === "function") {
    event = new CustomEvent("muva:open-sculpture", { detail: { id } });
  } else {
    const e = document.createEvent("CustomEvent");
    e.initCustomEvent("muva:open-sculpture", false, false, { id });
    event = e;
  }
  window.dispatchEvent(event);
}
