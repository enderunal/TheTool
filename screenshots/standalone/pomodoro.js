/**
 * Pomodoro timer functionality with sound alerts and auto-advance
 */

class PomodoroTimer {
    constructor() {
        // Default settings (minutes)
        this.settings = {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            longBreakInterval: 4,
            autoAdvance: true,
            soundEnabled: true
        };

        // Timer state
        this.currentPhase = 'focus'; // 'focus', 'shortBreak', 'longBreak'
        this.sessionCount = 0;
        this.timeRemaining = this.settings.focusTime * 60;
        this.isRunning = false;
        this.timerInterval = null;
        this.startTime = 0;

        // Total session stats
        this.totalStats = {
            totalFocusMinutes: 0,
            completedPomodoros: 0,
            date: new Date().toDateString()
        };

        this.initializeElements();
        this.initializeEventListeners();
        this.restoreState();
        this.updateDisplay();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.phaseElement = document.getElementById('pomodoro-phase');
        this.sessionElement = document.getElementById('pomodoro-session');
        this.minutesElement = document.getElementById('pomodoro-minutes');
        this.secondsElement = document.getElementById('pomodoro-seconds');

        this.startButton = document.getElementById('pomodoro-start');
        this.pauseButton = document.getElementById('pomodoro-pause');
        this.skipButton = document.getElementById('pomodoro-skip');
        this.resetButton = document.getElementById('pomodoro-reset');
        this.settingsButton = document.getElementById('pomodoro-settings-btn');
        this.muteButton = document.getElementById('mute-toggle');

        this.todayFocusElement = document.getElementById('today-focus');
        this.completedPomodorosElement = document.getElementById('completed-pomodoros');
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.skipButton.addEventListener('click', () => this.skip());
        this.resetButton.addEventListener('click', () => this.reset());
        this.settingsButton.addEventListener('click', () => this.showSettings());
        this.muteButton.addEventListener('click', () => this.toggleMute());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#pomodoro').classList.contains('active')) {
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
            case 's':
            case 'S':
                this.skip();
                break;
            case 'r':
            case 'R':
                this.reset();
                break;
        }
    }

    /**
     * Start the pomodoro timer
     */
    start() {
        if (this.timeRemaining <= 0) {
            this.nextPhase();
        }

        if (!this.isRunning) {
            const elapsedTime = this.getPhaseTime() - this.timeRemaining;
            this.startTime = Date.now() - (elapsedTime * 1000);
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            this.isRunning = true;

            // Update UI
            this.startButton.textContent = 'Running...';
            this.startButton.disabled = true;
            this.pauseButton.disabled = false;

            this.saveState();
        }
    }

    /**
     * Pause the pomodoro timer
     */
    pause() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;

            // Update UI
            this.startButton.textContent = 'Start';
            this.startButton.disabled = false;
            this.pauseButton.disabled = true;

            this.saveState();
        }
    }

    /**
     * Skip to next phase
     */
    skip() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
        }

        this.nextPhase();

        // Update UI
        this.startButton.textContent = 'Start';
        this.startButton.disabled = false;
        this.pauseButton.disabled = true;

        this.updateDisplay();
        this.saveState();
    }

    /**
     * Reset current phase and all stats
     */
    reset() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
        }

        // Reset timer state
        this.currentPhase = 'focus';
        this.sessionCount = 0;
        this.timeRemaining = this.getPhaseTime();

        // Reset total session stats
        this.totalStats = {
            totalFocusMinutes: 0,
            completedPomodoros: 0,
            date: new Date().toDateString()
        };

        // Update UI
        this.startButton.textContent = 'Start';
        this.startButton.disabled = false;
        this.pauseButton.disabled = true;

        this.updateDisplay();
        this.saveState();
    }

    /**
     * Update timer countdown
     */
    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeRemaining = Math.max(0, this.getPhaseTime() - elapsed);

        this.updateDisplay();

        if (this.timeRemaining <= 0) {
            this.onPhaseComplete();
        }

        // Save state every 30 seconds
        if (elapsed % 30 === 0) {
            this.saveState();
        }
    }

    /**
     * Handle phase completion
     */
    onPhaseComplete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;

        // Update stats
        if (this.currentPhase === 'focus') {
            this.totalStats.totalFocusMinutes += this.settings.focusTime;
            this.totalStats.completedPomodoros++;
            this.sessionCount++;
        }

        // Play notification sound
        if (this.settings.soundEnabled) {
            this.playPhaseCompleteSound();
        }

        // Show notification
        this.showPhaseCompleteNotification();

        // Auto-advance or wait for user
        if (this.settings.autoAdvance) {
            setTimeout(() => {
                this.nextPhase();
                this.start();
            }, 2000);
        } else {
            this.nextPhase();
            this.startButton.textContent = 'Start';
            this.startButton.disabled = false;
            this.pauseButton.disabled = true;
        }

        this.updateStatsDisplay();
        this.updateDisplay();
        this.saveState();
    }

    /**
     * Move to next phase
     */
    nextPhase() {
        if (this.currentPhase === 'focus') {
            // After focus, determine if it's short or long break
            const isLongBreak = this.sessionCount > 0 && this.sessionCount % this.settings.longBreakInterval === 0;
            this.currentPhase = isLongBreak ? 'longBreak' : 'shortBreak';
        } else {
            // After any break, go back to focus
            this.currentPhase = 'focus';
        }

        this.timeRemaining = this.getPhaseTime();
        this.updateDisplay();
    }

    /**
     * Get time for current phase in seconds
     */
    getPhaseTime() {
        switch (this.currentPhase) {
            case 'focus':
                return this.settings.focusTime * 60;
            case 'shortBreak':
                return this.settings.shortBreak * 60;
            case 'longBreak':
                return this.settings.longBreak * 60;
            default:
                return this.settings.focusTime * 60;
        }
    }

    /**
     * Play phase complete sound
     */
    playPhaseCompleteSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different tones for different phases
            const frequency = this.currentPhase === 'focus' ? 600 : 800;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

            // Play second beep
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();

                osc2.connect(gain2);
                gain2.connect(audioContext.destination);

                osc2.frequency.setValueAtTime(frequency * 1.2, audioContext.currentTime);
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 600);

        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    /**
     * Show phase complete notification
     */
    showPhaseCompleteNotification() {
        const messages = {
            focus: 'Focus session complete! Time for a break.',
            shortBreak: 'Short break over! Ready to focus?',
            longBreak: 'Long break finished! Back to work!'
        };

        const message = messages[this.currentPhase] || 'Phase complete!';

        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: message,
                    icon: 'icons/icon48.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Pomodoro Timer', {
                            body: message,
                            icon: 'icons/icon48.png'
                        });
                    }
                });
            }
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.muteButton.textContent = this.settings.soundEnabled ? '🔊' : '🔇';
        this.saveState();
    }

    /**
 * Show settings panel
 */
    showSettings() {
        // Toggle settings panel
        let settingsPanel = document.getElementById('pomodoro-settings-panel');

        if (settingsPanel) {
            settingsPanel.remove();
            return;
        }

        // Create settings panel
        settingsPanel = document.createElement('div');
        settingsPanel.id = 'pomodoro-settings-panel';
        settingsPanel.className = 'settings-panel';

        settingsPanel.innerHTML = `
      <div class="settings-header">
        <h3>Pomodoro Settings</h3>
        <button id="close-settings" class="close-btn">×</button>
      </div>
      <div class="settings-content">
        <div class="setting-item">
          <label>Focus Time (minutes):</label>
          <input type="number" id="focus-time-setting" min="1" max="60" value="${this.settings.focusTime}">
        </div>
        <div class="setting-item">
          <label>Short Break (minutes):</label>
          <input type="number" id="short-break-setting" min="1" max="30" value="${this.settings.shortBreak}">
        </div>
        <div class="setting-item">
          <label>Long Break (minutes):</label>
          <input type="number" id="long-break-setting" min="1" max="60" value="${this.settings.longBreak}">
        </div>
        <div class="setting-item">
          <label>Long Break Interval:</label>
          <input type="number" id="long-break-interval-setting" min="2" max="10" value="${this.settings.longBreakInterval}">
        </div>
        <div class="setting-item checkbox-item">
          <label>
            <input type="checkbox" id="auto-advance-setting" ${this.settings.autoAdvance ? 'checked' : ''}>
            Auto-advance to next phase
          </label>
        </div>
        <div class="settings-actions">
          <button id="apply-settings" class="btn-primary">Apply</button>
          <button id="cancel-settings" class="btn-secondary">Cancel</button>
        </div>
      </div>
    `;

        // Insert after pomodoro controls
        const pomodoroDiv = document.querySelector('.pomodoro');
        pomodoroDiv.appendChild(settingsPanel);

        // Add event listeners
        document.getElementById('close-settings').addEventListener('click', () => {
            settingsPanel.remove();
        });

        document.getElementById('cancel-settings').addEventListener('click', () => {
            settingsPanel.remove();
        });

        document.getElementById('apply-settings').addEventListener('click', () => {
            this.applySettings();
            settingsPanel.remove();
        });
    }

    /**
     * Apply settings from panel
     */
    applySettings() {
        const focusTime = parseInt(document.getElementById('focus-time-setting').value);
        const shortBreak = parseInt(document.getElementById('short-break-setting').value);
        const longBreak = parseInt(document.getElementById('long-break-setting').value);
        const longBreakInterval = parseInt(document.getElementById('long-break-interval-setting').value);
        const autoAdvance = document.getElementById('auto-advance-setting').checked;

        this.settings.focusTime = Math.max(1, focusTime);
        this.settings.shortBreak = Math.max(1, shortBreak);
        this.settings.longBreak = Math.max(1, longBreak);
        this.settings.longBreakInterval = Math.max(2, longBreakInterval);
        this.settings.autoAdvance = autoAdvance;

        // Reset current phase time if not running
        if (!this.isRunning) {
            this.timeRemaining = this.getPhaseTime();
            this.updateDisplay();
        }

        this.saveState();
    }

    /**
     * Update the display
     */
    updateDisplay() {
        // Update phase display
        const phaseNames = {
            focus: 'Focus Time',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };

        this.phaseElement.textContent = phaseNames[this.currentPhase];
        this.sessionElement.textContent = `Session ${this.sessionCount + 1}`;

        // Update time display
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;

        this.minutesElement.textContent = this.pad(minutes, 2);
        this.secondsElement.textContent = this.pad(seconds, 2);

        // Update stats display
        this.updateStatsDisplay();
    }

    /**
     * Update stats display
     */
    updateStatsDisplay() {
        // Check if it's a new day
        const today = new Date().toDateString();
        if (this.totalStats.date !== today) {
            this.totalStats.totalFocusMinutes = 0;
            this.totalStats.completedPomodoros = 0;
            this.totalStats.date = today;
        }

        this.todayFocusElement.textContent = `${this.totalStats.totalFocusMinutes} min`;
        this.completedPomodorosElement.textContent = this.totalStats.completedPomodoros;
    }

    /**
     * Pad number with zeros
     */
    pad(number, digits) {
        return number.toString().padStart(digits, '0');
    }

    /**
     * Save state to storage
     */
    saveState() {
        chrome.storage.local.set({
            pomodoroState: {
                settings: this.settings,
                currentPhase: this.currentPhase,
                sessionCount: this.sessionCount,
                timeRemaining: this.timeRemaining,
                isRunning: this.isRunning,
                startTime: this.startTime,
                totalStats: this.totalStats
            }
        });
    }

    /**
     * Restore state from storage
     */
    restoreState() {
        chrome.storage.local.get(['pomodoroState'], (result) => {
            if (result.pomodoroState) {
                const state = result.pomodoroState;

                // Restore settings
                this.settings = { ...this.settings, ...state.settings };

                // Restore timer state
                this.currentPhase = state.currentPhase || 'focus';
                this.sessionCount = state.sessionCount || 0;
                this.timeRemaining = state.timeRemaining || this.getPhaseTime();
                this.totalStats = state.totalStats || this.totalStats;

                // Update mute button
                this.muteButton.textContent = this.settings.soundEnabled ? '🔊' : '🔇';

                // If timer was running, resume it
                if (state.isRunning) {
                    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
                    const remaining = Math.max(0, this.getPhaseTime() - elapsed);

                    if (remaining > 0) {
                        this.timeRemaining = remaining;
                        this.start();
                    } else {
                        // Phase completed while extension was closed
                        this.timeRemaining = 0;
                        this.onPhaseComplete();
                    }
                }

                this.updateDisplay();
            }
        });
    }
}

// Initialize pomodoro timer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PomodoroTimer();
    });
} else {
    new PomodoroTimer();
}
