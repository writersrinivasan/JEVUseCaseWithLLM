"use client";

import { useEffect, useState } from "react";
import { KeyChip } from "./KeyProvider";
import { STEPS } from "./Section";

export function Nav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    STEPS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0820]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3">
        <a href="#top" className="font-display shrink-0 text-lg font-bold">
          <span className="text-gradient">JEV</span>
          <span className="text-white/50"> × </span>
          <span className="text-white">LLM</span>
        </a>
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active === s.id ? `bg-gradient-to-r ${s.color} text-white shadow-lg` : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${active === s.id ? "bg-white/25" : `bg-gradient-to-br ${s.color} text-white`}`}>
                {s.n}
              </span>
              {s.label}
            </a>
          ))}
        </div>
        <div className="ml-auto pl-2">
          <KeyChip />
        </div>
      </div>
    </nav>
  );
}
