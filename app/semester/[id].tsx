import { createCourse, subscribeToCourses } from '@/src/services/binder';
import { Course } from '@/src/types/binder';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function SemesterDetailScreen() {
    const router = useRouter();
    const { id: semesterId, title: semesterTitle } = useLocalSearchParams<{ id: string, title: string }>();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // New Course Form State
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseCode, setNewCourseCode] = useState('');

    useEffect(() => {
        if (!semesterId) return;
        const unsubscribe = subscribeToCourses(semesterId, (data) => {
            setCourses(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [semesterId]);

    const handleCreateCourse = async () => {
        if (!newCourseTitle.trim() || !semesterId) return;
        try {
            // Random pastel color generator for course cards
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            await createCourse(semesterId, newCourseTitle, newCourseCode || '101', randomColor);
            setNewCourseTitle('');
            setNewCourseCode('');
            setIsModalVisible(false);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const renderCourse = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => {
                router.push({
                    pathname: '/course/[id]',
                    params: { id: item.id, title: item.title, semesterId: semesterId }
                });
            }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.courseIcon, { color: item.color }]}>
                        {item.title.substring(0, 2).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{item.title}</Text>
                    <Text style={styles.courseCode}>{item.code}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen options={{
                title: semesterTitle || 'Semester',
                headerStyle: { backgroundColor: '#0A0A0A' },
                headerTintColor: '#fff',
                headerBackTitle: 'Back',
            }} />

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
                ) : (
                    <View style={Platform.OS === 'web' ? styles.webContainer : { flex: 1 }}>
                        <FlatList
                            data={courses}
                            renderItem={renderCourse}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            ListHeaderComponent={
                                <View style={styles.headerContainer}>
                                    <Text style={styles.headerSubtitle}>Manage your courses</Text>
                                    <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                                        <Text style={styles.addButtonText}>+ Add Course</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No courses yet.</Text>
                                    <Text style={styles.emptySubText}>Add a course to start taking notes.</Text>
                                </View>
                            }
                        />
                    </View>
                )}

                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>New Course</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Course Name (e.g. Calculus)"
                                    placeholderTextColor="#666"
                                    value={newCourseTitle}
                                    onChangeText={setNewCourseTitle}
                                    autoFocus
                                    returnKeyType="next"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Course Code (e.g. MATH101)"
                                    placeholderTextColor="#666"
                                    value={newCourseCode}
                                    onChangeText={setNewCourseCode}
                                    returnKeyType="done"
                                    onSubmitEditing={handleCreateCourse}
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.createButton} onPress={handleCreateCourse}>
                                        <Text style={styles.createButtonText}>Create</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    webContainer: {
        width: '100%',
        maxWidth: 1024,
        alignSelf: 'center',
        paddingHorizontal: 20,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerSubtitle: {
        color: '#888',
        fontSize: 16,
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
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeftWidth: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseIcon: {
        fontSize: 20,
        fontWeight: '800',
    },
    courseInfo: {
        gap: 4,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    courseCode: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
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
        maxWidth: 500, // Constraint modal too
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
