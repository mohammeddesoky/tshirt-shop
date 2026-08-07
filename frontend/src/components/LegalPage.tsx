export default function LegalPage({ title, sections }: { title: string; sections: { heading: string; body: string }[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-10">{title}</h1>
      <div className="space-y-8">
        {sections.map((s, i) => (
          <div key={i}>
            <h2 className="font-display font-semibold text-lg mb-2">{s.heading}</h2>
            <p className="text-sm text-ink/60 dark:text-ink-dark/60 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
