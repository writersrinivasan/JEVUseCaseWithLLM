import { JEV_FACTS } from "@/lib/knowledge";
import { Badge } from "./Section";

const STATS = [
  { value: "70–500 ms", label: "per decision", kind: "vendor" as const, color: "from-fuchsia-500/30 to-pink-500/10" },
  { value: "$0.042", label: "per 1M input tokens · output free", kind: "vendor" as const, color: "from-amber-500/30 to-orange-500/10" },
  { value: "~25× faster", label: "vs Claude Fable 5.1 on extraction", kind: "independent" as const, color: "from-emerald-500/30 to-lime-500/10" },
  { value: "~580× cheaper", label: "same independent test", kind: "independent" as const, color: "from-sky-500/30 to-cyan-500/10" },
];

export function Hero() {
  return (
    <header id="top" className="pt-16 pb-8 sm:pt-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
        <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
        {JEV_FACTS.company} · launched {JEV_FACTS.launched}
      </div>
      <h1 className="font-display mt-6 text-5xl font-bold leading-[1.05] sm:text-7xl">
        <span className="text-gradient">JEV</span> decides.
        <br />
        <span className="text-white">LLMs talk.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-white/75">
        Jev is a <strong className="text-pink-300">“System One Model”</strong>. It isn&apos;t a language model. It reads messy state, answers your{" "}
        <strong className="text-amber-300">typed questions</strong> in one parallel pass, and returns <strong className="text-emerald-300">machine-ready decisions</strong>{" "}
        with confidence scores. This page walks through it in seven colour-coded steps, using one real-world scenario.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.value} className={`glass rounded-2xl bg-gradient-to-br ${s.color} p-4`}>
            <Badge kind={s.kind} />
            <div className="font-display mt-2 text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-white/65">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href="#what" className="rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:brightness-110">
          Start at Step 1 →
        </a>
        <a href="#assistant" className="rounded-full border border-white/20 px-5 py-2.5 font-semibold text-white hover:bg-white/10">
          Ask the AI assistant
        </a>
      </div>
    </header>
  );
}
