"use client";

import { useState } from "react";
import { Badge, Section } from "./Section";

const ROWS = [
  ["What it produces", "Typed values: yes/no, choice, score", "Free-form text, code, JSON-as-text"],
  ["How it generates", "All answers in one parallel pass", "Token by token, sequentially"],
  ["Latency", "70–500 ms (vendor)", "Seconds, and up to minutes with reasoning"],
  ["Pricing", "$0.042/M input, output not metered", "Input and output both billed, output costs more"],
  ["Output reliability", "Always matches the schema", "Can be malformed, needs parsing and retries"],
  ["Confidence", "Calibrated probability per answer", "Not calibrated by default"],
  ["Open-ended reasoning", "✗ No", "✓ Yes"],
  ["Writing, chat, code", "✗ No", "✓ Yes"],
  ["Needs a known answer space", "Yes, you define the options", "No"],
  ["Maturity", "Early access (Sep 2026)", "Mature, widely deployed"],
];

const TASKS = [
  { t: "Route a support ticket to a team", w: "jev", why: "Fixed list of teams, high volume, needs to be instant." },
  { t: "Approve / hold / review an invoice", w: "jev", why: "A choice among four known outcomes, with confidence to trigger human review." },
  { t: "Block a risky tool call (prompt injection)", w: "jev", why: "allow / block / escalate runs before every tool call, so it has to be cheap and fast." },
  { t: "Filter RAG chunks for relevance", w: "jev", why: "One yes/no per chunk adds up to many calls, so cost per call matters." },
  { t: "Pick cheap vs powerful model", w: "jev", why: "This is the ModelRouterMiddleware pattern: the router must cost less than the savings it brings." },
  { t: "Write the customer reply", w: "llm", why: "Needs natural, empathetic language, which Jev can't produce." },
  { t: "Plan a multi-step research task", w: "llm", why: "Open-ended reasoning with no fixed set of answers." },
  { t: "Generate or refactor code", w: "llm", why: "The output is free-form text." },
  { t: "Summarise a 40-page contract", w: "llm", why: "Long-form generation." },
  { t: "Decide whether the agent's task is done", w: "jev", why: "Yes/no plus a completeness score, checked at every loop iteration." },
];

export function Comparison() {
  const [picked, setPicked] = useState(0);
  const task = TASKS[picked];

  return (
    <Section
      id="compare"
      title="JEV vs LLM: where each one wins"
      subtitle="They aren't competitors. Jev is the fast instinct and the LLM is the deliberate thinker. Use Jev wherever the possible answers can be listed in advance."
    >
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-4 text-white/50">Dimension</th>
                <th className="bg-gradient-to-r from-fuchsia-500/30 to-pink-500/20 p-4 font-display text-fuchsia-100">⚡ JEV</th>
                <th className="bg-gradient-to-r from-sky-500/30 to-cyan-500/20 p-4 font-display text-sky-100">🧠 LLM</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([d, j, l], i) => (
                <tr key={d} className={i % 2 ? "bg-white/[0.02]" : ""}>
                  <td className="p-3 pl-4 font-semibold text-white/80">{d}</td>
                  <td className="p-3 text-fuchsia-100/90">{j}</td>
                  <td className="p-3 text-sky-100/90">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div className="font-display font-bold">Speed, one extraction passage</div>
              <Badge kind="independent" />
            </div>
            <HBar label="JEV" value={0.35} max={8.83} unit="s" color="from-fuchsia-500 to-pink-500" />
            <HBar label="Claude Fable 5.1" value={8.83} max={8.83} unit="s" color="from-sky-500 to-cyan-400" />
            <p className="mt-3 text-xs text-white/55">Every&apos;s test found Jev ~25× faster and ~580× cheaper on this one task.</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div className="font-display font-bold">Peak, TypeSafe in-house</div>
              <Badge kind="vendor" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-fuchsia-500/15 p-3">
                <div className="font-display text-2xl font-bold text-fuchsia-200">193.6×</div>
                <div className="text-xs text-white/60">faster</div>
              </div>
              <div className="rounded-2xl bg-amber-500/15 p-3">
                <div className="font-display text-2xl font-bold text-amber-200">444.6×</div>
                <div className="text-xs text-white/60">cheaper</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/55">
              Accuracy is ~67.8% on TypeSafe&apos;s internal 4-workflow benchmark, which it reports as comparable to GPT-5.6 Terra. That benchmark measures agreement with frontier models.
            </p>
          </div>
        </div>
      </div>

      <h3 className="font-display mt-10 text-xl font-bold">Which one should handle this task?</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-wrap gap-2">
          {TASKS.map((t, i) => (
            <button
              key={t.t}
              onClick={() => setPicked(i)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                i === picked ? "border-transparent bg-gradient-to-r from-sky-500 to-cyan-400 font-semibold text-white" : "border-white/15 text-white/70 hover:bg-white/10"
              }`}
            >
              {t.t}
            </button>
          ))}
        </div>
        <div className={`rounded-3xl p-5 ${task.w === "jev" ? "bg-gradient-to-br from-fuchsia-600/40 to-orange-500/20" : "bg-gradient-to-br from-sky-600/40 to-indigo-600/20"}`}>
          <div className="text-xs uppercase tracking-wider text-white/60">Best fit</div>
          <div className="font-display mt-1 text-3xl font-bold">{task.w === "jev" ? "⚡ JEV" : "🧠 LLM"}</div>
          <p className="mt-2 text-sm text-white/85">{task.why}</p>
        </div>
      </div>
    </Section>
  );
}

function HBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-white/70">
        <span>{label}</span>
        <span className="font-mono">
          {value} {unit}
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <div className={`h-3 rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
