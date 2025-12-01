# Playwright Browser Automation Plugin

Complete browser automation for Claude Code. Auto-detects dev servers, writes test scripts to `/tmp`, and provides comprehensive testing capabilities.

## Features

- **Auto-invoked Skill**: Claude automatically uses this when you ask about testing websites
- **Quick Commands**: `/screenshot`, `/check-links`, `/test-page`, `/test-responsive`
- **42 Helper Functions**: Forms, accessibility, performance, network, visual, mobile, and more
- **Visible Browser**: See automation happening in real-time by default
- **Dev Server Detection**: Automatically finds your running localhost servers

## Installation

### Via Plugin System

```bash
/plugin marketplace add DataflightSolutions/dataflight-claude-plugins
/plugin install playwright
```

Then setup Playwright:

```bash
cd ~/.claude/plugins/marketplaces/dataflight-claude-plugins/plugins/playwright
npm run setup
```

### Manual Installation

```bash
cd ~/.claude/plugins/marketplaces/dataflight-claude-plugins/plugins/playwright
npm run setup
```

## Quick Commands

### `/screenshot`
Take a full-page screenshot of any webpage.

```
/screenshot http://localhost:3000
```

### `/check-links`
Scan a page for broken links.

```
/check-links http://localhost:3000
```

### `/test-page`
Basic health check - verifies page loads without errors.

```
/test-page http://localhost:3000
```

### `/test-responsive`
Test responsive design across desktop, tablet, and mobile viewports.

```
/test-responsive http://localhost:3000
```

## Skill Usage

Just ask Claude naturally:

- "Test if my homepage loads correctly"
- "Check the login flow on localhost:3847"
- "Take screenshots of the dashboard at different sizes"
- "Find broken links on the marketing page"
- "Run an accessibility audit on the signup form"
- "Test the form validation on the contact page"

Claude will automatically:
1. Detect your running dev server
2. Write a custom Playwright script
3. Execute it with visible browser
4. Report results with screenshots

## Helper Functions

The plugin includes 42 helper functions organized by category:

### Browser & Context
- `launchBrowser()`, `createContext()`, `createPage()`
- `saveStorageState()`, `loadStorageState()`, `detectDevServers()`

### Navigation & Waiting
- `waitForPageReady()`, `navigateWithRetry()`
- `waitForSPA()`, `waitForElement()`

### Safe Interactions
- `safeClick()`, `safeType()`, `safeSelect()`, `safeCheck()`
- `scrollPage()`, `scrollToElement()`, `authenticate()`, `handleCookieBanner()`

### Form Helpers
- `getFormFields()`, `getRequiredFields()`, `getFieldErrors()`
- `validateFieldState()`, `fillFormFromData()`, `submitAndValidate()`

### Accessibility
- `checkAccessibility()`, `getARIAInfo()`
- `checkFocusOrder()`, `getFocusableElements()`

### Performance
- `measurePageLoad()`, `measureLCP()`, `measureFCP()`, `measureCLS()`

### Network
- `mockAPIResponse()`, `blockResources()`
- `captureRequests()`, `captureResponses()`, `waitForAPI()`

### Visual
- `takeScreenshot()`, `compareScreenshots()`, `takeElementScreenshot()`

### Mobile
- `emulateDevice()`, `setGeolocation()`, `simulateTouchEvent()`, `swipe()`

### Multi-page
- `handlePopup()`, `handleNewTab()`, `closeAllPopups()`, `handleDialog()`

### Data Extraction
- `extractTexts()`, `extractTableData()`, `extractMetaTags()`
- `extractOpenGraph()`, `extractJsonLD()`, `extractLinks()`

### Console Monitoring
- `captureConsoleLogs()`, `capturePageErrors()`
- `getConsoleErrors()`, `assertNoConsoleErrors()`

### Files
- `uploadFile()`, `uploadMultipleFiles()`, `downloadFile()`, `waitForDownload()`

## Requirements

- Node.js 18+
- Chromium browser (installed via `npm run setup`)

## Configuration

### Environment Variables

- `HEADLESS=true` - Run in headless mode (default: false)
- `SLOW_MO=100` - Slow down automation by N ms

### Scripts to /tmp

All test scripts are written to `/tmp/playwright-test-*.js`:
- Automatically cleaned by OS
- Won't clutter your project
- Easy to inspect/re-run

## Troubleshooting

### Playwright not installed
```bash
cd ~/.claude/plugins/marketplaces/dataflight-claude-plugins/plugins/playwright
npm run setup
```

### Browser doesn't open
- Check `headless: false` in your script
- Ensure display is available (not running over SSH without X forwarding)

### Module not found
- Always run scripts via `node run.js` from plugin directory
- This ensures proper module resolution

### Element not found
- Add explicit waits: `await page.waitForSelector('.element')`
- Increase timeout if page is slow

## Project Structure

```
plugins/playwright/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── skills/
│   └── playwright/
│       └── SKILL.md         # Auto-invoked skill
├── commands/
│   ├── screenshot.md        # /screenshot command
│   ├── check-links.md       # /check-links command
│   ├── test-page.md         # /test-page command
│   └── test-responsive.md   # /test-responsive command
├── lib/
│   └── helpers.js           # 42 helper functions
├── run.js                   # Universal executor
├── package.json             # Dependencies
├── README.md                # This file
└── API_REFERENCE.md         # Detailed API docs
```

## Dependencies

- `playwright` ^1.48.0 - Browser automation
- `pixelmatch` ^5.3.0 - Visual diff comparison
- `pngjs` ^7.0.0 - PNG image processing
- `axe-core` ^4.8.0 (optional) - Accessibility testing

## License

MIT
