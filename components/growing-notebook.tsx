import Image from "next/image";
import type { Messages } from "@/lib/i18n/messages";
import notebook from "@/src/assets/growing-notebook.webp";

export function GrowingNotebook({
  labels: t,
}: {
  labels: Messages["howWeGrow"];
}) {
  return (
    <section className="tower-notebook" aria-labelledby="notebook-title">
      <div className="tower-section-heading">
        <span className="eyebrow">{t.notebookEyebrow}</span>
        <h2 id="notebook-title">
          {t.notebookTitle}
          <br />
          <em>{t.notebookAccent}</em>
        </h2>
      </div>
      <Image
        src={notebook}
        alt={t.notebookAlt}
        sizes="(max-width: 800px) 100vw, 1168px"
      />
      <div className="tower-notes">
        {t.notes.map((note) => (
          <article key={note.label}>
            <span>{note.label}</span>
            <h3>{note.title}</h3>
            <p>{note.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
