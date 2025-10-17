(function() {
    'use strict';
    function waitForFirebase() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.db && window.vertexAI && window.getGenerativeModel) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
    document.addEventListener('DOMContentLoaded', async () => {
        await waitForFirebase();
        const { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
        const meetingTitle = document.getElementById('meeting-title');
        const meetingDate = document.getElementById('meeting-date');
        const meetingContent = document.getElementById('meeting-content');
        const generateBtn = document.getElementById('generate-btn');
        const saveBtn = document.getElementById('save-btn');
        const refreshBtn = document.getElementById('refresh-btn');
        const loading = document.getElementById('loading');
        const resultSection = document.getElementById('result-section');
        const summaryResult = document.getElementById('summary-result');
        const actionItemsResult = document.getElementById('action-items-result');
        const notesList = document.getElementById('notes-list');
        const USERNAME = 'nekokazu';
        const PROJECT_ID = 'ab22e138';
        const NOTES_COLLECTION_PATH = `ccbotDev/${USERNAME}/apps/${PROJECT_ID}/notes`;
        let currentAnalysis = null;
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        meetingDate.value = now.toISOString().slice(0, 16);
        generateBtn.addEventListener('click', async () => {
            const title = meetingTitle.value.trim();
            const date = meetingDate.value;
            const content = meetingContent.value.trim();
            if (!title || !date || !content) {
                alert('すべての項目を入力してください');
                return;
            }
            try {
                loading.style.display = 'flex';
                resultSection.style.display = 'none';
                generateBtn.disabled = true;
                const model = window.getGenerativeModel(window.vertexAI, { model: 'gemini-1.5-flash' });
                const prompt = `以下の会議の議事録を分析してください。\n\n【会議タイトル】\n${title}\n\n【会議日時】\n${new Date(date).toLocaleString('ja-JP')}\n\n【議事内容】\n${content}\n\n以下の形式で出力してください:\n\n## 要約\n会議の内容を簡潔にまとめてください（3-5文程度）。\n\n## アクションアイテム\n具体的なアクションアイテムを箇条書きで抽出してください。各項目は「担当者（推定）: タスク内容」の形式で記載してください。アクションアイテムがない場合は「なし」と記載してください。`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const summaryMatch = text.match(/## 要約\s*([\s\S]*?)(?=## アクションアイテム|$)/);
                const actionItemsMatch = text.match(/## アクションアイテム\s*([\s\S]*?)$/);
                const summary = summaryMatch ? summaryMatch[1].trim() : '解析できませんでした';
                const actionItems = actionItemsMatch ? actionItemsMatch[1].trim() : 'なし';
                currentAnalysis = { title, date, content, summary, actionItems };
                summaryResult.textContent = summary;
                actionItemsResult.textContent = actionItems;
                resultSection.style.display = 'block';
                saveBtn.disabled = false;
            } catch (error) {
                console.error('AI分析エラー:', error);
                alert('AI分析に失敗しました。もう一度お試しください。\n\nエラー: ' + error.message);
            } finally {
                loading.style.display = 'none';
                generateBtn.disabled = false;
            }
        });
        saveBtn.addEventListener('click', async () => {
            if (!currentAnalysis) {
                alert('先にAI分析を実行してください');
                return;
            }
            try {
                saveBtn.disabled = true;
                saveBtn.textContent = '保存中...';
                const notesCollection = collection(window.db, NOTES_COLLECTION_PATH);
                await addDoc(notesCollection, { ...currentAnalysis, createdAt: serverTimestamp() });
                alert('議事録を保存しました');
                meetingTitle.value = '';
                meetingContent.value = '';
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                meetingDate.value = now.toISOString().slice(0, 16);
                resultSection.style.display = 'none';
                currentAnalysis = null;
                saveBtn.disabled = true;
                await loadNotes();
            } catch (error) {
                console.error('保存エラー:', error);
                alert('保存に失敗しました。\n\nエラー: ' + error.message);
            } finally {
                saveBtn.textContent = '保存';
            }
        });
        async function loadNotes() {
            try {
                const notesCollection = collection(window.db, NOTES_COLLECTION_PATH);
                const q = query(notesCollection, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    notesList.innerHTML = '<p class="empty-message">保存された議事録はまだありません</p>';
                    return;
                }
                notesList.innerHTML = '';
                querySnapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    const noteCard = createNoteCard(docSnapshot.id, data);
                    notesList.appendChild(noteCard);
                });
            } catch (error) {
                console.error('読み込みエラー:', error);
                notesList.innerHTML = `<p class="empty-message">データの読み込みに失敗しました<br><small>${error.message}</small></p>`;
            }
        }
        function createNoteCard(id, data) {
            const card = document.createElement('div');
            card.className = 'note-card';
            const dateStr = data.date ? new Date(data.date).toLocaleString('ja-JP') : '日時不明';
            const contentPreview = data.content ? data.content.substring(0, 150) : '';
            card.innerHTML = `<div class="note-card-header"><div><h3 class="note-card-title">${escapeHtml(data.title || '無題')}</h3><p class="note-card-date">${dateStr}</p></div></div><p class="note-card-content">${escapeHtml(contentPreview)}${contentPreview.length >= 150 ? '...' : ''}</p><div class="note-card-actions"><button class="note-card-btn view-btn" data-id="${id}">詳細を見る</button><button class="note-card-btn delete delete-btn" data-id="${id}">削除</button></div>`;
            card.querySelector('.view-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showNoteDetail(data);
            });
            card.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('この議事録を削除しますか?')) {
                    try {
                        await deleteDoc(doc(window.db, NOTES_COLLECTION_PATH, id));
                        await loadNotes();
                    } catch (error) {
                        console.error('削除エラー:', error);
                        alert('削除に失敗しました');
                    }
                }
            });
            return card;
        }
        function showNoteDetail(data) {
            const detailWindow = window.open('', '_blank', 'width=800,height=600');
            detailWindow.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(data.title || '無題')} - 議事録詳細</title><link rel="stylesheet" href="./styles.css"></head><body><div class="container"><header class="header"><h1 class="header-title">${escapeHtml(data.title || '無題')}</h1><p class="header-subtitle">${new Date(data.date).toLocaleString('ja-JP')}</p></header><main class="main"><section class="section"><div class="section-header"><h2 class="section-title">議事内容</h2></div><div class="result-content">${escapeHtml(data.content || '')}</div></section><section class="section"><div class="section-header"><h2 class="section-title">要約</h2></div><div class="result-content">${escapeHtml(data.summary || '')}</div></section><section class="section"><div class="section-header"><h2 class="section-title">アクションアイテム</h2></div><div class="result-content">${escapeHtml(data.actionItems || '')}</div></section></main></div></body></html>`);
            detailWindow.document.close();
        }
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        refreshBtn.addEventListener('click', loadNotes);
        await loadNotes();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js').then(registration => {
                console.log('Service Worker registered:', registration);
            }).catch(error => {
                console.error('Service Worker registration failed:', error);
            });
        }
    });
})();
