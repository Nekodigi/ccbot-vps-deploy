/**
 * Web計算機 - メインスクリプト
 * シンプルかつ高機能な計算機アプリケーション
 */

class Calculator {
    constructor() {
        this.displayElement = document.getElementById('display');
        this.expressionElement = document.getElementById('expression');
        this.historyElement = document.getElementById('history');

        this.currentValue = '0';
        this.previousValue = '';
        this.operator = '';
        this.shouldResetDisplay = false;
        this.history = this.loadHistory();

        this.initializeKeyboard();
        this.renderHistory();
    }

    /**
     * キーボード入力の初期化
     */
    initializeKeyboard() {
        document.addEventListener('keydown', (e) => {
            // 数字キー
            if (e.key >= '0' && e.key <= '9') {
                this.appendNumber(e.key);
            }
            // 小数点
            else if (e.key === '.') {
                this.appendNumber('.');
            }
            // 演算子
            else if (e.key === '+') {
                this.appendOperator('+');
            }
            else if (e.key === '-') {
                this.appendOperator('−');
            }
            else if (e.key === '*') {
                this.appendOperator('×');
            }
            else if (e.key === '/') {
                e.preventDefault(); // デフォルトの検索を防ぐ
                this.appendOperator('÷');
            }
            else if (e.key === '%') {
                this.percentage();
            }
            // Enter or =
            else if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                this.calculate();
            }
            // Backspace
            else if (e.key === 'Backspace') {
                this.delete();
            }
            // Escape
            else if (e.key === 'Escape') {
                this.clear();
            }
        });
    }

    /**
     * 数字または小数点を追加
     */
    appendNumber(number) {
        // 小数点の重複チェック
        if (number === '.' && this.currentValue.includes('.')) return;

        // ディスプレイリセットが必要な場合
        if (this.shouldResetDisplay) {
            this.currentValue = number === '.' ? '0.' : number;
            this.shouldResetDisplay = false;
        } else {
            // 最初の0を置き換え（小数点以外）
            if (this.currentValue === '0' && number !== '.') {
                this.currentValue = number;
            } else {
                this.currentValue += number;
            }
        }

        this.updateDisplay();
    }

    /**
     * 演算子を追加
     */
    appendOperator(op) {
        // 既に演算子があり、前の値がある場合は計算を実行
        if (this.operator && this.previousValue && !this.shouldResetDisplay) {
            this.calculate();
        }

        this.operator = op;
        this.previousValue = this.currentValue;
        this.shouldResetDisplay = true;
        this.updateExpression();
    }

    /**
     * 計算を実行
     */
    calculate() {
        if (!this.operator || !this.previousValue) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);

        if (isNaN(prev) || isNaN(current)) return;

        let result;

        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert('0で割ることはできません');
                    this.clear();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // 計算結果を丸める（浮動小数点誤差対策）
        result = Math.round(result * 1000000000) / 1000000000;

        // 履歴に追加
        const expression = `${this.previousValue} ${this.operator} ${this.currentValue}`;
        this.addToHistory(expression, result);

        // 状態更新
        this.currentValue = result.toString();
        this.operator = '';
        this.previousValue = '';
        this.shouldResetDisplay = true;

        this.updateDisplay();
        this.updateExpression();
    }

    /**
     * パーセント計算
     */
    percentage() {
        const current = parseFloat(this.currentValue);
        if (isNaN(current)) return;

        this.currentValue = (current / 100).toString();
        this.updateDisplay();
    }

    /**
     * 1文字削除
     */
    delete() {
        if (this.currentValue.length === 1) {
            this.currentValue = '0';
        } else {
            this.currentValue = this.currentValue.slice(0, -1);
        }
        this.updateDisplay();
    }

    /**
     * すべてクリア
     */
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = '';
        this.shouldResetDisplay = false;
        this.updateDisplay();
        this.updateExpression();
    }

    /**
     * ディスプレイを更新
     */
    updateDisplay() {
        let displayValue = this.currentValue;

        // 数値フォーマット（カンマ区切り）
        if (!displayValue.includes('.') && !isNaN(displayValue)) {
            const num = parseFloat(displayValue);
            if (!isNaN(num)) {
                displayValue = num.toLocaleString('ja-JP');
            }
        }

        this.displayElement.textContent = displayValue;

        // 長さに応じてフォントサイズを調整
        const length = displayValue.length;
        this.displayElement.classList.remove('long-number', 'very-long-number');

        if (length > 15) {
            this.displayElement.classList.add('very-long-number');
        } else if (length > 10) {
            this.displayElement.classList.add('long-number');
        }
    }

    /**
     * 式表示を更新
     */
    updateExpression() {
        if (this.operator && this.previousValue) {
            this.expressionElement.textContent = `${this.previousValue} ${this.operator}`;
        } else {
            this.expressionElement.textContent = '';
        }
    }

    /**
     * 履歴に追加
     */
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toISOString()
        };

        this.history.unshift(historyItem);

        // 履歴は最大20件まで
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.renderHistory();
    }

    /**
     * 履歴をクリア
     */
    clearHistory() {
        if (this.history.length === 0) return;

        if (confirm('計算履歴をすべて削除しますか?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    /**
     * 履歴を表示
     */
    renderHistory() {
        if (this.history.length === 0) {
            this.historyElement.innerHTML = '<div class="history-empty">履歴はありません</div>';
            return;
        }

        this.historyElement.innerHTML = '';

        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="expression-text">${this.escapeHtml(item.expression)}</div>
                <div class="result-text">= ${this.formatNumber(item.result)}</div>
            `;

            // クリックで結果を再利用
            historyItem.addEventListener('click', () => {
                this.currentValue = item.result.toString();
                this.updateDisplay();
            });

            this.historyElement.appendChild(historyItem);
        });
    }

    /**
     * 履歴をローカルストレージに保存
     */
    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('履歴の保存に失敗しました:', e);
        }
    }

    /**
     * 履歴をローカルストレージから読み込み
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('calculatorHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('履歴の読み込みに失敗しました:', e);
            return [];
        }
    }

    /**
     * 数値フォーマット
     */
    formatNumber(num) {
        if (typeof num === 'string') {
            num = parseFloat(num);
        }

        if (isNaN(num)) return '0';

        // 整数の場合はカンマ区切り
        if (Number.isInteger(num)) {
            return num.toLocaleString('ja-JP');
        }

        // 小数の場合
        return num.toLocaleString('ja-JP', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 8
        });
    }

    /**
     * HTMLエスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 計算機インスタンスを作成
const calculator = new Calculator();

// ページ読み込み完了時にフォーカス
window.addEventListener('load', () => {
    console.log('Web計算機が起動しました');
});
