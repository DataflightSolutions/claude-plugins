# Playwright API Reference

Comprehensive reference for browser automation with Playwright. Use this for advanced patterns beyond the basic skill examples.

## Table of Contents

1. [Selectors & Locators](#selectors--locators)
2. [Navigation & Waiting](#navigation--waiting)
3. [Forms & Input](#forms--input)
4. [Assertions](#assertions)
5. [Network Interception](#network-interception)
6. [Screenshots & Visual Testing](#screenshots--visual-testing)
7. [Mobile & Device Emulation](#mobile--device-emulation)
8. [Authentication & Sessions](#authentication--sessions)
9. [Performance Testing](#performance-testing)
10. [Accessibility Testing](#accessibility-testing)
11. [Debugging](#debugging)
12. [Common Patterns](#common-patterns)

---

## Selectors & Locators

### Best Practices (Priority Order)

```javascript
// 1. BEST: Test IDs (stable, explicit)
page.locator('[data-testid="submit-button"]')
page.getByTestId('submit-button')

// 2. GOOD: Role-based (accessible, semantic)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Sign up' })

// 3. GOOD: Text-based (readable)
page.getByText('Welcome back')
page.getByLabel('Password')
page.getByPlaceholder('Enter your email')

// 4. OK: CSS selectors (specific cases)
page.locator('form.login button[type="submit"]')

// 5. AVOID: Fragile selectors
page.locator('.btn-primary')  // Classes change
page.locator('div > div > button')  // Structure changes
```

### Locator Methods

```javascript
// Text matching
page.getByText('exact text')
page.getByText('partial', { exact: false })
page.getByText(/regex pattern/i)

// Role-based
page.getByRole('button', { name: 'Click me' })
page.getByRole('heading', { level: 1 })
page.getByRole('checkbox', { checked: true })

// Form elements
page.getByLabel('Username')
page.getByPlaceholder('Search...')
page.getByTitle('Submit form')

// Combining locators
page.locator('form').getByRole('button')
page.locator('.card').filter({ hasText: 'Premium' })
page.locator('li').filter({ has: page.getByRole('button') })

// Nth element
page.locator('.item').first()
page.locator('.item').last()
page.locator('.item').nth(2)
```

---

## Navigation & Waiting

### Page Navigation

```javascript
// Basic navigation
await page.goto('https://example.com')

// With options
await page.goto('https://example.com', {
  waitUntil: 'networkidle',  // or 'load', 'domcontentloaded', 'commit'
  timeout: 30000
})

// Reload
await page.reload()

// Go back/forward
await page.goBack()
await page.goForward()
```

### Waiting Strategies

```javascript
// Wait for selector
await page.waitForSelector('.loaded')
await page.waitForSelector('.element', { state: 'visible' })
await page.waitForSelector('.element', { state: 'hidden' })

// Wait for URL change
await page.waitForURL('**/dashboard')
await page.waitForURL(/\/user\/\d+/)

// Wait for load state
await page.waitForLoadState('networkidle')
await page.waitForLoadState('domcontentloaded')

// Wait for function
await page.waitForFunction(() => window.dataLoaded === true)

// Wait for response
await page.waitForResponse('**/api/users')
await page.waitForResponse(resp => resp.status() === 200)

// Auto-waiting (built into actions)
await page.click('button')  // Auto-waits for visible & enabled
await page.fill('input', 'text')  // Auto-waits for editable
```

---

## Forms & Input

### Text Input

```javascript
// Fill (clears first, fast)
await page.fill('input[name="email"]', 'user@example.com')

// Type (simulates keystrokes)
await page.type('input', 'text', { delay: 100 })

// Clear
await page.fill('input', '')

// Press key
await page.press('input', 'Enter')
await page.keyboard.press('Tab')
```

### Checkboxes & Radio Buttons

```javascript
// Check/uncheck
await page.check('input[type="checkbox"]')
await page.uncheck('input[type="checkbox"]')

// Set specific state
await page.setChecked('input[type="checkbox"]', true)

// Verify state
const checked = await page.isChecked('input[type="checkbox"]')
```

### Dropdowns

```javascript
// By value
await page.selectOption('select', 'value')

// By label
await page.selectOption('select', { label: 'Option Text' })

// By index
await page.selectOption('select', { index: 2 })

// Multiple selections
await page.selectOption('select', ['value1', 'value2'])
```

### File Upload

```javascript
// Single file
await page.setInputFiles('input[type="file"]', '/path/to/file.pdf')

// Multiple files
await page.setInputFiles('input[type="file"]', ['/path/a.pdf', '/path/b.pdf'])

// Clear files
await page.setInputFiles('input[type="file"]', [])
```

---

## Assertions

### Using expect()

```javascript
const { expect } = require('@playwright/test');

// Page assertions
await expect(page).toHaveURL('https://example.com/dashboard')
await expect(page).toHaveTitle('Dashboard')

// Locator assertions
await expect(page.locator('.message')).toBeVisible()
await expect(page.locator('.message')).toBeHidden()
await expect(page.locator('.message')).toHaveText('Success')
await expect(page.locator('.message')).toContainText('Success')
await expect(page.locator('input')).toHaveValue('test@example.com')
await expect(page.locator('button')).toBeEnabled()
await expect(page.locator('button')).toBeDisabled()
await expect(page.locator('.items')).toHaveCount(5)
await expect(page.locator('input')).toHaveAttribute('type', 'email')
await expect(page.locator('.box')).toHaveCSS('color', 'rgb(255, 0, 0)')
```

### Manual Assertions

```javascript
// Get values for manual checking
const text = await page.textContent('.message')
const value = await page.inputValue('input')
const attribute = await page.getAttribute('a', 'href')
const isVisible = await page.isVisible('.element')
const isEnabled = await page.isEnabled('button')
```

---

## Network Interception

### Mocking Responses

```javascript
// Mock API response
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Test User' }])
  })
})

// Modify response
await page.route('**/api/data', async route => {
  const response = await route.fetch()
  const json = await response.json()
  json.modified = true
  route.fulfill({ response, json })
})
```

### Blocking Resources

```javascript
// Block images
await page.route('**/*.{png,jpg,jpeg,gif}', route => route.abort())

// Block by resource type
await page.route('**/*', route => {
  if (route.request().resourceType() === 'image') {
    route.abort()
  } else {
    route.continue()
  }
})
```

### Capturing Requests

```javascript
// Listen to all requests
page.on('request', request => {
  console.log(request.method(), request.url())
})

// Listen to responses
page.on('response', response => {
  console.log(response.status(), response.url())
})

// Wait for specific API
const response = await page.waitForResponse('**/api/users')
const data = await response.json()
```

---

## Screenshots & Visual Testing

### Basic Screenshots

```javascript
// Full page
await page.screenshot({ path: '/tmp/page.png', fullPage: true })

// Viewport only
await page.screenshot({ path: '/tmp/viewport.png' })

// Element screenshot
await page.locator('.card').screenshot({ path: '/tmp/card.png' })

// With options
await page.screenshot({
  path: '/tmp/screenshot.png',
  fullPage: true,
  type: 'png',  // or 'jpeg'
  quality: 80,  // jpeg only
  omitBackground: true  // transparent background
})
```

### Visual Comparison

```javascript
const helpers = require('./lib/helpers');

// Take baseline
await helpers.takeScreenshot(page, 'baseline');

// Later, compare
const result = await helpers.compareScreenshots(
  '/tmp/baseline.png',
  '/tmp/current.png',
  { threshold: 0.1, outputDiffPath: '/tmp/diff.png' }
);

console.log(`Match: ${result.match}`);
console.log(`Diff: ${result.diffPercentage}%`);
```

---

## Mobile & Device Emulation

### Device Presets

```javascript
const { devices } = require('playwright');

// Use device preset
const context = await browser.newContext({
  ...devices['iPhone 12']
});

// Available devices include:
// 'iPhone 12', 'iPhone 13 Pro Max', 'Pixel 5',
// 'iPad Pro 11', 'Galaxy S8', etc.
```

### Custom Viewport

```javascript
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...',
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
});
```

### Geolocation

```javascript
const context = await browser.newContext({
  geolocation: { latitude: 37.7749, longitude: -122.4194 },
  permissions: ['geolocation']
});
```

### Touch Actions

```javascript
// Tap
await page.tap('.button');

// Swipe (using mouse to simulate)
await page.mouse.move(200, 400);
await page.mouse.down();
await page.mouse.move(200, 100, { steps: 10 });
await page.mouse.up();
```

---

## Authentication & Sessions

### Save & Restore Session

```javascript
// Login and save state
await page.goto('/login');
await page.fill('#email', 'user@example.com');
await page.fill('#password', 'password');
await page.click('button[type="submit"]');
await page.waitForURL('/dashboard');

// Save storage state
await context.storageState({ path: '/tmp/auth.json' });

// Later, restore state
const context = await browser.newContext({
  storageState: '/tmp/auth.json'
});
```

### HTTP Authentication

```javascript
const context = await browser.newContext({
  httpCredentials: {
    username: 'user',
    password: 'pass'
  }
});
```

---

## Performance Testing

### Core Web Vitals

```javascript
const helpers = require('./lib/helpers');

// Full load metrics
const metrics = await helpers.measurePageLoad(page, 'https://example.com');
console.log('Load time:', metrics.loadTime);
console.log('TTFB:', metrics.metrics.ttfb);

// Individual metrics
const lcp = await helpers.measureLCP(page);
const fcp = await helpers.measureFCP(page);
const cls = await helpers.measureCLS(page);

console.log('LCP:', lcp, 'ms');
console.log('FCP:', fcp, 'ms');
console.log('CLS:', cls);
```

### Performance Timing

```javascript
const timing = await page.evaluate(() => {
  const t = performance.timing;
  return {
    dns: t.domainLookupEnd - t.domainLookupStart,
    tcp: t.connectEnd - t.connectStart,
    ttfb: t.responseStart - t.requestStart,
    download: t.responseEnd - t.responseStart,
    domReady: t.domContentLoadedEventEnd - t.navigationStart,
    load: t.loadEventEnd - t.navigationStart
  };
});
```

---

## Accessibility Testing

### Axe-Core Audit

```javascript
const helpers = require('./lib/helpers');

// Run full audit
const results = await helpers.checkAccessibility(page, {
  tags: ['wcag2a', 'wcag2aa']
});

console.log('Violations:', results.violations.length);
console.log('Critical:', results.summary.critical);
console.log('Serious:', results.summary.serious);

// Check specific rules
results.violations.forEach(v => {
  console.log(`${v.id}: ${v.description}`);
  console.log(`  Impact: ${v.impact}`);
  console.log(`  Affected: ${v.nodes.length} elements`);
});
```

### Focus Order Testing

```javascript
const helpers = require('./lib/helpers');

const { focusOrder, issues, valid } = await helpers.checkFocusOrder(page);

if (!valid) {
  issues.forEach(issue => {
    console.log(`Issue: ${issue.message}`);
  });
}
```

---

## Debugging

### Headed Mode (Visible Browser)

```javascript
const browser = await chromium.launch({
  headless: false,
  slowMo: 100  // Slow down by 100ms
});
```

### Pause Execution

```javascript
// Pause and open inspector
await page.pause();

// Debug mode
const browser = await chromium.launch({
  headless: false,
  devtools: true
});
```

### Console Monitoring

```javascript
const helpers = require('./lib/helpers');

// Capture console
const consoleCapture = helpers.captureConsoleLogs(page);

// ... do actions ...

// Check for errors
const errors = consoleCapture.getErrors();
if (errors.length > 0) {
  console.log('Console errors:', errors);
}

// Assert no errors
helpers.assertNoConsoleErrors(consoleCapture);
```

### Trace Recording

```javascript
await context.tracing.start({ screenshots: true, snapshots: true });

// ... do actions ...

await context.tracing.stop({ path: '/tmp/trace.zip' });
// View with: npx playwright show-trace /tmp/trace.zip
```

---

## Common Patterns

### Login Flow

```javascript
async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}
```

### Form Submission

```javascript
async function submitForm(page, formData) {
  for (const [field, value] of Object.entries(formData)) {
    const selector = `[name="${field}"]`;
    const tagName = await page.locator(selector).evaluate(el => el.tagName);

    if (tagName === 'SELECT') {
      await page.selectOption(selector, value);
    } else if (tagName === 'INPUT') {
      const type = await page.getAttribute(selector, 'type');
      if (type === 'checkbox') {
        if (value) await page.check(selector);
      } else {
        await page.fill(selector, value);
      }
    } else {
      await page.fill(selector, value);
    }
  }

  await page.click('button[type="submit"]');
}
```

### Wait for API

```javascript
async function waitForApiAndClick(page, apiPattern, buttonSelector) {
  const [response] = await Promise.all([
    page.waitForResponse(apiPattern),
    page.click(buttonSelector)
  ]);
  return response.json();
}
```

### Handle Popups

```javascript
async function handlePopup(page, triggerSelector) {
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click(triggerSelector)
  ]);
  await popup.waitForLoadState('networkidle');
  return popup;
}
```

### Infinite Scroll

```javascript
async function scrollToLoadAll(page, itemSelector, maxItems = 100) {
  let previousCount = 0;
  let currentCount = await page.locator(itemSelector).count();

  while (currentCount < maxItems && currentCount !== previousCount) {
    previousCount = currentCount;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    currentCount = await page.locator(itemSelector).count();
  }

  return currentCount;
}
```

### Retry on Failure

```javascript
async function retryAction(action, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Locator Strategies](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
