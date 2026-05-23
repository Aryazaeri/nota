import OpenAI from "openai";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const SYSTEM_PROMPT = `You generate high-quality study flashcards from source material.

Rules for cards:
- Atomic: each card tests ONE specific fact, concept, or relationship.
- Front is a clear question or prompt; back is a concise answer (1-2 sentences max).
- Avoid yes/no questions. Prefer "What", "Why", "How", "Define".
- No trivia about formatting, page numbers, or the source itself.
- If the source is too thin to make good cards, return fewer cards rather than padding.

Return ONLY valid JSON in this exact shape, no prose:
{"cards": [{"front": "...", "back": "..."}]}`;

function initFirebaseAdmin() {
  if (getApps().length > 0) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env var missing");
  const serviceAccount = JSON.parse(raw);
  initializeApp({ credential: cert(serviceAccount) });
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, content-type",
      "access-control-allow-methods": "POST, OPTIONS",
    },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return json(204, {});
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return json(401, { error: "Missing auth token" });

  try {
    initFirebaseAdmin();
    await getAuth().verifyIdToken(token);
  } catch (e) {
    return json(401, { error: "Invalid auth token" });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const { text, count = 10 } = body ?? {};
  if (typeof text !== "string" || text.trim().length < 50) {
    return json(400, { error: "Provide at least 50 characters of notes." });
  }
  if (text.length > 20000) {
    return json(400, { error: "Notes too long (max 20000 chars)." });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let raw;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate up to ${count} flashcards from these notes:\n\n${text}` },
      ],
    });
    raw = completion.choices[0]?.message?.content;
  } catch (e) {
    return json(502, { error: "Model request failed", detail: String(e?.message ?? e) });
  }

  if (!raw) return json(502, { error: "Empty response from model" });

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json(502, { error: "Model returned invalid JSON" });
  }

  const cards = (parsed.cards ?? []).filter(
    (c) => c && typeof c.front === "string" && typeof c.back === "string"
  );
  if (cards.length === 0) return json(502, { error: "No valid cards generated" });

  return json(200, { cards });
}

export const config = { path: "/api/generate-flashcards" };
