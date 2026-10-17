# JEV × LLM — Decisions vs Language

A colourful Next.js app that explains **Jev** (TypeSafe AI's "System One Model", launched 15 Sep 2026),
how it is used in agentic AI and token optimization, and how it compares with LLMs. It includes a Groq-powered
AI assistant that shows each processing step as it runs.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your GROQ_API_KEY
npm run dev                   # http://localhost:3000
```

No key in `.env.local`? You can paste one into the assistant panel instead. It is stored in your browser and sent only to this app's API route.

## The 7 steps on the page
1. What JEV is: typed questions in, typed decisions + confidence out, in one parallel pass
2. Why it's popular now
3. Use case: a customer-support refund agent (toggle LLM-only vs LLM + JEV)
4. Token-savings calculator
5. JEV vs LLM comparison + "which should handle this task?" picker
6. 8 agentic patterns + LangChain middleware
7. AI assistant: Stage 1 question → Stage 2 JEV-style router (small Groq model, JSON-only typed choice) → Stage 3 prompt → Stage 4 large Groq model streams the answer → Stage 5 token report

Models can be changed with `GROQ_ANSWER_MODEL` / `GROQ_ROUTER_MODEL`.
The knowledge base and the assistant's system prompt live in `lib/knowledge.ts`.
