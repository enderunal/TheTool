/**
 * Generate PNG icons from SVG source
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if we have sharp installed
let sharp;
try {
    sharp = require('sharp');
} catch (err) {
    console.log('Sharp not installed. Installing...');
    console.log('Please run: npm install sharp');
    console.log('Then run this script again.');
    process.exit(1);
}

const svgPath = path.join(__dirname, 'icon.svg');
const sizes = [16, 48, 128];

async function generateIcons() {
    try {
        // Read SVG file
        const svgBuffer = fs.readFileSync(svgPath);

        console.log('Generating PNG icons from SVG...');

        // Generate each size
        for (const size of sizes) {
            const outputPath = path.join(__dirname, `icon${size}.png`);

            await sharp(svgBuffer)
                .resize(size, size)
                .png({
                    quality: 100,
                    compressionLevel: 9
                })
                .toFile(outputPath);

            console.log(`✓ Generated ${outputPath}`);
        }

        console.log('All icons generated successfully!');

    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

// Alternative method using canvas if sharp fails
async function generateIconsCanvas() {
    try {
        const { createCanvas, loadImage } = require('canvas');
        const svgContent = fs.readFileSync(svgPath, 'utf8');

        // Convert SVG to data URL
        const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

        for (const size of sizes) {
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');

            const img = await loadImage(svgDataUrl);
            ctx.drawImage(img, 0, 0, size, size);

            const buffer = canvas.toBuffer('image/png');
            const outputPath = path.join(__dirname, `icon${size}.png`);

            fs.writeFileSync(outputPath, buffer);
            console.log(`✓ Generated ${outputPath}`);
        }

        console.log('All icons generated successfully using Canvas!');

    } catch (error) {
        console.error('Error with canvas method:', error);
        console.log('Manual conversion needed - use online SVG to PNG converter');
    }
}

// Try sharp first, fallback to canvas
generateIcons().catch(() => {
    console.log('Sharp failed, trying canvas...');
    generateIconsCanvas();
});
