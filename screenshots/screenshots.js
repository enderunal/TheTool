const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Configuration
const SCREENSHOT_SIZES = {
    store: { width: 1280, height: 800 },
    small: { width: 640, height: 400 },
    about: { width: 1280, height: 900 }
};

const PROMO_SIZES = {
    small: { width: 440, height: 280 },
    marquee: { width: 1400, height: 560 }
};

const THEMES = ['classic', 'classic-dark', 'gold', 'gold-dark', 'platinum', 'platinum-dark', 'obsidian', 'obsidian-dark'];

const TABS = [
    { name: 'calculator' },
    { name: 'stopwatch' },
    { name: 'timer' },
    { name: 'pomodoro' },
    { name: 'calendar' },
    { name: 'notes' }
];

const OPTIONS_PAGES = [
    { name: 'appearance' },
    { name: 'about' }
];

class ScreenshotAutomation {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.outputDir = path.join(__dirname, 'output');
        this.extensionPath = path.join(__dirname, '..');
    }

    async init() {
        console.log('🚀 Initializing screenshot automation...');

        // Create output directory
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Launch browser with extension
        this.browser = await chromium.launch({
            headless: true,
            args: [
                `--disable-extensions-except=${this.extensionPath}`,
                `--load-extension=${this.extensionPath}`,
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        this.context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        // Inject chrome API stubs before any page loads
        await this.context.addInitScript(() => {
            if (!window.chrome) {
                window.chrome = {};
            }
            if (!window.chrome.storage) {
                window.chrome.storage = {};
            }
            const noop = () => { };
            const storageLocal = {
                get: (keys, callback) => {
                    // Return empty object for all keys
                    try { callback && callback({}); } catch (e) { }
                },
                set: (items, callback) => {
                    try { callback && callback(); } catch (e) { }
                }
            };
            window.chrome.storage.local = storageLocal;
            if (!window.chrome.storage.onChanged) {
                window.chrome.storage.onChanged = { addListener: noop };
            }
            if (!window.chrome.tabs) {
                window.chrome.tabs = { create: noop };
            }
            if (!window.chrome.runtime) {
                window.chrome.runtime = { getURL: (p) => p };
            }
        });

        this.page = await this.context.newPage();
        console.log('✅ Browser initialized');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('✅ Cleanup completed');
    }

    async takeScreenshot(name, size = 'store', format = 'png') {
        // For about page, use larger height to fit all content
        let screenshotSize;
        if (name.includes('about')) {
            screenshotSize = size === 'store' ? SCREENSHOT_SIZES.about : { width: 640, height: 600 };
        } else {
            screenshotSize = size === 'store' ? SCREENSHOT_SIZES.store : SCREENSHOT_SIZES.small;
        }

        const { width, height } = screenshotSize;
        await this.page.setViewportSize({ width, height });

        const filename = `${name}_${width}x${height}.${format}`;
        const filepath = path.join(this.outputDir, filename);

        // Take full page screenshot to ensure all content is captured
        await this.page.screenshot({
            path: filepath,
            type: format === 'png' ? 'png' : 'jpeg',
            quality: format === 'jpeg' ? 90 : undefined,
            fullPage: true
        });

        console.log(`📸 Screenshot saved: ${filename}`);
        return filepath;
    }

    async takePromoScreenshot(name, size = 'small', format = 'png') {
        const { width, height } = PROMO_SIZES[size];

        await this.page.setViewportSize({ width, height });

        const filename = `promo_${name}_${width}x${height}.${format}`;
        const filepath = path.join(this.outputDir, filename);

        await this.page.screenshot({
            path: filepath,
            type: format === 'png' ? 'png' : 'jpeg',
            quality: format === 'jpeg' ? 90 : undefined
        });

        console.log(`📸 Promo screenshot saved: ${filename}`);
        return filepath;
    }

    createBrowserMockup(popupContent, theme = 'classic') {
        const isDark = theme.includes('dark');
        const bgColor = isDark ? '#1a1a1a' : '#ffffff';
        const textColor = isDark ? '#ffffff' : '#000000';
        const borderColor = isDark ? '#333333' : '#e0e0e0';

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Mockup</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: ${bgColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: ${textColor};
        }
        .browser-window {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .browser-header {
            height: 40px;
            background: ${isDark ? '#2d2d2d' : '#f5f5f5'};
            border-bottom: 1px solid ${borderColor};
            display: flex;
            align-items: center;
            padding: 0 10px;
            gap: 10px;
        }
        .traffic-lights {
            display: flex;
            gap: 8px;
        }
        .traffic-light {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        .red { background: #ff5f57; }
        .yellow { background: #ffbd2e; }
        .green { background: #28ca42; }
        .address-bar {
            flex: 1;
            height: 28px;
            background: ${isDark ? '#1a1a1a' : '#ffffff'};
            border: 1px solid ${borderColor};
            border-radius: 6px;
            padding: 0 10px;
            display: flex;
            align-items: center;
            font-size: 14px;
            color: ${textColor};
        }
        .extension-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .browser-content {
            flex: 1;
            display: flex;
            position: relative;
        }
        .page-content {
            flex: 1;
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .google-logo {
            font-size: 72px;
            font-weight: 400;
            color: #4285f4;
            margin-bottom: 30px;
        }
        .search-box {
            width: 400px;
            height: 44px;
            border: 1px solid ${borderColor};
            border-radius: 24px;
            padding: 0 20px;
            font-size: 16px;
            background: ${isDark ? '#2d2d2d' : '#ffffff'};
            color: ${textColor};
            margin-bottom: 20px;
        }
        .search-buttons {
            display: flex;
            gap: 10px;
        }
        .search-btn {
            padding: 10px 20px;
            border: 1px solid ${borderColor};
            border-radius: 4px;
            background: ${isDark ? '#2d2d2d' : '#f8f9fa'};
            color: ${textColor};
            cursor: pointer;
        }
        .popup-container {
            position: absolute;
            top: 50px;
            right: 20px;
            z-index: 1000;
        }
        .popup-content {
            background: ${isDark ? '#2d3748' : '#ffffff'};
            border: 1px solid ${borderColor};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="browser-window">
        <div class="browser-header">
            <div class="traffic-lights">
                <div class="traffic-light red"></div>
                <div class="traffic-light yellow"></div>
                <div class="traffic-light green"></div>
            </div>
            <div class="address-bar">
                https://www.google.com
            </div>
            <div class="extension-icon">T</div>
        </div>
        <div class="browser-content">
            <div class="page-content">
                <div class="google-logo">Google</div>
                <input type="text" class="search-box" placeholder="Search Google or type a URL">
                <div class="search-buttons">
                    <button class="search-btn">Google Search</button>
                    <button class="search-btn">I'm Feeling Lucky</button>
                </div>
            </div>
            <div class="popup-container">
                <div class="popup-content">
                    ${popupContent}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    async applyTheme(page, theme) {
        console.log(`  🎨 Applying theme: ${theme}`);

        // Get the theme configuration from the extension
        const themeConfig = await page.evaluate((themeName) => {
            // Define the theme configurations inline (copied from popup.js)
            const themes = {
                'classic': {
                    '--theme-primary': '#667eea',
                    '--theme-secondary': '#764ba2',
                    '--theme-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '--theme-background': '#ffffff',
                    '--theme-surface': '#ffffff',
                    '--theme-surface-secondary': '#f5f5f5',
                    '--theme-surface-tertiary': '#f9f9f9',
                    '--theme-surface-hover': '#f0f0f0',
                    '--theme-surface-active': '#e8e8e8',
                    '--theme-surface-elevated': '#ffffff',
                    '--theme-surface-modal': '#ffffff',
                    '--theme-on-surface': '#333333',
                    '--theme-on-surface-variant': '#666666',
                    '--theme-on-surface-secondary': '#555555',
                    '--theme-on-background': '#333333',
                    '--theme-text-primary': '#333333',
                    '--theme-text-secondary': '#666666',
                    '--theme-text-tertiary': '#999999',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#aaaaaa',
                    '--theme-border': '#e0e0e0',
                    '--theme-border-variant': '#d1d1d6',
                    '--theme-border-light': '#f0f0f0',
                    '--theme-border-focus': '#667eea',
                    '--theme-outline': '#e0e0e0',
                    '--theme-outline-variant': '#f0f0f0',
                    '--theme-accent': '#667eea',
                    '--theme-accent-hover': '#5a6fd8',
                    '--theme-accent-active': '#4c63d2',
                    '--theme-accent-light': 'rgba(102, 126, 234, 0.1)',
                    '--theme-tab-nav-bg': '#f5f5f5',
                    '--theme-tab-hover': 'rgba(103, 58, 183, 0.05)',
                    '--theme-tab-active-color': '#673ab7',
                    '--theme-button-primary': '#667eea',
                    '--theme-button-primary-hover': '#5a6fd8',
                    '--theme-button-secondary': '#f5f5f5',
                    '--theme-button-secondary-hover': '#e8e8e8',
                    '--theme-input-background': '#ffffff',
                    '--theme-input-border': '#e0e0e0',
                    '--theme-input-focus': '#667eea',
                    '--theme-card-background': '#ffffff',
                    '--theme-card-border': '#e0e0e0',
                    '--theme-list-item-background': '#ffffff',
                    '--theme-list-item-hover': '#f5f5f5',
                    '--theme-list-item-active': '#667eea',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.2)',
                    '--theme-success': '#10b981',
                    '--theme-warning': '#f59e0b',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'classic-dark': {
                    '--theme-primary': '#667eea',
                    '--theme-secondary': '#764ba2',
                    '--theme-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '--theme-background': '#1a1a1a',
                    '--theme-surface': '#2d2d2d',
                    '--theme-surface-secondary': '#3a3a3a',
                    '--theme-surface-tertiary': '#4a4a4a',
                    '--theme-surface-hover': '#4a4a4a',
                    '--theme-surface-active': '#3a3a3a',
                    '--theme-surface-elevated': '#2d2d2d',
                    '--theme-surface-modal': '#2d2d2d',
                    '--theme-on-surface': '#ffffff',
                    '--theme-on-surface-variant': '#cccccc',
                    '--theme-on-surface-secondary': '#aaaaaa',
                    '--theme-on-background': '#ffffff',
                    '--theme-text-primary': '#ffffff',
                    '--theme-text-secondary': '#cccccc',
                    '--theme-text-tertiary': '#999999',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#666666',
                    '--theme-border': '#404040',
                    '--theme-border-variant': '#333333',
                    '--theme-border-light': '#4a4a4a',
                    '--theme-border-focus': '#667eea',
                    '--theme-outline': '#404040',
                    '--theme-outline-variant': '#333333',
                    '--theme-accent': '#667eea',
                    '--theme-accent-hover': '#5a6fd8',
                    '--theme-accent-active': '#4c63d2',
                    '--theme-accent-light': 'rgba(102, 126, 234, 0.2)',
                    '--theme-tab-nav-bg': '#3a3a3a',
                    '--theme-tab-hover': 'rgba(102, 126, 234, 0.2)',
                    '--theme-tab-active-color': '#667eea',
                    '--theme-button-primary': '#667eea',
                    '--theme-button-primary-hover': '#5a6fd8',
                    '--theme-button-secondary': '#3a3a3a',
                    '--theme-button-secondary-hover': '#4a4a4a',
                    '--theme-input-background': '#2d2d2d',
                    '--theme-input-border': '#404040',
                    '--theme-input-focus': '#667eea',
                    '--theme-card-background': '#2d2d2d',
                    '--theme-card-border': '#404040',
                    '--theme-list-item-background': '#2d2d2d',
                    '--theme-list-item-hover': '#3a3a3a',
                    '--theme-list-item-active': '#667eea',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.5)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.6)',
                    '--theme-success': '#22c55e',
                    '--theme-warning': '#eab308',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'gold': {
                    '--theme-primary': '#f59e0b',
                    '--theme-secondary': '#d97706',
                    '--theme-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    '--theme-background': '#ffffff',
                    '--theme-surface': '#ffffff',
                    '--theme-surface-secondary': '#fef3c7',
                    '--theme-surface-tertiary': '#fefce8',
                    '--theme-surface-hover': '#fde68a',
                    '--theme-surface-active': '#fcd34d',
                    '--theme-surface-elevated': '#ffffff',
                    '--theme-surface-modal': '#ffffff',
                    '--theme-on-surface': '#92400e',
                    '--theme-on-surface-variant': '#a16207',
                    '--theme-on-surface-secondary': '#78350f',
                    '--theme-on-background': '#92400e',
                    '--theme-text-primary': '#92400e',
                    '--theme-text-secondary': '#a16207',
                    '--theme-text-tertiary': '#78350f',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#d97706',
                    '--theme-border': '#fbbf24',
                    '--theme-border-variant': '#f59e0b',
                    '--theme-border-light': '#fef3c7',
                    '--theme-border-focus': '#f59e0b',
                    '--theme-outline': '#fbbf24',
                    '--theme-outline-variant': '#fef3c7',
                    '--theme-accent': '#f59e0b',
                    '--theme-accent-hover': '#d97706',
                    '--theme-accent-active': '#b45309',
                    '--theme-accent-light': 'rgba(245, 158, 11, 0.1)',
                    '--theme-tab-nav-bg': '#fef3c7',
                    '--theme-tab-hover': 'rgba(245, 158, 11, 0.1)',
                    '--theme-tab-active-color': '#f59e0b',
                    '--theme-button-primary': '#f59e0b',
                    '--theme-button-primary-hover': '#d97706',
                    '--theme-button-secondary': '#fef3c7',
                    '--theme-button-secondary-hover': '#fde68a',
                    '--theme-input-background': '#ffffff',
                    '--theme-input-border': '#fbbf24',
                    '--theme-input-focus': '#f59e0b',
                    '--theme-card-background': '#ffffff',
                    '--theme-card-border': '#fbbf24',
                    '--theme-list-item-background': '#ffffff',
                    '--theme-list-item-hover': '#fef3c7',
                    '--theme-list-item-active': '#f59e0b',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.2)',
                    '--theme-success': '#10b981',
                    '--theme-warning': '#f59e0b',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'gold-dark': {
                    '--theme-primary': '#f59e0b',
                    '--theme-secondary': '#d97706',
                    '--theme-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    '--theme-background': '#1a1a0a',
                    '--theme-surface': '#2a2a1a',
                    '--theme-surface-secondary': '#3a3a2a',
                    '--theme-surface-tertiary': '#4a4a3a',
                    '--theme-surface-hover': '#4a4a3a',
                    '--theme-surface-active': '#3a3a2a',
                    '--theme-surface-elevated': '#2a2a1a',
                    '--theme-surface-modal': '#2a2a1a',
                    '--theme-on-surface': '#fef3c7',
                    '--theme-on-surface-variant': '#fde68a',
                    '--theme-on-surface-secondary': '#fcd34d',
                    '--theme-on-background': '#fef3c7',
                    '--theme-text-primary': '#fef3c7',
                    '--theme-text-secondary': '#fde68a',
                    '--theme-text-tertiary': '#fcd34d',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#f59e0b',
                    '--theme-border': '#92400e',
                    '--theme-border-variant': '#78350f',
                    '--theme-border-light': '#4a4a3a',
                    '--theme-border-focus': '#fde68a',
                    '--theme-outline': '#92400e',
                    '--theme-outline-variant': '#78350f',
                    '--theme-accent': '#fde68a',
                    '--theme-accent-hover': '#f59e0b',
                    '--theme-accent-active': '#d97706',
                    '--theme-accent-light': 'rgba(253, 230, 138, 0.2)',
                    '--theme-tab-nav-bg': '#3a3a2a',
                    '--theme-tab-hover': 'rgba(245, 158, 11, 0.2)',
                    '--theme-tab-active-color': '#fde68a',
                    '--theme-button-primary': '#f59e0b',
                    '--theme-button-primary-hover': '#d97706',
                    '--theme-button-secondary': '#3a3a2a',
                    '--theme-button-secondary-hover': '#4a4a3a',
                    '--theme-input-background': '#2a2a1a',
                    '--theme-input-border': '#92400e',
                    '--theme-input-focus': '#fde68a',
                    '--theme-card-background': '#2a2a1a',
                    '--theme-card-border': '#3a3a2a',
                    '--theme-list-item-background': '#2a2a1a',
                    '--theme-list-item-hover': '#3a3a2a',
                    '--theme-list-item-active': '#f59e0b',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.5)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.6)',
                    '--theme-success': '#22c55e',
                    '--theme-warning': '#f59e0b',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'platinum': {
                    '--theme-primary': '#6b7280',
                    '--theme-secondary': '#4b5563',
                    '--theme-gradient': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    '--theme-background': '#ffffff',
                    '--theme-surface': '#ffffff',
                    '--theme-surface-secondary': '#f9fafb',
                    '--theme-surface-tertiary': '#f3f4f6',
                    '--theme-surface-hover': '#e5e7eb',
                    '--theme-surface-active': '#d1d5db',
                    '--theme-surface-elevated': '#ffffff',
                    '--theme-surface-modal': '#ffffff',
                    '--theme-on-surface': '#374151',
                    '--theme-on-surface-variant': '#6b7280',
                    '--theme-on-surface-secondary': '#9ca3af',
                    '--theme-on-background': '#374151',
                    '--theme-text-primary': '#374151',
                    '--theme-text-secondary': '#6b7280',
                    '--theme-text-tertiary': '#9ca3af',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#d1d5db',
                    '--theme-border': '#e5e7eb',
                    '--theme-border-variant': '#d1d5db',
                    '--theme-border-light': '#f3f4f6',
                    '--theme-border-focus': '#6b7280',
                    '--theme-outline': '#e5e7eb',
                    '--theme-outline-variant': '#f3f4f6',
                    '--theme-accent': '#6b7280',
                    '--theme-accent-hover': '#4b5563',
                    '--theme-accent-active': '#374151',
                    '--theme-accent-light': 'rgba(107, 114, 128, 0.1)',
                    '--theme-tab-nav-bg': '#f9fafb',
                    '--theme-tab-hover': 'rgba(107, 114, 128, 0.1)',
                    '--theme-tab-active-color': '#6b7280',
                    '--theme-button-primary': '#6b7280',
                    '--theme-button-primary-hover': '#4b5563',
                    '--theme-button-secondary': '#f9fafb',
                    '--theme-button-secondary-hover': '#f3f4f6',
                    '--theme-input-background': '#ffffff',
                    '--theme-input-border': '#e5e7eb',
                    '--theme-input-focus': '#6b7280',
                    '--theme-card-background': '#ffffff',
                    '--theme-card-border': '#e5e7eb',
                    '--theme-list-item-background': '#ffffff',
                    '--theme-list-item-hover': '#f9fafb',
                    '--theme-list-item-active': '#6b7280',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.2)',
                    '--theme-success': '#10b981',
                    '--theme-warning': '#f59e0b',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'platinum-dark': {
                    '--theme-primary': '#6b7280',
                    '--theme-secondary': '#4b5563',
                    '--theme-gradient': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    '--theme-background': '#1a1a1a',
                    '--theme-surface': '#2d2d2d',
                    '--theme-surface-secondary': '#3a3a3a',
                    '--theme-surface-tertiary': '#4a4a4a',
                    '--theme-surface-hover': '#4a4a4a',
                    '--theme-surface-active': '#3a3a3a',
                    '--theme-surface-elevated': '#2d2d2d',
                    '--theme-surface-modal': '#2d2d2d',
                    '--theme-on-surface': '#e5e7eb',
                    '--theme-on-surface-variant': '#d1d5db',
                    '--theme-on-surface-secondary': '#9ca3af',
                    '--theme-on-background': '#e5e7eb',
                    '--theme-text-primary': '#e5e7eb',
                    '--theme-text-secondary': '#d1d5db',
                    '--theme-text-tertiary': '#9ca3af',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#6b7280',
                    '--theme-border': '#404040',
                    '--theme-border-variant': '#333333',
                    '--theme-border-light': '#4a4a4a',
                    '--theme-border-focus': '#6b7280',
                    '--theme-outline': '#404040',
                    '--theme-outline-variant': '#333333',
                    '--theme-accent': '#6b7280',
                    '--theme-accent-hover': '#4b5563',
                    '--theme-accent-active': '#374151',
                    '--theme-accent-light': 'rgba(107, 114, 128, 0.2)',
                    '--theme-tab-nav-bg': '#3a3a3a',
                    '--theme-tab-hover': 'rgba(107, 114, 128, 0.2)',
                    '--theme-tab-active-color': '#6b7280',
                    '--theme-button-primary': '#6b7280',
                    '--theme-button-primary-hover': '#4b5563',
                    '--theme-button-secondary': '#3a3a3a',
                    '--theme-button-secondary-hover': '#4a4a4a',
                    '--theme-input-background': '#2d2d2d',
                    '--theme-input-border': '#404040',
                    '--theme-input-focus': '#6b7280',
                    '--theme-card-background': '#2d2d2d',
                    '--theme-card-border': '#404040',
                    '--theme-list-item-background': '#2d2d2d',
                    '--theme-list-item-hover': '#3a3a3a',
                    '--theme-list-item-active': '#6b7280',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.5)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.6)',
                    '--theme-success': '#22c55e',
                    '--theme-warning': '#eab308',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'obsidian': {
                    '--theme-primary': '#000000',
                    '--theme-secondary': '#1a1a1a',
                    '--theme-gradient': 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                    '--theme-background': '#ffffff',
                    '--theme-surface': '#ffffff',
                    '--theme-surface-secondary': '#f9f9f9',
                    '--theme-surface-tertiary': '#f5f5f5',
                    '--theme-surface-hover': '#f0f0f0',
                    '--theme-surface-active': '#e8e8e8',
                    '--theme-surface-elevated': '#ffffff',
                    '--theme-surface-modal': '#ffffff',
                    '--theme-on-surface': '#000000',
                    '--theme-on-surface-variant': '#333333',
                    '--theme-on-surface-secondary': '#666666',
                    '--theme-on-background': '#000000',
                    '--theme-text-primary': '#000000',
                    '--theme-text-secondary': '#333333',
                    '--theme-text-tertiary': '#666666',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#999999',
                    '--theme-border': '#e0e0e0',
                    '--theme-border-variant': '#d1d1d6',
                    '--theme-border-light': '#f0f0f0',
                    '--theme-border-focus': '#000000',
                    '--theme-outline': '#e0e0e0',
                    '--theme-outline-variant': '#f0f0f0',
                    '--theme-accent': '#000000',
                    '--theme-accent-hover': '#1a1a1a',
                    '--theme-accent-active': '#333333',
                    '--theme-accent-light': 'rgba(0, 0, 0, 0.1)',
                    '--theme-tab-nav-bg': '#f9f9f9',
                    '--theme-tab-hover': 'rgba(0, 0, 0, 0.1)',
                    '--theme-tab-active-color': '#000000',
                    '--theme-button-primary': '#000000',
                    '--theme-button-primary-hover': '#1a1a1a',
                    '--theme-button-secondary': '#f9f9f9',
                    '--theme-button-secondary-hover': '#f0f0f0',
                    '--theme-input-background': '#ffffff',
                    '--theme-input-border': '#e0e0e0',
                    '--theme-input-focus': '#000000',
                    '--theme-card-background': '#ffffff',
                    '--theme-card-border': '#e0e0e0',
                    '--theme-list-item-background': '#ffffff',
                    '--theme-list-item-hover': '#f9f9f9',
                    '--theme-list-item-active': '#000000',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.2)',
                    '--theme-success': '#10b981',
                    '--theme-warning': '#f59e0b',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'obsidian-dark': {
                    '--theme-primary': '#ffffff',
                    '--theme-secondary': '#e5e5e5',
                    '--theme-gradient': 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
                    '--theme-background': '#000000',
                    '--theme-surface': '#1a1a1a',
                    '--theme-surface-secondary': '#2d2d2d',
                    '--theme-surface-tertiary': '#3a3a3a',
                    '--theme-surface-hover': '#3a3a3a',
                    '--theme-surface-active': '#2d2d2d',
                    '--theme-surface-elevated': '#1a1a1a',
                    '--theme-surface-modal': '#1a1a1a',
                    '--theme-on-surface': '#ffffff',
                    '--theme-on-surface-variant': '#e5e5e5',
                    '--theme-on-surface-secondary': '#cccccc',
                    '--theme-on-background': '#ffffff',
                    '--theme-text-primary': '#ffffff',
                    '--theme-text-secondary': '#e5e5e5',
                    '--theme-text-tertiary': '#cccccc',
                    '--theme-text-on-gradient': '#000000',
                    '--theme-text-muted': '#999999',
                    '--theme-border': '#404040',
                    '--theme-border-variant': '#333333',
                    '--theme-border-light': '#3a3a3a',
                    '--theme-border-focus': '#ffffff',
                    '--theme-outline': '#404040',
                    '--theme-outline-variant': '#333333',
                    '--theme-accent': '#ffffff',
                    '--theme-accent-hover': '#e5e5e5',
                    '--theme-accent-active': '#cccccc',
                    '--theme-accent-light': 'rgba(255, 255, 255, 0.2)',
                    '--theme-tab-nav-bg': '#2d2d2d',
                    '--theme-tab-hover': 'rgba(255, 255, 255, 0.2)',
                    '--theme-tab-active-color': '#ffffff',
                    '--theme-button-primary': '#ffffff',
                    '--theme-button-primary-hover': '#e5e5e5',
                    '--theme-button-secondary': '#2d2d2d',
                    '--theme-button-secondary-hover': '#3a3a3a',
                    '--theme-input-background': '#1a1a1a',
                    '--theme-input-border': '#404040',
                    '--theme-input-focus': '#ffffff',
                    '--theme-card-background': '#1a1a1a',
                    '--theme-card-border': '#404040',
                    '--theme-list-item-background': '#1a1a1a',
                    '--theme-list-item-hover': '#2d2d2d',
                    '--theme-list-item-active': '#ffffff',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.5)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.6)',
                    '--theme-success': '#22c55e',
                    '--theme-warning': '#eab308',
                    '--theme-error': '#ef4444',
                    '--theme-info': '#3b82f6'
                },
                'amethyst-dark': {
                    '--theme-primary': '#8B5CF6',
                    '--theme-secondary': '#6D28D9',
                    '--theme-gradient': 'linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)',
                    '--theme-background': '#1A0A1A',
                    '--theme-surface': '#2A1A2A',
                    '--theme-surface-secondary': '#3A2A3A',
                    '--theme-surface-tertiary': '#4A3A4A',
                    '--theme-surface-hover': '#4A3A4A',
                    '--theme-surface-active': '#3A2A3A',
                    '--theme-surface-elevated': '#2A1A2A',
                    '--theme-surface-modal': '#2A1A2A',
                    '--theme-on-surface': '#E8D4E8',
                    '--theme-on-surface-variant': '#C4B5FD',
                    '--theme-on-surface-secondary': '#A78BFA',
                    '--theme-on-background': '#E8D4E8',
                    '--theme-text-primary': '#E8D4E8',
                    '--theme-text-secondary': '#C4B5FD',
                    '--theme-text-tertiary': '#A78BFA',
                    '--theme-text-on-gradient': '#ffffff',
                    '--theme-text-muted': '#8B5CF6',
                    '--theme-border': '#5B21B6',
                    '--theme-border-variant': '#4C1D95',
                    '--theme-border-light': '#4A3A4A',
                    '--theme-border-focus': '#C4B5FD',
                    '--theme-outline': '#5B21B6',
                    '--theme-outline-variant': '#4C1D95',
                    '--theme-accent': '#C4B5FD',
                    '--theme-accent-hover': '#8B5CF6',
                    '--theme-accent-active': '#7C3AED',
                    '--theme-accent-light': 'rgba(196, 181, 253, 0.2)',
                    '--theme-tab-nav-bg': '#3A2A3A',
                    '--theme-tab-hover': 'rgba(139, 92, 246, 0.2)',
                    '--theme-tab-active-color': '#C4B5FD',
                    '--theme-button-primary': '#8B5CF6',
                    '--theme-button-primary-hover': '#7C3AED',
                    '--theme-button-secondary': '#3A2A3A',
                    '--theme-button-secondary-hover': '#4A3A4A',
                    '--theme-input-background': '#2A1A2A',
                    '--theme-input-border': '#5B21B6',
                    '--theme-input-focus': '#C4B5FD',
                    '--theme-card-background': '#2A1A2A',
                    '--theme-card-border': '#3A2A3A',
                    '--theme-list-item-background': '#2A1A2A',
                    '--theme-list-item-hover': '#3A2A3A',
                    '--theme-list-item-active': '#8B5CF6',
                    '--theme-shadow': '0 2px 8px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-light': '0 1px 3px rgba(0, 0, 0, 0.4)',
                    '--theme-shadow-medium': '0 2px 8px rgba(0, 0, 0, 0.5)',
                    '--theme-shadow-heavy': '0 4px 16px rgba(0, 0, 0, 0.6)',
                    '--theme-success': '#22C55E',
                    '--theme-warning': '#EAB308',
                    '--theme-error': '#EF4444',
                    '--theme-info': '#3B82F6'
                }
            };

            const themeConfig = themes[themeName] || themes.classic;
            const root = document.documentElement;

            // Apply CSS custom properties
            Object.entries(themeConfig).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });

            // Set theme attribute for potential CSS selectors
            document.body.setAttribute('data-theme', themeName);

            return themeConfig;
        }, theme);

        await page.waitForTimeout(1000); // Wait for theme to apply
        return themeConfig;
    }

    async capturePopupScreenshots() {
        console.log('\n📱 Capturing popup screenshots...');

        // Load popup
        const popupUrl = `file://${path.join(this.extensionPath, 'popup.html')}`;
        await this.page.goto(popupUrl);

        // Wait for popup to load
        await this.page.waitForSelector('.tab-content', { timeout: 5000 });

        // Capture each tab for both light and dark themes
        const themes = ['classic', 'amethyst-dark'];

        for (const theme of themes) {
            console.log(`\n🎨 Capturing ${theme} theme...`);

            // Apply theme properly
            await this.applyTheme(this.page, theme);

            for (const tab of TABS) {
                console.log(`  📸 Capturing ${tab.name} tab...`);

                // Click tab button by data attribute
                await this.page.click(`.tab-button[data-tab="${tab.name}"]`);
                await this.page.waitForTimeout(500); // Wait for content to load

                // Use larger viewport to get actual popup dimensions
                await this.page.setViewportSize({ width: 400, height: 500 });
                await this.page.waitForTimeout(1000);

                // Get the actual popup container dimensions
                const popupDimensions = await this.page.evaluate(() => {
                    const container = document.querySelector('.container');
                    if (container) {
                        const rect = container.getBoundingClientRect();
                        return {
                            width: Math.ceil(rect.width),
                            height: Math.ceil(rect.height)
                        };
                    }
                    return { width: 320, height: 400 }; // fallback
                });

                console.log(`  📏 Popup dimensions: ${popupDimensions.width}x${popupDimensions.height}`);

                // Set viewport to actual popup size
                await this.page.setViewportSize({
                    width: popupDimensions.width,
                    height: popupDimensions.height
                });
                await this.page.waitForTimeout(500);

                // Prevent scrollbars and ensure content fits
                await this.page.evaluate(() => {
                    document.documentElement.style.overflow = 'hidden';
                    document.body.style.overflow = 'hidden';

                    // Ensure the container fits the viewport
                    const container = document.querySelector('.container');
                    if (container) {
                        container.style.width = '100%';
                        container.style.height = '100%';
                        container.style.maxWidth = '100%';
                        container.style.maxHeight = '100%';
                    }
                });
                await this.page.waitForTimeout(200);

                // Take popup screenshot
                const popupScreenshotBuffer = await this.page.screenshot({
                    type: 'png',
                    fullPage: false,
                    clip: { x: 0, y: 0, width: popupDimensions.width, height: popupDimensions.height }
                });

                // Determine theme colors
                const isDarkTheme = theme === 'amethyst-dark';
                const pageBackgroundColor = isDarkTheme ? '#1a1a1a' : '#ffffff';
                const pageTextColor = isDarkTheme ? '#e8eaed' : '#333333';
                const browserHeaderBg = isDarkTheme ? '#2d2d2d' : '#e8eaed';
                const browserHeaderBorder = isDarkTheme ? '#404040' : '#dadce0';
                const addressBarBg = isDarkTheme ? '#404040' : '#ffffff';
                const addressBarBorder = isDarkTheme ? '#5f6368' : '#dadce0';
                const addressBarText = isDarkTheme ? '#e8eaed' : '#5f6368';

                // Create browser window HTML with correct extension icon
                const browserHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>* { margin: 0; padding: 0; box-sizing: border-box; }body { width: 1280px; height: 800px; background: ${isDarkTheme ? '#0f0f0f' : '#f5f5f5'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative; overflow: hidden; }.browser-window { width: 100%; height: 100%; background: ${pageBackgroundColor}; border-radius: 8px 8px 0 0; box-shadow: 0 0 20px rgba(0,0,0,${isDarkTheme ? '0.3' : '0.1'}); display: flex; flex-direction: column; }.browser-header { height: 40px; background: ${browserHeaderBg}; border-bottom: 1px solid ${browserHeaderBorder}; display: flex; align-items: center; padding: 0 16px; }.window-controls { display: flex; gap: 8px; }.control-button { width: 12px; height: 12px; border-radius: 50%; }.control-close { background: #ff5f57; }.control-minimize { background: #ffbd2e; }.control-maximize { background: #28ca42; }.address-bar { flex: 1; margin: 0 16px; height: 28px; background: ${addressBarBg}; border: 1px solid ${addressBarBorder}; border-radius: 14px; display: flex; align-items: center; padding: 0 12px; color: ${addressBarText}; font-size: 13px; }.extension-toolbar { display: flex; align-items: center; gap: 8px; }.extension-icon { width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; }.browser-content { flex: 1; background: ${pageBackgroundColor}; position: relative; }.popup-container { position: absolute; top: 8px; right: 8px; background: transparent; z-index: 1000; }.popup-container img { box-shadow: 0 8px 24px rgba(0,0,0,${isDarkTheme ? '0.4' : '0.2'}); border-radius: 8px; border: 1px solid ${isDarkTheme ? '#404040' : '#e0e0e0'}; }.page-content { padding: 40px; color: ${pageTextColor}; line-height: 1.6; }.page-title { font-size: 32px; font-weight: 400; margin-bottom: 24px; color: ${isDarkTheme ? '#4285f4' : '#1a73e8'}; text-align: center; margin-top: 120px; }.search-box { max-width: 600px; margin: 0 auto 40px auto; }.search-input { width: 100%; height: 44px; border: 1px solid ${isDarkTheme ? '#5f6368' : '#dfe1e5'}; border-radius: 24px; padding: 0 20px; font-size: 16px; background: ${isDarkTheme ? '#303134' : '#ffffff'}; color: ${pageTextColor}; }.search-buttons { display: flex; justify-content: center; gap: 12px; margin-top: 30px; }.search-button { background: ${isDarkTheme ? '#303134' : '#f8f9fa'}; border: 1px solid ${isDarkTheme ? '#5f6368' : '#f8f9fa'}; border-radius: 4px; color: ${pageTextColor}; font-size: 14px; padding: 10px 20px; cursor: pointer; }</style></head><body><div class="browser-window"><div class="browser-header"><div class="window-controls"><div class="control-button control-close"></div><div class="control-button control-minimize"></div><div class="control-button control-maximize"></div></div><div class="address-bar">https://www.google.com</div><div class="extension-toolbar"><div class="extension-icon">T</div></div></div><div class="browser-content"><div class="page-content"><div class="page-title">Google</div><div class="search-box"><input type="text" class="search-input" placeholder="Search Google or type a URL"></div><div class="search-buttons"><button class="search-button">Google Search</button><button class="search-button">I'm Feeling Lucky</button></div></div><div class="popup-container" id="popup-container"></div></div></div></body></html>`;

                // Create browser page and insert popup
                const browserPage = await this.page.context().newPage();
                await browserPage.setViewportSize({ width: 1280, height: 800 });
                await browserPage.setContent(browserHtml);
                await browserPage.waitForTimeout(1000);

                await browserPage.evaluate((popupImageData) => {
                    const popupContainer = document.getElementById('popup-container');
                    if (popupContainer) {
                        const img = document.createElement('img');
                        img.src = 'data:image/png;base64,' + popupImageData;
                        img.style.display = 'block';
                        popupContainer.appendChild(img);
                    }
                }, popupScreenshotBuffer.toString('base64'));

                await browserPage.waitForTimeout(1000);

                // Take final screenshot
                const screenshotPath = path.join(this.outputDir, `popup_${tab.name}_${theme}_1280x800.png`);
                await browserPage.screenshot({
                    path: screenshotPath,
                    type: 'png',
                    fullPage: false
                });

                await browserPage.close();

                // Verify screenshot
                const stats = await fs.promises.stat(screenshotPath);
                console.log(`📸 Screenshot saved: popup_${tab.name}_${theme}_1280x800.png (${Math.round(stats.size / 1024)}KB)`);

                // Create small version
                const smallScreenshotPath = path.join(this.outputDir, `popup_${tab.name}_${theme}_640x400.png`);
                await fs.promises.copyFile(screenshotPath, smallScreenshotPath);
                console.log(`📸 Screenshot saved: popup_${tab.name}_${theme}_640x400.png`);
            }
        }
    }

    async captureOptionsScreenshots() {
        console.log('\n⚙️ Capturing options page screenshots...');

        // Load options page
        const optionsUrl = `file://${path.join(this.extensionPath, 'options.html')}`;
        await this.page.goto(optionsUrl);

        // Wait for options to load
        await this.page.waitForSelector('.tab-content-container', { timeout: 5000 });

        // Capture each options page for both themes
        const themes = ['classic', 'amethyst-dark'];

        for (const theme of themes) {
            console.log(`\n🎨 Capturing ${theme} theme...`);

            // Apply theme properly
            await this.applyTheme(this.page, theme);

            // For dark theme, we'll apply the theme directly without clicking the theme card
            // since the applyTheme method already handles the theme application
            if (theme === 'amethyst-dark') {
                console.log('  🎨 Applying amethyst-dark theme...');
                // The theme is already applied by the applyTheme method above
            }

            // Capture both appearance and about pages
            for (const page of OPTIONS_PAGES) {
                console.log(`  📸 Capturing ${page.name} page...`);

                // Click options nav tab by data attribute
                await this.page.click(`.nav-tab[data-tab="${page.name}"]`);
                await this.page.waitForTimeout(1000);

                // Wait for theme to be fully applied
                await this.page.waitForTimeout(2000);

                // Ensure content fits properly
                await this.page.evaluate(() => {
                    document.documentElement.style.overflow = 'hidden';
                    document.body.style.overflow = 'hidden';

                    // Ensure the container fits the viewport
                    const container = document.querySelector('.options-container');
                    if (container) {
                        container.style.width = '100%';
                        container.style.height = '100%';
                        container.style.maxWidth = '100%';
                        container.style.maxHeight = '100%';
                    }
                });
                await this.page.waitForTimeout(500);

                // Take screenshots in both sizes
                await this.takeScreenshot(`options_${page.name}_${theme}`, 'store', 'png');
                await this.takeScreenshot(`options_${page.name}_${theme}`, 'small', 'png');
            }
        }
    }

    async captureThemeScreenshots() {
        console.log('\n🎨 Capturing theme screenshots...');

        // Load popup
        const popupUrl = `file://${path.join(this.extensionPath, 'popup.html')}`;
        await this.page.goto(popupUrl);

        // Wait for popup to load
        await this.page.waitForSelector('.tab-content', { timeout: 5000 });

        // Capture each theme
        for (const theme of THEMES) {
            console.log(`  📸 Capturing ${theme} theme...`);

            // Apply theme properly
            await this.applyTheme(this.page, theme);

            // Take screenshots for calculator tab (most representative)
            await this.page.click(`.tab-button[data-tab="calculator"]`);
            await this.page.waitForTimeout(500);

            await this.takeScreenshot(`theme_${theme}`, 'store', 'png');
            await this.takeScreenshot(`theme_${theme}`, 'small', 'png');
        }
    }

    async capturePromoScreenshots() {
        console.log('\n🎯 Capturing promo screenshots...');
        console.log('  ⏭️ Skipping promo screenshots as requested');
    }

    // Removed createPromoPages method as requested

    async run(type = 'all') {
        try {
            await this.init();

            switch (type) {
                case 'popup':
                    await this.capturePopupScreenshots();
                    break;
                case 'options':
                    await this.captureOptionsScreenshots();
                    break;
                case 'themes':
                    await this.captureThemeScreenshots();
                    break;
                case 'promo':
                    await this.capturePromoScreenshots();
                    break;
                case 'all':
                default:
                    await this.capturePopupScreenshots();
                    await this.captureOptionsScreenshots();
                    await this.captureThemeScreenshots();
                    await this.capturePromoScreenshots();
                    break;
            }

            console.log('\n✅ All screenshots completed successfully!');
            console.log(`📁 Screenshots saved to: ${this.outputDir}`);

        } catch (error) {
            console.error('❌ Error during screenshot capture:', error);
        } finally {
            await this.cleanup();
        }
    }
}

// CLI handling
async function main() {
    const type = process.argv[2] || 'all';
    const automation = new ScreenshotAutomation();
    await automation.run(type);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ScreenshotAutomation;
