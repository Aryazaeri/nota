import { DeckCard, deleteDeck, subscribeToDeckCards } from '@/src/services/decks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeckScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cards, setCards] = useState<DeckCard[]>([]);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToDeckCards(id, setCards);
    return () => unsub();
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete deck?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDeck(id!);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.inner, isWeb && styles.webInner]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.h1}>{cards.length} cards</Text>

        <TouchableOpacity
          style={styles.studyBtn}
          onPress={() => router.push({ pathname: '/study/[id]', params: { id: id! } })}
          disabled={cards.length === 0}
        >
          <Text style={styles.studyBtnText}>Start studying →</Text>
        </TouchableOpacity>

        <FlatList
          data={cards}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.cardIndex}>#{index + 1}</Text>
              <Text style={styles.cardFront}>{item.front}</Text>
              <View style={styles.divider} />
              <Text style={styles.cardBack}>{item.back}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No cards in this deck.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flex: 1, padding: 20 },
  webInner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { paddingVertical: 6 },
  backText: { color: '#fff', fontSize: 15 },
  deleteText: { color: '#ff4d4d', fontSize: 15, fontWeight: '600' },
  h1: { fontSize: 28, fontWeight: '800', color: '#fff', marginVertical: 12 },
  studyBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  studyBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardIndex: { color: '#555', fontSize: 12, marginBottom: 6 },
  cardFront: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#2a2a2a', marginVertical: 10 },
  cardBack: { color: '#bbb', fontSize: 15, lineHeight: 21 },
  empty: { color: '#666', textAlign: 'center', marginTop: 60 },
});
