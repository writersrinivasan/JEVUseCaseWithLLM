"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TOPICS, type Topic } from "@/lib/knowledge";
import { useGroqKey } from "./KeyProvider";
import { Section } from "./Section";

type Msg = { role: "user" | "assistant"; content: string; topic?: Topic; usage?: { router?: number; answer?: number } };
type StepState = { status: "idle" | "active" | "done" | "error"; detail?: string };

const PIPELINE = [
  { title: "Your question", desc: "Sent to the Next.js API route on the server", icon: "💬", color: "from-pink-500 to-fuchsia-500" },
  { title: "JEV-style router", desc: "A small fast model makes a typed choice: topic + confidence", icon: "⚡", color: "from-orange-500 to-amber-400" },
  { title: "Build the prompt", desc: "JEV knowledge base + routed topic + chat history", icon: "🧩", color: "from-lime-400 to-emerald-500" },
  { title: "LLM answers on Groq", desc: "A large model streams a step-by-step explanation", icon: "🧠", color: "from-sky-500 to-cyan-400" },
  { title: "Token report", desc: "Tokens used by each stage, as reported by Groq", icon: "📊", color: "from-violet-500 to-indigo-500" },
];

const SUGGESTIONS = [
  "Explain step by step how JEV handles a refund ticket",
  "How does JEV reduce token usage in an agent loop?",
  "When should I use an LLM instead of JEV?",
  "Why is JEV getting popular right now?",
  "How do I add JEV to a LangChain agent?",
];

const idle = (): StepState[] => PIPELINE.map(() => ({ status: "idle" }));

export function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<StepState[]>(idle);
  const [error, setError] = useState("");
  const { apiKey: key, openGate } = useGroqKey();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    if (!key) {
      openGate();
      return;
    }
    setError("");
    setInput("");
    setBusy(true);
    setSteps(idle());
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);

    const patchStep = (i: number, s: StepState) => setSteps((prev) => prev.map((p, j) => (j === i ? s : p)));
    const patchLast = (fn: (m: Msg) => Msg) => setMessages((prev) => [...prev.slice(0, -1), fn(prev[prev.length - 1])]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(key ? { "x-groq-key": key } : {}) },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line);
          if (ev.type === "step") {
            patchStep(ev.step - 1, { status: ev.status, detail: ev.detail });
            if (ev.topic) patchLast((m) => ({ ...m, topic: ev.topic }));
            if (ev.step === 5) patchLast((m) => ({ ...m, usage: { router: ev.router?.usage?.total_tokens, answer: ev.answer?.usage?.total_tokens } }));
          } else if (ev.type === "token") {
            patchLast((m) => ({ ...m, content: m.content + ev.text }));
          } else if (ev.type === "error") {
            throw new Error(ev.message);
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setSteps((prev) => prev.map((p) => (p.status === "active" ? { status: "error", detail: "Failed" } : p)));
      setMessages((prev) => (prev[prev.length - 1]?.content ? prev : prev.slice(0, -1)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section
      id="assistant"
      title="Ask the AI assistant"
      subtitle="It's powered by Groq, and it is built the way this page recommends: a small, fast model makes a typed routing decision first, then a large model writes the step-by-step answer. Watch each stage light up as your question moves through."
    >
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Pipeline */}
        <div className="glass rounded-3xl p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50">What happens when you ask</div>
          <ol className="mt-4 space-y-1">
            {PIPELINE.map((p, i) => {
              const s = steps[i];
              return (
                <li key={p.title} className="relative flex gap-3 pb-4">
                  {i < PIPELINE.length - 1 && (
                    <span className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${s.status === "done" ? `bg-gradient-to-b ${p.color}` : "bg-white/10"}`} />
                  )}
                  <span
                    className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg transition ${
                      s.status === "idle" ? "bg-white/5 grayscale" : s.status === "error" ? "bg-red-500/60" : `bg-gradient-to-br ${p.color}`
                    } ${s.status === "active" ? "pulse-ring" : ""}`}
                  >
                    {s.status === "done" ? "✓" : p.icon}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${s.status === "idle" ? "text-white/60" : "text-white"}`}>
                      {i + 1}. {p.title}
                    </div>
                    <div className="text-xs text-white/50">{p.desc}</div>
                    {s.detail && <div className="mt-1 inline-block rounded-md bg-black/40 px-2 py-0.5 font-mono text-[11px] text-lime-300">{s.detail}</div>}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-2 border-t border-white/10 pt-4 text-xs">
            {key ? (
              <div className="text-emerald-300">✓ Using your Groq key (…{key.slice(-4)}) for this tab only</div>
            ) : (
              <button onClick={openGate} className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-pink-500 px-3 py-2 font-bold text-white">
                🔑 Add your Groq key to start
              </button>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="glass flex h-[640px] flex-col rounded-3xl">
          <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <div className="text-5xl">✨</div>
                  <div className="font-display mt-3 text-xl font-bold">Ask anything about JEV and LLMs</div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        className={`rounded-full bg-gradient-to-r ${PIPELINE[i % PIPELINE.length].color} px-3 py-1.5 text-xs font-semibold text-white shadow hover:brightness-110`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-fuchsia-600 to-orange-500 px-4 py-2.5 text-sm text-white">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[95%] rounded-2xl rounded-bl-sm border border-white/10 bg-black/30 px-4 py-3 text-sm">
                  {m.topic && (
                    <span className={`mb-2 inline-block rounded-full bg-gradient-to-r ${TOPICS[m.topic].color} px-2.5 py-0.5 text-[11px] font-bold text-white`}>
                      Routed → {TOPICS[m.topic].label}
                    </span>
                  )}
                  <div className="prose-chat">
                    {m.content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown> : <span className="animate-pulse text-white/50">Thinking…</span>}
                  </div>
                  {m.usage && (
                    <div className="mt-3 flex gap-2 text-[11px]">
                      <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-orange-200">router {m.usage.router ?? "?"} tok</span>
                      <span className="rounded-md bg-sky-500/20 px-2 py-0.5 text-sky-200">answer {m.usage.answer ?? "?"} tok</span>
                    </div>
                  )}
                </div>
              ),
            )}
            {error && <div className="rounded-xl border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200">⚠️ {error}</div>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-white/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Compare JEV and an LLM for fraud review, step by step"
              className="flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
            <button
              disabled={busy || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-pink-500 px-5 font-bold text-white disabled:opacity-40"
            >
              {busy ? "…" : "Ask"}
            </button>
          </form>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/45">
        Note: Jev itself is in early access, so a small Groq model plays its role in Stage 2. It uses the same pattern Jev formalises: a fixed answer space, JSON-only output, and a confidence score.
      </p>
    </Section>
  );
}
