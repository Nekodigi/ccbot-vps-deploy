// 量子シミュレーターのコア機能

export class QuantumSimulator {
    constructor(numQubits = 1) {
        this.numQubits = numQubits;
        this.stateVector = this.initializeStateVector();
        this.circuit = [];
    }

    // 状態ベクトルの初期化 (|0...0⟩状態)
    initializeStateVector() {
        const size = Math.pow(2, this.numQubits);
        const state = new Array(size).fill(0).map(() => ({ real: 0, imag: 0 }));
        state[0] = { real: 1, imag: 0 }; // |0⟩状態
        return state;
    }

    // 複素数の乗算
    complexMultiply(a, b) {
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        };
    }

    // 複素数の加算
    complexAdd(a, b) {
        return {
            real: a.real + b.real,
            imag: a.imag + b.imag
        };
    }

    // 複素数の絶対値の二乗
    complexAbsSquared(c) {
        return c.real * c.real + c.imag * c.imag;
    }

    // 状態ベクトルに行列を適用
    applyMatrix(matrix, targetQubit) {
        const newState = [...this.stateVector].map(s => ({ ...s }));
        const size = Math.pow(2, this.numQubits);
        const blockSize = Math.pow(2, targetQubit);

        for (let i = 0; i < size; i++) {
            const block = Math.floor(i / blockSize);
            if (block % 2 === 0) {
                const i0 = i;
                const i1 = i + blockSize;

                const state0 = this.stateVector[i0];
                const state1 = this.stateVector[i1];

                newState[i0] = this.complexAdd(
                    this.complexMultiply(matrix[0][0], state0),
                    this.complexMultiply(matrix[0][1], state1)
                );

                newState[i1] = this.complexAdd(
                    this.complexMultiply(matrix[1][0], state0),
                    this.complexMultiply(matrix[1][1], state1)
                );
            }
        }

        this.stateVector = newState;
    }

    // Hadamardゲート
    hadamard(qubit) {
        const h = 1 / Math.sqrt(2);
        const matrix = [
            [{ real: h, imag: 0 }, { real: h, imag: 0 }],
            [{ real: h, imag: 0 }, { real: -h, imag: 0 }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'H', qubit });
    }

    // パウリXゲート (NOT)
    pauliX(qubit) {
        const matrix = [
            [{ real: 0, imag: 0 }, { real: 1, imag: 0 }],
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'X', qubit });
    }

    // パウリYゲート
    pauliY(qubit) {
        const matrix = [
            [{ real: 0, imag: 0 }, { real: 0, imag: -1 }],
            [{ real: 0, imag: 1 }, { real: 0, imag: 0 }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'Y', qubit });
    }

    // パウリZゲート
    pauliZ(qubit) {
        const matrix = [
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'Z', qubit });
    }

    // Sゲート (位相ゲート)
    sGate(qubit) {
        const matrix = [
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: 0, imag: 1 }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'S', qubit });
    }

    // Tゲート
    tGate(qubit) {
        const phase = Math.PI / 4;
        const matrix = [
            [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: Math.cos(phase), imag: Math.sin(phase) }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'T', qubit });
    }

    // X軸回転ゲート
    rotationX(qubit, angle) {
        const cos = Math.cos(angle / 2);
        const sin = Math.sin(angle / 2);
        const matrix = [
            [{ real: cos, imag: 0 }, { real: 0, imag: -sin }],
            [{ real: 0, imag: -sin }, { real: cos, imag: 0 }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'RX', qubit, angle });
    }

    // Y軸回転ゲート
    rotationY(qubit, angle) {
        const cos = Math.cos(angle / 2);
        const sin = Math.sin(angle / 2);
        const matrix = [
            [{ real: cos, imag: 0 }, { real: -sin, imag: 0 }],
            [{ real: sin, imag: 0 }, { real: cos, imag: 0 }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'RY', qubit, angle });
    }

    // Z軸回転ゲート
    rotationZ(qubit, angle) {
        const phase = angle / 2;
        const matrix = [
            [{ real: Math.cos(-phase), imag: Math.sin(-phase) }, { real: 0, imag: 0 }],
            [{ real: 0, imag: 0 }, { real: Math.cos(phase), imag: Math.sin(phase) }]
        ];
        this.applyMatrix(matrix, qubit);
        this.circuit.push({ gate: 'RZ', qubit, angle });
    }

    // CNOTゲート (制御NOT)
    cnot(controlQubit, targetQubit) {
        if (this.numQubits < 2) {
            console.warn('CNOTゲートには最低2量子ビットが必要です');
            return;
        }

        const size = Math.pow(2, this.numQubits);
        const newState = [...this.stateVector].map(s => ({ ...s }));

        for (let i = 0; i < size; i++) {
            const controlBit = (i >> controlQubit) & 1;
            if (controlBit === 1) {
                const targetBit = (i >> targetQubit) & 1;
                const flippedIndex = i ^ (1 << targetQubit);
                newState[i] = this.stateVector[flippedIndex];
            }
        }

        this.stateVector = newState;
        this.circuit.push({ gate: 'CNOT', control: controlQubit, target: targetQubit });
    }

    // 測定確率の計算
    getMeasurementProbabilities() {
        const probs = this.stateVector.map(state => this.complexAbsSquared(state));
        return probs;
    }

    // 測定の実行
    measure() {
        const probs = this.getMeasurementProbabilities();
        const rand = Math.random();
        let cumulative = 0;

        for (let i = 0; i < probs.length; i++) {
            cumulative += probs[i];
            if (rand < cumulative) {
                // 測定後、状態を崩壊させる
                this.stateVector = this.stateVector.map((_, idx) =>
                    idx === i ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
                );
                return i;
            }
        }
        return probs.length - 1;
    }

    // 単一量子ビットの状態取得 (ブロッホ球用)
    getSingleQubitState(qubit = 0) {
        if (this.numQubits !== 1 && qubit !== 0) {
            console.warn('複数量子ビットの場合、部分状態の取得は近似です');
        }

        const state0 = this.stateVector[0];
        const state1 = this.stateVector[1];

        // ブロッホ球の座標を計算
        const alpha = state0;
        const beta = state1;

        const x = 2 * (alpha.real * beta.real + alpha.imag * beta.imag);
        const y = 2 * (alpha.imag * beta.real - alpha.real * beta.imag);
        const z = this.complexAbsSquared(alpha) - this.complexAbsSquared(beta);

        return { x, y, z, alpha, beta };
    }

    // 回路のリセット
    reset() {
        this.stateVector = this.initializeStateVector();
        this.circuit = [];
    }

    // 状態ベクトルの文字列表現
    getStateString() {
        let result = '';
        for (let i = 0; i < this.stateVector.length; i++) {
            const state = this.stateVector[i];
            const amplitude = Math.sqrt(this.complexAbsSquared(state));

            if (amplitude > 0.001) {
                const basis = i.toString(2).padStart(this.numQubits, '0');
                const realPart = state.real.toFixed(3);
                const imagPart = state.imag >= 0 ? `+${state.imag.toFixed(3)}i` : `${state.imag.toFixed(3)}i`;
                result += `${realPart}${imagPart} |${basis}⟩\n`;
            }
        }
        return result || '0.000 |0⟩';
    }
}
