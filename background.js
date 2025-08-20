/**
 * Background service worker for TheTool
 * Handles theme changes and extension lifecycle
 */

// Handle extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('TheTool installed');

        // Set default theme
        chrome.storage.local.set({
            currentTheme: 'classic',
            theme: 'classic'
        });
    } else if (details.reason === 'update') {
        console.log('TheTool updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle messages from options page and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'themeChanged':
            // Broadcast theme change to all extension pages
            broadcastThemeChange(message.theme);
            sendResponse({ success: true });
            break;

        case 'getTheme':
            // Return current theme
            chrome.storage.local.get(['currentTheme', 'theme'], (result) => {
                sendResponse({ theme: result.currentTheme || result.theme || 'classic' });
            });
            return true; // Async response

        default:
            console.log('Unknown message type:', message.type);
    }
});

// Broadcast theme changes to all extension contexts
function broadcastThemeChange(theme) {
    // Store the theme
    chrome.storage.local.set({ currentTheme: theme });

    // Get all extension pages and send theme update
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tab.url && (tab.url.includes(chrome.runtime.id))) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'themeUpdate',
                    theme: theme
                }).catch(() => {
                    // Ignore errors for tabs that don't have content scripts
                });
            }
        });
    });
}

// Handle storage changes to sync theme across all contexts
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.currentTheme || changes.theme)) {
        const newTheme = changes.currentTheme?.newValue || changes.theme?.newValue;
        if (newTheme) {
            broadcastThemeChange(newTheme);
        }
    }
});

// Context menu for quick access to options (optional)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'openOptions',
        title: 'Open TheTool Settings',
        contexts: ['action']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openOptions') {
        chrome.tabs.create({
            url: chrome.runtime.getURL('options.html')
        });
    }
});