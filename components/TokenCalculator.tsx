"use client";

import { useState } from "react";
import { JEV_FACTS } from "@/lib/knowledge";
import { Badge, Section } from "./Section";

type Field = { key: keyof Inputs; label: string; min: number; max: number; step: number; fmt: (v: number) => string; color: string };
type Inputs = {
  tasks: number;
  decisions: number;
  contextTokens: number;
  decisionOut: number;
  replyOut: number;
  llmIn: number;
  llmOut: number;
};

const FIELDS: Field[] = [
  { key: "tasks", label: "Agent tasks per day", min: 100, max: 200000, step: 100, fmt: (v) => v.toLocaleString(), color: "accent-pink-500" },
  { key: "decisions", label: "Decision steps per task", min: 1, max: 30, step: 1, fmt: (v) => String(v), color: "accent-orange-500" },
  { key: "contextTokens", label: "Context tokens per call", min: 500, max: 20000, step: 100, fmt: (v) => v.toLocaleString(), color: "accent-amber-400" },
  { key: "decisionOut", label: "LLM output tokens per decision", min: 10, max: 600, step: 10, fmt: (v) => String(v), color: "accent-lime-400" },
  { key: "replyOut", label: "LLM output tokens for final reply", min: 50, max: 2000, step: 10, fmt: (v) => String(v), color: "accent-emerald-400" },
  { key: "llmIn", label: "LLM input price ($ / 1M tokens)", min: 0.1, max: 15, step: 0.1, fmt: (v) => `$${v.toFixed(2)}`, color: "accent-sky-400" },
  { key: "llmOut", label: "LLM output price ($ / 1M tokens)", min: 0.4, max: 75, step: 0.1, fmt: (v) => `$${v.toFixed(2)}`, color: "accent-violet-400" },
];

const money = (v: number) => (v >= 100 ? `$${Math.round(v).toLocaleString()}` : `$${v.toFixed(2)}`);
const big = (v: number) => (v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : `${Math.round(v)}`);

export function TokenCalculator() {
  const [x, setX] = useState<Inputs>({ tasks: 10000, decisions: 5, contextTokens: 2500, decisionOut: 120, replyOut: 220, llmIn: 3, llmOut: 15 });

  // LLM-only: every decision + the reply is an LLM call.
  const llmInTok = x.tasks * (x.decisions + 1) * x.contextTokens;
  const llmOutTok = x.tasks * (x.decisions * x.decisionOut + x.replyOut);
  const llmCost = (llmInTok * x.llmIn + llmOutTok * x.llmOut) / 1e6;

  // Hybrid: decisions go to Jev (input-only billing), the reply stays on the LLM.
  const jevInTok = x.tasks * x.decisions * x.contextTokens;
  const hybridLlmIn = x.tasks * x.contextTokens;
  const hybridLlmOut = x.tasks * x.replyOut;
  const hybridCost = (hybridLlmIn * x.llmIn + hybridLlmOut * x.llmOut) / 1e6 + (jevInTok * JEV_FACTS.pricingInputPerMTok) / 1e6;

  const saved = llmCost - hybridCost;
  const pct = llmCost > 0 ? (saved / llmCost) * 100 : 0;
  const outSavedPct = llmOutTok > 0 ? ((llmOutTok - hybridLlmOut) / llmOutTok) * 100 : 0;

  return (
    <Section
      id="tokens"
      title="Token optimization: calculate it yourself"
      subtitle="Jev doesn't compress your prompts. It saves tokens by taking decision calls away from the LLM. The LLM stops generating reasoning and JSON for every decision, and the remaining input tokens move to a model that charges $0.042 per million."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="glass space-y-4 rounded-3xl p-5">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <div className="flex justify-between text-sm">
                <span className="text-white/75">{f.label}</span>
                <span className="font-mono font-bold">{f.fmt(x[f.key])}</span>
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={x[f.key]}
                onChange={(e) => setX({ ...x, [f.key]: Number(e.target.value) })}
                className={`mt-1 w-full ${f.color}`}
              />
            </label>
          ))}
          <p className="text-xs text-white/50">
            Default LLM prices are an assumption for a typical frontier model, so change them to match yours. Jev pricing is TypeSafe&apos;s published rate <Badge kind="vendor" />.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-gradient-to-br from-sky-600/40 to-blue-900/30 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-200">🧠 LLM-only / day</div>
              <div className="font-display mt-1 text-3xl font-bold">{money(llmCost)}</div>
              <div className="mt-2 text-xs text-white/70">{big(llmInTok)} in · {big(llmOutTok)} out</div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-fuchsia-600/40 to-orange-600/30 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-fuchsia-200">⚡ LLM + JEV / day</div>
              <div className="font-display mt-1 text-3xl font-bold">{money(hybridCost)}</div>
              <div className="mt-2 text-xs text-white/70">
                LLM {big(hybridLlmIn)} in · {big(hybridLlmOut)} out · JEV {big(jevInTok)} in
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <Bar label="LLM-only" value={llmCost} max={llmCost} color="from-sky-500 to-blue-500" />
            <Bar label="LLM + JEV" value={hybridCost} max={llmCost} color="from-fuchsia-500 to-orange-400" />
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="font-display text-2xl font-bold text-lime-300">{pct.toFixed(0)}%</div>
                <div className="text-xs text-white/60">cost saved</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-amber-300">{money(saved * 30)}</div>
                <div className="text-xs text-white/60">saved / month</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-pink-300">{outSavedPct.toFixed(0)}%</div>
                <div className="text-xs text-white/60">fewer LLM output tokens</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-white/80">
            <b className="text-emerald-300">Where the savings come from, step by step</b>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Decision calls no longer generate output tokens. Output is the most expensive kind of token.</li>
              <li>Each decision&apos;s context is billed at $0.042/M instead of the LLM input rate.</li>
              <li>No malformed JSON means no paid retries.</li>
              <li>Several questions are answered in one parallel pass instead of one LLM call each.</li>
              <li>
                <b>Jevons paradox:</b> with decisions this cheap, you&apos;ll add more checks (safety, quality, RAG filtering), which makes the agent more reliable.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const w = max > 0 ? Math.max(1.5, (value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs text-white/70">
        <span>{label}</span>
        <span className="font-mono">{money(value)}/day</span>
      </div>
      <div className="h-4 rounded-full bg-white/10">
        <div className={`h-4 rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}
