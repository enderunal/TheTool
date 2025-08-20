const ScreenshotAutomation = require('./screenshots.js');

async function testScreenshotAutomation() {
    console.log('🧪 Testing Screenshot Automation...\n');

    const automation = new ScreenshotAutomation();

    try {
        await automation.init();
        console.log('✅ Browser initialization successful');

        // Test popup loading
        const popupUrl = `file://${automation.extensionPath}/popup.html`;
        await automation.page.goto(popupUrl);
        console.log('✅ Popup loading successful');

        // Test options loading
        const optionsUrl = `file://${automation.extensionPath}/options.html`;
        await automation.page.goto(optionsUrl);
        console.log('✅ Options page loading successful');

        // Test theme switching
        await automation.page.goto(popupUrl);
        await automation.page.evaluate(() => {
            localStorage.setItem('selectedTheme', 'classic-dark');
            const event = new CustomEvent('themeChanged', { detail: 'classic-dark' });
            window.dispatchEvent(event);
        });
        console.log('✅ Theme switching successful');

        // Take a test screenshot
        await automation.takeScreenshot('test', 'small', 'png');
        console.log('✅ Screenshot capture successful');

        console.log('\n🎉 All tests passed! Screenshot automation is ready to use.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await automation.cleanup();
    }
}

if (require.main === module) {
    testScreenshotAutomation().catch(console.error);
}

module.exports = testScreenshotAutomation;
