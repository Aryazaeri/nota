# Nota

**Nota** is a comprehensive study companion app built with Expo and React Native. It organizes your academic life by semesters and courses, offering tools for note-taking and flashcards to boost your learning.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📚 Features

- **Semester Management**: Organize your courses by active semesters (e.g., "Fall 2024").
- **Course Organization**: Create binders for each course to keep materials sorted.
- **Flashcards**: Built-in flashcard tool for active recall study sessions.
- **Note Taking**: Rich text or markdown support for lecture notes.
- **Cross-Platform**: Runs on iOS, Android, and Web via Expo.
- **Cloud Sync**: (In Progress) Firebase integration for data persistence across devices.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Backend**: [Firebase](https://firebase.google.com/) (Firestore/Auth)
- **Language**: TypeScript

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/nota.git
    cd nota
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npx expo start
    ```
    - Press `i` for iOS Simulator
    - Press `a` for Android Emulator
    - Press `w` for Web

## 📱 Architecture

- `app/`: File-based routes (screens).
- `components/`: Reusable UI components.
- `services/`: Firebase and business logic.
- `types/`: TypeScript definitions.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
