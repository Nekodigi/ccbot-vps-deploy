// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// AR Application State
class ARApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.objectsLayer = document.getElementById('objectsLayer');

        this.isRunning = false;
        this.selectedObject = 'cube';
        this.virtualObjects = [];
        this.objectIdCounter = 0;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkCameraPermission();
    }

    setupEventListeners() {
        // Object selection buttons
        document.querySelectorAll('.object-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.object-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.selectedObject = e.currentTarget.dataset.object;
            });
        });

        // Set default selection
        document.querySelector('.object-btn').classList.add('active');

        // Canvas click for object placement
        this.canvas.addEventListener('click', (e) => {
            if (this.isRunning) {
                this.placeObject(e.clientX, e.clientY);
            }
        });

        // Touch support for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.isRunning) {
                e.preventDefault();
                const touch = e.touches[0];
                this.placeObject(touch.clientX, touch.clientY);
            }
        });

        // AI Capture button
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.captureAndAnalyze();
        });

        // Clear objects button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllObjects();
        });

        // Info modal
        document.getElementById('infoBtn').addEventListener('click', () => {
            document.getElementById('infoModal').classList.remove('hidden');
        });

        document.getElementById('closeInfoBtn').addEventListener('click', () => {
            document.getElementById('infoModal').classList.add('hidden');
        });

        // AI Result panel
        document.getElementById('closeResultBtn').addEventListener('click', () => {
            document.getElementById('aiResultPanel').classList.add('hidden');
        });

        // Permission request
        document.getElementById('requestPermissionBtn').addEventListener('click', () => {
            this.requestCameraAccess();
        });
    }

    async checkCameraPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });

            if (result.state === 'granted') {
                await this.startCamera();
            } else {
                this.showPermissionRequest();
            }

            result.addEventListener('change', () => {
                if (result.state === 'granted') {
                    this.hidePermissionRequest();
                    this.startCamera();
                }
            });
        } catch (error) {
            // Fallback for browsers that don't support permissions API
            this.showPermissionRequest();
        }
    }

    showPermissionRequest() {
        document.getElementById('permissionRequest').classList.remove('hidden');
    }

    hidePermissionRequest() {
        document.getElementById('permissionRequest').classList.add('hidden');
    }

    async requestCameraAccess() {
        try {
            await this.startCamera();
            this.hidePermissionRequest();
        } catch (error) {
            console.error('Camera access denied:', error);
            this.updateStatus('カメラへのアクセスが拒否されました', 'error');
        }
    }

    async startCamera() {
        try {
            this.updateStatus('カメラを起動中...', 'loading');

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = stream;

            this.video.addEventListener('loadedmetadata', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.isRunning = true;
                this.updateStatus('AR準備完了', 'ready');
                this.renderLoop();
            });

        } catch (error) {
            console.error('Error accessing camera:', error);
            this.updateStatus('カメラの起動に失敗しました', 'error');
        }
    }

    renderLoop() {
        if (!this.isRunning) return;

        // Draw video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        requestAnimationFrame(() => this.renderLoop());
    }

    placeObject(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;

        const object = {
            id: this.objectIdCounter++,
            type: this.selectedObject,
            x: relativeX,
            y: relativeY,
            timestamp: Date.now()
        };

        this.virtualObjects.push(object);
        this.renderObject(object);

        // Add animation effect
        const objElement = document.getElementById(`obj-${object.id}`);
        objElement.style.animation = 'objectAppear 0.3s ease-out';
    }

    renderObject(object) {
        const objDiv = document.createElement('div');
        objDiv.id = `obj-${object.id}`;
        objDiv.className = `virtual-object ${object.type}`;
        objDiv.style.left = `${object.x}px`;
        objDiv.style.top = `${object.y}px`;

        // Add object content based on type
        switch (object.type) {
            case 'cube':
                objDiv.innerHTML = '<div class="cube-3d"><div class="cube-face front"></div><div class="cube-face back"></div><div class="cube-face left"></div><div class="cube-face right"></div><div class="cube-face top"></div><div class="cube-face bottom"></div></div>';
                break;
            case 'sphere':
                objDiv.innerHTML = '<div class="sphere-3d"></div>';
                break;
            case 'pyramid':
                objDiv.innerHTML = '<div class="pyramid-3d"></div>';
                break;
            case 'text':
                objDiv.innerHTML = '<div class="text-3d">AR Text</div>';
                objDiv.contentEditable = true;
                break;
        }

        // Make objects draggable
        this.makeDraggable(objDiv, object);

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-object-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeObject(object.id);
        });
        objDiv.appendChild(deleteBtn);

        this.objectsLayer.appendChild(objDiv);
    }

    makeDraggable(element, object) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        element.addEventListener('mousedown', dragStart);
        element.addEventListener('touchstart', dragStart);

        function dragStart(e) {
            if (e.target.classList.contains('delete-object-btn')) return;

            isDragging = true;
            element.classList.add('dragging');

            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - object.x;
                initialY = e.touches[0].clientY - object.y;
            } else {
                initialX = e.clientX - object.x;
                initialY = e.clientY - object.y;
            }

            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
        }

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            object.x = currentX;
            object.y = currentY;

            element.style.left = currentX + 'px';
            element.style.top = currentY + 'px';
        };

        const dragEnd = () => {
            isDragging = false;
            element.classList.remove('dragging');

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        };
    }

    removeObject(id) {
        const element = document.getElementById(`obj-${id}`);
        if (element) {
            element.style.animation = 'objectDisappear 0.3s ease-out';
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        this.virtualObjects = this.virtualObjects.filter(obj => obj.id !== id);
    }

    clearAllObjects() {
        this.virtualObjects.forEach(obj => {
            const element = document.getElementById(`obj-${obj.id}`);
            if (element) {
                element.style.animation = 'objectDisappear 0.3s ease-out';
                setTimeout(() => {
                    element.remove();
                }, 300);
            }
        });
        this.virtualObjects = [];
    }

    async captureAndAnalyze() {
        if (!this.isRunning) {
            this.updateStatus('カメラが起動していません', 'error');
            return;
        }

        // Show loading state
        const resultPanel = document.getElementById('aiResultPanel');
        const resultContent = document.getElementById('aiResultContent');
        resultPanel.classList.remove('hidden');
        resultContent.innerHTML = '<div class="loading-spinner"></div><p class="loading-text">AI分析中...</p>';

        try {
            // Capture current frame
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = this.canvas.width;
            captureCanvas.height = this.canvas.height;
            const captureCtx = captureCanvas.getContext('2d');
            captureCtx.drawImage(this.video, 0, 0);

            // Convert to base64
            const imageData = captureCanvas.toDataURL('image/jpeg', 0.8);

            // Call AI analysis
            const result = await this.analyzeImageWithAI(imageData);

            // Display result
            resultContent.innerHTML = `
                <div class="result-success">
                    <h4>分析完了</h4>
                    <div class="result-text">${result}</div>
                    <div class="result-meta">
                        <span class="meta-label">分析日時:</span>
                        <span class="meta-value">${new Date().toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            `;

            // Save to Firestore
            await this.saveAnalysisToFirestore(imageData, result);

        } catch (error) {
            console.error('AI analysis failed:', error);
            resultContent.innerHTML = `
                <div class="result-error">
                    <h4>分析エラー</h4>
                    <p>${error.message || 'AI分析に失敗しました。もう一度お試しください。'}</p>
                </div>
            `;
        }
    }

    async analyzeImageWithAI(imageData) {
        // Firebase AI Logic SDK integration
        // Note: This is a placeholder implementation
        // Actual implementation would use Firebase AI Logic SDK when available

        try {
            // Simulate AI analysis with Gemini API
            const apiKey = firebaseConfig.apiKey;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: "この画像に写っているものを日本語で詳しく説明してください。物体の特徴、色、配置などを含めてください。"
                            },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: imageData.split(',')[1]
                                }
                            }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('AI APIからのレスポンスエラー');
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('AIからの応答を解析できませんでした');
            }

        } catch (error) {
            console.error('AI API Error:', error);

            // Fallback: Basic analysis
            return `画像を検出しました。\n\nカメラから取得した映像をキャプチャしています。\n\nオブジェクト数: ${this.virtualObjects.length}個\n\n現在の時刻: ${new Date().toLocaleTimeString('ja-JP')}\n\nより詳細な分析を行うには、Firebase AI Logic SDKの完全な実装が必要です。`;
        }
    }

    async saveAnalysisToFirestore(imageData, result) {
        try {
            const docRef = await addDoc(collection(db, 'ccbotDev/nekokazu/apps/6b7855ed'), {
                type: 'ar_analysis',
                result: result,
                objectCount: this.virtualObjects.length,
                timestamp: serverTimestamp(),
                imageDataLength: imageData.length
            });
            console.log('Analysis saved to Firestore:', docRef.id);
        } catch (error) {
            console.error('Error saving to Firestore:', error);
        }
    }

    updateStatus(message, type = 'normal') {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');

        text.textContent = message;

        dot.className = 'status-dot';
        if (type === 'ready') {
            dot.classList.add('ready');
        } else if (type === 'error') {
            dot.classList.add('error');
        } else if (type === 'loading') {
            dot.classList.add('loading');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ARApp();
});
