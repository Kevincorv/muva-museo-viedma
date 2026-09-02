import { sculptures } from "../data/sculptures";
import { useScrollReveal } from "../hooks/useScrollReveal";
import SculptureCard from "./SculptureCard";

export default function VirtualEnvironment() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const gridReveal = useScrollReveal<HTMLDivElement>();

  const openViewer = (id: string) => {
    window.dispatchEvent(new CustomEvent("muva:open-sculpture", { detail: { id } }));
  };

  return (
    <section
      id="entorno-virtual"
      className="relative bg-muva-beige py-28 md:py-40"
      aria-label="Entorno Virtual 3D"
    >
      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} max-w-4xl`}
        >
          <div className="eyebrow">Entorno Virtual</div>
          <h2 className="mt-6 font-serif font-light text-muva-dark text-display-xl text-balance">
            Explora el arte
            <br />
            desde cualquier lugar
          </h2>
          <p className="mt-8 max-w-2xl font-serif text-xl italic text-muva-brown text-pretty">
            Recorre nuestra colección en tres dimensiones y descubre cada obra
            desde nuevas perspectivas. Una experiencia contemplativa,
            accesible y abierta al mundo.
          </p>
        </div>

        <div
          ref={gridReveal.ref}
          className={`reveal-on-scroll ${gridReveal.isVisible ? "is-visible" : ""} mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:mt-24 md:gap-10`}
        >
          {sculptures.map((sculpture, i) => (
            <SculptureCard
              key={sculpture.id}
              sculpture={sculpture}
              index={i}
              onOpen={openViewer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
