/**
 * Options page controller for TheTool
 */

class OptionsManager {
    constructor() {
        this.currentTheme = 'classic';
        this.settings = {};

        this.initializeElements();
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        // Navigation tabs
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Theme cards
        this.themeCards = document.querySelectorAll('.theme-card');

        // Settings inputs
        this.settingsInputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');

        // Version display
        this.versionElement = document.getElementById('app-version');
        if (this.versionElement && chrome.runtime.getManifest) {
            this.versionElement.textContent = chrome.runtime.getManifest().version;
        }

        // Link buttons
        this.privacyButton = document.getElementById('privacy-policy');
        this.supportButton = document.getElementById('support');
        this.feedbackButton = document.getElementById('feedback');
    }

    initializeEventListeners() {
        // Navigation tabs
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Theme selection
        this.themeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.selectTheme(theme);
            });
        });

        // Settings inputs
        this.settingsInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.saveSetting(e.target.id, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
            });
        });

        // Link buttons
        if (this.privacyButton) {
            this.privacyButton.addEventListener('click', () => {
                chrome.tabs.create({ url: 'https://example.com/privacy' });
            });
        }

        if (this.supportButton) {
            this.supportButton.addEventListener('click', () => {
                chrome.tabs.create({ url: 'https://example.com/support' });
            });
        }

        if (this.feedbackButton) {
            this.feedbackButton.addEventListener('click', () => {
                chrome.tabs.create({ url: 'mailto:support@example.com?subject=TheTool Feedback' });
            });
        }
    }

    switchTab(tabId) {
        // Update nav tabs
        this.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });

        // Save active tab
        this.saveSetting('activeOptionsTab', tabId);
    }

    selectTheme(theme) {
        this.currentTheme = theme;

        // Update visual selection
        this.themeCards.forEach(card => {
            card.classList.toggle('selected', card.dataset.theme === theme);
        });

        // Apply theme immediately
        this.applyTheme(theme);

        // Save theme preference
        this.saveSetting('theme', theme);
    }

    applyTheme(theme) {
        // Apply theme to current page
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = document.body.className.replace(/theme-\w+(-\w+)*/g, '');
        document.body.classList.add(`theme-${theme}`);

        // Update CSS custom properties based on theme
        this.updateThemeVariables(theme);

        // Notify other parts of the extension
        chrome.storage.local.set({ currentTheme: theme });

        // Send message to background script to update popup
        chrome.runtime.sendMessage({
            type: 'themeChanged',
            theme: theme
        });
    }

    updateThemeVariables(theme) {
        const root = document.documentElement;
        const themeConfig = this.getThemeConfig(theme);

        if (themeConfig) {
            Object.entries(themeConfig).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
        }
    }

    getThemeConfig(theme) {
        const themes = {
            'classic': {
                '--md-sys-color-primary': '#667eea',
                '--md-sys-color-secondary': '#764ba2',
                '--md-sys-color-background': '#ffffff',
                '--md-sys-color-surface': '#ffffff',
                '--md-sys-color-on-surface': '#333333',
                '--primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '--primary-color': '#667eea',
                '--secondary-color': '#764ba2',
                '--background': '#ffffff',
                '--surface': '#ffffff',
                '--on-surface': '#333333'
            },
            'classic-dark': {
                '--md-sys-color-primary': '#4a5568',
                '--md-sys-color-secondary': '#2d3748',
                '--md-sys-color-background': '#1a202c',
                '--md-sys-color-surface': '#2d3748',
                '--md-sys-color-on-surface': '#ffffff',
                '--primary-gradient': 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                '--primary-color': '#4a5568',
                '--secondary-color': '#2d3748',
                '--background': '#1a202c',
                '--surface': '#2d3748',
                '--on-surface': '#ffffff'
            },
            'gold': {
                '--primary-gradient': 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)',
                '--primary-color': '#B8860B',
                '--secondary-color': '#DAA520',
                '--background': '#FFFDF7',
                '--surface': '#ffffff',
                '--on-surface': '#1F1B13'
            },
            'gold-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #6B4E00 0%, #8B6914 100%)',
                '--primary-color': '#8B6914',
                '--secondary-color': '#6B4E00',
                '--background': '#1A1611',
                '--surface': '#2A2016',
                '--on-surface': '#E8E2D4'
            },
            'platinum': {
                '--primary-gradient': 'linear-gradient(135deg, #C0C0C0 0%, #E5E5E5 100%)',
                '--primary-color': '#9CA3AF',
                '--secondary-color': '#6B7280',
                '--background': '#FEFEFE',
                '--surface': '#ffffff',
                '--on-surface': '#1A1A1A'
            },
            'platinum-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                '--primary-color': '#9CA3AF',
                '--secondary-color': '#6B7280',
                '--background': '#121212',
                '--surface': '#1F2937',
                '--on-surface': '#E8E8E8'
            },
            'emerald': {
                '--primary-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                '--primary-color': '#059669',
                '--secondary-color': '#10B981',
                '--background': '#F8FDF9',
                '--surface': '#ffffff',
                '--on-surface': '#0F1B11'
            },
            'emerald-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
                '--primary-color': '#10B981',
                '--secondary-color': '#065F46',
                '--background': '#0A1A0C',
                '--surface': '#1A2E1C',
                '--on-surface': '#D4E8D6'
            },
            'sapphire': {
                '--primary-gradient': 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                '--primary-color': '#1E40AF',
                '--secondary-color': '#3B82F6',
                '--background': '#F8FBFF',
                '--surface': '#ffffff',
                '--on-surface': '#0F1419'
            },
            'sapphire-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
                '--primary-color': '#3B82F6',
                '--secondary-color': '#1D4ED8',
                '--background': '#0A1318',
                '--surface': '#1A2330',
                '--on-surface': '#D4E2F0'
            },
            'ruby': {
                '--primary-gradient': 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                '--primary-color': '#DC2626',
                '--secondary-color': '#EF4444',
                '--background': '#FFFBFB',
                '--surface': '#ffffff',
                '--on-surface': '#1B0F0F'
            },
            'ruby-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)',
                '--primary-color': '#EF4444',
                '--secondary-color': '#991B1B',
                '--background': '#1A0A0A',
                '--surface': '#2A1A1A',
                '--on-surface': '#E8D4D4'
            },
            'amethyst': {
                '--primary-gradient': 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                '--primary-color': '#7C3AED',
                '--secondary-color': '#8B5CF6',
                '--background': '#FDFBFF',
                '--surface': '#ffffff',
                '--on-surface': '#1A0F1B'
            },
            'amethyst-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)',
                '--primary-color': '#8B5CF6',
                '--secondary-color': '#6D28D9',
                '--background': '#1A0A1A',
                '--surface': '#2A1A2A',
                '--on-surface': '#E8D4E8'
            },
            'copper': {
                '--primary-gradient': 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
                '--primary-color': '#C2410C',
                '--secondary-color': '#EA580C',
                '--background': '#FFFCF9',
                '--surface': '#ffffff',
                '--on-surface': '#1B1611'
            },
            'copper-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #7C2D12 0%, #9A3412 100%)',
                '--primary-color': '#EA580C',
                '--secondary-color': '#9A3412',
                '--background': '#1A1510',
                '--surface': '#2A251A',
                '--on-surface': '#E8E0D4'
            },
            'obsidian': {
                '--primary-gradient': 'linear-gradient(135deg, #000000 0%, #374151 100%)',
                '--primary-color': '#374151',
                '--secondary-color': '#000000',
                '--background': '#FFFFFF',
                '--surface': '#ffffff',
                '--on-surface': '#000000'
            },
            'obsidian-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #000000 0%, #111827 100%)',
                '--primary-color': '#6B7280',
                '--secondary-color': '#374151',
                '--background': '#000000',
                '--surface': '#111827',
                '--on-surface': '#FFFFFF'
            },
            'steel': {
                '--primary-gradient': 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
                '--primary-color': '#475569',
                '--secondary-color': '#64748B',
                '--background': '#F8FAFC',
                '--surface': '#ffffff',
                '--on-surface': '#1E293B'
            },
            'steel-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                '--primary-color': '#64748B',
                '--secondary-color': '#475569',
                '--background': '#0F172A',
                '--surface': '#1E293B',
                '--on-surface': '#E2E8F0'
            },
            'midnight': {
                '--primary-gradient': 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                '--primary-color': '#1E1B4B',
                '--secondary-color': '#312E81',
                '--background': '#FAFBFF',
                '--surface': '#ffffff',
                '--on-surface': '#0A0E1A'
            },
            'midnight-dark': {
                '--primary-gradient': 'linear-gradient(135deg, #000510 0%, #1A1625 100%)',
                '--primary-color': '#6366F1',
                '--secondary-color': '#312E81',
                '--background': '#000510',
                '--surface': '#0A0A1A',
                '--on-surface': '#E6F0FF'
            }
        };

        return themes[theme] || themes.classic;
    }

    loadSettings() {
        chrome.storage.local.get(null, (result) => {
            this.settings = result;

            // Apply saved theme
            const savedTheme = result.theme || result.currentTheme || 'classic';
            this.selectTheme(savedTheme);

            // Apply saved tab
            const savedTab = result.activeOptionsTab || 'appearance';
            this.switchTab(savedTab);

            // Apply saved settings
            this.settingsInputs.forEach(input => {
                const savedValue = result[input.id];
                if (savedValue !== undefined) {
                    if (input.type === 'checkbox') {
                        input.checked = savedValue;
                    } else if (input.type === 'radio') {
                        input.checked = input.value === savedValue;
                    }
                }
            });
        });
    }

    saveSetting(key, value) {
        this.settings[key] = value;
        chrome.storage.local.set({ [key]: value });

        console.log(`Setting saved: ${key} = ${value}`);
    }

    // Export settings for backup
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'thetool-settings.json';
        link.click();

        URL.revokeObjectURL(url);
    }

    // Import settings from backup
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                chrome.storage.local.set(settings, () => {
                    this.loadSettings();
                    alert('Settings imported successfully!');
                });
            } catch (error) {
                alert('Error importing settings: Invalid file format');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.optionsManager = new OptionsManager();
});

// Handle extension messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getTheme') {
        sendResponse({ theme: window.optionsManager?.currentTheme || 'classic' });
    }
});
