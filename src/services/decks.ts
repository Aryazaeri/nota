import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export interface Deck {
  id: string;
  title: string;
  cardCount: number;
  createdAt: number;
}

export interface DeckCard {
  id: string;
  front: string;
  back: string;
  createdAt: number;
}

function userId() {
  const u = auth.currentUser;
  if (!u) throw new Error('Not signed in');
  return u.uid;
}

export async function createDeck(
  title: string,
  cards: { front: string; back: string }[]
): Promise<string> {
  const uid = userId();
  const decksRef = collection(db, `users/${uid}/decks`);
  const deckDoc = await addDoc(decksRef, {
    title,
    cardCount: cards.length,
    createdAt: Date.now(),
  });

  const batch = writeBatch(db);
  const now = Date.now();
  cards.forEach((c, i) => {
    const cardRef = doc(collection(db, `users/${uid}/decks/${deckDoc.id}/cards`));
    batch.set(cardRef, { front: c.front, back: c.back, createdAt: now + i });
  });
  await batch.commit();

  return deckDoc.id;
}

export function subscribeToDecks(callback: (decks: Deck[]) => void) {
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};
  const q = query(collection(db, `users/${uid}/decks`), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Deck)));
  });
}

export function subscribeToDeckCards(
  deckId: string,
  callback: (cards: DeckCard[]) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};
  const q = query(
    collection(db, `users/${uid}/decks/${deckId}/cards`),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DeckCard)));
  });
}

export async function deleteDeck(deckId: string) {
  const uid = userId();
  const cardsSnap = await getDocs(collection(db, `users/${uid}/decks/${deckId}/cards`));
  const batch = writeBatch(db);
  cardsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, `users/${uid}/decks/${deckId}`));
  await batch.commit();
}
