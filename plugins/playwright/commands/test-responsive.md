---
description: Test page across multiple viewports (desktop, tablet, mobile)
allowed-tools: Bash(node:*), Bash(npm:*)
---

# Test Responsive Command

Test a webpage across multiple viewport sizes to verify responsive design. Captures screenshots at desktop, tablet, and mobile breakpoints.

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

### Step 2: Generate Responsive Test Script

Write a script to `/tmp/playwright-test-responsive.js`:

```javascript
const { chromium } = require('playwright');

const TARGET_URL = '<detected-or-provided-url>';

const VIEWPORTS = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 }
];

(async () => {
  console.log('Testing responsive design:', TARGET_URL);
  console.log('');

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  const results = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);

      // Set viewport
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      // Navigate (or reload if already loaded)
      await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for any responsive adjustments
      await page.waitForTimeout(500);

      // Check for common responsive issues
      const checks = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;

        // Check horizontal overflow
        const hasHorizontalScroll = body.scrollWidth > window.innerWidth;

        // Check if content is cut off
        const viewportWidth = window.innerWidth;
        const allElements = document.querySelectorAll('*');
        let overflowingElements = 0;
        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > viewportWidth + 10) {
            overflowingElements++;
          }
        });

        // Check font readability (very small text)
        let smallTextElements = 0;
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          if (fontSize > 0 && fontSize < 12 && el.textContent?.trim()) {
            smallTextElements++;
          }
        });

        // Check touch targets (buttons/links too small on mobile)
        let smallTouchTargets = 0;
        document.querySelectorAll('a, button, input, select').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 44 || rect.height < 44) {
              smallTouchTargets++;
            }
          }
        });

        return {
          hasHorizontalScroll,
          overflowingElements,
          smallTextElements,
          smallTouchTargets
        };
      });

      // Take screenshot
      const screenshotName = viewport.name.toLowerCase().replace(/\s+/g, '-');
      const screenshotPath = `/tmp/responsive-${screenshotName}-${timestamp}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const result = {
        viewport: viewport.name,
        dimensions: `${viewport.width}x${viewport.height}`,
        screenshot: screenshotPath,
        issues: []
      };

      // Report issues
      if (checks.hasHorizontalScroll) {
        result.issues.push('Horizontal scrollbar detected');
      }
      if (checks.overflowingElements > 0) {
        result.issues.push(`${checks.overflowingElements} elements overflow viewport`);
      }
      if (checks.smallTextElements > 5) {
        result.issues.push(`${checks.smallTextElements} elements have very small text (<12px)`);
      }
      if (viewport.name === 'Mobile' && checks.smallTouchTargets > 3) {
        result.issues.push(`${checks.smallTouchTargets} touch targets are too small (<44px)`);
      }

      results.push(result);

      if (result.issues.length === 0) {
        console.log(`  PASS - No issues detected`);
      } else {
        console.log(`  WARN - ${result.issues.length} issue(s):`);
        result.issues.forEach(issue => console.log(`    - ${issue}`));
      }
      console.log(`  Screenshot: ${screenshotPath}`);
      console.log('');
    }

    // Final summary
    console.log('=== RESPONSIVE TEST SUMMARY ===');
    console.log('');

    let totalIssues = 0;
    results.forEach(r => {
      totalIssues += r.issues.length;
      const status = r.issues.length === 0 ? 'PASS' : 'WARN';
      console.log(`${r.viewport} (${r.dimensions}): ${status}`);
      if (r.issues.length > 0) {
        r.issues.forEach(i => console.log(`  - ${i}`));
      }
    });

    console.log('');
    console.log(`Total viewports tested: ${VIEWPORTS.length}`);
    console.log(`Total issues found: ${totalIssues}`);
    console.log('');
    console.log('Screenshots saved to /tmp/responsive-*');

  } catch (error) {
    console.error('Responsive test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
```

Replace `<detected-or-provided-url>` with the actual URL.

### Step 3: Execute Responsive Test Script

```bash
cd ${CLAUDE_PLUGIN_ROOT} && node run.js /tmp/playwright-test-responsive.js
```

### Step 4: Report Results

Provide a comprehensive summary:
- Results for each viewport
- Any responsive issues detected
- Screenshot paths

Example output:
```
Responsive Test Complete: http://localhost:3847

Results by Viewport:

Desktop (1920x1080): PASS
  Screenshot: /tmp/responsive-desktop-2024-01-15T10-30-45Z.png

Laptop (1366x768): PASS
  Screenshot: /tmp/responsive-laptop-2024-01-15T10-30-45Z.png

Tablet (768x1024): PASS
  Screenshot: /tmp/responsive-tablet-2024-01-15T10-30-45Z.png

Mobile (375x667): WARN
  - 5 touch targets are too small (<44px)
  Screenshot: /tmp/responsive-mobile-2024-01-15T10-30-45Z.png

Summary: 4 viewports tested, 1 issue found
```

## Viewport Sizes Tested

| Name    | Width  | Height | Use Case                    |
|---------|--------|--------|-----------------------------|
| Desktop | 1920px | 1080px | Full HD monitors            |
| Laptop  | 1366px | 768px  | Common laptop resolution    |
| Tablet  | 768px  | 1024px | iPad portrait               |
| Mobile  | 375px  | 667px  | iPhone 8/SE                 |

## Issues Detected

1. **Horizontal scrollbar** - Content wider than viewport
2. **Overflowing elements** - Elements extend past viewport edge
3. **Small text** - Text smaller than 12px (hard to read)
4. **Small touch targets** - Buttons/links smaller than 44px (hard to tap on mobile)

## Error Handling

If the test fails:
- Report which viewport failed
- Show error details
- Previous screenshots still saved

## Notes

- Screenshots are full-page captures
- Issues are warnings, not failures
- Some issues may be intentional (e.g., data tables with horizontal scroll)
- Touch target check only applies to mobile viewport
