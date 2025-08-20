/**
 * Timer functionality
 */

class Timer {
    constructor() {
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.timerInterval = null;
        this.startTime = 0;

        this.initializeElements();
        this.initializeEventListeners();
        this.restoreState();
        this.updateDisplay();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.hoursElement = document.getElementById('timer-hours');
        this.minutesElement = document.getElementById('timer-minutes');
        this.secondsElement = document.getElementById('timer-seconds');
        this.startButton = document.getElementById('timer-start');
        this.pauseButton = document.getElementById('timer-pause');
        this.resetButton = document.getElementById('timer-reset');
        this.setButton = document.getElementById('setTimer');

        this.inputHours = document.getElementById('input-hours');
        this.inputMinutes = document.getElementById('input-minutes');
        this.inputSeconds = document.getElementById('input-seconds');
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Timer controls
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
        this.setButton.addEventListener('click', () => this.setTimer());

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(button => {
            button.addEventListener('click', () => {
                const seconds = parseInt(button.dataset.time);
                this.setTimerFromSeconds(seconds);
            });
        });

        // Input validation
        [this.inputHours, this.inputMinutes, this.inputSeconds].forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('change', () => this.setTimer());
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#timer').classList.contains('active')) {
                this.handleKeyboard(e);
            }
        });
    }

    /**
     * Handle keyboard input
     */
    handleKeyboard(e) {
        switch (e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
                break;
            case 'r':
            case 'R':
                this.reset();
                break;
        }
    }

    /**
     * Validate numeric input
     */
    validateInput(input) {
        let value = parseInt(input.value) || 0;
        const max = input === this.inputHours ? 23 : 59;

        if (value < 0) value = 0;
        if (value > max) value = max;

        input.value = value;
    }

    /**
     * Set timer from input fields
     */
    setTimer() {
        const hours = parseInt(this.inputHours.value) || 0;
        const minutes = parseInt(this.inputMinutes.value) || 0;
        const seconds = parseInt(this.inputSeconds.value) || 0;

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        this.setTimerFromSeconds(totalSeconds);
    }

    /**
     * Set timer from total seconds
     */
    setTimerFromSeconds(totalSeconds) {
        if (this.isRunning) {
            this.stop();
        }

        this.totalTime = totalSeconds;
        this.timeRemaining = totalSeconds;
        this.updateDisplay();
        this.saveState();
    }

    /**
     * Start the timer
     */
    start() {
        if (this.timeRemaining <= 0) return;

        if (!this.isRunning) {
            this.startTime = Date.now() - (this.totalTime - this.timeRemaining) * 1000;
            this.timerInterval = setInterval(() => this.updateTimer(), 100);
            this.isRunning = true;
            this.isPaused = false;

            // Update UI
            this.startButton.disabled = true;
            this.pauseButton.disabled = false;

            this.saveState();
        }
    }

    /**
     * Pause the timer
     */
    pause() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
            this.isPaused = true;

            // Update UI
            this.startButton.disabled = false;
            this.pauseButton.disabled = true;

            this.saveState();
        }
    }

    /**
     * Stop the timer (internal method)
     */
    stop() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = false;

        // Update UI
        this.startButton.disabled = false;
        this.pauseButton.disabled = true;
    }

    /**
     * Reset the timer
     */
    reset() {
        this.stop();
        this.timeRemaining = this.totalTime;
        this.updateDisplay();
        this.saveState();
    }

    /**
     * Update the timer countdown
     */
    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeRemaining = Math.max(0, this.totalTime - elapsed);

        this.updateDisplay();

        if (this.timeRemaining <= 0) {
            this.onTimerFinished();
        }

        // Save state periodically
        if (elapsed % 5 === 0) {
            this.saveState();
        }
    }

    /**
     * Handle timer completion
     */
    onTimerFinished() {
        this.stop();
        this.timeRemaining = 0;
        this.updateDisplay();

        // Play notification sound
        this.playNotificationSound();

        // Show browser notification
        this.showNotification('Timer Finished!', 'Your countdown timer has reached zero.');

        this.saveState();
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        // Create audio context for beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    /**
     * Show browser notification
     */
    showNotification(title, message) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: 'icons/icon48.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body: message,
                            icon: 'icons/icon48.png'
                        });
                    }
                });
            }
        }
    }

    /**
     * Update the display with current time
     */
    updateDisplay() {
        const time = this.formatTime(this.timeRemaining);

        this.hoursElement.textContent = time.hours;
        this.minutesElement.textContent = time.minutes;
        this.secondsElement.textContent = time.seconds;
    }

    /**
     * Format time from seconds
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            hours: this.pad(hours, 2),
            minutes: this.pad(minutes, 2),
            seconds: this.pad(seconds, 2)
        };
    }

    /**
     * Pad number with zeros
     */
    pad(number, digits) {
        return number.toString().padStart(digits, '0');
    }

    /**
     * Save timer state to storage
     */
    saveState() {
        chrome.storage.local.set({
            timerState: {
                timeRemaining: this.timeRemaining,
                totalTime: this.totalTime,
                isRunning: this.isRunning,
                isPaused: this.isPaused,
                startTime: this.startTime
            }
        });
    }

    /**
     * Restore timer state from storage
     */
    restoreState() {
        chrome.storage.local.get(['timerState'], (result) => {
            if (result.timerState) {
                const state = result.timerState;

                this.totalTime = state.totalTime || 0;
                this.timeRemaining = state.timeRemaining || 0;

                // If timer was running, check if it should have finished
                if (state.isRunning) {
                    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
                    const remaining = Math.max(0, state.totalTime - elapsed);

                    if (remaining > 0) {
                        this.timeRemaining = remaining;
                        this.start();
                    } else {
                        // Timer finished while extension was closed
                        this.timeRemaining = 0;
                        this.onTimerFinished();
                    }
                }

                this.updateDisplay();
            }
        });
    }
}

// Initialize timer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Timer();
    });
} else {
    new Timer();
}
