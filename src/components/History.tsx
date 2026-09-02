import { useScrollReveal } from "../hooks/useScrollReveal";

interface TimelineEntry {
  year: string;
  title: string;
  description: string;
}

const timeline: TimelineEntry[] = [
  {
    year: "1941",
    title: "Nacimiento de Manuel Viedma",
    description:
      "Nace en Asunción el artista cuya obra dará vida, décadas más tarde, a un proyecto cultural sin precedentes en Paraguay.",
  },
  {
    year: "1971",
    title: "Fundación del ESAP",
    description:
      "La Escuela Superior de Arte y Patrimonio sienta las bases de una educación artística con identidad paraguaya.",
  },
  {
    year: "1996",
    title: "Fundación de la UPAP",
    description:
      "La Universidad Paraguayo Alemana nace como un puente entre tradición, ciencia y futuro para el país.",
  },
  {
    year: "+40 años",
    title: "Desarrollo de la obra artística",
    description:
      "Décadas de trabajo silencioso: escultura, pintura, murales y pensamiento que hoy constituyen el corazón del museo.",
  },
  {
    year: "2026",
    title: "Nacimiento del MUVA",
    description:
      "Se concreta en San Ignacio Guazú un espacio para el encuentro con el legado guaraní–jesuítico y la obra de Manuel Viedma.",
  },
];

export default function History() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  return (
    <section
      id="historia"
      className="relative overflow-hidden bg-muva-cream py-28 md:py-40"
      aria-label="Historia"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="container-muva">
        <div
          ref={titleReveal.ref}
          className={`reveal-on-scroll ${titleReveal.isVisible ? "is-visible" : ""} max-w-3xl`}
        >
          <div className="eyebrow">Historia</div>
          <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
            Un legado construido en el tiempo
          </h2>
          <p className="mt-8 max-w-2xl font-serif text-xl italic text-muva-brown">
            Un recorrido breve por los hitos que hicieron posible la creación
            del MUVA.
          </p>
        </div>

        <div className="relative mt-20 md:mt-28">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-px bg-muva-sand md:left-1/2" />

          <ol className="space-y-16 md:space-y-24">
            {timeline.map((entry, i) => (
              <TimelineItem key={entry.year} entry={entry} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ entry, index }: { entry: TimelineEntry; index: number }) {
  const reveal = useScrollReveal<HTMLLIElement>();
  const isLeft = index % 2 === 0;

  return (
    <li
      ref={reveal.ref}
      className={`reveal-on-scroll ${reveal.isVisible ? "is-visible" : ""} relative pl-16 md:grid md:grid-cols-2 md:gap-16 md:pl-0`}
    >
      {/* Dot */}
      <div className="absolute left-6 top-2 -translate-x-1/2 md:left-1/2">
        <div className="relative h-3 w-3">
          <div className="absolute inset-0 rounded-full bg-muva-earth" />
          <div className="absolute -inset-2 rounded-full border border-muva-earth/40" />
        </div>
      </div>

      {/* Content */}
      <div className={isLeft ? "md:col-start-1 md:pr-12 md:text-right" : "md:col-start-2 md:pl-12"}>
        <div className="font-serif text-5xl font-light text-muva-earth md:text-6xl">
          {entry.year}
        </div>
        <h3 className="mt-4 font-serif text-2xl text-muva-dark md:text-3xl">
          {entry.title}
        </h3>
        <p className={`mt-4 max-w-md text-muva-brown text-pretty ${isLeft ? "md:ml-auto" : ""}`}>
          {entry.description}
        </p>
      </div>
    </li>
  );
}
