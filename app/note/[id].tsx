import { updateNote } from '@/src/services/binder';
import { Stack, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function NoteEditorScreen() {
    const { id: noteId, title: initialTitle, courseId, semesterId } = useLocalSearchParams<{ id: string, title: string, courseId: string, semesterId: string }>();

    const [title, setTitle] = useState(initialTitle || '');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Fetch initial content
        const fetchNote = async () => {
            if (!auth.currentUser || !semesterId || !courseId || !noteId) return;
            try {
                const noteRef = doc(db, `users/${auth.currentUser.uid}/semesters/${semesterId}/courses/${courseId}/notes/${noteId}`);
                const snap = await getDoc(noteRef);
                if (snap.exists()) {
                    setContent(snap.data().content || '');
                    setTitle(snap.data().title || initialTitle);
                }
            } catch (e) {
                console.error("Error fetching note:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [noteId]);

    // Auto-save logic
    const handleContentChange = (text: string) => {
        setContent(text);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            saveNote(text, title);
        }, 1000);
    };

    const handleTitleChange = (text: string) => {
        setTitle(text);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            saveNote(content, text);
        }, 1000);
    };

    const saveNote = async (text: string, currentTitle: string) => {
        if (!courseId || !semesterId || !noteId) return;
        try {
            await updateNote(semesterId, courseId, noteId, text, currentTitle);
        } catch (e) {
            console.error("Error saving note:", e);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <Stack.Screen
                options={{
                    headerTitle: '',
                    headerStyle: { backgroundColor: '#0A0A0A' },
                    headerTintColor: '#fff',
                    headerBackTitle: '',
                }}
            />

            <View style={[Platform.OS === 'web' ? styles.webContainer : { flex: 1 }]}>
                <TextInput
                    style={styles.titleInput}
                    value={title}
                    onChangeText={handleTitleChange}
                    placeholder="Note Title"
                    placeholderTextColor="#666"
                    multiline
                />

                <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
                    <TextInput
                        style={styles.contentInput}
                        value={content}
                        onChangeText={handleContentChange}
                        placeholder="Start typing your notes here..."
                        placeholderTextColor="#444"
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        padding: 20,
        paddingBottom: 10,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        color: '#ddd',
        padding: 20,
        paddingTop: 0,
        minHeight: 300,
        lineHeight: 24,
    },
});
