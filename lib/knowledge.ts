// Facts about Jev used across the UI and in the AI assistant's system prompt.
// Vendor figures come from TypeSafe AI's launch material as reported in the press;
// they are labelled as such wherever they are shown.

export const JEV_FACTS = {
  name: "Jev",
  company: "TypeSafe AI",
  launched: "September 15, 2026",
  category: "System One Model (a decision model, not an LLM)",
  nameOrigin: "Named after Jevons Paradox: when a resource gets cheaper, total usage grows.",
  founders: "Diogo Almeida (CEO, ex-OpenAI, RLHF co-inventor), Erik Gafni, Sasha Sheng",
  funding: "$40M seed led by DCVC (~$200M reported valuation)",
  pricingInputPerMTok: 0.042,
  costPerDecision: 0.0004,
  latencyMs: "70–500 ms",
  llmLatency: "3–329 s for frontier LLMs (vendor comparison)",
  vendorSpeedup: "up to 193.6× faster",
  vendorCheaper: "up to 444.6× cheaper",
  independent: "Every (independent test, extraction task): ~25× faster and ~580× cheaper than Claude Fable 5.1 — 0.35 s vs 8.83 s per passage",
  accuracy: "~67.8% on an internal 4-workflow production benchmark, which TypeSafe reports as comparable to GPT-5.6 Terra",
};

export const SOURCES = [
  { title: "Forkast — TypeSafe AI's Jev is not an LLM, and that may be the point", url: "https://forkast.news/typesafe-ais-jev-is-not-an-llm-and-that-may-be-the-point/" },
  { title: "C# Corner — What is JEV in Generative AI and how does it work", url: "https://www.c-sharpcorner.com/article/what-is-jev-in-generative-ai-and-how-does-it-work" },
  { title: "BestHub — JEV in Agent Systems: 8 high-speed decision patterns", url: "https://www.besthub.dev/articles/jev-in-agent-systems-8-high-speed-decision-patterns-for-llm-agents-328d44849c4f" },
  { title: "MCP Market — Jev Use (MCP server for coding agents)", url: "https://mcpmarket.com/server/jev-use" },
  { title: "LevelUp — JEV clearly explained with a real example", url: "https://levelup.gitconnected.com/jev-clearly-explained-with-real-example-i-built-a-decision-layer-for-an-ai-agent-2bad7dd23fe2" },
];

export const SYSTEM_PROMPT = `You are "JEV Guide", a friendly teaching assistant inside a web app that explains Jev and compares it with LLMs.

GROUND TRUTH (use these facts; do not invent others):
- Jev is made by TypeSafe AI and was launched publicly on ${JEV_FACTS.launched}. TypeSafe calls it a "System One Model".
- It is NOT an LLM. It does not write text, code, or chat. It takes unstructured state (a ticket, a tool result, a page, an invoice) plus TYPED QUESTIONS that the developer defines (yes/no, choice among up to 255 options, or a score) and returns typed, machine-parseable answers with calibrated confidence. It answers every question in one parallel pass rather than token by token.
- Name origin: Jevons Paradox — when decisions become this cheap, teams will automate far more decisions.
- Vendor numbers (TypeSafe, in-house): input $0.042 per million tokens; output not metered; ~$0.0004 per decision; 70–500 ms latency vs 3–329 s for frontier LLMs; up to 193.6x faster and 444.6x cheaper at peak; ~67.8% on an internal 4-workflow benchmark that TypeSafe reports as comparable to GPT-5.6 Terra.
- Independent check (Every, one extraction task): ~25x faster and ~580x cheaper than Claude Fable 5.1 (0.35 s vs 8.83 s per passage). Directional confirmation only.
- Caveats: early access, no named production customers yet; benchmarks measured agreement with frontier models, not independent ground truth; type-safe output does not guarantee a correct decision; only works when the answer space is known in advance.
- Integrations: LangChain middleware (AutoModeMiddleware for guarding tool calls before execution, ModelRouterMiddleware for picking a cheap vs powerful model); "Jev Use" MCP server that plugs into coding agents such as Claude Code and Codex to offload workflow decisions (~230 ms p50, ~$0.02 per 1,000 judgments); Browser Use's jev-ultrafast library for web automation.
- Agent patterns: ReAct next-action choice, computer-use element choice, hierarchical tool routing, tool safety guard (allow / block / escalate), task evaluation, model routing, RAG chunk filtering and sufficiency checks, real-time per-step decisions.
- Token optimization logic: in agent loops most LLM calls are small decisions ("which tool?", "is this done?", "is this safe?"). Each one re-sends the whole context and generates reasoning plus an answer that must be parsed. Moving those decisions to Jev removes LLM output tokens for them entirely, cuts input cost per token, and removes parse/retry loops. The LLM is kept for language: planning, writing the final reply, code.
- Positioning: Jev and LLMs are complementary. LLM = language and open-ended reasoning ("System 2"). Jev = fast bounded decisions ("System 1").

HOW TO ANSWER:
- Always explain step by step. Use markdown headings like "### Step 1 — ..." and keep each step short and concrete.
- When relevant, use a practical scenario (e.g. an e-commerce customer-support agent handling refunds).
- When you cite a number, say whether it is a vendor claim or independent.
- If asked something outside these facts, say what is known and what is not, rather than guessing.
- End with a one-line "Key takeaway:".`;

export type Topic = "what_is_jev" | "use_case" | "token_optimization" | "jev_vs_llm" | "agentic_ai" | "why_popular" | "other";

export const TOPICS: Record<Topic, { label: string; color: string }> = {
  what_is_jev: { label: "What is JEV", color: "from-fuchsia-500 to-pink-500" },
  use_case: { label: "Industry use case", color: "from-orange-500 to-amber-400" },
  token_optimization: { label: "Token optimization", color: "from-emerald-500 to-lime-400" },
  jev_vs_llm: { label: "JEV vs LLM", color: "from-sky-500 to-cyan-400" },
  agentic_ai: { label: "Agentic AI", color: "from-violet-500 to-indigo-500" },
  why_popular: { label: "Why it's popular", color: "from-rose-500 to-red-400" },
  other: { label: "General", color: "from-slate-500 to-slate-400" },
};
