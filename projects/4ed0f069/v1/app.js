// メインアプリケーションロジック

import { QuantumSimulator } from './quantum-simulator.js';
import { BlochSphere } from './bloch-sphere.js';
import { CircuitRenderer } from './circuit-renderer.js';
import { getAIExplanation, saveSimulationLog } from './firebase-config.js';

class QuantumComputerApp {
    constructor() {
        this.simulator = new QuantumSimulator(1);
        this.blochSphere = new BlochSphere('bloch-canvas');
        this.circuitRenderer = new CircuitRenderer('circuit-canvas');
        this.selectedGate = null;
        this.rotationAngle = Math.PI / 2;
        this.measurementData = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateVisualization();
        this.blochSphere.draw();
        this.circuitRenderer.draw();
    }

    setupEventListeners() {
        // 量子ビット数の変更
        document.getElementById('qubit-count').addEventListener('change', (e) => {
            const numQubits = parseInt(e.target.value);
            this.simulator = new QuantumSimulator(numQubits);
            this.circuitRenderer.setNumQubits(numQubits);
            this.updateVisualization();
            this.circuitRenderer.draw();

            // CNOTボタンの表示制御
            const cnotBtn = document.querySelector('[data-gate="CNOT"]');
            if (numQubits >= 2) {
                cnotBtn.style.display = 'block';
            } else {
                cnotBtn.style.display = 'none';
            }
        });

        // 回路のリセット
        document.getElementById('reset-circuit').addEventListener('click', () => {
            this.simulator.reset();
            this.updateVisualization();
            this.circuitRenderer.updateCircuit([]);
            this.clearMeasurementResults();
        });

        // ゲートボタン
        document.querySelectorAll('.gate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gate = e.target.dataset.gate;
                this.handleGateClick(gate);

                // ボタンのハイライト
                document.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // 回転角度の変更
        document.getElementById('rotation-angle').addEventListener('input', (e) => {
            this.rotationAngle = parseFloat(e.target.value);
            document.getElementById('angle-value').textContent = this.rotationAngle.toFixed(2);
        });

        // 回路の実行
        document.getElementById('run-circuit').addEventListener('click', () => {
            this.runCircuit();
        });

        // 測定
        document.getElementById('measure-btn').addEventListener('click', () => {
            this.performMeasurement();
        });

        // AI解説
        document.getElementById('explain-state').addEventListener('click', () => {
            this.explainCurrentState();
        });

        document.getElementById('explain-gates').addEventListener('click', () => {
            this.explainGateOperations();
        });
    }

    handleGateClick(gate) {
        const angleControl = document.getElementById('angle-control');

        // 回転ゲートの場合は角度入力を表示
        if (gate === 'RX' || gate === 'RY' || gate === 'RZ') {
            angleControl.style.display = 'block';
            this.selectedGate = gate;
        } else {
            angleControl.style.display = 'none';
        }

        const targetQubit = 0; // デフォルトは0番目の量子ビット

        // ゲートの適用
        switch (gate) {
            case 'H':
                this.simulator.hadamard(targetQubit);
                break;
            case 'X':
                this.simulator.pauliX(targetQubit);
                break;
            case 'Y':
                this.simulator.pauliY(targetQubit);
                break;
            case 'Z':
                this.simulator.pauliZ(targetQubit);
                break;
            case 'S':
                this.simulator.sGate(targetQubit);
                break;
            case 'T':
                this.simulator.tGate(targetQubit);
                break;
            case 'RX':
                this.simulator.rotationX(targetQubit, this.rotationAngle);
                break;
            case 'RY':
                this.simulator.rotationY(targetQubit, this.rotationAngle);
                break;
            case 'RZ':
                this.simulator.rotationZ(targetQubit, this.rotationAngle);
                break;
            case 'CNOT':
                if (this.simulator.numQubits >= 2) {
                    this.simulator.cnot(0, 1);
                }
                break;
        }

        this.updateVisualization();
        this.circuitRenderer.updateCircuit(this.simulator.circuit);
    }

    runCircuit() {
        // 回路を再実行 (既に適用済みなので、視覚的なフィードバックのみ)
        this.updateVisualization();
        this.circuitRenderer.updateCircuit(this.simulator.circuit);

        // ログを保存
        saveSimulationLog(
            this.simulator.circuit,
            this.simulator.getStateString()
        );
    }

    updateVisualization() {
        // 状態ベクトルの表示
        const stateDiv = document.getElementById('state-vector');
        stateDiv.innerHTML = '<pre>' + this.simulator.getStateString() + '</pre>';

        // ブロッホ球の更新 (単一量子ビットのみ)
        if (this.simulator.numQubits === 1) {
            const state = this.simulator.getSingleQubitState();
            this.blochSphere.updateState(state.x, state.y, state.z);
        }
    }

    performMeasurement() {
        const numShots = 1000;
        const counts = {};

        // 現在の状態を保存
        const originalState = [...this.simulator.stateVector];

        // 複数回測定してヒストグラムを作成
        for (let i = 0; i < numShots; i++) {
            this.simulator.stateVector = originalState.map(s => ({ ...s }));
            const result = this.simulator.measure();
            const binary = result.toString(2).padStart(this.simulator.numQubits, '0');
            counts[binary] = (counts[binary] || 0) + 1;
        }

        // 状態を元に戻す
        this.simulator.stateVector = originalState;

        // 結果を表示
        this.displayMeasurementResults(counts, numShots);
        this.measurementData = counts;
    }

    displayMeasurementResults(counts, total) {
        const canvas = document.getElementById('measurement-chart');
        const ctx = canvas.getContext('2d');

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 300 * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '300px';

        ctx.clearRect(0, 0, rect.width, 300);

        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, rect.width, 300);

        const states = Object.keys(counts).sort();
        const barWidth = (rect.width - 80) / states.length;
        const maxCount = Math.max(...Object.values(counts));

        states.forEach((state, idx) => {
            const count = counts[state];
            const probability = count / total;
            const barHeight = (probability * 200);

            const x = 40 + idx * barWidth;
            const y = 250 - barHeight;

            // バー
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(x, y, barWidth - 10, barHeight);

            // 確率ラベル
            ctx.fillStyle = '#e0e0e0';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                (probability * 100).toFixed(1) + '%',
                x + barWidth / 2 - 5,
                y - 5
            );

            // 状態ラベル
            ctx.fillText(
                '|' + state + '⟩',
                x + barWidth / 2 - 5,
                270
            );
        });

        // タイトル
        ctx.fillStyle = '#a0a0a0';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`測定結果 (${total}回の試行)`, 10, 20);
    }

    clearMeasurementResults() {
        const canvas = document.getElementById('measurement-chart');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.measurementData = null;
    }

    async explainCurrentState() {
        const explanationDiv = document.getElementById('ai-explanation');
        explanationDiv.innerHTML = '<div class="loading"></div> AI解説を生成中...';

        const stateString = this.simulator.getStateString();
        const numQubits = this.simulator.numQubits;

        const prompt = `量子コンピュータのシミュレーション状態について、初心者にも分かりやすく日本語で解説してください。

量子ビット数: ${numQubits}
現在の状態ベクトル:
${stateString}

以下の点について説明してください:
1. この状態が物理的に何を意味するか
2. 重ね合わせ状態の度合い
3. 測定するとどのような結果が得られる可能性があるか
4. この状態の特徴的な性質

簡潔に3-4段落で説明してください。`;

        const explanation = await getAIExplanation(prompt);
        explanationDiv.innerHTML = `<p>${explanation.replace(/\n/g, '</p><p>')}</p>`;
    }

    async explainGateOperations() {
        const explanationDiv = document.getElementById('ai-explanation');
        explanationDiv.innerHTML = '<div class="loading"></div> AI解説を生成中...';

        const circuit = this.simulator.circuit;

        if (circuit.length === 0) {
            explanationDiv.innerHTML = '<p>回路にゲートが追加されていません。ゲートを追加してから解説をリクエストしてください。</p>';
            return;
        }

        const circuitDescription = circuit.map(g => {
            if (g.gate === 'CNOT') {
                return `CNOT(制御: q${g.control}, ターゲット: q${g.target})`;
            } else if (g.angle !== undefined) {
                return `${g.gate}(q${g.qubit}, 角度: ${g.angle.toFixed(2)})`;
            } else {
                return `${g.gate}(q${g.qubit})`;
            }
        }).join(' → ');

        const prompt = `量子コンピュータの量子回路について、初心者にも分かりやすく日本語で解説してください。

実行された量子回路:
${circuitDescription}

以下の点について説明してください:
1. 各ゲート操作が量子状態にどのような影響を与えるか
2. この回路全体で何を実現しようとしているか
3. 各ゲートの物理的・数学的意味
4. この回路の応用例や実用性

簡潔に3-4段落で説明してください。`;

        const explanation = await getAIExplanation(prompt);
        explanationDiv.innerHTML = `<p>${explanation.replace(/\n/g, '</p><p>')}</p>`;
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    new QuantumComputerApp();
});
