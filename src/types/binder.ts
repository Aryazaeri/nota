export interface Note {
    id: string;
    title: string;
    content: string; // HTML or Markdown
    audioUrl?: string; // For Lecture Mode
    createdAt: number;
    updatedAt: number;
}

export interface Course {
    id: string;
    title: string;
    code: string; // e.g., "CS101"
    color: string; // Hex code for UI
    icon?: string; // Emoji or icon name
}

export interface Semester {
    id: string;
    title: string; // e.g., "Fall 2024"
    startDate: number;
    endDate: number;
    isActive: boolean;
}

export interface Assignment {
    id: string;
    title: string;
    dueDate: number; // timestamp
    isCompleted: boolean;
    courseId: string;
    semesterId: string;
    createdAt: number;
}

export interface FlashcardSet {
    id: string;
    title: string;
    courseId: string;
    semesterId: string;
    createdAt: number;
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    setId: string;
    createdAt: number;
}
