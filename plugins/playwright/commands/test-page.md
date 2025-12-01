---
description: Basic page health check - verify page loads without errors
allowed-tools: Bash(node:*), Bash(npm:*)
---

# Test Page Command

Perform a basic health check on a webpage. Verifies the page loads successfully, checks for JavaScript errors, and captures a verification screenshot.

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
- **Multiple servers found**: Ask user which one to test
- **No servers found**: Ask user for URL

### Step 2: Generate Test Script

Write a script to `/tmp/playwright-test-page.js`:

```javascript
const { chromium } = require('playwright');

const TARGET_URL = '<detected-or-provided-url>';

(async () => {
  console.log('Testing page:', TARGET_URL);
  console.log('');

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  const results = {
    url: TARGET_URL,
    passed: true,
    checks: [],
    consoleErrors: [],
    pageErrors: []
  };

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    }
  });

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', error => {
    results.pageErrors.push(error.message);
  });

  try {
    // Check 1: Page loads successfully
    console.log('Check 1: Page loads...');
    const response = await page.goto(TARGET_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    const status = response?.status() || 0;
    if (status >= 200 && status < 400) {
      results.checks.push({ name: 'Page loads', passed: true, detail: `Status: ${status}` });
      console.log(`  PASS - Status: ${status}`);
    } else {
      results.checks.push({ name: 'Page loads', passed: false, detail: `Status: ${status}` });
      results.passed = false;
      console.log(`  FAIL - Status: ${status}`);
    }

    // Check 2: Page has title
    console.log('Check 2: Page has title...');
    const title = await page.title();
    if (title && title.length > 0) {
      results.checks.push({ name: 'Has title', passed: true, detail: title });
      console.log(`  PASS - Title: "${title}"`);
    } else {
      results.checks.push({ name: 'Has title', passed: false, detail: 'No title found' });
      results.passed = false;
      console.log('  FAIL - No title found');
    }

    // Check 3: Page has content
    console.log('Check 3: Page has content...');
    const bodyText = await page.locator('body').textContent();
    const hasContent = bodyText && bodyText.trim().length > 0;
    if (hasContent) {
      results.checks.push({ name: 'Has content', passed: true, detail: `${bodyText.trim().length} characters` });
      console.log(`  PASS - ${bodyText.trim().length} characters`);
    } else {
      results.checks.push({ name: 'Has content', passed: false, detail: 'Empty page' });
      results.passed = false;
      console.log('  FAIL - Empty page');
    }

    // Wait a moment for any delayed errors
    await page.waitForTimeout(2000);

    // Check 4: No console errors
    console.log('Check 4: No console errors...');
    if (results.consoleErrors.length === 0) {
      results.checks.push({ name: 'No console errors', passed: true });
      console.log('  PASS - No console errors');
    } else {
      results.checks.push({ name: 'No console errors', passed: false, detail: results.consoleErrors });
      results.passed = false;
      console.log(`  FAIL - ${results.consoleErrors.length} console error(s)`);
      results.consoleErrors.forEach(err => console.log(`    - ${err.slice(0, 100)}`));
    }

    // Check 5: No page errors
    console.log('Check 5: No uncaught exceptions...');
    if (results.pageErrors.length === 0) {
      results.checks.push({ name: 'No page errors', passed: true });
      console.log('  PASS - No uncaught exceptions');
    } else {
      results.checks.push({ name: 'No page errors', passed: false, detail: results.pageErrors });
      results.passed = false;
      console.log(`  FAIL - ${results.pageErrors.length} uncaught exception(s)`);
      results.pageErrors.forEach(err => console.log(`    - ${err.slice(0, 100)}`));
    }

    // Take verification screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `/tmp/test-page-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('');
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Final summary
    console.log('');
    console.log('=== TEST SUMMARY ===');
    const passedCount = results.checks.filter(c => c.passed).length;
    console.log(`Checks passed: ${passedCount}/${results.checks.length}`);
    console.log(`Overall: ${results.passed ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    results.passed = false;
    results.checks.push({ name: 'Page loads', passed: false, detail: error.message });
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }

  process.exit(results.passed ? 0 : 1);
})();
```

Replace `<detected-or-provided-url>` with the actual URL.

### Step 3: Execute Test Script

```bash
cd ${CLAUDE_PLUGIN_ROOT} && node run.js /tmp/playwright-test-page.js
```

### Step 4: Report Results

Provide a clear summary:
- Overall pass/fail status
- Individual check results
- Any errors encountered
- Screenshot location

Example output:
```
Page Test Complete: http://localhost:3847

Overall: PASS

Checks:
1. Page loads: PASS (Status: 200)
2. Has title: PASS ("My App - Home")
3. Has content: PASS (1,234 characters)
4. No console errors: PASS
5. No uncaught exceptions: PASS

Screenshot: /tmp/test-page-2024-01-15T10-30-45-123Z.png
```

## What Gets Tested

1. **Page loads** - HTTP status code is 2xx or 3xx
2. **Has title** - Page has a non-empty title tag
3. **Has content** - Page body has text content
4. **No console errors** - No console.error() calls
5. **No page errors** - No uncaught JavaScript exceptions

## Error Handling

If the test fails:
- Report which specific checks failed
- Show error details
- Screenshot still captured for debugging

## Notes

- This is a basic health check, not comprehensive testing
- Console warnings are not counted as errors
- Network errors during page load will fail the test
- Browser opens visibly for observation
