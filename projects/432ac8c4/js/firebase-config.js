// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Get current user's username from email (before @ symbol)
export function getCurrentUsername() {
    const user = auth.currentUser;
    if (user && user.email) {
        return user.email.split('@')[0];
    }
    return null;
}

// Get Firestore path for user's tasks
export function getUserTasksPath() {
    const username = getCurrentUsername();
    if (!username) {
        throw new Error('User not authenticated');
    }
    return `ccbotDev/${username}/apps/432ac8c4/tasks`;
}

console.log('Firebase initialized successfully');
