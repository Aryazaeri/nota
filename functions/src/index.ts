import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

interface GenerateFlashcardsRequest {
  text: string;
  count?: number;
}

interface Flashcard {
  front: string;
  back: string;
}

const SYSTEM_PROMPT = `You generate high-quality study flashcards from source material.

Rules for cards:
- Atomic: each card tests ONE specific fact, concept, or relationship.
- Front is a clear question or prompt; back is a concise answer (1-2 sentences max).
- Avoid yes/no questions. Prefer "What", "Why", "How", "Define".
- No trivia about formatting, page numbers, or the source itself.
- If the source is too thin to make good cards, return fewer cards rather than padding.

Return ONLY valid JSON in this exact shape, no prose:
{"cards": [{"front": "...", "back": "..."}]}`;

export const generateFlashcards = onCall(
  { secrets: [OPENAI_API_KEY], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in to generate flashcards.");
    }

    const { text, count = 10 } = (request.data ?? {}) as GenerateFlashcardsRequest;

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      throw new HttpsError("invalid-argument", "Provide at least 50 characters of notes.");
    }
    if (text.length > 20000) {
      throw new HttpsError("invalid-argument", "Notes too long (max 20000 chars).");
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate up to ${count} flashcards from these notes:\n\n${text}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new HttpsError("internal", "Empty response from model.");
    }

    let parsed: { cards?: Flashcard[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new HttpsError("internal", "Model returned invalid JSON.");
    }

    const cards = (parsed.cards ?? []).filter(
      (c) => c && typeof c.front === "string" && typeof c.back === "string"
    );

    if (cards.length === 0) {
      throw new HttpsError("internal", "No valid cards generated.");
    }

    return { cards };
  }
);
