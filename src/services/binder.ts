import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Assignment, Course, Flashcard, FlashcardSet, Note, Semester } from '../types/binder';

// Helper to get user ID
const getUserId = () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("BinderService: User not authenticated!");
        throw new Error("User not authenticated");
    }
    console.log("BinderService: Current User ID:", user.uid);
    return user.uid;
};

// --- Semesters ---

export const createSemester = async (title: string, startDate: number, endDate: number) => {
    const userId = getUserId();
    console.log(`BinderService: Creating semester '${title}' for user ${userId}`);
    const semestersRef = collection(db, `users/${userId}/semesters`);
    try {
        const docRef = await addDoc(semestersRef, {
            title,
            startDate,
            endDate,
            isActive: true, // Default to active
            createdAt: Date.now()
        });
        console.log("BinderService: Semester created with ID:", docRef.id);
        return docRef;
    } catch (e) {
        console.error("BinderService: Error creating semester:", e);
        throw e;
    }
};

export const subscribeToSemesters = (callback: (semesters: Semester[]) => void) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => { };

    const semestersRef = collection(db, `users/${userId}/semesters`);
    const q = query(semestersRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const semesters = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Semester[];
        callback(semesters);
    });
};

// --- Courses ---

export const createCourse = async (semesterId: string, title: string, code: string, color: string) => {
    const userId = getUserId();
    const coursesRef = collection(db, `users/${userId}/semesters/${semesterId}/courses`);
    return await addDoc(coursesRef, {
        title,
        code,
        color,
        createdAt: Date.now()
    });
};

export const subscribeToCourses = (semesterId: string, callback: (courses: Course[]) => void) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => { };

    const coursesRef = collection(db, `users/${userId}/semesters/${semesterId}/courses`);
    const q = query(coursesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const courses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Course[];
        callback(courses);
    });
};

// --- Notes ---

export const createNote = async (semesterId: string, courseId: string, title: string) => {
    const userId = getUserId();
    const notesRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/notes`);
    const docRef = await addDoc(notesRef, {
        title,
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    return docRef;
};

export const subscribeToNotes = (semesterId: string, courseId: string, callback: (notes: Note[]) => void) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => { };

    const notesRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/notes`);
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Note[];
        callback(notes);
    });
};

export const updateNote = async (semesterId: string, courseId: string, noteId: string, content: string, title?: string) => {
    const userId = getUserId();
    const noteRef = doc(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/notes/${noteId}`);

    const updateData: any = {
        content,
        updatedAt: Date.now()
    };
    if (title) updateData.title = title;

    await updateDoc(noteRef, updateData);
};

// --- Assignments ---

export const createAssignment = async (semesterId: string, courseId: string, title: string, dueDate: number) => {
    const userId = getUserId();
    const listRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/assignments`);
    return await addDoc(listRef, {
        title,
        dueDate,
        isCompleted: false,
        courseId,
        semesterId,
        createdAt: Date.now()
    });
};

export const subscribeToAssignments = (semesterId: string, courseId: string, callback: (assignments: Assignment[]) => void) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => { };

    const listRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/assignments`);
    const q = query(listRef, orderBy('dueDate', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Assignment[];
        callback(data);
    });
};

export const toggleAssignment = async (semesterId: string, courseId: string, assignmentId: string, currentStatus: boolean) => {
    const userId = getUserId();
    const ref = doc(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/assignments/${assignmentId}`);
    await updateDoc(ref, { isCompleted: !currentStatus });
};

// --- Flashcards ---

export const createFlashcardSet = async (semesterId: string, courseId: string, title: string) => {
    const userId = getUserId();
    const listRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/flashcardSets`);
    return await addDoc(listRef, {
        title,
        courseId,
        semesterId,
        createdAt: Date.now()
    });
};

export const subscribeToFlashcardSets = (semesterId: string, courseId: string, callback: (sets: FlashcardSet[]) => void) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => { };

    const listRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/flashcardSets`);
    const q = query(listRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FlashcardSet[];
        callback(data);
    });
};

export const createFlashcard = async (semesterId: string, courseId: string, setId: string, front: string, back: string) => {
    const userId = getUserId();
    const listRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/flashcardSets/${setId}/cards`);
    return await addDoc(listRef, {
        front,
        back,
        setId,
        createdAt: Date.now()
    });
};

export const subscribeToFlashcards = (semesterId: string, courseId: string, setId: string, callback: (cards: Flashcard[]) => void) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => { };

    const listRef = collection(db, `users/${userId}/semesters/${semesterId}/courses/${courseId}/flashcardSets/${setId}/cards`);
    const q = query(listRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Flashcard[];
        callback(data);
    });
};
