# TheTool Screenshot Automation

Automated screenshot generation for Chrome Web Store submissions using Playwright.

## 📋 Requirements

- Node.js 16+ 
- Playwright

## 🚀 Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## 📸 Usage

### Generate All Screenshots
```bash
npm run screenshots
# or
node screenshots.js
```

### Generate Specific Screenshots
```bash
# Popup screenshots only
npm run screenshots:popup
node screenshots.js popup

# Options page screenshots only
npm run screenshots:options
node screenshots.js options

# Theme screenshots only
npm run screenshots:themes
node screenshots.js themes

# Promo screenshots only
npm run screenshots:promo
node screenshots.js promo
```

## 📁 Output Structure

Screenshots are saved to `screenshots/output/` with the following naming convention:

### Popup Screenshots
- `popup_calculator_1280x800.png` - Calculator tab (1280x800)
- `popup_calculator_640x400.png` - Calculator tab (640x400)
- `popup_stopwatch_1280x800.png` - Stopwatch tab (1280x800)
- `popup_stopwatch_640x400.png` - Stopwatch tab (640x400)
- `popup_timer_1280x800.png` - Timer tab (1280x800)
- `popup_timer_640x400.png` - Timer tab (640x400)
- `popup_pomodoro_1280x800.png` - Pomodoro tab (1280x800)
- `popup_pomodoro_640x400.png` - Pomodoro tab (640x400)
- `popup_calendar_1280x800.png` - Calendar tab (1280x800)
- `popup_calendar_640x400.png` - Calendar tab (640x400)
- `popup_notes_1280x800.png` - Notes tab (1280x800)
- `popup_notes_640x400.png` - Notes tab (640x400)

### Options Page Screenshots
- `options_appearance_1280x800.png` - Appearance tab (1280x800)
- `options_appearance_640x400.png` - Appearance tab (640x400)
- `options_about_1280x800.png` - About tab (1280x800)
- `options_about_640x400.png` - About tab (640x400)

### Theme Screenshots
- `theme_classic_1280x800.png` - Classic theme (1280x800)
- `theme_classic_640x400.png` - Classic theme (640x400)
- `theme_classic-dark_1280x800.png` - Classic Dark theme (1280x800)
- `theme_classic-dark_640x400.png` - Classic Dark theme (640x400)
- `theme_gold_1280x800.png` - Gold theme (1280x800)
- `theme_gold_640x400.png` - Gold theme (640x400)
- `theme_gold-dark_1280x800.png` - Gold Dark theme (1280x800)
- `theme_gold-dark_640x400.png` - Gold Dark theme (640x400)
- `theme_platinum_1280x800.png` - Platinum theme (1280x800)
- `theme_platinum_640x400.png` - Platinum theme (640x400)
- `theme_platinum-dark_1280x800.png` - Platinum Dark theme (1280x800)
- `theme_platinum-dark_640x400.png` - Platinum Dark theme (640x400)
- `theme_obsidian_1280x800.png` - Obsidian theme (1280x800)
- `theme_obsidian_640x400.png` - Obsidian theme (640x400)
- `theme_obsidian-dark_1280x800.png` - Obsidian Dark theme (1280x800)
- `theme_obsidian-dark_640x400.png` - Obsidian Dark theme (640x400)

### Promo Screenshots
- `promo_small_440x280.png` - Small promo tile (440x280)
- `promo_marquee_1400x560.png` - Marquee promo tile (1400x560)

## 🎨 Chrome Web Store Requirements

### Screenshots
- **Size**: 1280x800 or 640x400
- **Format**: JPEG or 24-bit PNG (no alpha)
- **Content**: Each tab of the popup, options pages

### Promo Tiles
- **Small Promo Tile**: 440x280
- **Marquee Promo Tile**: 1400x560
- **Format**: JPEG or 24-bit PNG (no alpha)

## 🔧 Configuration

### Screenshot Sizes
Edit `screenshots.js` to modify sizes:

```javascript
const SCREENSHOT_SIZES = {
  store: { width: 1280, height: 800 },
  small: { width: 640, height: 400 }
};
```

### Promo Sizes
```javascript
const PROMO_SIZES = {
  small: { width: 440, height: 280 },
  marquee: { width: 1400, height: 560 }
};
```

### Themes
```javascript
const THEMES = ['classic', 'classic-dark', 'gold', 'gold-dark', 'platinum', 'platinum-dark', 'obsidian', 'obsidian-dark'];
```

### Tabs
```javascript
const TABS = [
  { name: 'calculator', selector: '#calculator-tab' },
  { name: 'stopwatch', selector: '#stopwatch-tab' },
  { name: 'timer', selector: '#timer-tab' },
  { name: 'pomodoro', selector: '#pomodoro-tab' },
  { name: 'calendar', selector: '#calendar-tab' },
  { name: 'notes', selector: '#notes-tab' }
];
```

## 🐛 Troubleshooting

### Common Issues

1. **Extension not loading**
   - Ensure the extension path is correct
   - Check that manifest.json is valid

2. **Screenshots not capturing**
   - Increase timeout values in the script
   - Check browser console for errors

3. **Theme not applying**
   - Verify theme names match those in the extension
   - Check localStorage implementation

### Debug Mode

To run in debug mode (non-headless):
```javascript
this.browser = await chromium.launch({
  headless: false, // Change to false for debugging
  // ... other options
});
```

## 📝 Notes

- Screenshots are taken in PNG format by default for best quality
- JPEG format is available with 90% quality
- All screenshots are 24-bit (no alpha channel)
- The script automatically handles theme switching via localStorage
- Promo tiles are generated with custom HTML templates

## 🤝 Contributing

To add new screenshot types or modify existing ones:

1. Update the configuration constants
2. Add new capture methods to the `ScreenshotAutomation` class
3. Update the CLI handling in the `run()` method
4. Test with a specific type first before running all
