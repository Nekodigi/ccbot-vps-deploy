// 量子回路の描画

export class CircuitRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.circuit = [];
        this.numQubits = 1;
        this.setupCanvas();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = Math.max(200, this.numQubits * 100) * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = Math.max(200, this.numQubits * 100) + 'px';

        this.padding = 40;
        this.gateWidth = 50;
        this.gateHeight = 40;
        this.wireSpacing = 80;
    }

    setNumQubits(num) {
        this.numQubits = num;
        this.setupCanvas();
    }

    updateCircuit(circuit) {
        this.circuit = circuit;
        this.draw();
    }

    drawWires() {
        const width = this.canvas.width / (window.devicePixelRatio || 1);

        for (let i = 0; i < this.numQubits; i++) {
            const y = this.padding + i * this.wireSpacing;

            // ワイヤー
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#2a2a3e';
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(width - this.padding, y);
            this.ctx.stroke();

            // 量子ビットラベル
            this.ctx.fillStyle = '#a0a0a0';
            this.ctx.font = '14px monospace';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`q${i}:`, this.padding - 10, y + 5);

            // 初期状態
            this.ctx.fillStyle = '#e0e0e0';
            this.ctx.font = '12px monospace';
            this.ctx.fillText('|0⟩', this.padding - 10, y + 20);
        }
    }

    drawGate(gate, x, y, label) {
        // ゲートの背景
        this.ctx.fillStyle = '#252538';
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(
            x - this.gateWidth / 2,
            y - this.gateHeight / 2,
            this.gateWidth,
            this.gateHeight
        );
        this.ctx.strokeRect(
            x - this.gateWidth / 2,
            y - this.gateHeight / 2,
            this.gateWidth,
            this.gateHeight
        );

        // ゲートラベル
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x, y);
    }

    drawCNOTGate(controlY, targetY, x) {
        // 制御線
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#9d4edd';
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(x, controlY);
        this.ctx.lineTo(x, targetY);
        this.ctx.stroke();

        // 制御点
        this.ctx.beginPath();
        this.ctx.fillStyle = '#9d4edd';
        this.ctx.arc(x, controlY, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // ターゲット (⊕)
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#9d4edd';
        this.ctx.lineWidth = 2;
        this.ctx.arc(x, targetY, 15, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, targetY);
        this.ctx.lineTo(x + 15, targetY);
        this.ctx.moveTo(x, targetY - 15);
        this.ctx.lineTo(x, targetY + 15);
        this.ctx.stroke();
    }

    drawMeasurement(x, y) {
        // 測定記号
        this.ctx.fillStyle = '#252538';
        this.ctx.strokeStyle = '#06ffa5';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(
            x - this.gateWidth / 2,
            y - this.gateHeight / 2,
            this.gateWidth,
            this.gateHeight
        );
        this.ctx.strokeRect(
            x - this.gateWidth / 2,
            y - this.gateHeight / 2,
            this.gateWidth,
            this.gateHeight
        );

        // メーターアイコン
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#06ffa5';
        this.ctx.lineWidth = 2;
        this.ctx.arc(x, y + 5, 12, Math.PI, 0, false);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 5);
        this.ctx.lineTo(x + 8, y - 3);
        this.ctx.stroke();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 背景
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawWires();

        if (this.circuit.length === 0) {
            this.ctx.fillStyle = '#a0a0a0';
            this.ctx.font = '14px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'ゲートを追加してください',
                this.canvas.width / (window.devicePixelRatio || 1) / 2,
                this.canvas.height / (window.devicePixelRatio || 1) / 2
            );
            return;
        }

        let xPos = this.padding + 100;
        const gateSpacing = 80;

        this.circuit.forEach((gate) => {
            if (gate.gate === 'CNOT') {
                const controlY = this.padding + gate.control * this.wireSpacing;
                const targetY = this.padding + gate.target * this.wireSpacing;
                this.drawCNOTGate(controlY, targetY, xPos);
            } else {
                const y = this.padding + gate.qubit * this.wireSpacing;
                let label = gate.gate;

                if (gate.gate.startsWith('R')) {
                    const angle = (gate.angle || 0).toFixed(2);
                    label = `${gate.gate}(${angle})`;
                }

                this.drawGate(gate, xPos, y, label);
            }

            xPos += gateSpacing;
        });

        // 測定記号を最後に追加
        for (let i = 0; i < this.numQubits; i++) {
            const y = this.padding + i * this.wireSpacing;
            this.drawMeasurement(xPos, y);
        }
    }
}
