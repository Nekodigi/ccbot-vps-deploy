import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { getCollectionPath } from './firebase-config.js';

let db = null;
let currentUsername = 'nekokazu';

export function initDatabase(app) {
    db = getFirestore(app);
    return db;
}

export function setUsername(username) {
    currentUsername = username;
}

export async function saveData(title, content) {
    if (!db) throw new Error('Database not initialized');

    try {
        const collectionRef = collection(db, getCollectionPath(currentUsername));
        const docRef = await addDoc(collectionRef, {
            title: title,
            content: content,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving data:', error);
        throw new Error('データの保存に失敗しました: ' + error.message);
    }
}

export async function loadData() {
    if (!db) throw new Error('Database not initialized');

    try {
        const collectionRef = collection(db, getCollectionPath(currentUsername));
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            data.push({
                id: doc.id,
                title: docData.title,
                content: docData.content,
                createdAt: docData.createdAt?.toDate() || new Date()
            });
        });

        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        throw new Error('データの読み込みに失敗しました: ' + error.message);
    }
}

export async function deleteData(docId) {
    if (!db) throw new Error('Database not initialized');

    try {
        const docRef = doc(db, getCollectionPath(currentUsername), docId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting data:', error);
        throw new Error('データの削除に失敗しました: ' + error.message);
    }
}
