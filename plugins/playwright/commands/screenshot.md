---
description: Take a screenshot of a webpage
allowed-tools: Bash(node:*), Write
---

# Screenshot Command

Take a full-page screenshot of a webpage. Automatically detects running dev servers or uses a provided URL.

## Execution Steps

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

### Step 2: Write Screenshot Script

Write a script to `/tmp/playwright-screenshot.js` with the target URL:

```javascript
const { chromium } = require('playwright');

(async () => {
  console.log('Taking screenshot of: TARGET_URL');

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  try {
    await page.goto('TARGET_URL', { waitUntil: 'networkidle', timeout: 30000 });
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

Replace `TARGET_URL` with the actual URL.

### Step 3: Execute Script

```bash
cd ${CLAUDE_PLUGIN_ROOT} && node run.js /tmp/playwright-screenshot.js
```

### Step 4: Display Screenshot

After successful execution, use the Read tool to display the screenshot image to the user.

### Step 5: Report Result

Tell the user:
- Which URL was captured
- The path to the saved screenshot

## Error Handling

- If navigation fails, check if the server is running
- If Playwright is not installed, run `npm run setup` in the plugin directory
