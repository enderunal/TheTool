/**
 * Calculator functionality
 */

class Calculator {
    constructor() {
        this.previousOperand = '';
        this.currentOperand = '0';
        this.operation = undefined;
        this.shouldResetScreen = false;

        this.initializeElements();
        this.initializeEventListeners();
        this.restoreState();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.previousOperandElement = document.querySelector('.previous-operand');
        this.currentOperandElement = document.querySelector('.current-operand');
    }

    /**
     * Initialize event listeners for calculator buttons
     */
    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.dataset.number);
            });
        });

        // Operation buttons
        document.querySelectorAll('[data-operation]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.dataset.operation);
            });
        });

        // Action buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                switch (button.dataset.action) {
                    case 'clear':
                        this.clear();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                    case 'equals':
                        this.compute();
                        break;
                    case 'percent':
                        this.percent();
                        break;
                }
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#calculator').classList.contains('active')) {
                this.handleKeyboard(e);
            }
        });
    }

    /**
     * Handle keyboard input
     */
    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9') {
            this.appendNumber(e.key);
        } else if (e.key === '.') {
            this.appendNumber('.');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            const operationMap = {
                '+': '+',
                '-': '-',
                '*': '×',
                '/': '÷'
            };
            this.chooseOperation(operationMap[e.key]);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.compute();
        } else if (e.key === 'Backspace') {
            this.delete();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === '%') {
            this.percent();
        }
    }

    /**
     * Clear calculator
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
        this.saveState();
    }

    /**
     * Delete last digit
     */
    delete() {
        if (this.currentOperand === '0') return;

        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
        this.updateDisplay();
        this.saveState();
    }

    /**
 * Append number to display
 */
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '0';
            this.shouldResetScreen = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            // Much higher limit for better precision - allow up to 50 characters
            if (this.currentOperand.length < 50) {
                this.currentOperand = this.currentOperand.toString() + number;
            }
        }

        this.updateDisplay();
        this.saveState();
    }

    /**
     * Choose operation
     */
    chooseOperation(operation) {
        if (this.currentOperand === '') return;

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.shouldResetScreen = false;
        this.updateDisplay();
        this.saveState();
    }

    /**
     * Calculate percentage
     */
    percent() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;

        if (this.previousOperand !== '' && this.operation) {
            // If there's a pending operation, calculate percentage of previous operand
            const previous = parseFloat(this.previousOperand);
            this.currentOperand = ((previous * current) / 100).toString();
        } else {
            // Otherwise, just divide by 100
            this.currentOperand = (current / 100).toString();
        }

        this.updateDisplay();
        this.saveState();
    }

    /**
 * Perform calculation with high precision decimal arithmetic
 */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        // Use decimal arithmetic to avoid floating point errors
        switch (this.operation) {
            case '+':
                computation = this.decimalAdd(prev, current);
                break;
            case '-':
                computation = this.decimalSubtract(prev, current);
                break;
            case '×':
                computation = this.decimalMultiply(prev, current);
                break;
            case '÷':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.updateDisplay();
                    this.shouldResetScreen = true;
                    return;
                }
                computation = this.decimalDivide(prev, current);
                break;
            default:
                return;
        }

        // Format result
        this.currentOperand = this.formatNumber(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
        this.saveState();
    }

    /**
     * High precision decimal addition
     */
    decimalAdd(a, b) {
        // Convert to integers to avoid floating point issues
        const aStr = a.toString();
        const bStr = b.toString();
        const aDecimals = aStr.includes('.') ? aStr.split('.')[1].length : 0;
        const bDecimals = bStr.includes('.') ? bStr.split('.')[1].length : 0;
        const maxDecimals = Math.max(aDecimals, bDecimals);

        const multiplier = Math.pow(10, maxDecimals);
        const aInt = Math.round(a * multiplier);
        const bInt = Math.round(b * multiplier);

        return (aInt + bInt) / multiplier;
    }

    /**
     * High precision decimal subtraction
     */
    decimalSubtract(a, b) {
        const aStr = a.toString();
        const bStr = b.toString();
        const aDecimals = aStr.includes('.') ? aStr.split('.')[1].length : 0;
        const bDecimals = bStr.includes('.') ? bStr.split('.')[1].length : 0;
        const maxDecimals = Math.max(aDecimals, bDecimals);

        const multiplier = Math.pow(10, maxDecimals);
        const aInt = Math.round(a * multiplier);
        const bInt = Math.round(b * multiplier);

        return (aInt - bInt) / multiplier;
    }

    /**
     * High precision decimal multiplication
     */
    decimalMultiply(a, b) {
        const aStr = a.toString();
        const bStr = b.toString();
        const aDecimals = aStr.includes('.') ? aStr.split('.')[1].length : 0;
        const bDecimals = bStr.includes('.') ? bStr.split('.')[1].length : 0;

        const aInt = parseInt(aStr.replace('.', ''));
        const bInt = parseInt(bStr.replace('.', ''));

        const result = aInt * bInt;
        const totalDecimals = aDecimals + bDecimals;

        return result / Math.pow(10, totalDecimals);
    }

    /**
     * High precision decimal division
     */
    decimalDivide(a, b) {
        // For division, we use regular division but with higher precision
        const result = a / b;

        // Round to avoid floating point precision issues
        const precision = 15;
        return Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);
    }

    /**
 * Format number for display with high precision
 */
    formatNumber(number) {
        if (isNaN(number)) return '0';

        // Handle infinity
        if (!isFinite(number)) {
            return number > 0 ? 'Infinity' : '-Infinity';
        }

        const absNumber = Math.abs(number);

        if (absNumber === 0) return '0';

        // Use exponential notation only for extremely large or small numbers
        if (absNumber >= 1e21) {
            return number.toExponential(10);
        }

        if (absNumber < 1e-15) {
            return number.toExponential(10);
        }

        // For normal range, show full number
        let str = number.toString();

        // If JavaScript already converted to exponential, convert back if reasonable
        if (str.includes('e')) {
            const expNumber = parseFloat(str);
            // Only convert back if it won't be too long
            if (Math.abs(expNumber) < 1e18) {
                str = expNumber.toFixed(0);
                // Remove unnecessary decimal if it's a whole number
                if (str.endsWith('.0')) {
                    str = str.slice(0, -2);
                }
            } else {
                return str; // Keep exponential for very large numbers
            }
        }

        // For decimal numbers, maintain precision but limit display length
        if (str.includes('.')) {
            const parts = str.split('.');
            const wholePart = parts[0];
            const decimalPart = parts[1];

            // If the whole number is very long, truncate decimals
            if (wholePart.replace('-', '').length > 12) {
                str = wholePart; // Show only the whole part
            } else {
                // Limit total display to about 20 characters
                const maxLength = 20;
                if (str.length > maxLength) {
                    const availableDecimals = maxLength - wholePart.length - 1; // -1 for the dot
                    if (availableDecimals > 0) {
                        str = number.toFixed(availableDecimals);
                    } else {
                        str = wholePart;
                    }
                }

                // Remove trailing zeros
                str = str.replace(/\.?0+$/, '');
            }
        }

        return str;
    }

    /**
     * Update calculator display
     */
    updateDisplay() {
        this.currentOperandElement.textContent = this.currentOperand;

        if (this.operation != null) {
            this.previousOperandElement.textContent = `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = this.previousOperand;
        }
    }

    /**
     * Save calculator state to storage
     */
    saveState() {
        chrome.storage.local.set({
            calculatorState: {
                previousOperand: this.previousOperand,
                currentOperand: this.currentOperand,
                operation: this.operation
            }
        });
    }

    /**
     * Restore calculator state from storage
     */
    restoreState() {
        chrome.storage.local.get(['calculatorState'], (result) => {
            if (result.calculatorState) {
                this.previousOperand = result.calculatorState.previousOperand || '';
                this.currentOperand = result.calculatorState.currentOperand || '0';
                this.operation = result.calculatorState.operation || undefined;
                this.updateDisplay();
            }
        });
    }
}

// Initialize calculator when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Calculator();
    });
} else {
    new Calculator();
}
