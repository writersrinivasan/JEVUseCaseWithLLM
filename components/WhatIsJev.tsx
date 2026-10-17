import { JEV_FACTS } from "@/lib/knowledge";
import { Section } from "./Section";

const DECISION_TYPES = [
  { name: "Yes / No", example: "Is this order eligible for a refund?", out: "true · 0.94", color: "from-pink-500 to-rose-500" },
  { name: "Choice", example: "Which team handles this ticket? (up to 255 options)", out: '"refund" · 0.91', color: "from-orange-500 to-amber-400" },
  { name: "Score", example: "How risky is this transaction, 0–1?", out: "0.12", color: "from-emerald-500 to-teal-400" },
];

const REQUEST = `client.system_one(
  state = {
    "ticket": "Hi, my blender arrived cracked.
               I want my money back. Order #8812",
    "order":  { "delivered": "2026-10-12",
                "amount": 89.00, "refunds_90d": 0 }
  },
  questions = {
    "intent":   Choice(["refund","delivery","payment",
                        "technical_support","other"]),
    "eligible": YesNo("Within the 30-day refund policy?"),
    "risk":     Score("Fraud risk of this request")
  })`;

const RESPONSE = `{
  "intent":   { "value": "refund", "confidence": 0.93 },
  "eligible": { "value": true,     "confidence": 0.97 },
  "risk":     { "value": 0.08 }
}
// 3 answers · 1 parallel pass · ~0.3 s · 0 output tokens billed`;

export function WhatIsJev() {
  return (
    <Section
      id="what"
      title="What JEV actually is"
      subtitle="A model built for one job: making bounded decisions inside software. You define the possible answers in advance. Jev picks among them and tells you how sure it is."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {/* LLM path */}
        <div className="glass rounded-3xl p-6">
          <div className="text-sm font-semibold uppercase tracking-wider text-sky-300">How an LLM makes a decision</div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["Let", "me", "think", "…", "The", "customer", "mentions", "a", "cracked", "item", ",", "so", "intent", "=", '{"intent":', '"refund"}'].map((t, i) => (
              <span key={i} className="rounded-md bg-sky-500/15 px-2 py-1 font-mono text-xs text-sky-200" style={{ opacity: 0.45 + (i / 16) * 0.55 }}>
                {t}
              </span>
            ))}
          </div>
          <ul className="mt-5 space-y-2 text-sm text-white/75">
            <li>🐢 Generates <b>token by token</b>, and every token is billed and adds latency</li>
            <li>🧩 Output is text that you must <b>parse</b>, and it can be malformed</li>
            <li>🎲 Confidence is <b>not calibrated</b></li>
          </ul>
        </div>

        {/* JEV path */}
        <div className="glass rounded-3xl bg-gradient-to-br from-fuchsia-500/15 to-transparent p-6">
          <div className="text-sm font-semibold uppercase tracking-wider text-fuchsia-300">How JEV makes a decision</div>
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-xs">unstructured state + typed questions</div>
            <svg width="60" height="20" viewBox="0 0 60 20" className="shrink-0">
              <line x1="0" y1="10" x2="52" y2="10" stroke="#f0abfc" strokeWidth="2" className="flow-line" />
              <path d="M50 4 L58 10 L50 16" fill="none" stroke="#f0abfc" strokeWidth="2" />
            </svg>
            <div className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-3 py-2 text-xs font-bold">ONE parallel pass</div>
            <svg width="60" height="20" viewBox="0 0 60 20" className="shrink-0">
              <line x1="0" y1="10" x2="52" y2="10" stroke="#fde047" strokeWidth="2" className="flow-line" />
              <path d="M50 4 L58 10 L50 16" fill="none" stroke="#fde047" strokeWidth="2" />
            </svg>
            <div className="rounded-xl bg-yellow-400/20 px-3 py-2 text-xs text-yellow-100">typed answers + confidence</div>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-white/75">
            <li>⚡ All answers arrive at once in <b>{JEV_FACTS.latencyMs}</b> (vendor figure)</li>
            <li>🔒 <b>Type-safe</b>: the output always fits the schema you defined</li>
            <li>📊 <b>Calibrated confidence</b>, so you can set thresholds to act, ask, or escalate</li>
            <li>🚫 Can&apos;t write text, code or chat, by design</li>
          </ul>
        </div>
      </div>

      <h3 className="font-display mt-10 text-xl font-bold">Three kinds of question you can ask</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {DECISION_TYPES.map((d) => (
          <div key={d.name} className="glass overflow-hidden rounded-2xl">
            <div className={`bg-gradient-to-r ${d.color} px-4 py-2 font-display font-bold`}>{d.name}</div>
            <div className="p-4 text-sm">
              <div className="text-white/75">{d.example}</div>
              <div className="mt-3 inline-block rounded-lg bg-black/30 px-2 py-1 font-mono text-xs text-lime-300">→ {d.out}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-display mt-10 text-xl font-bold">One call, three decisions</h3>
      <p className="mt-1 text-sm text-white/60">Simplified from the call shape in TypeSafe&apos;s published examples.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <pre className="overflow-x-auto rounded-2xl border border-fuchsia-400/30 bg-black/40 p-4 text-xs leading-relaxed text-fuchsia-100">{REQUEST}</pre>
        <pre className="overflow-x-auto rounded-2xl border border-lime-400/30 bg-black/40 p-4 text-xs leading-relaxed text-lime-100">{RESPONSE}</pre>
      </div>

      <div className="mt-8 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 p-5 text-sm">
        <b className="text-yellow-200">Why “Jev”?</b> <span className="text-white/80">{JEV_FACTS.nameOrigin} TypeSafe is betting that once a decision costs ~$0.0004, teams will automate far more of them.</span>
      </div>
    </Section>
  );
}
