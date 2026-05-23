import { generateFlashcards } from '@/src/services/ai';
import { createDeck } from '@/src/services/decks';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GenerateScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const isWeb = Platform.OS === 'web';
  const charCount = text.length;
  const canGenerate = charCount >= 50 && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const cards = await generateFlashcards(text.trim(), count);
      const deckTitle = title.trim() || autoTitle(text);
      const deckId = await createDeck(deckTitle, cards);
      setText('');
      setTitle('');
      router.push({ pathname: '/deck/[id]', params: { id: deckId } });
    } catch (e: any) {
      Alert.alert('Could not generate', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, isWeb && styles.webContent]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.h1}>Notes → Flashcards</Text>
        <Text style={styles.sub}>Paste your lecture notes. We'll turn them into a study deck.</Text>

        <TextInput
          style={styles.titleInput}
          placeholder="Deck title (optional)"
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        <TextInput
          style={styles.textarea}
          placeholder="Paste lecture notes, a textbook section, a study guide..."
          placeholderTextColor="#555"
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.row}>
          <Text style={styles.meta}>
            {charCount} chars {charCount < 50 ? `· need ${50 - charCount} more` : ''}
          </Text>
          <View style={styles.countRow}>
            <Text style={styles.countLabel}>Cards:</Text>
            {[5, 10, 20].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setCount(n)}
                style={[styles.countChip, count === n && styles.countChipActive]}
              >
                <Text style={[styles.countChipText, count === n && styles.countChipTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !canGenerate && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Generate flashcards</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function autoTitle(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? '';
  if (firstLine.length > 0 && firstLine.length <= 60) return firstLine;
  const words = text.trim().split(/\s+/).slice(0, 6).join(' ');
  return words || 'Untitled deck';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20, paddingBottom: 60 },
  webContent: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  h1: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 12 },
  sub: { fontSize: 15, color: '#888', marginTop: 6, marginBottom: 24 },
  titleInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  textarea: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    minHeight: 240,
    marginBottom: 12,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  meta: { color: '#666', fontSize: 13 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countLabel: { color: '#888', fontSize: 13, marginRight: 4 },
  countChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1A1A1A',
  },
  countChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  countChipText: { color: '#888', fontSize: 13, fontWeight: '600' },
  countChipTextActive: { color: '#000' },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#333' },
  buttonText: { color: '#000', fontSize: 17, fontWeight: '700' },
});
