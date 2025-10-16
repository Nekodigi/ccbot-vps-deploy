// ブロッホ球の可視化

export class BlochSphere {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.stateVector = { x: 0, y: 0, z: 1 }; // 初期状態 |0⟩
        this.rotation = { x: 0.5, y: 0.5 };
        this.isDragging = false;
        this.setupInteraction();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
        this.radius = Math.min(rect.width, rect.height) * 0.35;
    }

    setupInteraction() {
        let lastX, lastY;

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                this.rotation.y += deltaX * 0.01;
                this.rotation.x += deltaY * 0.01;
                lastX = e.clientX;
                lastY = e.clientY;
                this.draw();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        // タッチイベント
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging) {
                const deltaX = e.touches[0].clientX - lastX;
                const deltaY = e.touches[0].clientY - lastY;
                this.rotation.y += deltaX * 0.01;
                this.rotation.x += deltaY * 0.01;
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
                this.draw();
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    // 3D座標を2D画面座標に変換
    project3D(x, y, z) {
        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);
        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);

        // Y軸回転
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;
        let y1 = y;

        // X軸回転
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        return {
            x: this.centerX + x2 * this.radius,
            y: this.centerY - y2 * this.radius,
            z: z2
        };
    }

    drawSphere() {
        const steps = 20;

        // 経線
        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * Math.PI * 2;
            const points = [];

            for (let j = 0; j <= steps; j++) {
                const phi = (j / steps) * Math.PI;
                const x = Math.sin(phi) * Math.cos(theta);
                const y = Math.sin(phi) * Math.sin(theta);
                const z = Math.cos(phi);
                points.push(this.project3D(x, y, z));
            }

            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
            this.ctx.lineWidth = 1;

            points.forEach((p, idx) => {
                if (idx === 0) this.ctx.moveTo(p.x, p.y);
                else this.ctx.lineTo(p.x, p.y);
            });
            this.ctx.stroke();
        }

        // 緯線
        for (let i = 0; i <= steps; i++) {
            const phi = (i / steps) * Math.PI;
            const points = [];

            for (let j = 0; j <= steps * 2; j++) {
                const theta = (j / (steps * 2)) * Math.PI * 2;
                const x = Math.sin(phi) * Math.cos(theta);
                const y = Math.sin(phi) * Math.sin(theta);
                const z = Math.cos(phi);
                points.push(this.project3D(x, y, z));
            }

            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
            this.ctx.lineWidth = 1;

            points.forEach((p, idx) => {
                if (idx === 0) this.ctx.moveTo(p.x, p.y);
                else this.ctx.lineTo(p.x, p.y);
            });
            this.ctx.stroke();
        }
    }

    drawAxes() {
        // X軸 (赤)
        const xStart = this.project3D(-1.2, 0, 0);
        const xEnd = this.project3D(1.2, 0, 0);
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(xStart.x, xStart.y);
        this.ctx.lineTo(xEnd.x, xEnd.y);
        this.ctx.stroke();

        if (xEnd.z > xStart.z) {
            this.ctx.fillStyle = '#ff4444';
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText('X', xEnd.x + 10, xEnd.y);
        }

        // Y軸 (緑)
        const yStart = this.project3D(0, -1.2, 0);
        const yEnd = this.project3D(0, 1.2, 0);
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#44ff44';
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(yStart.x, yStart.y);
        this.ctx.lineTo(yEnd.x, yEnd.y);
        this.ctx.stroke();

        if (yEnd.z > yStart.z) {
            this.ctx.fillStyle = '#44ff44';
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText('Y', yEnd.x + 10, yEnd.y);
        }

        // Z軸 (青)
        const zStart = this.project3D(0, 0, -1.2);
        const zEnd = this.project3D(0, 0, 1.2);
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#4444ff';
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(zStart.x, zStart.y);
        this.ctx.lineTo(zEnd.x, zEnd.y);
        this.ctx.stroke();

        if (zEnd.z > zStart.z) {
            this.ctx.fillStyle = '#4444ff';
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText('|0⟩', zEnd.x + 10, zEnd.y);
        }
        if (zStart.z > zEnd.z) {
            this.ctx.fillStyle = '#4444ff';
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText('|1⟩', zStart.x + 10, zStart.y);
        }
    }

    drawStateVector() {
        const origin = this.project3D(0, 0, 0);
        const end = this.project3D(
            this.stateVector.x,
            this.stateVector.y,
            this.stateVector.z
        );

        // 状態ベクトルの描画
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(origin.x, origin.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        // 矢印の先端
        this.ctx.beginPath();
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // 外側の光る円
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.arc(end.x, end.y, 12, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    updateState(x, y, z) {
        // 正規化
        const length = Math.sqrt(x * x + y * y + z * z);
        if (length > 0) {
            this.stateVector = {
                x: x / length,
                y: y / length,
                z: z / length
            };
        }
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 背景
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawSphere();
        this.drawAxes();
        this.drawStateVector();
    }
}
