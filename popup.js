/**
 * Popup controller for tab navigation and initialization
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    restoreActiveTab();
});

/**
 * Initialize tab navigation functionality
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Update button states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update pane visibility
            tabPanes.forEach(pane => {
                if (pane.id === targetTab) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            // Save active tab to storage
            chrome.storage.local.set({ activeTab: targetTab });

            // Trigger resize event for proper rendering
            window.dispatchEvent(new Event('resize'));
        });
    });
}

/**
 * Restore the last active tab from storage
 */
function restoreActiveTab() {
    chrome.storage.local.get(['activeTab'], (result) => {
        if (result.activeTab) {
            const tabButton = document.querySelector(`[data-tab="${result.activeTab}"]`);
            if (tabButton) {
                tabButton.click();
            }
        }
    });
}
