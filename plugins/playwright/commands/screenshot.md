---
description: Take a screenshot of a webpage
allowed-tools: Bash(node:*), Bash(npm:*)
---

# Screenshot Command

Take a full-page screenshot of a webpage. Automatically detects running dev servers or uses a provided URL.

## Execution Steps

Execute these steps in order. Stop and report errors if any step fails.

### Step 1: Determine Target URL

If user provided a URL argument, use it directly.

If no URL provided, detect running dev servers:

```bash
cd ${CLAUDE_PLUGIN_ROOT} && node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
```

**Decision tree:**
- **1 server found**: Use it automatically, inform user which port
- **Multiple servers found**: Ask user which one to screenshot
- **No servers found**: Ask user for URL

### Step 2: Generate Screenshot Script

Write a script to `/tmp/playwright-screenshot.js`:

```javascript
const { chromium } = require('playwright');

const TARGET_URL = '<detected-or-provided-url>';

(async () => {
  console.log('Taking screenshot of:', TARGET_URL);

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded:', await page.title());

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `/tmp/screenshot-${timestamp}.png`;

    await page.screenshot({ path: filename, fullPage: true });
    console.log('Screenshot saved:', filename);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
```

Replace `<detected-or-provided-url>` with the actual URL.

### Step 3: Execute Screenshot Script

```bash
cd ${CLAUDE_PLUGIN_ROOT} && node run.js /tmp/playwright-screenshot.js
```

### Step 4: Report Result

After successful execution:
- Report the URL that was captured
- Report the exact path where screenshot was saved
- Mention the screenshot is in PNG format with full page capture

Example output:
```
Screenshot captured for: http://localhost:3847

Saved to: /tmp/screenshot-2024-01-15T10-30-45-123Z.png

The screenshot includes the full scrollable page content.
```

## Error Handling

If the script fails:
- Show the error message
- Common issues:
  - URL not reachable: Check if the server is running
  - Timeout: Try increasing timeout or check network
  - Playwright not installed: Run `npm run setup` in plugin directory

## Options

The user can provide optional parameters:
- **URL**: Direct URL to screenshot (overrides server detection)
- **fullPage**: Whether to capture full scrollable page (default: true)
- **viewport**: Custom viewport size

## Notes

- Screenshots are saved to `/tmp` for easy access and automatic cleanup
- Browser opens visibly so user can see the capture process
- Uses `networkidle` wait to ensure page is fully loaded
- Full page screenshots may be large for long pages
