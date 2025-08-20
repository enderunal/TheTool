const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Configuration
const SCREENSHOT_SIZES = {
    store: { width: 1280, height: 800 },
    small: { width: 640, height: 400 }
};

const PROMO_SIZES = {
    small: { width: 440, height: 280 },
    marquee: { width: 1400, height: 560 }
};

const THEMES = ['classic', 'classic-dark', 'gold', 'gold-dark', 'platinum', 'platinum-dark', 'obsidian', 'obsidian-dark'];

const TABS = [
    { name: 'calculator', selector: '#calculator-tab' },
    { name: 'stopwatch', selector: '#stopwatch-tab' },
    { name: 'timer', selector: '#timer-tab' },
    { name: 'pomodoro', selector: '#pomodoro-tab' },
    { name: 'calendar', selector: '#calendar-tab' },
    { name: 'notes', selector: '#notes-tab' }
];

const OPTIONS_PAGES = [
    { name: 'appearance', selector: '#appearance-tab' },
    { name: 'about', selector: '#about-tab' }
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
        const { width, height } = size === 'store' ? SCREENSHOT_SIZES.store : SCREENSHOT_SIZES.small;

        await this.page.setViewportSize({ width, height });

        const filename = `${name}_${width}x${height}.${format}`;
        const filepath = path.join(this.outputDir, filename);

        await this.page.screenshot({
            path: filepath,
            type: format === 'png' ? 'png' : 'jpeg',
            quality: format === 'jpeg' ? 90 : undefined
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

    async capturePopupScreenshots() {
        console.log('\n📱 Capturing popup screenshots...');

        // Load popup
        const popupUrl = `file://${path.join(this.extensionPath, 'popup.html')}`;
        await this.page.goto(popupUrl);

        // Wait for popup to load
        await this.page.waitForSelector('.tab-content', { timeout: 5000 });

        // Capture each tab
        for (const tab of TABS) {
            console.log(`  📸 Capturing ${tab.name} tab...`);

            // Click tab
            await this.page.click(tab.selector);
            await this.page.waitForTimeout(500); // Wait for content to load

            // Take screenshots in both sizes
            await this.takeScreenshot(`popup_${tab.name}`, 'store', 'png');
            await this.takeScreenshot(`popup_${tab.name}`, 'small', 'png');
        }
    }

    async captureOptionsScreenshots() {
        console.log('\n⚙️ Capturing options page screenshots...');

        // Load options page
        const optionsUrl = `file://${path.join(this.extensionPath, 'options.html')}`;
        await this.page.goto(optionsUrl);

        // Wait for options to load
        await this.page.waitForSelector('.tab-content', { timeout: 5000 });

        // Capture each options page
        for (const page of OPTIONS_PAGES) {
            console.log(`  📸 Capturing ${page.name} page...`);

            // Click tab
            await this.page.click(page.selector);
            await this.page.waitForTimeout(500);

            // Take screenshots in both sizes
            await this.takeScreenshot(`options_${page.name}`, 'store', 'png');
            await this.takeScreenshot(`options_${page.name}`, 'small', 'png');
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

            // Apply theme via localStorage
            await this.page.evaluate((themeName) => {
                localStorage.setItem('selectedTheme', themeName);
                // Trigger theme change
                const event = new CustomEvent('themeChanged', { detail: themeName });
                window.dispatchEvent(event);
            }, theme);

            await this.page.waitForTimeout(1000); // Wait for theme to apply

            // Take screenshots for calculator tab (most representative)
            await this.page.click('#calculator-tab');
            await this.page.waitForTimeout(500);

            await this.takeScreenshot(`theme_${theme}`, 'store', 'png');
            await this.takeScreenshot(`theme_${theme}`, 'small', 'png');
        }
    }

    async capturePromoScreenshots() {
        console.log('\n🎯 Capturing promo screenshots...');

        // Create promo pages
        await this.createPromoPages();

        // Small promo tile
        await this.page.goto(`file://${path.join(this.outputDir, 'promo_small.html')}`);
        await this.page.waitForTimeout(1000);
        await this.takePromoScreenshot('small', 'small', 'png');

        // Marquee promo tile
        await this.page.goto(`file://${path.join(this.outputDir, 'promo_marquee.html')}`);
        await this.page.waitForTimeout(1000);
        await this.takePromoScreenshot('marquee', 'marquee', 'png');
    }

    async createPromoPages() {
        console.log('  📝 Creating promo pages...');

        // Small promo tile (440x280)
        const smallPromoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TheTool - All-in-One Productivity Tools</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 440px;
            height: 280px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            overflow: hidden;
        }
        .logo {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
            text-align: center;
        }
        .subtitle {
            font-size: 14px;
            opacity: 0.9;
            text-align: center;
            max-width: 300px;
        }
        .features {
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        .feature {
            background: rgba(255,255,255,0.2);
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="logo">T</div>
    <div class="title">TheTool</div>
    <div class="subtitle">All-in-One Productivity Tools</div>
    <div class="features">
        <div class="feature">Calculator</div>
        <div class="feature">Timer</div>
        <div class="feature">Notes</div>
    </div>
</body>
</html>`;

        // Marquee promo tile (1400x560)
        const marqueePromoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TheTool - All-in-One Productivity Tools</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 1400px;
            height: 560px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            color: white;
            overflow: hidden;
        }
        .left-section {
            flex: 1;
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .logo {
            font-size: 120px;
            font-weight: bold;
            margin-bottom: 30px;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
        }
        .title {
            font-size: 64px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        .subtitle {
            font-size: 24px;
            opacity: 0.9;
            margin-bottom: 40px;
        }
        .features {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .feature {
            background: rgba(255,255,255,0.2);
            padding: 15px 25px;
            border-radius: 30px;
            font-size: 18px;
            backdrop-filter: blur(10px);
        }
        .right-section {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
        }
        .mockup {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.2);
        }
        .mockup-content {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            width: 400px;
        }
        .mockup-item {
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="left-section">
        <div class="logo">T</div>
        <div class="title">TheTool</div>
        <div class="subtitle">All-in-One Productivity Tools</div>
        <div class="features">
            <div class="feature">Calculator</div>
            <div class="feature">Stopwatch</div>
            <div class="feature">Timer</div>
            <div class="feature">Pomodoro</div>
            <div class="feature">Calendar</div>
            <div class="feature">Notes</div>
        </div>
    </div>
    <div class="right-section">
        <div class="mockup">
            <div class="mockup-content">
                <div class="mockup-item">📊 Calculator</div>
                <div class="mockup-item">⏱️ Stopwatch</div>
                <div class="mockup-item">⏰ Timer</div>
                <div class="mockup-item">🍅 Pomodoro</div>
                <div class="mockup-item">📅 Calendar</div>
                <div class="mockup-item">📝 Notes</div>
            </div>
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync(path.join(this.outputDir, 'promo_small.html'), smallPromoHTML);
        fs.writeFileSync(path.join(this.outputDir, 'promo_marquee.html'), marqueePromoHTML);
    }

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
