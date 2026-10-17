import { Section } from "./Section";

const PATTERNS = [
  { icon: "🔁", t: "ReAct next action", b: "Choose: call tool X / ask user / finish. Code still enforces loop limits.", c: "from-pink-500 to-rose-500" },
  { icon: "🖱️", t: "Computer use", b: "Pick which UI element to click from a menu of options (Browser Use’s jev-ultrafast).", c: "from-orange-500 to-amber-400" },
  { icon: "🧭", t: "Tool routing", b: "Category → sub-category → tool, like hospital triage, with a “no match” exit at each level.", c: "from-yellow-400 to-lime-400" },
  { icon: "🛡️", t: "Tool safety guard", b: "Before execution: allow / block / escalate. Detects prompt injection, data leaks, policy violations.", c: "from-emerald-500 to-teal-400" },
  { icon: "✅", t: "Task evaluation", b: "Is it complete? Did it violate anything? Does it need review? Plus completeness and urgency scores.", c: "from-cyan-500 to-sky-500" },
  { icon: "🔀", t: "Model routing", b: "Pick a fast or powerful model per task, keeping its confidence as a safeguard.", c: "from-blue-500 to-indigo-500" },
  { icon: "📚", t: "RAG filtering", b: "Keep a chunk if it's relevant (above 0.5), stop retrieving when the evidence is sufficient (above 0.8).", c: "from-violet-500 to-purple-500" },
  { icon: "🤖", t: "Real-time decisions", b: "The LLM plans the route and Jev reroutes a warehouse robot around a blocked aisle in milliseconds.", c: "from-fuchsia-500 to-pink-500" },
];

const CODE = `# LangChain: guard every tool call + route to the cheapest capable model
guard  = AutoModeMiddleware(tools=tools)          # JEV checks risk before execution
router = ModelRouterMiddleware(choices={
    "fast":     ModelChoice(model=fast,     criteria="single query"),
    "powerful": ModelChoice(model=powerful, criteria="multi-constraint planning"),
}, instructions="Choose the model that completes the task at lowest cost")

agent  = create_agent(fast, tools=tools, middleware=[router, guard])
result = agent.invoke({"messages": [HumanMessage(content=task)]})`;

export function Patterns() {
  return (
    <Section
      id="patterns"
      title="How JEV powers agentic AI: 8 patterns"
      subtitle="The common design: the LLM thinks and writes, and Jev makes the many small decisions in between. Each card is a place where an agent used to make an LLM call."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PATTERNS.map((p, i) => (
          <div key={p.t} className="glass group relative overflow-hidden rounded-2xl p-5">
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${p.c}`} />
            <div className="flex items-center justify-between">
              <span className="text-3xl">{p.icon}</span>
              <span className={`bg-gradient-to-r ${p.c} bg-clip-text font-display text-3xl font-bold text-transparent opacity-60`}>{i + 1}</span>
            </div>
            <div className="font-display mt-3 font-bold">{p.t}</div>
            <p className="mt-1 text-sm text-white/70">{p.b}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <pre className="overflow-x-auto rounded-2xl border border-violet-400/30 bg-black/40 p-4 text-xs leading-relaxed text-violet-100">{CODE}</pre>
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5 text-sm text-white/80">
          <div className="font-display font-bold text-indigo-200">Also in coding agents</div>
          <p className="mt-2">
            The <b>Jev Use</b> MCP server plugs into Claude Code, Codex and Pi agents. It hands off workflow decisions that don&apos;t need text, and the LLM takes back hard cases with a typed reason.
          </p>
          <p className="mt-2 text-white/60">Listed figures: ~230 ms p50, ~$0.02 per 1,000 judgments.</p>
        </div>
      </div>
    </Section>
  );
}
