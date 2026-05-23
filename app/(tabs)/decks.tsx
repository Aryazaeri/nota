import { Deck, subscribeToDecks } from '@/src/services/decks';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DecksScreen() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    const unsub = subscribeToDecks(setDecks);
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.inner, isWeb && styles.webInner]}>
        <Text style={styles.h1}>My Decks</Text>
        <FlatList
          data={decks}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/deck/[id]', params: { id: item.id } })}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.cardCount} cards</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No decks yet. Generate one from the Home tab.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flex: 1, padding: 20 },
  webInner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  h1: { fontSize: 28, fontWeight: '800', color: '#fff', marginVertical: 12 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cardMeta: { color: '#888', fontSize: 13, marginTop: 4 },
  empty: { marginTop: 80, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 15 },
});
