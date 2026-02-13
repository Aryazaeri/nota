import { IconSymbol } from '@/components/ui/icon-symbol';
import { createAssignment, createFlashcardSet, createNote, subscribeToAssignments, subscribeToFlashcardSets, subscribeToNotes, toggleAssignment } from '@/src/services/binder';
import { Assignment, FlashcardSet, Note } from '@/src/types/binder';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

type Tab = 'notes' | 'assignments' | 'flashcards';

export default function CourseDetailScreen() {
    const router = useRouter();
    const { id: courseId, title: courseTitle, semesterId } = useLocalSearchParams<{ id: string, title: string, semesterId: string }>();

    const [activeTab, setActiveTab] = useState<Tab>('notes');
    const [notes, setNotes] = useState<Note[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');

    useEffect(() => {
        if (!courseId || !semesterId) return;

        const unsubscribeNotes = subscribeToNotes(semesterId, courseId, (data) => {
            setNotes(data);
            if (activeTab === 'notes') setLoading(false);
        });

        const unsubscribeAssignments = subscribeToAssignments(semesterId, courseId, (data) => {
            setAssignments(data);
            if (activeTab === 'assignments') setLoading(false);
        });

        const unsubscribeFlashcards = subscribeToFlashcardSets(semesterId, courseId, (data) => {
            setFlashcardSets(data);
            if (activeTab === 'flashcards') setLoading(false);
        });

        return () => {
            unsubscribeNotes();
            unsubscribeAssignments();
            unsubscribeFlashcards();
        };
    }, [courseId, semesterId]);

    useEffect(() => {
        setLoading(false);
    }, [activeTab]);

    const handleCreate = async () => {
        if (!newItemTitle.trim() || !courseId || !semesterId) return;
        try {
            if (activeTab === 'notes') {
                await createNote(semesterId, courseId, newItemTitle);
            } else if (activeTab === 'assignments') {
                const dueDate = Date.now() + 86400000;
                await createAssignment(semesterId, courseId, newItemTitle, dueDate);
            } else {
                await createFlashcardSet(semesterId, courseId, newItemTitle);
            }
            setNewItemTitle('');
            setIsModalVisible(false);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const handleToggleAssignment = async (id: string, currentStatus: boolean) => {
        if (!courseId || !semesterId) return;
        try {
            await toggleAssignment(semesterId, courseId, id, currentStatus);
        } catch (e) {
            console.error(e);
        }
    };

    const renderNote = ({ item }: { item: Note }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                router.push({
                    pathname: '/note/[id]',
                    params: { id: item.id, title: item.title, courseId, semesterId }
                });
            }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#333' }]}>
                    <IconSymbol name="note.text" size={24} color="#FFF" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.date}>
                        {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#666" />
        </TouchableOpacity>
    );

    const renderAssignment = ({ item }: { item: Assignment }) => (
        <TouchableOpacity
            style={[styles.card, item.isCompleted && styles.completedCard]}
            onPress={() => handleToggleAssignment(item.id, item.isCompleted)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, item.isCompleted ? styles.completedIcon : styles.assignmentIcon]}>
                    <IconSymbol
                        name={item.isCompleted ? "checkmark.circle.fill" : "circle"}
                        size={24}
                        color={item.isCompleted ? "#4CD964" : "#FF9500"}
                    />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.title, item.isCompleted && styles.completedText]}>{item.title}</Text>
                    <Text style={styles.date}>
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Link to Flashcard Set Screen
    const renderFlashcardSet = ({ item }: { item: FlashcardSet }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                router.push({
                    pathname: '/flashcard-set/[id]',
                    params: { id: item.id, title: item.title, courseId, semesterId }
                });
            }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#0044CC' }]}>
                    <IconSymbol name="rectangle.on.rectangle" size={24} color="#FFF" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.date}>Flashcards</Text>
                </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#666" />
        </TouchableOpacity>
    );

    const getEmptyText = () => {
        if (activeTab === 'notes') return 'No notes yet.';
        if (activeTab === 'assignments') return 'No assignments yet.';
        return 'No flashcard sets yet.';
    };

    const getEmptySubText = () => {
        if (activeTab === 'notes') return 'Start typing or recording a lecture.';
        if (activeTab === 'assignments') return 'Add your first assignment.';
        return 'Create a set to start studying.';
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: courseTitle || 'Course',
                    headerStyle: { backgroundColor: '#0A0A0A' },
                    headerTintColor: '#fff',
                    headerBackTitle: '',
                }}
            />

            <View style={[Platform.OS === 'web' ? styles.webContainer : { flex: 1 }]}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
                        onPress={() => setActiveTab('notes')}
                    >
                        <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
                        onPress={() => setActiveTab('assignments')}
                    >
                        <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>Assignments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]}
                        onPress={() => setActiveTab('flashcards')}
                    >
                        <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>Flashcards</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        {activeTab === 'notes' && (
                            <FlatList
                                data={notes}
                                renderItem={renderNote}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listContent}
                                ListHeaderComponent={
                                    <View style={styles.headerContainer}>
                                        <Text style={styles.headerSubtitle}>Lecture Notes</Text>
                                        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                                            <Text style={styles.addButtonText}>+ New Note</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>{getEmptyText()}</Text>
                                        <Text style={styles.emptySubText}>{getEmptySubText()}</Text>
                                    </View>
                                }
                            />
                        )}
                        {activeTab === 'assignments' && (
                            <FlatList
                                data={assignments}
                                renderItem={renderAssignment}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listContent}
                                ListHeaderComponent={
                                    <View style={styles.headerContainer}>
                                        <Text style={styles.headerSubtitle}>Assignments</Text>
                                        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                                            <Text style={styles.addButtonText}>+ New Task</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>{getEmptyText()}</Text>
                                        <Text style={styles.emptySubText}>{getEmptySubText()}</Text>
                                    </View>
                                }
                            />
                        )}
                        {activeTab === 'flashcards' && (
                            <FlatList
                                data={flashcardSets}
                                renderItem={renderFlashcardSet}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listContent}
                                ListHeaderComponent={
                                    <View style={styles.headerContainer}>
                                        <Text style={styles.headerSubtitle}>Study Sets</Text>
                                        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                                            <Text style={styles.addButtonText}>+ New Set</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>{getEmptyText()}</Text>
                                        <Text style={styles.emptySubText}>{getEmptySubText()}</Text>
                                    </View>
                                }
                            />
                        )}
                    </>
                )}
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
                            <Text style={styles.modalTitle}>New {activeTab === 'notes' ? 'Note' : activeTab === 'assignments' ? 'Assignment' : 'Set'}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Title"
                                placeholderTextColor="#666"
                                value={newItemTitle}
                                onChangeText={setNewItemTitle}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleCreate}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                                    <Text style={styles.createButtonText}>Create</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    webContainer: {
        width: '100%',
        maxWidth: 800,
        alignSelf: 'center',
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        marginBottom: 8, // Added margin
    },
    tab: {
        paddingVertical: 10,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#fff',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 8,
    },
    headerSubtitle: {
        color: '#888',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
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
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    completedCard: {
        opacity: 0.5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    assignmentIcon: {
        backgroundColor: '#553300', // darker orange bg
    },
    completedIcon: {
        backgroundColor: '#113311',
    },
    info: {
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
    emptyState: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubText: {
        color: '#666',
        fontSize: 14,
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
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
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
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 8,
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
