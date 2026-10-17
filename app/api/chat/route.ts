import { SYSTEM_PROMPT, TOPICS, type Topic } from "@/lib/knowledge";

export const runtime = "nodejs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const ANSWER_MODEL = process.env.GROQ_ANSWER_MODEL || "openai/gpt-oss-120b";
const ROUTER_MODEL = process.env.GROQ_ROUTER_MODEL || "openai/gpt-oss-20b";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Usage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };

const TOPIC_KEYS = Object.keys(TOPICS) as Topic[];

// Stage 2 imitates a Jev-style typed decision: a fixed answer space, a confidence,
// strict JSON out. (Jev itself is in early access; a small Groq model stands in for it.)
async function routeQuestion(apiKey: string, question: string) {
  const started = Date.now();
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ROUTER_MODEL,
      temperature: 0,
      max_tokens: 400,
      reasoning_effort: "low",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Classify the user's question about Jev/LLMs. Reply ONLY with JSON {"topic": one of ${JSON.stringify(
            TOPIC_KEYS,
          )}, "confidence": number 0-1}.`,
        },
        { role: "user", content: question },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Router call failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  let topic: Topic = "other";
  let confidence = 0.5;
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    if (TOPIC_KEYS.includes(parsed.topic)) topic = parsed.topic;
    if (typeof parsed.confidence === "number") confidence = Math.max(0, Math.min(1, parsed.confidence));
  } catch {
    // Malformed output is exactly the LLM failure mode Jev's typed outputs avoid; fall back to "other".
  }
  return { topic, confidence, usage: data.usage as Usage, ms: Date.now() - started };
}

export async function GET() {
  return Response.json({ hasServerKey: Boolean(process.env.GROQ_API_KEY) });
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY || req.headers.get("x-groq-key") || "";
  if (!apiKey) {
    return Response.json(
      { error: "No Groq API key. Add GROQ_API_KEY to .env.local or paste a key in the assistant panel." },
      { status: 400 },
    );
  }

  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  const history = (messages || []).slice(-10);
  const question = history.at(-1)?.content?.trim();
  if (!question) return Response.json({ error: "Empty question." }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        send({ type: "step", step: 1, status: "done", detail: `Received ${question.length} characters` });

        send({ type: "step", step: 2, status: "active" });
        const route = await routeQuestion(apiKey, question);
        send({
          type: "step",
          step: 2,
          status: "done",
          detail: `${TOPICS[route.topic].label} · ${(route.confidence * 100).toFixed(0)}% · ${route.ms} ms`,
          topic: route.topic,
          usage: route.usage,
        });

        send({ type: "step", step: 3, status: "active" });
        const system = `${SYSTEM_PROMPT}\n\nThe question was routed to topic: "${TOPICS[route.topic].label}". Focus your answer there.`;
        send({ type: "step", step: 3, status: "done", detail: `System prompt + ${history.length} message(s) of context` });

        send({ type: "step", step: 4, status: "active" });
        const started = Date.now();
        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ANSWER_MODEL,
            temperature: 0.4,
            max_tokens: 3000,
            reasoning_effort: "low",
            stream: true,
            messages: [{ role: "system", content: system }, ...history],
          }),
        });
        if (!res.ok || !res.body) throw new Error(`Answer call failed (${res.status}): ${await res.text()}`);

        let answerUsage: Usage | undefined;
        let buffer = "";
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            const chunk = JSON.parse(payload);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) send({ type: "token", text: delta });
            const usage = chunk.x_groq?.usage ?? chunk.usage;
            if (usage) answerUsage = usage;
          }
        }
        send({ type: "step", step: 4, status: "done", detail: `${ANSWER_MODEL} · ${Date.now() - started} ms`, usage: answerUsage });

        send({
          type: "step",
          step: 5,
          status: "done",
          detail: `Router ${route.usage?.total_tokens ?? "?"} tok · Answer ${answerUsage?.total_tokens ?? "?"} tok`,
          router: { model: ROUTER_MODEL, usage: route.usage },
          answer: { model: ANSWER_MODEL, usage: answerUsage },
        });
        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
