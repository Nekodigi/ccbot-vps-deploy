// グローバル変数
let scene, camera, renderer, cube, particleSystem;
let isGyroActive = false;
let currentRotation = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let mouseDown = false;
let lastMouseX = 0, lastMouseY = 0;

// DOM要素
const startBtn = document.getElementById('startBtn');
const statusPanel = document.getElementById('statusPanel');
const gyroStatus = document.getElementById('gyroStatus');
const orientationValue = document.getElementById('orientationValue');
const loading = document.getElementById('loading');

// 初期化
function init() {
    const container = document.getElementById('canvas-container');

    // シーンの作成
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 1, 15);

    // カメラの作成
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // レンダラーの作成
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // ライティング
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4a90e2, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe24a90, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // メインの3Dオブジェクト（複数のキューブで構成）
    const group = new THREE.Group();

    // 中心の大きなキューブ
    const mainGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mainMaterial = new THREE.MeshPhongMaterial({
        color: 0x4a90e2,
        specular: 0xffffff,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    const mainCube = new THREE.Mesh(mainGeometry, mainMaterial);
    group.add(mainCube);

    // ワイヤーフレーム
    const wireGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireCube = new THREE.Mesh(wireGeometry, wireMaterial);
    group.add(wireCube);

    // 周囲の小さなキューブ
    const smallGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const radius = 2.5;
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(i / 8, 1, 0.6),
            transparent: true,
            opacity: 0.8
        });
        const smallCube = new THREE.Mesh(smallGeometry, material);
        smallCube.position.x = Math.cos(angle) * radius;
        smallCube.position.z = Math.sin(angle) * radius;
        smallCube.userData.orbit = { angle, radius, speed: 0.5 + Math.random() * 0.5 };
        group.add(smallCube);
    }

    cube = group;
    scene.add(cube);

    // パーティクルシステム
    createParticles();

    // イベントリスナー
    window.addEventListener('resize', onWindowResize, false);
    setupControls();

    // ローディング完了
    setTimeout(() => {
        loading.classList.add('hidden');
    }, 500);

    // アニメーション開始
    animate();
}

// パーティクルの作成
function createParticles() {
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;

        const color = new THREE.Color().setHSL(Math.random(), 1, 0.7);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });

    particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

// コントロール設定
function setupControls() {
    // スタートボタン
    startBtn.addEventListener('click', async () => {
        startBtn.classList.add('hidden');
        statusPanel.classList.remove('hidden');

        // ジャイロセンサーの権限要求（iOS13+）
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    startGyro();
                } else {
                    showError('ジャイロセンサーへのアクセスが拒否されました');
                }
            } catch (error) {
                console.error('Permission error:', error);
                showError('権限の取得に失敗しました');
            }
        } else {
            // Android、その他のブラウザ
            startGyro();
        }
    });

    // マウス/タッチ操作
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    renderer.domElement.addEventListener('touchend', onMouseUp);

    // ダブルタップでリセット
    let lastTap = 0;
    renderer.domElement.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            resetRotation();
        }
        lastTap = currentTime;
    });
}

// ジャイロセンサー開始
function startGyro() {
    window.addEventListener('deviceorientation', handleOrientation);
    isGyroActive = true;
    gyroStatus.textContent = '接続済';
    gyroStatus.classList.remove('inactive');
    gyroStatus.classList.add('active');
}

// デバイスの向き変化を処理
function handleOrientation(event) {
    if (!isGyroActive) return;

    const beta = event.beta || 0;   // X軸（前後の傾き）-180〜180
    const gamma = event.gamma || 0; // Y軸（左右の傾き）-90〜90

    // 値を正規化
    targetRotation.x = (beta / 180) * Math.PI;
    targetRotation.y = (gamma / 90) * Math.PI;

    // ステータス表示更新
    orientationValue.textContent = `${Math.round(beta)}°, ${Math.round(gamma)}°`;
}

// マウス操作
function onMouseDown(e) {
    mouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
}

function onMouseMove(e) {
    if (!mouseDown) return;

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    targetRotation.y += deltaX * 0.01;
    targetRotation.x += deltaY * 0.01;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    orientationValue.textContent = `マウス操作中`;
}

function onMouseUp() {
    mouseDown = false;
}

// タッチ操作
function onTouchStart(e) {
    if (e.touches.length === 1) {
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
        mouseDown = true;
    }
}

function onTouchMove(e) {
    if (!mouseDown || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - lastMouseX;
    const deltaY = e.touches[0].clientY - lastMouseY;

    targetRotation.y += deltaX * 0.01;
    targetRotation.x += deltaY * 0.01;

    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;

    orientationValue.textContent = `タッチ操作中`;
}

// 回転リセット
function resetRotation() {
    targetRotation.x = 0;
    targetRotation.y = 0;
    currentRotation.x = 0;
    currentRotation.y = 0;
}

// ウィンドウリサイズ
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// エラー表示
function showError(message) {
    gyroStatus.textContent = 'エラー';
    gyroStatus.classList.remove('active');
    gyroStatus.classList.add('error');
    orientationValue.textContent = message;
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);

    // スムーズな回転補間
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

    // メインオブジェクトの回転
    if (cube) {
        cube.rotation.x = currentRotation.x;
        cube.rotation.y = currentRotation.y;

        // 内部のキューブにも個別の動き
        cube.children.forEach((child, index) => {
            if (child.userData.orbit) {
                const orbit = child.userData.orbit;
                orbit.angle += 0.01 * orbit.speed;
                child.position.x = Math.cos(orbit.angle) * orbit.radius;
                child.position.z = Math.sin(orbit.angle) * orbit.radius;
                child.rotation.x += 0.01;
                child.rotation.y += 0.02;
            }
        });
    }

    // パーティクルの回転
    if (particleSystem) {
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;
    }

    renderer.render(scene, camera);
}

// Service Workerの登録（PWA対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// アプリケーション起動
window.addEventListener('load', init);
