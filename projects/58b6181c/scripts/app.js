const { useState, useEffect, useCallback } = React;

// ===========================
// ユーティリティ関数
// ===========================

// 現在のユーザー名を取得（Firestoreのパス用）
const getCurrentUsername = () => {
    return 'nekokazu'; // 固定値として設定
};

const PROJECT_ID = '58b6181c';

// Firestoreのパスを生成
const getTasksCollectionPath = () => {
    return `/ccbotDev/${getCurrentUsername()}/apps/${PROJECT_ID}/tasks`;
};

// ===========================
// 認証コンポーネント
// ===========================

function AuthForm({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = window.firebaseAuthFunctions;
            const auth = window.firebaseAuth;

            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }

            onAuthSuccess();
        } catch (err) {
            console.error('Authentication error:', err);

            // エラーメッセージを日本語化
            let errorMessage = 'エラーが発生しました';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'このメールアドレスは既に使用されています';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'メールアドレスの形式が正しくありません';
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = 'メールアドレスまたはパスワードが正しくありません';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'パスワードは6文字以上で入力してください';
            } else if (err.code === 'auth/invalid-credential') {
                errorMessage = 'メールアドレスまたはパスワードが正しくありません';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return React.createElement('div', { className: 'auth-container' },
        React.createElement('div', { className: 'auth-card' },
            React.createElement('h1', { className: 'auth-title' }, 'タスク管理アプリ'),

            React.createElement('div', { className: 'auth-tabs' },
                React.createElement('button', {
                    className: `auth-tab ${isLogin ? 'active' : ''}`,
                    onClick: () => {
                        setIsLogin(true);
                        setError('');
                    }
                }, 'ログイン'),
                React.createElement('button', {
                    className: `auth-tab ${!isLogin ? 'active' : ''}`,
                    onClick: () => {
                        setIsLogin(false);
                        setError('');
                    }
                }, '新規登録')
            ),

            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'email' }, 'メールアドレス'),
                    React.createElement('input', {
                        id: 'email',
                        type: 'email',
                        className: 'form-input',
                        placeholder: 'example@email.com',
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        required: true,
                        autoComplete: 'email'
                    })
                ),

                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'password' }, 'パスワード'),
                    React.createElement('input', {
                        id: 'password',
                        type: 'password',
                        className: 'form-input',
                        placeholder: '6文字以上',
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true,
                        minLength: 6,
                        autoComplete: isLogin ? 'current-password' : 'new-password'
                    })
                ),

                error && React.createElement('span', { className: 'form-error' }, error),

                React.createElement('button', {
                    type: 'submit',
                    className: 'btn btn-primary btn-full mt-lg',
                    disabled: loading
                }, loading ? '処理中...' : (isLogin ? 'ログイン' : '登録'))
            )
        )
    );
}

// ===========================
// タスク追加コンポーネント
// ===========================

function TaskInput({ onAddTask }) {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await onAddTask({
                title: title.trim(),
                priority: priority,
                completed: false
            });
            setTitle('');
            setPriority(false);
        } catch (err) {
            console.error('Error adding task:', err);
            alert('タスクの追加に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return React.createElement('div', { className: 'task-input-section' },
        React.createElement('form', { className: 'task-input-form', onSubmit: handleSubmit },
            React.createElement('input', {
                type: 'text',
                className: 'form-input task-input',
                placeholder: '新しいタスクを入力...',
                value: title,
                onChange: (e) => setTitle(e.target.value),
                disabled: loading
            }),
            React.createElement('label', {
                style: { display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }
            },
                React.createElement('input', {
                    type: 'checkbox',
                    checked: priority,
                    onChange: (e) => setPriority(e.target.checked),
                    disabled: loading
                }),
                '重要'
            ),
            React.createElement('button', {
                type: 'submit',
                className: 'btn btn-primary',
                disabled: loading || !title.trim()
            }, loading ? '追加中...' : '追加')
        )
    );
}

// ===========================
// タスクアイテムコンポーネント
// ===========================

function TaskItem({ task, onToggle, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!editTitle.trim()) return;

        setLoading(true);
        try {
            await onEdit(task.id, { title: editTitle.trim() });
            setIsEditing(false);
        } catch (err) {
            console.error('Error editing task:', err);
            alert('タスクの編集に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditTitle(task.title);
        setIsEditing(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return React.createElement('div', {
        className: `task-item ${task.completed ? 'completed' : ''} ${task.priority ? 'priority' : ''}`
    },
        React.createElement('input', {
            type: 'checkbox',
            className: 'task-checkbox',
            checked: task.completed,
            onChange: () => onToggle(task.id, !task.completed),
            disabled: loading
        }),

        React.createElement('div', { className: 'task-content' },
            isEditing
                ? React.createElement('input', {
                    type: 'text',
                    className: 'form-input',
                    value: editTitle,
                    onChange: (e) => setEditTitle(e.target.value),
                    disabled: loading,
                    autoFocus: true
                })
                : React.createElement('div', { className: 'task-title' }, task.title),

            React.createElement('div', { className: 'task-meta' },
                task.priority && React.createElement('span', {
                    style: {
                        color: 'var(--color-warning)',
                        fontWeight: '500',
                        fontSize: '0.8125rem'
                    }
                }, '重要'),
                task.createdAt && React.createElement('span', null, formatDate(task.createdAt))
            )
        ),

        React.createElement('div', { className: 'task-actions' },
            isEditing
                ? React.createElement(React.Fragment, null,
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: handleSave,
                        disabled: loading || !editTitle.trim(),
                        style: { padding: '0.5rem 1rem', fontSize: '0.875rem' }
                    }, '保存'),
                    React.createElement('button', {
                        className: 'btn btn-secondary',
                        onClick: handleCancel,
                        disabled: loading,
                        style: { padding: '0.5rem 1rem', fontSize: '0.875rem' }
                    }, 'キャンセル')
                )
                : React.createElement(React.Fragment, null,
                    React.createElement('button', {
                        className: 'btn-icon',
                        onClick: () => setIsEditing(true),
                        title: '編集',
                        disabled: loading
                    }, '✏️'),
                    React.createElement('button', {
                        className: 'btn-icon',
                        onClick: () => {
                            if (confirm('このタスクを削除しますか?')) {
                                onDelete(task.id);
                            }
                        },
                        title: '削除',
                        disabled: loading
                    }, '🗑️')
                )
        )
    );
}

// ===========================
// タスクリストコンポーネント
// ===========================

function TaskList({ user }) {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
    const [loading, setLoading] = useState(true);

    // タスクの取得と監視
    useEffect(() => {
        if (!user) return;

        const { collection, query, orderBy, onSnapshot } = window.firebaseFirestoreFunctions;
        const db = window.firebaseDb;

        const tasksPath = getTasksCollectionPath();
        const tasksRef = collection(db, tasksPath);
        const q = query(tasksRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = [];
            snapshot.forEach((doc) => {
                tasksData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setTasks(tasksData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // タスクの追加
    const addTask = async (taskData) => {
        const { collection, addDoc, serverTimestamp } = window.firebaseFirestoreFunctions;
        const db = window.firebaseDb;

        const tasksPath = getTasksCollectionPath();
        const tasksRef = collection(db, tasksPath);

        await addDoc(tasksRef, {
            ...taskData,
            userId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    };

    // タスクの完了切り替え
    const toggleTask = async (taskId, completed) => {
        const { doc, updateDoc, serverTimestamp } = window.firebaseFirestoreFunctions;
        const db = window.firebaseDb;

        const tasksPath = getTasksCollectionPath();
        const taskRef = doc(db, tasksPath, taskId);

        await updateDoc(taskRef, {
            completed,
            updatedAt: serverTimestamp()
        });
    };

    // タスクの編集
    const editTask = async (taskId, updates) => {
        const { doc, updateDoc, serverTimestamp } = window.firebaseFirestoreFunctions;
        const db = window.firebaseDb;

        const tasksPath = getTasksCollectionPath();
        const taskRef = doc(db, tasksPath, taskId);

        await updateDoc(taskRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    };

    // タスクの削除
    const deleteTask = async (taskId) => {
        const { doc, deleteDoc } = window.firebaseFirestoreFunctions;
        const db = window.firebaseDb;

        const tasksPath = getTasksCollectionPath();
        const taskRef = doc(db, tasksPath, taskId);

        await deleteDoc(taskRef);
    };

    // フィルタリング
    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    // 完了・未完了で分類
    const activeTasks = filteredTasks.filter(task => !task.completed);
    const completedTasks = filteredTasks.filter(task => task.completed);
    const sortedTasks = [...activeTasks, ...completedTasks];

    if (loading) {
        return React.createElement('div', { className: 'loading-container' },
            React.createElement('div', { className: 'spinner' })
        );
    }

    return React.createElement('div', null,
        React.createElement(TaskInput, { onAddTask: addTask }),

        React.createElement('div', { className: 'task-filters' },
            React.createElement('button', {
                className: `filter-btn ${filter === 'all' ? 'active' : ''}`,
                onClick: () => setFilter('all')
            }, `すべて (${tasks.length})`),
            React.createElement('button', {
                className: `filter-btn ${filter === 'active' ? 'active' : ''}`,
                onClick: () => setFilter('active')
            }, `未完了 (${tasks.filter(t => !t.completed).length})`),
            React.createElement('button', {
                className: `filter-btn ${filter === 'completed' ? 'active' : ''}`,
                onClick: () => setFilter('completed')
            }, `完了 (${tasks.filter(t => t.completed).length})`)
        ),

        sortedTasks.length === 0
            ? React.createElement('div', { className: 'empty-state' },
                React.createElement('div', { className: 'empty-state-title' },
                    filter === 'all' ? 'タスクがありません' :
                    filter === 'active' ? '未完了のタスクがありません' :
                    '完了したタスクがありません'
                ),
                React.createElement('div', { className: 'empty-state-text' },
                    filter === 'all' ? '新しいタスクを追加して始めましょう' : ''
                )
            )
            : React.createElement('div', { className: 'task-list' },
                sortedTasks.map(task =>
                    React.createElement(TaskItem, {
                        key: task.id,
                        task: task,
                        onToggle: toggleTask,
                        onDelete: deleteTask,
                        onEdit: editTask
                    })
                )
            )
    );
}

// ===========================
// メインアプリケーション
// ===========================

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { onAuthStateChanged } = window.firebaseAuthFunctions;
        const auth = window.firebaseAuth;

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        const { signOut } = window.firebaseAuthFunctions;
        const auth = window.firebaseAuth;

        try {
            await signOut(auth);
        } catch (err) {
            console.error('Logout error:', err);
            alert('ログアウトに失敗しました');
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'loading-container' },
            React.createElement('div', { className: 'spinner' })
        );
    }

    if (!user) {
        return React.createElement(AuthForm, {
            onAuthSuccess: () => {}
        });
    }

    return React.createElement('div', { className: 'app-container' },
        React.createElement('header', { className: 'app-header' },
            React.createElement('div', { className: 'header-content' },
                React.createElement('h1', { className: 'app-title' }, 'タスク管理'),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem' } },
                    React.createElement('span', {
                        style: {
                            fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)'
                        }
                    }, user.email),
                    React.createElement('button', {
                        className: 'btn btn-secondary',
                        onClick: handleLogout
                    }, 'ログアウト')
                )
            )
        ),

        React.createElement('main', { className: 'main-content' },
            React.createElement(TaskList, { user: user })
        )
    );
}

// ===========================
// アプリケーションのマウント
// ===========================

// Firebase初期化を待ってからアプリをマウント
function waitForFirebase() {
    if (window.firebaseAuth && window.firebaseDb) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
    } else {
        setTimeout(waitForFirebase, 100);
    }
}

waitForFirebase();
