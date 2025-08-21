/**
 * Stopwatch functionality
 */

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.laps = [];

        this.initializeElements();
        this.initializeEventListeners();
        this.restoreState();
        this.updateDisplay();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.millisecondsElement = document.getElementById('milliseconds');
        this.startStopButton = document.getElementById('startStop');
        this.resetButton = document.getElementById('reset');
        this.lapButton = document.getElementById('lap');
        this.lapList = document.getElementById('lapList');
        this.clearLapsButton = document.getElementById('clearLaps');
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        this.startStopButton.addEventListener('click', () => this.toggleStartStop());
        this.resetButton.addEventListener('click', () => this.reset());
        this.lapButton.addEventListener('click', () => this.recordLap());
        this.clearLapsButton.addEventListener('click', () => this.clearLaps());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#stopwatch').classList.contains('active')) {
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
                this.toggleStartStop();
                break;
            case 'r':
            case 'R':
                this.reset();
                break;
            case 'l':
            case 'L':
                if (this.isRunning) {
                    this.recordLap();
                }
                break;
            case 'c':
            case 'C':
                this.clearLaps();
                break;
        }
    }

    /**
     * Toggle start/stop
     */
    toggleStartStop() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Start the stopwatch
     */
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(() => this.updateTimer(), 10);
            this.isRunning = true;

            // Update UI
            this.startStopButton.textContent = 'Stop';
            this.startStopButton.classList.add('stop');
            this.lapButton.disabled = false;

            this.saveState();
        }
    }

    /**
     * Stop the stopwatch
     */
    stop() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;

            // Update UI
            this.startStopButton.textContent = 'Start';
            this.startStopButton.classList.remove('stop');
            this.lapButton.disabled = true;

            this.saveState();
        }
    }

    /**
     * Reset the stopwatch
     */
    reset() {
        clearInterval(this.timerInterval);
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;

        // Update UI
        this.startStopButton.textContent = 'Start';
        this.startStopButton.classList.remove('stop');
        this.lapButton.disabled = true;

        this.updateDisplay();
        this.saveState();
    }

    /**
     * Record a lap time
     */
    recordLap() {
        if (this.isRunning) {
            const lapTime = this.elapsedTime;
            const lapNumber = this.laps.length + 1;

            this.laps.push({
                number: lapNumber,
                time: lapTime
            });

            this.displayLap(lapNumber, lapTime);
            this.saveState();

            // Scroll to the latest lap
            this.lapList.scrollTop = 0;
        }
    }

    /**
     * Display a lap in the list
     */
    displayLap(number, time) {
        const lapItem = document.createElement('li');
        const formattedTime = this.formatTime(time);

        lapItem.innerHTML = `
      <span class="lap-number">Lap ${number}</span>
      <span class="lap-time">${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}.${formattedTime.milliseconds}</span>
    `;

        // Add new laps at the top
        this.lapList.insertBefore(lapItem, this.lapList.firstChild);

        // Animate the new lap
        lapItem.style.animation = 'fadeIn 0.3s ease';
    }

    /**
     * Clear all laps
     */
    clearLaps() {
        this.laps = [];
        this.lapList.innerHTML = '';
        this.saveState();
    }

    /**
     * Update the timer display
     */
    updateTimer() {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();

        // Save state periodically (every second)
        if (this.elapsedTime % 1000 < 10) {
            this.saveState();
        }
    }

    /**
     * Update the display with current time
     */
    updateDisplay() {
        const time = this.formatTime(this.elapsedTime);

        this.hoursElement.textContent = time.hours;
        this.minutesElement.textContent = time.minutes;
        this.secondsElement.textContent = time.seconds;
        this.millisecondsElement.textContent = time.milliseconds;
    }

    /**
     * Format time from milliseconds
     */
    formatTime(totalMilliseconds) {
        const hours = Math.floor(totalMilliseconds / 3600000);
        const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
        const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
        const milliseconds = Math.floor((totalMilliseconds % 1000) / 10);

        return {
            hours: this.pad(hours, 2),
            minutes: this.pad(minutes, 2),
            seconds: this.pad(seconds, 2),
            milliseconds: this.pad(milliseconds, 2)
        };
    }

    /**
     * Pad number with zeros
     */
    pad(number, digits) {
        return number.toString().padStart(digits, '0');
    }

    /**
     * Save stopwatch state to storage
     */
    saveState() {
        chrome.storage.local.set({
            stopwatchState: {
                elapsedTime: this.elapsedTime,
                isRunning: this.isRunning,
                startTime: this.startTime,
                laps: this.laps
            }
        });
    }

    /**
     * Restore stopwatch state from storage
     */
    restoreState() {
        chrome.storage.local.get(['stopwatchState'], (result) => {
            if (result.stopwatchState) {
                const state = result.stopwatchState;

                this.elapsedTime = state.elapsedTime || 0;
                this.laps = state.laps || [];

                // Restore laps display
                this.laps.slice().reverse().forEach(lap => {
                    this.displayLap(lap.number, lap.time);
                });

                // If stopwatch was running, resume it
                if (state.isRunning) {
                    // Adjust start time to account for time passed while extension was closed
                    const timePassed = Date.now() - state.startTime;
                    this.elapsedTime = state.elapsedTime + timePassed;
                    this.start();
                }

                this.updateDisplay();
            }
        });
    }
}

// Initialize stopwatch when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Stopwatch();
    });
} else {
    new Stopwatch();
}
