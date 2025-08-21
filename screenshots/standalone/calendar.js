/**
 * Quick-view calendar with ISO week numbers
 */

class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.displayDate = new Date();
        this.selectedDate = null;

        this.initializeElements();
        this.initializeEventListeners();
        this.renderCalendar();
    }

    /**
 * Initialize DOM elements
 */
    initializeElements() {
        this.prevButton = document.getElementById('prev-month');
        this.nextButton = document.getElementById('next-month');
        this.monthSelect = document.getElementById('month-select');
        this.yearSelect = document.getElementById('year-select');
        this.calendarDays = document.getElementById('calendar-days');
    }

    /**
 * Initialize event listeners
 */
    initializeEventListeners() {
        this.prevButton.addEventListener('click', () => this.previousMonth());
        this.nextButton.addEventListener('click', () => this.nextMonth());

        // Month/Year selector changes
        this.monthSelect.addEventListener('change', () => this.onMonthYearChange());
        this.yearSelect.addEventListener('change', () => this.onMonthYearChange());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#calendar').classList.contains('active')) {
                this.handleKeyboard(e);
            }
        });
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousMonth();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextMonth();
                break;
            case 'Home':
                e.preventDefault();
                this.goToToday();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                // Could implement day-by-day navigation here
                break;
        }
    }

    /**
     * Go to previous month
     */
    previousMonth() {
        this.displayDate.setMonth(this.displayDate.getMonth() - 1);
        this.renderCalendar();
    }

    /**
     * Go to next month
     */
    nextMonth() {
        this.displayDate.setMonth(this.displayDate.getMonth() + 1);
        this.renderCalendar();
    }

    /**
 * Go to current month
 */
    goToToday() {
        this.displayDate = new Date();
        this.renderCalendar();
    }

    /**
     * Handle month/year selector change
     */
    onMonthYearChange() {
        const selectedMonth = parseInt(this.monthSelect.value);
        const selectedYear = parseInt(this.yearSelect.value);

        this.displayDate.setMonth(selectedMonth);
        this.displayDate.setFullYear(selectedYear);
        this.renderCalendar();
    }

    /**
     * Get ISO week number for a date
     * ISO 8601 week date system
     */
    getISOWeekNumber(date) {
        const tempDate = new Date(date.getTime());
        const dayNum = (date.getDay() + 6) % 7; // Make Monday = 0
        tempDate.setDate(tempDate.getDate() - dayNum + 3); // Thursday of this week
        const firstThursday = tempDate.valueOf();
        tempDate.setMonth(0, 1);
        if (tempDate.getDay() !== 4) {
            tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - tempDate) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
    }

    /**
     * Get the Monday of the week containing the given date
     */
    getMondayOfWeek(date) {
        const dayOfWeek = date.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, so we need -6
        const monday = new Date(date);
        monday.setDate(date.getDate() + diff);
        return monday;
    }

    /**
     * Format month and year for display
     */
    formatMonthYear(date) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    /**
     * Check if two dates are the same day
     */
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    /**
     * Check if date is today
     */
    isToday(date) {
        return this.isSameDay(date, this.currentDate);
    }

    /**
     * Check if date is in the current display month
     */
    isCurrentMonth(date) {
        return date.getMonth() === this.displayDate.getMonth() &&
            date.getFullYear() === this.displayDate.getFullYear();
    }

    /**
 * Render the calendar
 */
    renderCalendar() {
        // Update month/year selectors
        this.monthSelect.value = this.displayDate.getMonth();
        this.yearSelect.value = this.displayDate.getFullYear();

        // Clear calendar days
        this.calendarDays.innerHTML = '';

        // Get first day of the month
        const firstDay = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth(), 1);

        // Get Monday of the week containing first day
        const startDate = this.getMondayOfWeek(firstDay);

        // Generate 6 weeks (42 days) to ensure full month visibility
        for (let week = 0; week < 6; week++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + (week * 7));

            // Add week number
            const weekNumber = this.getISOWeekNumber(weekStart);
            const weekNumberElement = document.createElement('div');
            weekNumberElement.className = 'week-number';
            weekNumberElement.textContent = weekNumber;
            this.calendarDays.appendChild(weekNumberElement);

            // Add days of the week
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(weekStart);
                currentDate.setDate(weekStart.getDate() + day);

                const dayElement = document.createElement('div');
                dayElement.className = 'day-cell';
                dayElement.textContent = currentDate.getDate();

                // Add classes for styling
                if (this.isToday(currentDate)) {
                    dayElement.classList.add('today');
                }

                if (!this.isCurrentMonth(currentDate)) {
                    dayElement.classList.add('other-month');
                }

                // Add click event
                dayElement.addEventListener('click', () => {
                    this.selectedDate = new Date(currentDate);
                    this.renderCalendar(); // Re-render to update selection
                });

                // Add selected class
                if (this.selectedDate && this.isSameDay(currentDate, this.selectedDate)) {
                    dayElement.classList.add('selected');
                }

                this.calendarDays.appendChild(dayElement);
            }
        }
    }
}

// Initialize calendar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Calendar();
    });
} else {
    new Calendar();
}
