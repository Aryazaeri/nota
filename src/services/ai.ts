import { auth } from '../../firebaseConfig';

const API_BASE = 'https://notabyarya.netlify.app';

export interface GeneratedCard {
  front: string;
  back: string;
}

export async function generateFlashcards(text: string, count = 10): Promise<GeneratedCard[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');

  const token = await user.getIdToken();

  const res = await fetch(`${API_BASE}/api/generate-flashcards`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, count }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error ?? body?.detail ?? '';
    } catch {}
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const data = await res.json();
  return data.cards as GeneratedCard[];
}
