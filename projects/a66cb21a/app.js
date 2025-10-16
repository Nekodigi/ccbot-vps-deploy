class AR3DLocationViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentLocation = null;

        this.startButton = document.getElementById('start-button');
        this.viewerContainer = document.getElementById('viewer-container');
        this.statusMessage = document.getElementById('status-message');
        this.viewerInfo = document.getElementById('viewer-info');
        this.closeButton = document.getElementById('close-button');
        this.loadingOverlay = document.getElementById('loading-overlay');

        this.initEventListeners();
    }

    initEventListeners() {
        this.startButton.addEventListener('click', () => this.startViewer());
        this.closeButton.addEventListener('click', () => this.closeViewer());
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.add('active');
        } else {
            this.loadingOverlay.classList.remove('active');
        }
    }

    async startViewer() {
        try {
            this.startButton.disabled = true;
            this.showStatus('位置情報を取得中...', 'info');

            const position = await this.getCurrentPosition();
            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            this.showStatus('3Dビューアーを起動中...', 'info');
            await this.initThreeJS();

            this.viewerContainer.classList.add('active');
            this.showLoading(true);

            await this.load3DTerrain();

            this.showLoading(false);
            this.showStatus('3Dモデルを表示しました', 'success');

        } catch (error) {
            console.error('Error:', error);
            this.showStatus(error.message || '3Dビューアーの起動に失敗しました', 'error');
            this.startButton.disabled = false;
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('お使いのブラウザは位置情報に対応していません'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                resolve,
                (error) => {
                    let message = '位置情報の取得に失敗しました';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = '位置情報の使用が許可されていません';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = '位置情報を取得できません';
                            break;
                        case error.TIMEOUT:
                            message = '位置情報の取得がタイムアウトしました';
                            break;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    async initThreeJS() {
        const canvas = document.getElementById('three-canvas');

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 500, 1000);

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 100;
        this.controls.maxDistance = 5000;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(500, 1000, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 5000;
        this.scene.add(directionalLight);

        const gridHelper = new THREE.GridHelper(2000, 50, 0x444444, 0x888888);
        this.scene.add(gridHelper);

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
    }

    async load3DTerrain() {
        return new Promise((resolve) => {
            const lat = this.currentLocation.latitude;
            const lon = this.currentLocation.longitude;

            this.viewerInfo.textContent = `位置: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;

            const terrainGeometry = this.generateTerrainGeometry(lat, lon);

            const terrainMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a7c59,
                roughness: 0.8,
                metalness: 0.2,
                flatShading: false
            });

            const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
            terrain.receiveShadow = true;
            terrain.castShadow = true;
            this.scene.add(terrain);

            this.addBuildingModels();

            this.addLocationMarker();

            setTimeout(resolve, 500);
        });
    }

    generateTerrainGeometry(latitude, longitude) {
        const width = 100;
        const height = 100;
        const geometry = new THREE.PlaneGeometry(2000, 2000, width - 1, height - 1);

        const vertices = geometry.attributes.position.array;

        const seed = latitude * longitude;
        const noise = this.createSimplexNoise(seed);

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];

            const scale = 0.01;
            const amplitude = 100;

            const elevation = noise(x * scale, y * scale) * amplitude;
            const elevation2 = noise(x * scale * 2, y * scale * 2) * amplitude * 0.5;

            vertices[i + 2] = elevation + elevation2;
        }

        geometry.computeVertexNormals();
        geometry.rotateX(-Math.PI / 2);

        return geometry;
    }

    createSimplexNoise(seed) {
        const random = this.seededRandom(seed);

        return (x, y) => {
            const X = Math.floor(x);
            const Y = Math.floor(y);

            const xFrac = x - X;
            const yFrac = y - Y;

            const n00 = this.dotGridGradient(X, Y, x, y, random);
            const n10 = this.dotGridGradient(X + 1, Y, x, y, random);
            const n01 = this.dotGridGradient(X, Y + 1, x, y, random);
            const n11 = this.dotGridGradient(X + 1, Y + 1, x, y, random);

            const sx = this.smootherstep(xFrac);
            const sy = this.smootherstep(yFrac);

            const nx0 = this.lerp(n00, n10, sx);
            const nx1 = this.lerp(n01, n11, sx);

            return this.lerp(nx0, nx1, sy);
        };
    }

    seededRandom(seed) {
        return (x, y) => {
            const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453123;
            return n - Math.floor(n);
        };
    }

    dotGridGradient(ix, iy, x, y, random) {
        const angle = random(ix, iy) * Math.PI * 2;
        const gradient = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };

        const dx = x - ix;
        const dy = y - iy;

        return dx * gradient.x + dy * gradient.y;
    }

    smootherstep(x) {
        return x * x * x * (x * (x * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    addBuildingModels() {
        const buildingCount = 12;
        const range = 800;

        for (let i = 0; i < buildingCount; i++) {
            const width = 50 + Math.random() * 80;
            const height = 100 + Math.random() * 300;
            const depth = 50 + Math.random() * 80;

            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.1, 0.1, 0.5 + Math.random() * 0.3),
                roughness: 0.7,
                metalness: 0.3
            });

            const building = new THREE.Mesh(geometry, material);
            building.position.set(
                (Math.random() - 0.5) * range,
                height / 2,
                (Math.random() - 0.5) * range
            );
            building.castShadow = true;
            building.receiveShadow = true;

            this.scene.add(building);
        }

        const treeCount = 20;
        for (let i = 0; i < treeCount; i++) {
            const tree = this.createTree();
            tree.position.set(
                (Math.random() - 0.5) * range * 1.2,
                0,
                (Math.random() - 0.5) * range * 1.2
            );
            this.scene.add(tree);
        }
    }

    createTree() {
        const tree = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(5, 8, 40, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 20;
        trunk.castShadow = true;
        tree.add(trunk);

        const leavesGeometry = new THREE.SphereGeometry(30, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 50;
        leaves.castShadow = true;
        tree.add(leaves);

        return tree;
    }

    addLocationMarker() {
        const markerGeometry = new THREE.ConeGeometry(20, 60, 8);
        const markerMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });

        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, 200, 0);
        marker.castShadow = true;

        this.scene.add(marker);

        const animate = () => {
            if (!this.viewerContainer.classList.contains('active')) return;
            marker.position.y = 200 + Math.sin(Date.now() * 0.002) * 20;
            marker.rotation.y += 0.02;
            requestAnimationFrame(animate);
        };
        animate();
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;

        requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    closeViewer() {
        this.viewerContainer.classList.remove('active');
        this.startButton.disabled = false;

        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AR3DLocationViewer();
});
