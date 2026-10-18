"use client";

import { createContext, useContext, useEffect, useState } from "react";

// The Groq key lives only in this tab's sessionStorage: it survives a reload,
// is wiped when the tab closes, and is never stored on the server.
const STORAGE = "groq-key";

type KeyCtx = { apiKey: string; forget: () => void; openGate: () => void };
const Ctx = createContext<KeyCtx>({ apiKey: "", forget: () => {}, openGate: () => {} });
export const useGroqKey = () => useContext(Ctx);

const read = () => {
  try {
    return sessionStorage.getItem(STORAGE) || "";
  } catch {
    return "";
  }
};
const write = (v: string) => {
  try {
    if (v) sessionStorage.setItem(STORAGE, v);
    else sessionStorage.removeItem(STORAGE);
  } catch {}
};

export function KeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState("");
  const [gate, setGate] = useState(false);
  const [draft, setDraft] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = read();
    setApiKey(saved);
    setGate(!saved);
    try {
      localStorage.removeItem(STORAGE); // clean up the old persistent copy from earlier versions
    } catch {}
  }, []);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    const key = draft.trim();
    if (!key) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/verify", { method: "POST", headers: { "x-groq-key": key } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Key check failed");
      write(key);
      setApiKey(key);
      setDraft("");
      setGate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setChecking(false);
    }
  }

  const forget = () => {
    write("");
    setApiKey("");
    setGate(true);
  };

  return (
    <Ctx.Provider value={{ apiKey, forget, openGate: () => setGate(true) }}>
      {children}
      {gate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b0820]/85 p-4 backdrop-blur-md">
          <form onSubmit={unlock} className="glass w-full max-w-md rounded-3xl bg-gradient-to-br from-fuchsia-500/20 via-transparent to-sky-500/20 p-6 shadow-2xl">
            <div className="text-4xl">🔑</div>
            <h2 className="font-display mt-3 text-2xl font-bold">
              Enter your <span className="text-gradient">Groq API key</span>
            </h2>
            <p className="mt-2 text-sm text-white/70">
              The AI assistant runs on your own Groq free tier. Your key is kept only in this browser tab and is <b className="text-lime-300">wiped when you close the tab</b>. It is never saved on the server.
            </p>
            <input
              autoFocus
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="gsk_…"
              autoComplete="off"
              className="mt-5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm outline-none focus:border-yellow-300"
            />
            {error && <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/15 p-2 text-xs text-red-200">⚠️ {error}</div>}
            <button
              disabled={checking || !draft.trim()}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-fuchsia-500 py-3 font-bold text-white disabled:opacity-40"
            >
              {checking ? "Checking key…" : "Unlock the assistant"}
            </button>
            <button type="button" onClick={() => setGate(false)} className="mt-2 w-full rounded-xl py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
              Browse without the assistant
            </button>
            <p className="mt-3 text-center text-xs text-white/40">
              Get a free key at{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline hover:text-pink-300">
                console.groq.com/keys
              </a>
            </p>
          </form>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function KeyChip() {
  const { apiKey, forget, openGate } = useGroqKey();
  return apiKey ? (
    <button onClick={forget} title="Remove the key from this tab" className="shrink-0 rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1.5 text-xs font-semibold text-lime-200 hover:bg-lime-400/20">
      🔑 …{apiKey.slice(-4)} · Forget key
    </button>
  ) : (
    <button onClick={openGate} className="shrink-0 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 px-3 py-1.5 text-xs font-bold text-white">
      🔑 Add Groq key
    </button>
  );
}
