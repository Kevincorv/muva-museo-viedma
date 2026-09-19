import { useScrollReveal } from "../hooks/useScrollReveal";
import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

interface TimelineEntry {
  year: string;
  titleEs: string;
  titleEn: string;
  titlePt: string;
  descEs: string;
  descEn: string;
  descPt: string;
}

const timeline: TimelineEntry[] = [
  {
    year: "1941",
    titleEs: "Nacimiento de Manuel Viedma",
    titleEn: "Birth of Manuel Viedma",
    titlePt: "Nascimento de Manuel Viedma",
    descEs: "Nace en Asunción el artista cuya obra dará vida, décadas más tarde, a un proyecto cultural sin precedentes en Paraguay.",
    descEn: "Born in Asunción, the artist whose work would give life, decades later, to an unprecedented cultural project in Paraguay.",
    descPt: "Nasce em Assunção o artista cuja obra dará vida, décadas depois, a um projeto cultural sem precedentes no Paraguai.",
  },
  {
    year: "1971",
    titleEs: "Fundación del ESAP",
    titleEn: "Foundation of ESAP",
    titlePt: "Fundação da ESAP",
    descEs: "La Escuela Superior de Arte y Patrimonio sienta las bases de una educación artística con identidad paraguaya.",
    descEn: "The Higher School of Art and Heritage lays the foundations for art education with Paraguayan identity.",
    descPt: "A Escola Superior de Arte e Patrimônio sienta as bases de uma educação artística com identidade paraguaia.",
  },
  {
    year: "1996",
    titleEs: "Fundación de la UPAP",
    titleEn: "Foundation of UPAP",
    titlePt: "Fundação da UPAP",
    descEs: "La Universidad Paraguayo Alemana nace como un puente entre tradición, ciencia y futuro para el país.",
    descEn: "The Paraguayan-German University is born as a bridge between tradition, science, and the country's future.",
    descPt: "A Universidade Paraguai-Alemana nasce como uma ponte entre tradição, ciência e futuro para o país.",
  },
  {
    year: "+40 años",
    titleEs: "Desarrollo de la obra artística",
    titleEn: "Development of artistic work",
    titlePt: "Desenvolvimento da obra artística",
    descEs: "Décadas de trabajo silencioso: escultura, pintura, murales y pensamiento que hoy constituyen el corazón del museo.",
    descEn: "Decades of quiet work: sculpture, painting, murals, and thought that today constitute the heart of the museum.",
    descPt: "Décadas de trabalho silencioso: escultura, pintura, murais e pensamento que hoje constituem o coração do museu.",
  },
  {
    year: "2026",
    titleEs: "Nacimiento del MUVA",
    titleEn: "Birth of MUVA",
    titlePt: "Nascimento do MUVA",
    descEs: "Se concreta en San Ignacio Guazú un espacio para el encuentro con el legado guaraní–jesuítico y la obra de Manuel Viedma.",
    descEn: "In San Ignacio Guazú, a space for encounter with the Guaraní–Jesuit legacy and the work of Manuel Viedma becomes reality.",
    descPt: "Em San Ignacio Guazú, um espaço para o encontro com o legado guarani–jesuíta e a obra de Manuel Viedma se concretiza.",
  },
];

export default function History() {
  const titleReveal = useScrollReveal<HTMLDivElement>();
  const { locale } = useLanguage();

  const getLocalized = (entry: TimelineEntry, field: "title" | "desc") => {
    if (field === "title") {
      return locale === "en" ? entry.titleEn : locale === "pt" ? entry.titlePt : entry.titleEs;
    }
    return locale === "en" ? entry.descEn : locale === "pt" ? entry.descPt : entry.descEs;
  };

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
          <div className="eyebrow">{t("history.eyebrow", locale)}</div>
          <h2 className="mt-6 font-serif font-light text-muva-dark text-display-lg text-balance">
            {t("history.heading", locale)}
          </h2>
          <p className="mt-8 max-w-2xl font-serif text-xl italic text-muva-brown">
            {t("history.intro", locale)}
          </p>
        </div>

        <div className="relative mt-20 md:mt-28">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-px bg-muva-sand md:left-1/2" />

          <ol className="space-y-16 md:space-y-24">
            {timeline.map((entry, i) => (
              <TimelineItem
                key={entry.year}
                entry={entry}
                index={i}
                getLocalized={getLocalized}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  entry,
  index,
  getLocalized,
}: {
  entry: TimelineEntry;
  index: number;
  getLocalized: (entry: TimelineEntry, field: "title" | "desc") => string;
}) {
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
          {getLocalized(entry, "title")}
        </h3>
        <p className={`mt-4 max-w-md text-muva-brown text-pretty ${isLeft ? "md:ml-auto" : ""}`}>
          {getLocalized(entry, "desc")}
        </p>
      </div>
    </li>
  );
}
