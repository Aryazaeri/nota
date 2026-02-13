import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, browserLocalPersistence, getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyByqWbV6vt3gILu7y0qKe23xSXFb9hwXhU",
    authDomain: "nota-student-app-alpha.firebaseapp.com",
    projectId: "nota-student-app-alpha",
    storageBucket: "nota-student-app-alpha.firebasestorage.app",
    messagingSenderId: "1034675437134",
    appId: "1:1034675437134:web:71d7d342edadafb5c8cd1f"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
    auth.setPersistence(browserLocalPersistence);
} else {
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
    } catch (e) {
        console.error("Firebase Auth Persistence Init Failed:", e);
        auth = getAuth(app);
    }
}

export { auth };
export const db = getFirestore(app);
