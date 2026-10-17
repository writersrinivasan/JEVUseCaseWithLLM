"use client";

import { useState } from "react";
import { Badge, Section } from "./Section";

// Illustrative per-step numbers for one ticket. LLM: ~2.2k context tokens in, a short
// reasoning + JSON answer out. JEV: same context in, no billed output, sub-second.
export const PIPELINE = [
  { title: "Read the ticket and pick an intent", q: 'Choice: refund · delivery · payment · technical_support · other', kind: "decision", in: 2200, out: 140, llmMs: 2400, jevMs: 300, color: "from-pink-500 to-fuchsia-500" },
  { title: "Check refund eligibility", q: "Yes/No: delivered < 30 days ago and item not excluded?", kind: "decision", in: 2400, out: 120, llmMs: 2200, jevMs: 250, color: "from-orange-500 to-amber-400" },
  { title: "Score fraud risk", q: "Score 0–1: refund history, amount, account age", kind: "decision", in: 2600, out: 110, llmMs: 2100, jevMs: 250, color: "from-yellow-400 to-lime-400" },
  { title: "Guard the issue_refund() tool call", q: "Choice: allow · block · escalate_to_human", kind: "decision", in: 2800, out: 130, llmMs: 2300, jevMs: 280, color: "from-emerald-500 to-teal-400" },
  { title: "Write the reply to the customer", q: "Free-form, empathetic text with the refund details", kind: "language", in: 3000, out: 220, llmMs: 3600, jevMs: 3600, color: "from-sky-500 to-cyan-400" },
  { title: "Confirm the task is complete", q: "Yes/No: refund issued, reply sent, ticket closable?", kind: "decision", in: 3300, out: 100, llmMs: 2000, jevMs: 240, color: "from-violet-500 to-indigo-500" },
] as const;

export function UseCase() {
  const [mode, setMode] = useState<"llm" | "jev">("jev");
  const [active, setActive] = useState(0);

  const totals = PIPELINE.reduce(
    (acc, s) => {
      const useJev = mode === "jev" && s.kind === "decision";
      acc.ms += useJev ? s.jevMs : s.llmMs;
      acc.llmCalls += useJev ? 0 : 1;
      acc.outTokens += useJev ? 0 : s.out;
      return acc;
    },
    { ms: 0, llmCalls: 0, outTokens: 0 },
  );

  return (
    <Section
      id="usecase"
      title="Use case: a customer-support refund agent"
      subtitle="Customer support is where Jev fits most easily. Teams already have a fixed list of intents, policies and actions, so each decision point already has a known set of answers. Step through one ticket and switch between the two architectures."
    >
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl text-sm text-white/80">
            <Badge kind="illustrative" /> <b>ShopNow</b>, an e-commerce store, gets the ticket below. The agent has to understand it, check policy, guard a money-moving tool, reply, and close the ticket.
            <div className="mt-3 rounded-xl border-l-4 border-pink-400 bg-black/30 p-3 italic text-white/90">
              “Hi, my blender arrived cracked. I want my money back. Order #8812.”
            </div>
          </div>
          <div className="flex rounded-full bg-black/40 p-1 text-sm font-semibold">
            <button onClick={() => setMode("llm")} className={`rounded-full px-4 py-2 transition ${mode === "llm" ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white" : "text-white/60"}`}>
              LLM-only agent
            </button>
            <button onClick={() => setMode("jev")} className={`rounded-full px-4 py-2 transition ${mode === "jev" ? "bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white" : "text-white/60"}`}>
              LLM + JEV agent
            </button>
          </div>
        </div>

        <ol className="mt-6 grid gap-3">
          {PIPELINE.map((s, i) => {
            const useJev = mode === "jev" && s.kind === "decision";
            const isActive = i === active;
            return (
              <li key={s.title}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${
                    isActive ? "border-white/40 bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.color} font-display text-lg font-bold ${isActive ? "pulse-ring" : ""}`}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{s.title}</span>
                    <span className="block truncate text-xs text-white/55">{s.q}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      useJev ? "bg-fuchsia-500/25 text-fuchsia-200" : "bg-sky-500/25 text-sky-200"
                    }`}
                  >
                    {useJev ? "⚡ JEV" : "🧠 LLM"}
                  </span>
                  <span className="hidden w-20 shrink-0 text-right font-mono text-xs text-white/70 sm:block">
                    {((useJev ? s.jevMs : s.llmMs) / 1000).toFixed(2)} s
                  </span>
                </button>
                {isActive && (
                  <div className="mx-2 mt-2 rounded-xl bg-black/30 p-4 text-sm text-white/80">
                    {s.kind === "language" ? (
                      <>
                        <b className="text-sky-300">This step needs language</b>, so the LLM handles it in <i>both</i> architectures. This is what LLMs are for: writing a warm, specific reply. Jev can&apos;t write text.
                      </>
                    ) : useJev ? (
                      <>
                        <b className="text-fuchsia-300">Jev answers this</b> with a typed value and a confidence score in ~{s.jevMs} ms. The app then applies thresholds: above 0.9 it acts automatically, between 0.6 and 0.9 it asks a follow-up, below 0.6 it escalates to a human. No output tokens, nothing to parse. The ~{s.in.toLocaleString()} context tokens are billed at $0.042/M.
                      </>
                    ) : (
                      <>
                        <b className="text-sky-300">The LLM answers this</b> by re-reading ~{s.in.toLocaleString()} context tokens and generating ~{s.out} tokens of reasoning plus JSON, which then has to be parsed. If the JSON is malformed, you pay for a retry. ~{(s.llmMs / 1000).toFixed(1)} s.
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="End-to-end time" value={`${(totals.ms / 1000).toFixed(1)} s`} color="text-amber-300" />
          <Stat label="LLM calls" value={`${totals.llmCalls} / ${PIPELINE.length}`} color="text-sky-300" />
          <Stat label="LLM output tokens" value={totals.outTokens.toLocaleString()} color="text-fuchsia-300" />
        </div>
        <p className="mt-4 text-xs text-white/50">
          Latency and token counts are illustrative, based on Jev&apos;s published 70–500 ms range and typical frontier-LLM decision calls of a few seconds. Measure on your own workload.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Why adoption is easy", b: "You replace one LLM call at a time. The ticket system, the LLM that writes replies, and the tools all stay the same.", c: "border-pink-400/40" },
          { t: "Impact on the agent", b: "Five of the six steps become sub-second. The agent responds much faster, and guardrails and escalation are driven by calibrated confidence.", c: "border-amber-400/40" },
          { t: "Impact on tokens", b: "The LLM is called once per ticket instead of six times, so output tokens fall to just the reply. Calculate your own savings in Step 4.", c: "border-emerald-400/40" },
        ].map((x) => (
          <div key={x.t} className={`rounded-2xl border ${x.c} bg-white/[0.04] p-4`}>
            <div className="font-display font-bold">{x.t}</div>
            <p className="mt-1 text-sm text-white/70">{x.b}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-black/30 p-3">
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
