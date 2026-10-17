import { Assistant } from "@/components/Assistant";
import { Comparison } from "@/components/Comparison";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Patterns } from "@/components/Patterns";
import { TokenCalculator } from "@/components/TokenCalculator";
import { UseCase } from "@/components/UseCase";
import { WhatIsJev } from "@/components/WhatIsJev";
import { WhyNow } from "@/components/WhyNow";
import { SOURCES } from "@/lib/knowledge";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4">
        <Hero />
        <WhatIsJev />
        <WhyNow />
        <UseCase />
        <TokenCalculator />
        <Comparison />
        <Patterns />
        <Assistant />
      </main>
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-white/55">
          <div className="font-display font-bold text-white/80">Sources</div>
          <ul className="mt-2 space-y-1">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-pink-300 hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/40">
            Vendor figures are TypeSafe AI&apos;s own claims. Scenario numbers are illustrative. Check them against your own workload.
          </p>
        </div>
      </footer>
    </>
  );
}
