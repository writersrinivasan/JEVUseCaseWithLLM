import { JEV_FACTS } from "@/lib/knowledge";
import { Section } from "./Section";

const REASONS = [
  {
    icon: "🤖",
    title: "Agents are mostly decisions",
    body: "An agent loop has many small calls (“which tool?”, “is this done?”, “is this safe?”) for every paragraph it writes. Each of those calls re-sends the whole context to an expensive LLM.",
    color: "from-rose-500/30",
  },
  {
    icon: "💸",
    title: "Token bills got out of hand",
    body: "When an agent takes dozens of steps per task, cost and latency grow with every step. Teams want the LLM to handle less, not more.",
    color: "from-orange-500/30",
  },
  {
    icon: "🧱",
    title: "Typed output, no parsing",
    body: "No more broken JSON, retries or regex fixes. A Jev answer always fits your schema, so it can go straight into an if-statement.",
    color: "from-amber-500/30",
  },
  {
    icon: "🔌",
    title: "Easy to plug in",
    body: "LangChain middleware, the “Jev Use” MCP server for coding agents such as Claude Code and Codex, and Browser Use’s jev-ultrafast. You swap out one step, not your whole stack.",
    color: "from-emerald-500/30",
  },
  {
    icon: "🧠",
    title: "System 1 + System 2",
    body: "It follows the familiar idea from psychology: fast intuition (Jev) handles routine choices and slow reasoning (LLM) handles the hard parts. That framing is easy to explain to a team.",
    color: "from-sky-500/30",
  },
  {
    icon: "🏦",
    title: "Credible team and funding",
    body: `${JEV_FACTS.founders}. ${JEV_FACTS.funding}.`,
    color: "from-violet-500/30",
  },
];

export function WhyNow() {
  return (
    <Section
      id="why"
      title="Why everyone is talking about it"
      subtitle="Jev launched in September 2026, when agentic AI was moving from demos into production and teams were seeing their LLM bills grow."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((r) => (
          <div key={r.title} className={`glass rounded-2xl bg-gradient-to-br ${r.color} to-transparent p-5 transition hover:-translate-y-1`}>
            <div className="text-3xl">{r.icon}</div>
            <div className="font-display mt-3 text-lg font-bold">{r.title}</div>
            <p className="mt-2 text-sm text-white/75">{r.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5">
        <div className="font-display font-bold text-white">⚠️ The honest caveats</div>
        <ul className="mt-2 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
          <li>• Still in <b>early access</b>. No production customers have been named publicly.</li>
          <li>• Benchmarks measure <b>agreement with frontier LLMs</b>, not independent ground truth.</li>
          <li>• The independent test (Every) covered <b>one extraction task</b> only.</li>
          <li>• Type-safe doesn&apos;t mean <b>correct</b>. It only works when you can list every possible answer in advance.</li>
        </ul>
      </div>
    </Section>
  );
}
