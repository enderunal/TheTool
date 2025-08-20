# TheTool - All-in-One Productivity Chrome Extension

A powerful Chrome extension providing instant access to essential productivity tools directly from your browser toolbar. Built with zero animations for lightning-fast performance and complete offline functionality.

## 🚀 Features

### 🧮 **Calculator**
- **High-precision arithmetic** - Handles 0.1 + 0.2 = 0.3 correctly
- **No artificial limits** - Support for very large and small numbers
- **Advanced operations** - Percentages, memory functions, and operator precedence
- **Full keyboard support** - All standard calculator shortcuts
- **Persistent state** - Calculations saved between sessions

### ⏱️ **Stopwatch**
- **Millisecond precision** - Accurate timing with drift correction
- **Lap functionality** - Record and display multiple lap times
- **Persistent operation** - Continues running when popup is closed
- **Export capability** - Copy lap times to clipboard
- **Keyboard shortcuts** - Space to start/stop, L for lap

### ⏰ **Countdown Timer**
- **Preset options** - Quick 1m, 5m, 10m, 30m buttons
- **Custom timing** - Set any time up to 23:59:59
- **Audio alerts** - Sound notification when timer finishes
- **Browser notifications** - Desktop alerts with permission
- **Pause/Resume** - Full control over timer state

### 🍅 **Pomodoro Timer**
- **Configurable sessions** - Customize focus/break/long-break durations
- **Auto-advance** - Automatically moves between phases
- **Session tracking** - Count completed pomodoros
- **Daily statistics** - Track total focus time and completed sessions
- **Audio cues** - Different sounds for different phase transitions
- **Mute option** - Toggle sound on/off

### 📅 **Calendar**
- **Month view** - Clean calendar layout with current month display
- **ISO week numbers** - Shows standard week numbers (1-53)
- **Today highlighting** - Current date clearly marked
- **Keyboard navigation** - Arrow keys to navigate months
- **Quick access** - Always shows current month first

### 📝 **Notes**
- **Auto-save** - Saves as you type (2-second delay)
- **Search functionality** - Find notes by title or content
- **Pin favorites** - Double-click to pin important notes to top
- **Persistent storage** - Notes saved locally with sync option
- **Rich editing** - Full-featured text editor with keyboard shortcuts

## ⚡ Performance Features

- **Zero animations** - Instant tool switching for maximum speed
- **Offline-first** - All tools work without internet connection
- **Memory efficient** - Lightweight code with minimal resource usage
- **Fast startup** - Opens in <100ms on typical machines
- **Persistent state** - All data maintained between sessions

## 🎯 Quick Start

### Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked" and select the TheTool folder
5. Pin the extension to your toolbar for quick access

### Usage
- **Tab Navigation**: Click icons or use Alt+1-6 to switch tools
- **Calculator**: Use mouse or keyboard (0-9, +, -, *, /, Enter, etc.)
- **Stopwatch**: Space to start/stop, R to reset, L for lap
- **Timer**: Set time and press Start, automatic alerts when finished
- **Pomodoro**: Configurable work/break cycles with auto-advance
- **Calendar**: Navigate with arrow keys, Home to go to today
- **Notes**: Ctrl+N for new note, Ctrl+S to save, auto-search as you type

## 🔧 Technical Specifications

- **Manifest Version**: V3 (latest Chrome standard)
- **Permissions**: Storage, Notifications, Alarms
- **Technologies**: Pure JavaScript ES6+, HTML5, CSS3
- **Architecture**: Modular design with separate files for each tool
- **Storage**: Chrome local storage with sync option for notes
- **Precision**: Uses decimal arithmetic to avoid floating-point errors

## 📂 File Structure

```
TheTool/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.css             # Styling (no animations)
├── popup.js              # Tab navigation and initialization
├── calculator.js         # High-precision calculator
├── stopwatch.js          # Drift-corrected stopwatch
├── timer.js              # Countdown timer with alerts
├── pomodoro.js           # Pomodoro timer with auto-advance
├── calendar.js           # Calendar with ISO week numbers
├── notes.js              # Note-taking with auto-save
├── background.js         # Service worker
└── icons/               # Extension icons (16, 48, 128px)
```

## 🎨 Design Principles

- **Instant responsiveness** - No loading delays or animations
- **Clean interface** - Minimalist design focused on functionality
- **Consistent experience** - Same interactions across all tools
- **Accessible** - Full keyboard navigation support
- **Mobile-ready** - Optimized for various screen sizes

## ⚙️ Advanced Features

### Calculator
- Handles expressions like `(100 + 5%) × 2 = 210`
- Exponential notation for very large/small numbers
- 15-digit precision maintenance
- Error handling for division by zero

### Timers (Stopwatch, Timer, Pomodoro)
- Uses `performance.now()` for precise timing
- Drift correction algorithms
- Background operation capability
- Multiple notification methods

### Calendar
- ISO 8601 week numbering standard
- Handles leap years and month transitions
- Quick navigation shortcuts
- Visual distinction for today/selected dates

### Notes
- Real-time search through all note content
- Automatic backup and versioning
- Conflict resolution for sync storage
- Rich text support with line breaks

## 🛡️ Privacy & Security

- **No external calls** - Everything runs locally
- **No tracking** - Zero analytics or user monitoring  
- **Secure storage** - Uses Chrome's encrypted storage APIs
- **Minimal permissions** - Only requests necessary access
- **Open source** - Full code transparency

## 🔄 Version History

- **v1.1.0** - Complete feature set with all 6 tools
- **v1.0.0** - Initial release with calculator and stopwatch

## 📖 Keyboard Shortcuts Reference

| Tool | Action | Shortcut |
|------|--------|----------|
| **Global** | Switch tools | Alt+1-6 |
| **Calculator** | Numbers/operators | 0-9, +, -, *, / |
| **Calculator** | Equals | Enter or = |
| **Calculator** | Clear | Escape |
| **Calculator** | Delete | Backspace |
| **Stopwatch** | Start/Stop | Space/Enter |
| **Stopwatch** | Lap | L |
| **Stopwatch** | Reset | R |
| **Timer** | Start/Pause | Space/Enter |
| **Timer** | Reset | R |
| **Pomodoro** | Start/Pause | Space/Enter |
| **Pomodoro** | Skip phase | S |
| **Calendar** | Navigate | Arrow keys |
| **Calendar** | Go to today | Home |
| **Notes** | New note | Ctrl+N |
| **Notes** | Save | Ctrl+S |

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for improvements.

## 📄 License

MIT License - See LICENSE file for details.

---

**Made with ❤️ for maximum productivity**