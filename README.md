# JEV × LLM — Decisions vs Language

A colourful Next.js app that explains **Jev** (TypeSafe AI's "System One Model", launched 15 Sep 2026),
how it is used in agentic AI and token optimization, and how it compares with LLMs. It includes a Groq-powered
AI assistant that shows each processing step as it runs.

## Run it

```bash
npm install
npm run dev                   # http://localhost:3000
```

## Groq API key: bring your own, per session
The app stores **no** API key. When you open it, a screen asks for your Groq key
([get one free](https://console.groq.com/keys)). The app checks the key with Groq, then keeps it **only in that
browser tab's `sessionStorage`**. It is sent with each assistant request and is gone when you close the tab.
Use **"Forget key"** in the top bar to remove it sooner. You can also choose "Browse without the assistant".

This keeps you in control of your Groq free-tier usage: nobody can spend your tokens unless they have your key.

## Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import `writersrinivasan/JEVUseCaseWithLLM`.
2. Framework preset: **Next.js**. Keep the default build settings.
3. **Don't add `GROQ_API_KEY`.** Environment variables are optional: only `GROQ_ANSWER_MODEL` / `GROQ_ROUTER_MODEL` if you want different models.
4. Deploy. Vercel redeploys automatically on every push to `main`.

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
