/**
 * Background service worker for Chrome extension
 * Handles extension lifecycle and background tasks
 */

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Initialize default storage values
        chrome.storage.local.set({
            activeTab: 'calculator',
            calculatorState: {
                previousOperand: '',
                currentOperand: '0',
                operation: undefined
            },
            stopwatchState: {
                elapsedTime: 0,
                isRunning: false,
                startTime: 0,
                laps: []
            }
        });

        console.log('TheTool extension installed successfully');
    } else if (details.reason === 'update') {
        console.log('TheTool extension updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle extension icon click (optional - popup is already set)
chrome.action.onClicked.addListener((tab) => {
    // This won't be triggered since we have a default_popup
    // But keeping it here for completeness
    console.log('Extension icon clicked');
});

// Handle messages from content scripts or popup (if needed in future)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVersion') {
        sendResponse({ version: chrome.runtime.getManifest().version });
    }
    // Return true to indicate async response
    return true;
});

// Keep service worker alive (optional for Manifest V3)
// This is useful if you need persistent background tasks
const keepAlive = () => {
    // Simple keep-alive mechanism
    chrome.storage.local.get(null, () => {
        // Just accessing storage to keep the service worker active
    });
};

// Set up periodic keep-alive if needed
// Note: In Manifest V3, service workers are event-driven and will terminate when idle
// Only use this if you have specific background tasks that need persistence
if (chrome.alarms) {
    chrome.alarms.create('keepAlive', { periodInMinutes: 0.25 }); // Every 15 seconds

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'keepAlive') {
            keepAlive();
        }
    });
}
