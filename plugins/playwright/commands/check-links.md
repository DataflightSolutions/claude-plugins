---
description: Check for broken links on a webpage
allowed-tools: Bash(node:*), Bash(npm:*)
---

# Check Links Command

Scan a webpage for broken links. Tests all anchor tags with HTTP/HTTPS hrefs and reports working vs broken links.

## Execution Steps

Execute these steps in order. Stop and report errors if any step fails.

### Step 1: Determine Target URL

If user provided a URL argument, use it directly.

If no URL provided, detect running dev servers:

```bash
cd ${CLAUDE_PLUGIN_ROOT} && node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
```

**Decision tree:**
- **1 server found**: Use it automatically
- **Multiple servers found**: Ask user which one to check
- **No servers found**: Ask user for URL

### Step 2: Generate Link Check Script

Write a script to `/tmp/playwright-check-links.js`:

```javascript
const { chromium } = require('playwright');

const TARGET_URL = '<detected-or-provided-url>';

(async () => {
  console.log('Checking links on:', TARGET_URL);
  console.log('');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded:', await page.title());
    console.log('');

    // Get all links
    const links = await page.locator('a[href]').all();
    console.log(`Found ${links.length} links to check`);
    console.log('');

    const results = {
      working: [],
      broken: [],
      skipped: []
    };

    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = (await link.textContent())?.trim().slice(0, 50) || '[no text]';

      // Skip non-HTTP links
      if (!href || !href.startsWith('http')) {
        results.skipped.push({ href, text, reason: 'not HTTP' });
        continue;
      }

      try {
        const response = await page.request.head(href, { timeout: 10000 });
        const status = response.status();

        if (response.ok()) {
          results.working.push({ href, text, status });
          console.log(`OK [${status}]: ${href}`);
        } else {
          results.broken.push({ href, text, status });
          console.log(`BROKEN [${status}]: ${href}`);
        }
      } catch (e) {
        results.broken.push({ href, text, error: e.message });
        console.log(`ERROR: ${href} - ${e.message}`);
      }
    }

    // Summary
    console.log('');
    console.log('=== SUMMARY ===');
    console.log(`Working links: ${results.working.length}`);
    console.log(`Broken links: ${results.broken.length}`);
    console.log(`Skipped (non-HTTP): ${results.skipped.length}`);

    if (results.broken.length > 0) {
      console.log('');
      console.log('=== BROKEN LINKS ===');
      results.broken.forEach(link => {
        console.log(`  ${link.href}`);
        console.log(`    Status: ${link.status || link.error}`);
        console.log(`    Text: ${link.text}`);
      });
    }

  } catch (error) {
    console.error('Link check failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
```

Replace `<detected-or-provided-url>` with the actual URL.

### Step 3: Execute Link Check Script

```bash
cd ${CLAUDE_PLUGIN_ROOT} && node run.js /tmp/playwright-check-links.js
```

### Step 4: Report Results

After execution, provide a summary:
- Total links found
- Number of working links
- Number of broken links (with details)
- Number of skipped links (non-HTTP like mailto:, tel:, etc.)

Example output:
```
Link Check Complete for: http://localhost:3847

Results:
- Working: 15 links
- Broken: 2 links
- Skipped: 3 links (non-HTTP)

Broken Links:
1. https://example.com/old-page
   Status: 404
   Link text: "Old Documentation"

2. https://api.service.com/health
   Error: Connection refused
   Link text: "API Status"
```

## Error Handling

If the script fails:
- Show the error message
- Common issues:
  - Page not accessible: Check if URL is correct
  - Timeout: Some external links may be slow
  - Too many links: Script may take a while on large pages

## Options

User can optionally specify:
- **URL**: Direct URL to check
- **internal**: Only check internal links (same domain)
- **external**: Only check external links

## Notes

- Uses HEAD requests for efficiency (doesn't download full page)
- External links may timeout due to network issues
- Some sites block HEAD requests, may show false positives
- Links with `#` anchors are checked against base URL
- mailto:, tel:, and javascript: links are skipped
