import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = getUserId();
const notesCollection = collection(db, `/ccbotDev/${userId}/apps/58de9838`);

const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const notesList = document.getElementById('notesList');

function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

async function saveNote() {
    const content = noteInput.value.trim();

    if (!content) {
        alert('メモの内容を入力してください');
        return;
    }

    try {
        await addDoc(notesCollection, {
            content: content,
            createdAt: serverTimestamp()
        });

        noteInput.value = '';
    } catch (error) {
        console.error('メモの保存に失敗しました:', error);
        alert('メモの保存に失敗しました');
    }
}

async function deleteNote(noteId) {
    if (!confirm('このメモを削除しますか?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, `/ccbotDev/${userId}/apps/58de9838`, noteId));
    } catch (error) {
        console.error('メモの削除に失敗しました:', error);
        alert('メモの削除に失敗しました');
    }
}

function formatDate(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function renderNotes(notes) {
    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state">まだメモがありません</div>';
        return;
    }

    notesList.innerHTML = notes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <span class="note-timestamp">${formatDate(note.createdAt)}</span>
                <button class="btn btn-danger" onclick="window.deleteNoteById('${note.id}')">削除</button>
            </div>
            <div class="note-content">${escapeHtml(note.content)}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.deleteNoteById = deleteNote;

saveBtn.addEventListener('click', saveNote);

noteInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        saveNote();
    }
});

const q = query(notesCollection, orderBy('createdAt', 'desc'));

onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    renderNotes(notes);
}, (error) => {
    console.error('メモの取得に失敗しました:', error);
    notesList.innerHTML = '<div class="empty-state">メモの読み込みに失敗しました</div>';
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
