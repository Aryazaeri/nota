import { DeckCard, subscribeToDeckCards } from '@/src/services/decks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToDeckCards(id, setCards);
    return () => unsub();
  }, [id]);

  const current = cards[index];
  const total = cards.length;
  const done = total > 0 && index >= total;

  const next = (markKnown: boolean) => {
    if (!current) return;
    if (markKnown) {
      setKnownIds((s) => new Set(s).add(current.id));
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setKnownIds(new Set());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.inner, isWeb && styles.webInner]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          {total > 0 && !done && (
            <Text style={styles.progress}>
              {index + 1} / {total}
            </Text>
          )}
        </View>

        {done ? (
          <View style={styles.doneBox}>
            <Text style={styles.doneTitle}>Session complete</Text>
            <Text style={styles.doneStats}>
              You marked {knownIds.size} of {total} as known.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={restart}>
              <Text style={styles.primaryBtnText}>Study again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
              <Text style={styles.secondaryBtnText}>Back to deck</Text>
            </TouchableOpacity>
          </View>
        ) : current ? (
          <>
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => setFlipped((f) => !f)}
            >
              <Text style={styles.cardLabel}>{flipped ? 'ANSWER' : 'QUESTION'}</Text>
              <Text style={styles.cardText}>{flipped ? current.back : current.front}</Text>
              <Text style={styles.tapHint}>Tap to flip</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.againBtn]} onPress={() => next(false)}>
                <Text style={styles.againText}>Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.knownBtn]} onPress={() => next(true)}>
                <Text style={styles.knownText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.empty}>Loading...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flex: 1, padding: 20 },
  webInner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: '#fff', fontSize: 15 },
  progress: { color: '#888', fontSize: 14 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333',
    padding: 28,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  cardLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 18 },
  cardText: { color: '#fff', fontSize: 22, fontWeight: '600', textAlign: 'center', lineHeight: 30 },
  tapHint: { color: '#444', fontSize: 12, marginTop: 24 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  actionBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  againBtn: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#444' },
  againText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  knownBtn: { backgroundColor: '#fff' },
  knownText: { color: '#000', fontSize: 16, fontWeight: '700' },
  empty: { color: '#666', textAlign: 'center', marginTop: 80 },
  doneBox: { marginTop: 80, alignItems: 'center' },
  doneTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 10 },
  doneStats: { color: '#888', fontSize: 15, marginBottom: 32 },
  primaryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingHorizontal: 32, paddingVertical: 14 },
  secondaryBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
});
