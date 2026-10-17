export const STEPS = [
  { id: "what", n: 1, label: "What is JEV", color: "from-fuchsia-500 to-pink-500", ring: "ring-fuchsia-400" },
  { id: "why", n: 2, label: "Why now", color: "from-rose-500 to-orange-400", ring: "ring-rose-400" },
  { id: "usecase", n: 3, label: "Use case", color: "from-orange-500 to-amber-400", ring: "ring-amber-400" },
  { id: "tokens", n: 4, label: "Token savings", color: "from-emerald-500 to-lime-400", ring: "ring-emerald-400" },
  { id: "compare", n: 5, label: "JEV vs LLM", color: "from-sky-500 to-cyan-400", ring: "ring-sky-400" },
  { id: "patterns", n: 6, label: "Agentic patterns", color: "from-violet-500 to-indigo-500", ring: "ring-violet-400" },
  { id: "assistant", n: 7, label: "AI assistant", color: "from-yellow-400 to-pink-500", ring: "ring-yellow-300" },
] as const;

export function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: (typeof STEPS)[number]["id"];
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const step = STEPS.find((s) => s.id === id)!;
  return (
    <section id={id} className="scroll-mt-24 py-16 sm:py-20">
      <div className="mb-8 flex items-start gap-4">
        <div className={`shrink-0 rounded-2xl bg-gradient-to-br ${step.color} px-3 py-2 text-center shadow-lg`}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">Step</div>
          <div className="font-display text-2xl font-bold leading-none text-white">{step.n}</div>
        </div>
        <div>
          <h2 className={`font-display bg-gradient-to-r ${step.color} bg-clip-text text-3xl font-bold text-transparent sm:text-4xl`}>
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-white/70">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function Badge({ kind }: { kind: "vendor" | "independent" | "illustrative" }) {
  const styles = {
    vendor: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    independent: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    illustrative: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  }[kind];
  const label = { vendor: "Vendor claim", independent: "Independent test", illustrative: "Illustrative" }[kind];
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles}`}>{label}</span>;
}
