export const runtime = "nodejs";

// Checks a user-supplied Groq key by listing models. The key is used for this one request only.
export async function POST(req: Request) {
  const apiKey = req.headers.get("x-groq-key")?.trim();
  if (!apiKey) return Response.json({ error: "No key provided." }, { status: 400 });

  const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
  if (res.status === 401) return Response.json({ error: "Groq rejected this key. Check it and try again." }, { status: 401 });
  if (!res.ok) return Response.json({ error: `Groq returned ${res.status}. Try again in a moment.` }, { status: 502 });
  return Response.json({ ok: true });
}
