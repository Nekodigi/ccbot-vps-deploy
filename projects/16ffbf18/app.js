// app.js - Main Application Module for Information Management
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let db;
let currentUser;
let unsubscribeSnapshot = null;

// Wait for user authentication
function waitForAuth() {
    return new Promise((resolve) => {
        window.addEventListener('user-authenticated', (e) => {
            currentUser = e.detail.user;
            resolve();
        });
    });
}

// Initialize app module
async function initApp() {
    await waitForAuth();
    db = window.firebaseDb;

    // UI Elements
    const infoTitle = document.getElementById('info-title');
    const infoContent = document.getElementById('info-content');
    const addInfoBtn = document.getElementById('add-info-btn');
    const infoList = document.getElementById('info-list');
    const noInfoMessage = document.getElementById('no-info-message');
    const searchInput = document.getElementById('search-input');

    let allInfoItems = [];

    // Get user's collection path
    function getUserCollectionPath() {
        const username = currentUser.email.split('@')[0];
        return `ccbotDev/${username}/apps/16ffbf18/information`;
    }

    // Add new information
    addInfoBtn.addEventListener('click', async () => {
        const title = infoTitle.value.trim();
        const content = infoContent.value.trim();

        if (!title || !content) {
            alert('タイトルと内容を入力してください。');
            return;
        }

        try {
            addInfoBtn.disabled = true;
            addInfoBtn.textContent = '追加中...';

            const collectionPath = getUserCollectionPath();
            const infoRef = collection(db, collectionPath);

            await addDoc(infoRef, {
                title: title,
                content: content,
                createdAt: serverTimestamp(),
                userId: currentUser.uid,
                userEmail: currentUser.email
            });

            // Clear form
            infoTitle.value = '';
            infoContent.value = '';

            // Hide AI suggestion if visible
            const aiSuggestion = document.getElementById('ai-suggestion');
            if (aiSuggestion) {
                aiSuggestion.style.display = 'none';
            }

        } catch (error) {
            console.error('Error adding information:', error);
            alert('情報の追加に失敗しました。Firestoreのアクセス権限を確認してください。');
        } finally {
            addInfoBtn.disabled = false;
            addInfoBtn.textContent = '追加';
        }
    });

    // Load information items with real-time updates
    function loadInformation() {
        try {
            const collectionPath = getUserCollectionPath();
            const infoRef = collection(db, collectionPath);
            const q = query(infoRef, orderBy('createdAt', 'desc'));

            // Set up real-time listener
            unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                allInfoItems = [];

                snapshot.forEach((docSnap) => {
                    allInfoItems.push({
                        id: docSnap.id,
                        ...docSnap.data()
                    });
                });

                displayInformation(allInfoItems);
            }, (error) => {
                console.error('Error loading information:', error);
                // Show empty state on error
                infoList.innerHTML = '';
                noInfoMessage.style.display = 'block';
                noInfoMessage.textContent = '情報の読み込みに失敗しました。Firestoreのアクセス権限を確認してください。';
            });
        } catch (error) {
            console.error('Error setting up listener:', error);
            infoList.innerHTML = '';
            noInfoMessage.style.display = 'block';
            noInfoMessage.textContent = '情報の読み込みに失敗しました。';
        }
    }

    // Display information items
    function displayInformation(items) {
        infoList.innerHTML = '';

        if (items.length === 0) {
            noInfoMessage.style.display = 'block';
            noInfoMessage.textContent = 'まだ情報が登録されていません。上記のフォームから追加してください。';
            return;
        }

        noInfoMessage.style.display = 'none';

        items.forEach(item => {
            const itemElement = createInfoItemElement(item);
            infoList.appendChild(itemElement);
        });
    }

    // Create info item element
    function createInfoItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'info-item';
        itemDiv.dataset.id = item.id;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-item-header';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'info-item-title';
        titleDiv.textContent = item.title;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'info-item-actions';

        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-btn';
        shareBtn.textContent = '共有';
        shareBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('share-info', { detail: { item } }));
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', async () => {
            if (confirm('この情報を削除してもよろしいですか?')) {
                await deleteInformation(item.id);
            }
        });

        actionsDiv.appendChild(shareBtn);
        actionsDiv.appendChild(deleteBtn);

        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(actionsDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'info-item-content';
        contentDiv.textContent = item.content;

        const metaDiv = document.createElement('div');
        metaDiv.className = 'info-item-meta';

        const dateSpan = document.createElement('span');
        if (item.createdAt) {
            const date = item.createdAt.toDate();
            dateSpan.textContent = `作成日時: ${formatDate(date)}`;
        } else {
            dateSpan.textContent = '作成日時: 処理中...';
        }

        const authorSpan = document.createElement('span');
        authorSpan.textContent = `作成者: ${item.userEmail}`;

        metaDiv.appendChild(dateSpan);
        metaDiv.appendChild(authorSpan);

        itemDiv.appendChild(headerDiv);
        itemDiv.appendChild(contentDiv);
        itemDiv.appendChild(metaDiv);

        return itemDiv;
    }

    // Delete information
    async function deleteInformation(id) {
        try {
            const collectionPath = getUserCollectionPath();
            const docRef = doc(db, collectionPath, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting information:', error);
            alert('情報の削除に失敗しました。');
        }
    }

    // Search/Filter information
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            displayInformation(allInfoItems);
        } else {
            const filtered = allInfoItems.filter(item => {
                return item.title.toLowerCase().includes(searchTerm) ||
                       item.content.toLowerCase().includes(searchTerm);
            });
            displayInformation(filtered);
        }
    });

    // Format date helper
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    // Enable Enter key for title (move to content)
    infoTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            infoContent.focus();
        }
    });

    // Load information on init
    loadInformation();

    // Cleanup on sign out
    window.addEventListener('user-signed-out', () => {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
        allInfoItems = [];
    });

    // Check online/offline status
    function updateOnlineStatus() {
        const offlineIndicator = document.getElementById('offline-indicator');
        if (navigator.onLine) {
            offlineIndicator.style.display = 'none';
        } else {
            offlineIndicator.style.display = 'block';
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
}

// Initialize when user is authenticated
window.addEventListener('user-authenticated', initApp);

// Export functions for use in other modules
export function getUserCollectionPath() {
    if (!currentUser) return null;
    const username = currentUser.email.split('@')[0];
    return `ccbotDev/${username}/apps/16ffbf18/information`;
}

export function getCurrentUserInfo() {
    return currentUser;
}
