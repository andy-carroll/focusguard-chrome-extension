# FocusGuard Chrome Extension

A Chrome extension that blocks distracting websites with meaningful friction to help you stay focused during work time.

## Features

### Week 1 MVP ✅
- **Website Blocking**: Block specific sites during work hours
- **10-Second Bypass Timer**: Friction to make bypassing uncomfortable
- **Quick Settings**: Easy toggle on/off and site management
- **Basic Analytics**: Track bypass attempts
- **Break Mode**: 15-minute quick break option

### Planned Features
- **Week 2**: Google Calendar integration for automatic work/break detection
- **Week 3**: Progressive friction (longer delays, challenges, goal reminders)
- **Week 4**: Detailed analytics, weekly reports, data export

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked" and select the `focusguard-extension` folder
4. The extension should now appear in your toolbar

## Usage

1. **First Setup**: Click the FocusGuard icon and go to Settings to add websites you want to block
2. **Default Sites**: Includes Facebook, Twitter/X, Reddit, Hacker News, CNN, BBC News
3. **Quick Toggle**: Use the popup to enable/disable blocking quickly
4. **Break Mode**: Take a 15-minute break when you need it
5. **Bypass**: When blocked, wait 10 seconds then click "Continue to Site" (friction by design!)

## Development Roadmap

### Week 1: Core Blocker (Current) 🎯
**Goal**: Block specific sites with simple bypass timer

### Week 2: Work Hours Integration
**Goal**: Only block during calendar work time
- Google Calendar API integration
- Detect "busy" calendar events
- Manual work/break toggle fallback

### Week 3: Meaningful Friction
**Goal**: Make bypassing genuinely uncomfortable
- Progressive delays (10s → 30s → 60s per attempt)
- "Why do you want to visit this?" text requirement
- Math problems or typing challenges
- Personal goal reminders

### Week 4: Analytics & Polish
**Goal**: Data insights and Chrome Web Store ready
- Detailed bypass tracking
- Focus time calculations
- Weekly summary reports
- Export functionality
- Chrome Web Store submission

## Tech Stack
- **Manifest V3** (latest Chrome extension format)
- **Vanilla JavaScript** (no external dependencies)
- **Chrome APIs**: Storage, DeclarativeNetRequest, Identity
- **Future**: Google Calendar API integration

## File Structure
```
focusguard-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (blocking logic)
├── blocked.html           # Page shown when site is blocked
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── options.html          # Settings page
├── options.js            # Settings functionality
└── README.md             # This file
```

## Contributing
This is a personal productivity tool being built with an ultra-lean, milestone-driven approach. Each week focuses on one key outcome.

## License
MIT License - Feel free to use and modify for your own focus needs!
