import { createSemester, subscribeToSemesters } from '@/src/services/binder';
import { Semester } from '@/src/types/binder';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabOneScreen() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSemesterTitle, setNewSemesterTitle] = useState('');

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const effectiveWidth = isWeb && width > 768 ? width - 250 : width; // account for sidebar
  const numColumns = isWeb && effectiveWidth > 1000 ? 4 : isWeb && effectiveWidth > 700 ? 3 : isWeb && effectiveWidth > 500 ? 2 : 1;

  useEffect(() => {
    const unsubscribe = subscribeToSemesters((data) => {
      setSemesters(data);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateSemester = async () => {
    if (!newSemesterTitle.trim()) return;
    try {
      await createSemester(newSemesterTitle, Date.now(), Date.now() + 1000 * 60 * 60 * 24 * 90); // default 90 days
      setNewSemesterTitle('');
      setIsModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const renderSemester = ({ item }: { item: Semester }) => (
    <TouchableOpacity
      style={[styles.card, numColumns > 1 && { flex: 1, margin: 8 }]}
      onPress={() => {
        router.push({
          pathname: '/semester/[id]',
          params: { id: item.id, title: item.title }
        });
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.isActive && <View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View>}
      </View>
      <Text style={styles.cardSubtitle}>Tap to view courses</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.activeContainer, isWeb && styles.webContainer]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Binders</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          key={numColumns} // Force re-render on column change
          data={semesters}
          renderItem={renderSemester}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { justifyContent: 'flex-start', gap: 16 } : undefined}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No semesters yet. Start by adding one!</Text>
            </View>
          }
        />
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Semester</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Fall 2024"
                placeholderTextColor="#666"
                value={newSemesterTitle}
                onChangeText={setNewSemesterTitle}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateSemester}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateSemester}>
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  activeContainer: {
    flex: 1,
  },
  webContainer: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  activeBadge: {
    backgroundColor: '#32CD32', // Lime Green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
