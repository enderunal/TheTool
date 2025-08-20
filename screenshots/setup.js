const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TheTool Screenshot Automation...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.log('❌ package.json not found. Please run this script from the screenshots directory.');
    process.exit(1);
}

try {
    // Install npm dependencies
    console.log('📦 Installing npm dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Install Playwright browsers
    console.log('\n🌐 Installing Playwright browsers...');
    execSync('npx playwright install chromium', { stdio: 'inherit' });

    // Create output directory
    console.log('\n📁 Creating output directory...');
    if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { recursive: true });
    }

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📸 You can now run screenshots:');
    console.log('   npm run screenshots        # All screenshots');
    console.log('   npm run screenshots:popup  # Popup only');
    console.log('   npm run screenshots:options # Options only');
    console.log('   npm run screenshots:themes  # Themes only');
    console.log('   npm run screenshots:promo   # Promo only');

} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
}
