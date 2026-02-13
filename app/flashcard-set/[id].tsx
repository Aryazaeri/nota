import { IconSymbol } from '@/components/ui/icon-symbol';
import { createFlashcard, subscribeToFlashcards } from '@/src/services/binder';
import { Flashcard } from '@/src/types/binder';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function FlashcardSetScreen() {
    const { id: setId, title: setTitle, courseId, semesterId } = useLocalSearchParams<{ id: string, title: string, courseId: string, semesterId: string }>();

    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [frontText, setFrontText] = useState('');
    const [backText, setBackText] = useState('');

    // Study Mode State
    const [isStudyMode, setIsStudyMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (!courseId || !semesterId || !setId) return;

        const unsubscribe = subscribeToFlashcards(semesterId, courseId, setId, (data) => {
            setCards(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setId, courseId, semesterId]);

    const handleCreateCard = async () => {
        if (!frontText.trim() || !backText.trim() || !courseId || !semesterId || !setId) return;
        try {
            await createFlashcard(semesterId, courseId, setId, frontText, backText);
            setFrontText('');
            setBackText('');
            setIsAddModalVisible(false);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const toggleStudyMode = () => {
        if (cards.length === 0) {
            Alert.alert('Empty Set', 'Add some cards first!');
            return;
        }
        setIsStudyMode(!isStudyMode);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const handleNextCard = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            Alert.alert('Done!', 'You finished the set.', [
                { text: 'Restart', onPress: () => { setCurrentCardIndex(0); setIsFlipped(false); } },
                { text: 'Exit', onPress: () => setIsStudyMode(false) }
            ]);
        }
    };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const renderCardItem = ({ item }: { item: Flashcard }) => (
        <View style={styles.cardItem}>
            <View style={styles.cardSide}>
                <Text style={styles.cardLabel}>FRONT</Text>
                <Text style={styles.cardText}>{item.front}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardSide}>
                <Text style={styles.cardLabel}>BACK</Text>
                <Text style={styles.cardText}>{item.back}</Text>
            </View>
        </View>
    );

    // Render Study Mode
    if (isStudyMode && cards.length > 0) {
        const currentCard = cards[currentCardIndex];
        return (
            <View style={styles.studyContainer}>
                <Stack.Screen options={{ headerShown: false }} />

                <View style={styles.studyHeader}>
                    <TouchableOpacity onPress={toggleStudyMode} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.studyCounter}>{currentCardIndex + 1} / {cards.length}</Text>
                </View>

                <TouchableOpacity
                    style={styles.flashcardContainer}
                    activeOpacity={0.8}
                    onPress={() => setIsFlipped(!isFlipped)}
                >
                    <View style={[styles.flashcard, isFlipped ? styles.flashcardBack : styles.flashcardFront]}>
                        <Text style={styles.flashcardText}>
                            {isFlipped ? currentCard.back : currentCard.front}
                        </Text>
                        <Text style={styles.flipHint}>
                            {isFlipped ? '(Back)' : '(Front) - Tap to Flip'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.studyControls}>
                    <TouchableOpacity onPress={handlePrevCard} disabled={currentCardIndex === 0} style={[styles.controlButton, currentCardIndex === 0 && styles.controlDisabled]}>
                        <IconSymbol name="chevron.left" size={32} color={currentCardIndex === 0 ? "#444" : "#fff"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNextCard} style={styles.controlButton}>
                        <IconSymbol name="chevron.right" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: setTitle || 'Flashcard Set',
                    headerStyle: { backgroundColor: '#0A0A0A' },
                    headerTintColor: '#fff',
                    headerBackTitle: '',
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleStudyMode} style={styles.headerButton}>
                            <Text style={styles.headerButtonText}>Study</Text>
                            <IconSymbol name="play.fill" size={14} color="#007AFF" />
                        </TouchableOpacity>
                    )
                }}
            />

            <View style={[Platform.OS === 'web' ? styles.webContainer : { flex: 1 }]}>
                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={cards}
                        renderItem={renderCardItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={
                            <View style={styles.headerContainer}>
                                <Text style={styles.headerSubtitle}>{cards.length} Cards</Text>
                                <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
                                    <Text style={styles.addButtonText}>+ Add Card</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Empty Set</Text>
                                <Text style={styles.emptySubText}>Add your first flashcard to start studying.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Add Card Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>New Flashcard</Text>

                            <Text style={styles.inputLabel}>FRONT</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Term / Question"
                                placeholderTextColor="#666"
                                value={frontText}
                                onChangeText={setFrontText}
                                multiline
                                blurOnSubmit={true}
                            />

                            <Text style={styles.inputLabel}>BACK</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Definition / Answer"
                                placeholderTextColor="#666"
                                value={backText}
                                onChangeText={setBackText}
                                multiline
                                blurOnSubmit={true}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.createButton} onPress={handleCreateCard}>
                                    <Text style={styles.createButtonText}>Add Card</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
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
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    headerButtonText: {
        color: '#007AFF',
        fontWeight: '700',
        fontSize: 14,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    headerSubtitle: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#333',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#444'
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    cardItem: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardSide: {
        paddingVertical: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 12,
    },
    cardLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '700',
        marginBottom: 4,
    },
    cardText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 22,
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
        textAlign: 'center',
    },
    inputLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        backgroundColor: '#0A0A0A',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
        minHeight: 80,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    cancelButton: {
        padding: 16,
    },
    cancelButtonText: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    createButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    // Study Mode
    studyContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    studyHeader: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButton: {
        position: 'absolute',
        left: 20,
        padding: 10,
    },
    studyCounter: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
    flashcardContainer: {
        width: '85%',
        aspectRatio: 0.7,
        maxWidth: 400,
    },
    flashcard: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    flashcardFront: {
        // front styles
    },
    flashcardBack: {
        backgroundColor: '#222',
        borderColor: '#555',
    },
    flashcardText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    flipHint: {
        position: 'absolute',
        bottom: 24,
        color: '#666',
        fontSize: 12,
    },
    studyControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: 300,
        marginTop: 40,
    },
    controlButton: {
        padding: 20,
        borderRadius: 40,
        backgroundColor: '#1A1A1A',
    },
    controlDisabled: {
        opacity: 0.5,
    },
});
