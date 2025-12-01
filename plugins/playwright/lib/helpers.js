/**
 * Playwright Helper Library
 * 42 essential helper functions for browser automation
 */

const { chromium, firefox, webkit, devices } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ============================================================================
// BROWSER & CONTEXT (6 functions)
// ============================================================================

/**
 * Launch browser with standard configuration
 * @param {string} browserType - 'chromium', 'firefox', or 'webkit'
 * @param {Object} options - Additional launch options
 */
async function launchBrowser(browserType = 'chromium', options = {}) {
  const defaultOptions = {
    headless: process.env.HEADLESS === 'true' ? true : false,
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  const browsers = { chromium, firefox, webkit };
  const browser = browsers[browserType];

  if (!browser) {
    throw new Error(`Invalid browser type: ${browserType}. Use 'chromium', 'firefox', or 'webkit'.`);
  }

  return await browser.launch({ ...defaultOptions, ...options });
}

/**
 * Create browser context with common settings
 * @param {Object} browser - Browser instance
 * @param {Object} options - Context options
 */
async function createContext(browser, options = {}) {
  const defaultOptions = {
    viewport: options.viewport || { width: 1280, height: 720 },
    userAgent: options.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      : undefined,
    permissions: options.permissions || [],
    geolocation: options.geolocation,
    locale: options.locale || 'en-US',
    timezoneId: options.timezoneId || 'America/New_York',
    colorScheme: options.colorScheme || 'light'
  };

  return await browser.newContext({ ...defaultOptions, ...options });
}

/**
 * Create a new page with viewport and user agent
 * @param {Object} context - Browser context
 * @param {Object} options - Page options
 */
async function createPage(context, options = {}) {
  const page = await context.newPage();

  if (options.viewport) {
    await page.setViewportSize(options.viewport);
  }

  page.setDefaultTimeout(options.timeout || 30000);

  return page;
}

/**
 * Save storage state (cookies, localStorage) for session reuse
 * @param {Object} context - Browser context
 * @param {string} savePath - Path to save state
 */
async function saveStorageState(context, savePath) {
  await context.storageState({ path: savePath });
  console.log(`Session saved to: ${savePath}`);
  return savePath;
}

/**
 * Load saved storage state into a new context
 * @param {Object} browser - Browser instance
 * @param {string} statePath - Path to saved state
 * @param {Object} options - Additional context options
 */
async function loadStorageState(browser, statePath, options = {}) {
  if (!fs.existsSync(statePath)) {
    throw new Error(`Storage state file not found: ${statePath}`);
  }
  return await browser.newContext({ storageState: statePath, ...options });
}

/**
 * Detect running dev servers on common ports
 * @param {Array<number>} customPorts - Additional ports to check
 * @returns {Promise<Array>} Array of detected server URLs
 */
async function detectDevServers(customPorts = []) {
  const commonPorts = [3000, 3001, 3002, 5173, 5174, 8080, 8000, 4200, 5000, 9000, 1234, 4321, 3333];
  const allPorts = [...new Set([...commonPorts, ...customPorts])];

  const detectedServers = [];
  console.log('Checking for running dev servers...');

  for (const port of allPorts) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: port,
          path: '/',
          method: 'HEAD',
          timeout: 500
        }, (res) => {
          if (res.statusCode < 500) {
            detectedServers.push(`http://localhost:${port}`);
            console.log(`  Found server on port ${port}`);
          }
          resolve();
        });

        req.on('error', () => resolve());
        req.on('timeout', () => {
          req.destroy();
          resolve();
        });
        req.end();
      });
    } catch (e) {
      // Port not available
    }
  }

  if (detectedServers.length === 0) {
    console.log('  No dev servers detected');
  }

  return detectedServers;
}

// ============================================================================
// NAVIGATION & WAITING (4 functions)
// ============================================================================

/**
 * Smart wait for page to be ready
 * @param {Object} page - Playwright page
 * @param {Object} options - Wait options
 */
async function waitForPageReady(page, options = {}) {
  const waitOptions = {
    waitUntil: options.waitUntil || 'networkidle',
    timeout: options.timeout || 30000
  };

  try {
    await page.waitForLoadState(waitOptions.waitUntil, {
      timeout: waitOptions.timeout
    });
  } catch (e) {
    console.warn('Page load timeout, continuing...');
  }

  if (options.waitForSelector) {
    await page.waitForSelector(options.waitForSelector, {
      timeout: options.timeout
    });
  }
}

/**
 * Navigate to URL with automatic retry on failure
 * @param {Object} page - Playwright page
 * @param {string} url - URL to navigate to
 * @param {Object} options - Navigation options
 */
async function navigateWithRetry(page, url, options = {}) {
  const maxRetries = options.retries || 3;
  const retryDelay = options.retryDelay || 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await page.goto(url, {
        waitUntil: options.waitUntil || 'networkidle',
        timeout: options.timeout || 30000
      });
      return response;
    } catch (e) {
      if (i === maxRetries - 1) {
        throw new Error(`Failed to navigate to ${url} after ${maxRetries} attempts: ${e.message}`);
      }
      console.log(`Navigation attempt ${i + 1} failed, retrying in ${retryDelay}ms...`);
      await delay(retryDelay);
    }
  }
}

/**
 * Wait for SPA route change
 * @param {Object} page - Playwright page
 * @param {Object} options - Wait options
 */
async function waitForSPA(page, options = {}) {
  const { urlPattern, timeout = 10000 } = options;

  if (urlPattern) {
    await page.waitForURL(urlPattern, { timeout });
  } else {
    // Wait for network idle as fallback
    await page.waitForLoadState('networkidle', { timeout });
  }
}

/**
 * Wait for element with specific state
 * @param {Object} page - Playwright page
 * @param {string} selector - Element selector
 * @param {Object} options - Wait options
 */
async function waitForElement(page, selector, options = {}) {
  const { state = 'visible', timeout = 10000 } = options;
  return await page.locator(selector).waitFor({ state, timeout });
}

// ============================================================================
// SAFE INTERACTIONS (8 functions)
// ============================================================================

/**
 * Safe click with retry logic
 * @param {Object} page - Playwright page
 * @param {string} selector - Element selector
 * @param {Object} options - Click options
 */
async function safeClick(page, selector, options = {}) {
  const maxRetries = options.retries || 3;
  const retryDelay = options.retryDelay || 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, {
        state: 'visible',
        timeout: options.timeout || 5000
      });
      await page.click(selector, {
        force: options.force || false,
        timeout: options.timeout || 5000
      });
      return true;
    } catch (e) {
      if (i === maxRetries - 1) {
        console.error(`Failed to click ${selector} after ${maxRetries} attempts`);
        throw e;
      }
      console.log(`Retry ${i + 1}/${maxRetries} for clicking ${selector}`);
      await delay(retryDelay);
    }
  }
}

/**
 * Safe text input with clear before type
 * @param {Object} page - Playwright page
 * @param {string} selector - Input selector
 * @param {string} text - Text to type
 * @param {Object} options - Type options
 */
async function safeType(page, selector, text, options = {}) {
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout: options.timeout || 10000
  });

  if (options.clear !== false) {
    await page.fill(selector, '');
  }

  if (options.slow) {
    await page.type(selector, text, { delay: options.delay || 100 });
  } else {
    await page.fill(selector, text);
  }
}

/**
 * Safe dropdown/select interaction
 * @param {Object} page - Playwright page
 * @param {string} selector - Select element selector
 * @param {string|Array} value - Value(s) to select
 * @param {Object} options - Select options
 */
async function safeSelect(page, selector, value, options = {}) {
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout: options.timeout || 10000
  });
  await page.selectOption(selector, value);
}

/**
 * Safe checkbox/radio interaction
 * @param {Object} page - Playwright page
 * @param {string} selector - Checkbox/radio selector
 * @param {boolean} checked - Desired checked state
 * @param {Object} options - Check options
 */
async function safeCheck(page, selector, checked = true, options = {}) {
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout: options.timeout || 10000
  });

  if (checked) {
    await page.check(selector);
  } else {
    await page.uncheck(selector);
  }
}

/**
 * Scroll page in specified direction
 * @param {Object} page - Playwright page
 * @param {string} direction - 'down', 'up', 'top', 'bottom'
 * @param {number} distance - Pixels to scroll (for up/down)
 */
async function scrollPage(page, direction = 'down', distance = 500) {
  switch (direction) {
    case 'down':
      await page.evaluate(d => window.scrollBy(0, d), distance);
      break;
    case 'up':
      await page.evaluate(d => window.scrollBy(0, -d), distance);
      break;
    case 'top':
      await page.evaluate(() => window.scrollTo(0, 0));
      break;
    case 'bottom':
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      break;
  }
  await delay(500);
}

/**
 * Scroll element into view
 * @param {Object} page - Playwright page
 * @param {string} selector - Element selector
 * @param {Object} options - Scroll options
 */
async function scrollToElement(page, selector, options = {}) {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();

  if (options.offset) {
    await page.evaluate(({ sel, offset }) => {
      const el = document.querySelector(sel);
      if (el) {
        window.scrollBy(0, offset);
      }
    }, { sel: selector, offset: options.offset });
  }
}

/**
 * Handle authentication/login flow
 * @param {Object} page - Playwright page
 * @param {Object} credentials - Username and password
 * @param {Object} selectors - Login form selectors
 */
async function authenticate(page, credentials, selectors = {}) {
  const defaultSelectors = {
    username: 'input[name="username"], input[name="email"], #username, #email, input[type="email"]',
    password: 'input[name="password"], #password, input[type="password"]',
    submit: 'button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
  };

  const finalSelectors = { ...defaultSelectors, ...selectors };

  await safeType(page, finalSelectors.username, credentials.username || credentials.email);
  await safeType(page, finalSelectors.password, credentials.password);
  await safeClick(page, finalSelectors.submit);

  await Promise.race([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.waitForSelector(selectors.successIndicator || '.dashboard, .user-menu, .logout', { timeout: 10000 })
  ]).catch(() => {
    console.log('Login might have completed without navigation');
  });
}

/**
 * Wait for and dismiss cookie banners
 * @param {Object} page - Playwright page
 * @param {number} timeout - Max time to wait
 */
async function handleCookieBanner(page, timeout = 3000) {
  const commonSelectors = [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("OK")',
    'button:has-text("Got it")',
    'button:has-text("I agree")',
    'button:has-text("Allow")',
    '.cookie-accept',
    '#cookie-accept',
    '[data-testid="cookie-accept"]',
    '[data-testid="accept-cookies"]'
  ];

  for (const selector of commonSelectors) {
    try {
      const element = await page.waitForSelector(selector, {
        timeout: timeout / commonSelectors.length,
        state: 'visible'
      });
      if (element) {
        await element.click();
        console.log('Cookie banner dismissed');
        return true;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  return false;
}

// ============================================================================
// FORM HELPERS (6 functions)
// ============================================================================

/**
 * Extract all form fields with their metadata
 * @param {Object} page - Playwright page
 * @param {string} formSelector - Form selector
 */
async function getFormFields(page, formSelector = 'form') {
  return await page.evaluate((selector) => {
    const form = document.querySelector(selector);
    if (!form) return [];

    const fields = form.querySelectorAll('input, select, textarea');
    return Array.from(fields).map(field => ({
      name: field.name || field.id,
      type: field.type || field.tagName.toLowerCase(),
      required: field.required || field.hasAttribute('aria-required'),
      value: field.value,
      placeholder: field.placeholder,
      disabled: field.disabled
    }));
  }, formSelector);
}

/**
 * Get all required fields in a form
 * @param {Object} page - Playwright page
 * @param {string} formSelector - Form selector
 */
async function getRequiredFields(page, formSelector = 'form') {
  const fields = await getFormFields(page, formSelector);
  return fields.filter(f => f.required);
}

/**
 * Get validation error messages from form
 * @param {Object} page - Playwright page
 * @param {string} formSelector - Form selector
 */
async function getFieldErrors(page, formSelector = 'form') {
  return await page.evaluate((selector) => {
    const form = document.querySelector(selector);
    if (!form) return [];

    const errors = [];

    // Check for HTML5 validation messages
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      if (field.validationMessage) {
        errors.push({
          field: field.name || field.id,
          message: field.validationMessage
        });
      }
    });

    // Check for common error message patterns
    const errorElements = form.querySelectorAll('.error, .error-message, [role="alert"], .invalid-feedback');
    errorElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text) {
        errors.push({ field: 'unknown', message: text });
      }
    });

    return errors;
  }, formSelector);
}

/**
 * Validate field state
 * @param {Object} page - Playwright page
 * @param {string} selector - Field selector
 */
async function validateFieldState(page, selector) {
  return await page.evaluate((sel) => {
    const field = document.querySelector(sel);
    if (!field) return { exists: false };

    return {
      exists: true,
      valid: field.validity?.valid ?? true,
      valueMissing: field.validity?.valueMissing ?? false,
      typeMismatch: field.validity?.typeMismatch ?? false,
      patternMismatch: field.validity?.patternMismatch ?? false,
      tooShort: field.validity?.tooShort ?? false,
      tooLong: field.validity?.tooLong ?? false,
      validationMessage: field.validationMessage || null
    };
  }, selector);
}

/**
 * Fill form from data object
 * @param {Object} page - Playwright page
 * @param {string} formSelector - Form selector
 * @param {Object} data - Field name/value pairs
 * @param {Object} options - Fill options
 */
async function fillFormFromData(page, formSelector, data, options = {}) {
  for (const [fieldName, value] of Object.entries(data)) {
    const selectors = [
      `${formSelector} [name="${fieldName}"]`,
      `${formSelector} #${fieldName}`,
      `${formSelector} [data-testid="${fieldName}"]`
    ];

    for (const selector of selectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() === 0) continue;

        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const inputType = await element.getAttribute('type');

        if (tagName === 'select') {
          await element.selectOption(value);
        } else if (inputType === 'checkbox' || inputType === 'radio') {
          if (value) await element.check();
          else await element.uncheck();
        } else if (inputType === 'file') {
          await element.setInputFiles(value);
        } else {
          if (options.clear !== false) await element.clear();
          await element.fill(String(value));
        }
        break;
      } catch (e) {
        continue;
      }
    }
  }
}

/**
 * Submit form and check for errors
 * @param {Object} page - Playwright page
 * @param {string} formSelector - Form selector
 * @param {Object} options - Submit options
 */
async function submitAndValidate(page, formSelector, options = {}) {
  const submitSelector = options.submitSelector || `${formSelector} button[type="submit"], ${formSelector} input[type="submit"]`;

  await page.click(submitSelector);

  // Wait for response
  await delay(options.waitTime || 1000);

  const errors = await getFieldErrors(page, formSelector);

  return {
    success: errors.length === 0,
    errors
  };
}

// ============================================================================
// ACCESSIBILITY (4 functions)
// ============================================================================

/**
 * Run accessibility audit using axe-core
 * @param {Object} page - Playwright page
 * @param {Object} options - Audit options
 */
async function checkAccessibility(page, options = {}) {
  const { tags = ['wcag2a', 'wcag2aa'] } = options;

  // Inject axe-core
  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js'
  });

  const results = await page.evaluate(async (opts) => {
    return await window.axe.run(document, {
      runOnly: { type: 'tag', values: opts.tags }
    });
  }, { tags });

  const { violations, passes, incomplete } = results;

  console.log('\nAccessibility Audit Results:');
  console.log(`  Passes: ${passes.length}`);
  console.log(`  Violations: ${violations.length}`);
  console.log(`  Incomplete: ${incomplete.length}`);

  if (violations.length > 0) {
    console.log('\nViolations:');
    violations.forEach((v, i) => {
      console.log(`  ${i + 1}. [${v.impact}] ${v.id}: ${v.description}`);
    });
  }

  return {
    violations,
    passes: passes.length,
    incomplete,
    summary: {
      critical: violations.filter(v => v.impact === 'critical').length,
      serious: violations.filter(v => v.impact === 'serious').length,
      moderate: violations.filter(v => v.impact === 'moderate').length,
      minor: violations.filter(v => v.impact === 'minor').length
    }
  };
}

/**
 * Get ARIA information from element
 * @param {Object} page - Playwright page
 * @param {string} selector - Element selector
 */
async function getARIAInfo(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    return {
      role: element.getAttribute('role'),
      ariaLabel: element.getAttribute('aria-label'),
      ariaLabelledBy: element.getAttribute('aria-labelledby'),
      ariaDescribedBy: element.getAttribute('aria-describedby'),
      ariaExpanded: element.getAttribute('aria-expanded'),
      ariaHidden: element.getAttribute('aria-hidden'),
      ariaDisabled: element.getAttribute('aria-disabled'),
      ariaRequired: element.getAttribute('aria-required'),
      ariaInvalid: element.getAttribute('aria-invalid'),
      tabIndex: element.tabIndex
    };
  }, selector);
}

/**
 * Check tab/focus order
 * @param {Object} page - Playwright page
 * @param {Object} options - Check options
 */
async function checkFocusOrder(page, options = {}) {
  const { maxElements = 100 } = options;

  const focusOrder = await page.evaluate((max) => {
    const focusable = Array.from(document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).slice(0, max);

    return focusable.map((el, index) => ({
      index,
      tagName: el.tagName.toLowerCase(),
      text: el.textContent?.trim().slice(0, 50) || el.getAttribute('aria-label') || '',
      tabIndex: el.tabIndex,
      visible: el.offsetParent !== null
    }));
  }, maxElements);

  const issues = [];
  focusOrder.forEach(el => {
    if (el.tabIndex > 0) {
      issues.push({
        type: 'positive-tabindex',
        element: el,
        message: `Element has tabindex="${el.tabIndex}" - avoid positive tabindex`
      });
    }
  });

  return { focusOrder, issues, valid: issues.length === 0 };
}

/**
 * Get all focusable elements on page
 * @param {Object} page - Playwright page
 */
async function getFocusableElements(page) {
  return await page.evaluate(() => {
    const focusable = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return Array.from(focusable).map(el => ({
      tagName: el.tagName.toLowerCase(),
      id: el.id,
      name: el.name,
      text: el.textContent?.trim().slice(0, 50),
      tabIndex: el.tabIndex
    }));
  });
}

// ============================================================================
// PERFORMANCE (4 functions)
// ============================================================================

/**
 * Measure page load metrics
 * @param {Object} page - Playwright page
 * @param {string} url - URL to measure
 * @param {Object} options - Measurement options
 */
async function measurePageLoad(page, url, options = {}) {
  const { waitUntil = 'networkidle', timeout = 30000 } = options;

  const startTime = Date.now();
  const response = await page.goto(url, { waitUntil, timeout });
  const loadTime = Date.now() - startTime;

  await delay(1000);

  const metrics = await page.evaluate(() => {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];

    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      load: timing.loadEventEnd - timing.navigationStart,
      resourceCount: performance.getEntriesByType('resource').length
    };
  });

  return {
    url,
    statusCode: response?.status(),
    loadTime,
    metrics
  };
}

/**
 * Measure Largest Contentful Paint
 * @param {Object} page - Playwright page
 */
async function measureLCP(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry?.startTime || null);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      setTimeout(() => resolve(null), 5000);
    });
  });
}

/**
 * Measure First Contentful Paint
 * @param {Object} page - Playwright page
 */
async function measureFCP(page) {
  return await page.evaluate(() => {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : null;
  });
}

/**
 * Measure Cumulative Layout Shift
 * @param {Object} page - Playwright page
 */
async function measureCLS(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      setTimeout(() => resolve(cls), 3000);
    });
  });
}

// ============================================================================
// NETWORK (5 functions)
// ============================================================================

/**
 * Mock API response
 * @param {Object} page - Playwright page
 * @param {string} urlPattern - URL pattern to intercept
 * @param {Object|Function} response - Response data or function
 * @param {Object} options - Mock options
 */
async function mockAPIResponse(page, urlPattern, response, options = {}) {
  const { status = 200, contentType = 'application/json', times = Infinity } = options;

  let callCount = 0;

  await page.route(urlPattern, async (route) => {
    callCount++;
    if (callCount > times) {
      await route.continue();
      return;
    }

    const body = typeof response === 'function'
      ? response(route.request())
      : response;

    await route.fulfill({
      status,
      contentType,
      body: typeof body === 'string' ? body : JSON.stringify(body)
    });
  });

  return {
    getCallCount: () => callCount,
    unroute: () => page.unroute(urlPattern)
  };
}

/**
 * Block specific resource types
 * @param {Object} page - Playwright page
 * @param {Array<string>} resourceTypes - Types to block (image, stylesheet, font, etc.)
 */
async function blockResources(page, resourceTypes) {
  await page.route('**/*', (route) => {
    if (resourceTypes.includes(route.request().resourceType())) {
      route.abort();
    } else {
      route.continue();
    }
  });
}

/**
 * Capture network requests
 * @param {Object} page - Playwright page
 * @param {string|RegExp} urlPattern - Optional filter pattern
 */
function captureRequests(page, urlPattern = null) {
  const captured = [];

  const handler = (request) => {
    const url = request.url();

    if (urlPattern) {
      const regex = typeof urlPattern === 'string'
        ? new RegExp(urlPattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
        : urlPattern;
      if (!regex.test(url)) return;
    }

    captured.push({
      url,
      method: request.method(),
      resourceType: request.resourceType(),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: Date.now()
    });
  };

  page.on('request', handler);

  return {
    getCaptured: () => [...captured],
    getApiRequests: () => captured.filter(r => r.resourceType === 'fetch' || r.resourceType === 'xhr'),
    clear: () => { captured.length = 0; },
    stop: () => {
      page.off('request', handler);
      return captured;
    }
  };
}

/**
 * Capture network responses
 * @param {Object} page - Playwright page
 * @param {string|RegExp} urlPattern - Optional filter pattern
 */
function captureResponses(page, urlPattern = null) {
  const captured = [];

  const handler = async (response) => {
    const url = response.url();

    if (urlPattern) {
      const regex = typeof urlPattern === 'string'
        ? new RegExp(urlPattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
        : urlPattern;
      if (!regex.test(url)) return;
    }

    let body = null;
    try {
      body = await response.text();
    } catch (e) {
      // Body not available
    }

    captured.push({
      url,
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body,
      timestamp: Date.now()
    });
  };

  page.on('response', handler);

  return {
    getCaptured: () => [...captured],
    getByStatus: (status) => captured.filter(r => r.status === status),
    stop: () => {
      page.off('response', handler);
      return captured;
    }
  };
}

/**
 * Wait for specific API call
 * @param {Object} page - Playwright page
 * @param {string|RegExp} urlPattern - URL pattern to wait for
 * @param {Object} options - Wait options
 */
async function waitForAPI(page, urlPattern, options = {}) {
  const { timeout = 30000, method } = options;

  const response = await page.waitForResponse(
    (response) => {
      const matches = typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url());

      if (!matches) return false;
      if (method && response.request().method() !== method) return false;
      return true;
    },
    { timeout }
  );

  return {
    url: response.url(),
    status: response.status(),
    body: await response.text().catch(() => null)
  };
}

// ============================================================================
// VISUAL (3 functions)
// ============================================================================

/**
 * Take screenshot with timestamp
 * @param {Object} page - Playwright page
 * @param {string} name - Screenshot name
 * @param {Object} options - Screenshot options
 */
async function takeScreenshot(page, name, options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = options.dir || '/tmp';
  const filename = path.join(dir, `${name}-${timestamp}.png`);

  await page.screenshot({
    path: filename,
    fullPage: options.fullPage !== false,
    ...options
  });

  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

/**
 * Compare two screenshots
 * @param {string} baselinePath - Path to baseline image
 * @param {string} currentPath - Path to current image
 * @param {Object} options - Comparison options
 */
async function compareScreenshots(baselinePath, currentPath, options = {}) {
  const { threshold = 0.1, outputDiffPath = null } = options;

  let PNG, pixelmatch;
  try {
    PNG = require('pngjs').PNG;
    pixelmatch = require('pixelmatch');
  } catch (e) {
    throw new Error('Visual diff requires pixelmatch and pngjs packages. Run: npm install pixelmatch pngjs');
  }

  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const current = PNG.sync.read(fs.readFileSync(currentPath));

  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      match: false,
      reason: 'size-mismatch',
      baseline: { width: baseline.width, height: baseline.height },
      current: { width: current.width, height: current.height }
    };
  }

  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    baseline.data, current.data, diff.data, width, height,
    { threshold }
  );

  const totalPixels = width * height;
  const diffPercentage = (mismatchedPixels / totalPixels) * 100;

  if (outputDiffPath && mismatchedPixels > 0) {
    fs.writeFileSync(outputDiffPath, PNG.sync.write(diff));
  }

  return {
    match: mismatchedPixels === 0,
    mismatchedPixels,
    totalPixels,
    diffPercentage: diffPercentage.toFixed(2),
    diffPath: mismatchedPixels > 0 ? outputDiffPath : null
  };
}

/**
 * Take screenshot of specific element
 * @param {Object} page - Playwright page
 * @param {string} selector - Element selector
 * @param {string} name - Screenshot name
 * @param {Object} options - Screenshot options
 */
async function takeElementScreenshot(page, selector, name, options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = options.dir || '/tmp';
  const filename = path.join(dir, `${name}-${timestamp}.png`);

  const element = page.locator(selector);
  await element.screenshot({ path: filename, ...options });

  console.log(`Element screenshot saved: ${filename}`);
  return filename;
}

// ============================================================================
// MOBILE (4 functions)
// ============================================================================

/**
 * Emulate mobile device
 * @param {Object} context - Browser context (must be new context)
 * @param {string} deviceName - Device name from Playwright devices
 */
async function emulateDevice(browser, deviceName) {
  const device = devices[deviceName];
  if (!device) {
    const available = Object.keys(devices).slice(0, 10).join(', ');
    throw new Error(`Unknown device: ${deviceName}. Available: ${available}...`);
  }
  return await browser.newContext({ ...device });
}

/**
 * Set geolocation
 * @param {Object} context - Browser context
 * @param {Object} coords - Coordinates { latitude, longitude, accuracy? }
 */
async function setGeolocation(context, coords) {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy || 100
  });
}

/**
 * Simulate touch event
 * @param {Object} page - Playwright page
 * @param {string} type - Event type (tap, touchstart, touchend, touchmove)
 * @param {Object} coords - Coordinates { x, y }
 */
async function simulateTouchEvent(page, type, coords) {
  if (type === 'tap') {
    await page.tap(`text=dummy`).catch(() => { });
    await page.touchscreen.tap(coords.x, coords.y);
  } else {
    await page.evaluate(({ type, x, y }) => {
      const touch = new Touch({
        identifier: Date.now(),
        target: document.elementFromPoint(x, y),
        clientX: x,
        clientY: y
      });
      const event = new TouchEvent(type, {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      });
      document.elementFromPoint(x, y)?.dispatchEvent(event);
    }, { type, x: coords.x, y: coords.y });
  }
}

/**
 * Swipe gesture
 * @param {Object} page - Playwright page
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @param {number} distance - Distance to swipe
 * @param {Object} options - Swipe options
 */
async function swipe(page, direction, distance = 300, options = {}) {
  const viewport = page.viewportSize();
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  let startX = centerX, startY = centerY, endX = centerX, endY = centerY;

  switch (direction) {
    case 'up':
      startY = centerY + distance / 2;
      endY = centerY - distance / 2;
      break;
    case 'down':
      startY = centerY - distance / 2;
      endY = centerY + distance / 2;
      break;
    case 'left':
      startX = centerX + distance / 2;
      endX = centerX - distance / 2;
      break;
    case 'right':
      startX = centerX - distance / 2;
      endX = centerX + distance / 2;
      break;
  }

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: options.steps || 10 });
  await page.mouse.up();
}

// ============================================================================
// MULTI-PAGE (4 functions)
// ============================================================================

/**
 * Handle popup window
 * @param {Object} page - Playwright page
 * @param {Function} triggerAction - Action that triggers popup
 * @param {Object} options - Handler options
 */
async function handlePopup(page, triggerAction, options = {}) {
  const [popup] = await Promise.all([
    page.waitForEvent('popup', { timeout: options.timeout || 30000 }),
    triggerAction()
  ]);

  if (options.waitForLoad !== false) {
    await popup.waitForLoadState('networkidle');
  }

  return popup;
}

/**
 * Handle new tab
 * @param {Object} page - Playwright page
 * @param {Function} triggerAction - Action that triggers new tab
 * @param {Object} options - Handler options
 */
async function handleNewTab(page, triggerAction, options = {}) {
  const context = page.context();

  const [newPage] = await Promise.all([
    context.waitForEvent('page', { timeout: options.timeout || 30000 }),
    triggerAction()
  ]);

  if (options.waitForLoad !== false) {
    await newPage.waitForLoadState('networkidle');
  }

  return newPage;
}

/**
 * Close all pages except the main one
 * @param {Object} context - Browser context
 */
async function closeAllPopups(context) {
  const pages = context.pages();
  if (pages.length <= 1) return 0;

  const mainPage = pages[0];
  let closed = 0;

  for (let i = 1; i < pages.length; i++) {
    await pages[i].close();
    closed++;
  }

  return closed;
}

/**
 * Handle dialog (alert, confirm, prompt)
 * @param {Object} page - Playwright page
 * @param {string} action - 'accept' or 'dismiss'
 * @param {string} promptText - Text for prompt dialogs
 */
async function handleDialog(page, action = 'accept', promptText = '') {
  page.once('dialog', async (dialog) => {
    console.log(`Dialog type: ${dialog.type()}, message: ${dialog.message()}`);

    if (action === 'accept') {
      await dialog.accept(promptText);
    } else {
      await dialog.dismiss();
    }
  });
}

// ============================================================================
// DATA EXTRACTION (6 functions)
// ============================================================================

/**
 * Extract text from multiple elements
 * @param {Object} page - Playwright page
 * @param {string} selector - Elements selector
 */
async function extractTexts(page, selector) {
  await page.waitForSelector(selector, { timeout: 10000 });
  return await page.$$eval(selector, elements =>
    elements.map(el => el.textContent?.trim()).filter(Boolean)
  );
}

/**
 * Extract table data as JSON
 * @param {Object} page - Playwright page
 * @param {string} tableSelector - Table selector
 */
async function extractTableData(page, tableSelector) {
  await page.waitForSelector(tableSelector);

  return await page.evaluate((selector) => {
    const table = document.querySelector(selector);
    if (!table) return null;

    const headers = Array.from(table.querySelectorAll('thead th')).map(th =>
      th.textContent?.trim()
    );

    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
      const cells = Array.from(tr.querySelectorAll('td'));
      if (headers.length > 0) {
        return cells.reduce((obj, cell, index) => {
          obj[headers[index] || `column_${index}`] = cell.textContent?.trim();
          return obj;
        }, {});
      } else {
        return cells.map(cell => cell.textContent?.trim());
      }
    });

    return { headers, rows };
  }, tableSelector);
}

/**
 * Extract meta tags
 * @param {Object} page - Playwright page
 */
async function extractMetaTags(page) {
  return await page.evaluate(() => {
    const metas = {};
    document.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metas[name] = content;
      }
    });
    return metas;
  });
}

/**
 * Extract Open Graph metadata
 * @param {Object} page - Playwright page
 */
async function extractOpenGraph(page) {
  return await page.evaluate(() => {
    const og = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
      const property = meta.getAttribute('property').replace('og:', '');
      og[property] = meta.getAttribute('content');
    });
    return og;
  });
}

/**
 * Extract JSON-LD structured data
 * @param {Object} page - Playwright page
 */
async function extractJsonLD(page) {
  return await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    return Array.from(scripts).map(script => {
      try {
        return JSON.parse(script.textContent);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  });
}

/**
 * Extract all links from page
 * @param {Object} page - Playwright page
 * @param {Object} options - Extraction options
 */
async function extractLinks(page, options = {}) {
  const { internal = true, external = true } = options;

  return await page.evaluate(({ internal, external }) => {
    const currentHost = window.location.host;
    const links = [];

    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.href;
      const text = a.textContent?.trim();
      const isExternal = !href.includes(currentHost) && href.startsWith('http');

      if ((isExternal && external) || (!isExternal && internal)) {
        links.push({
          href,
          text,
          isExternal
        });
      }
    });

    return links;
  }, { internal, external });
}

// ============================================================================
// CONSOLE MONITORING (4 functions)
// ============================================================================

/**
 * Capture console logs
 * @param {Object} page - Playwright page
 * @param {Object} options - Capture options
 */
function captureConsoleLogs(page, options = {}) {
  const { levels = ['log', 'warn', 'error', 'info'] } = options;
  const logs = [];

  const handler = (msg) => {
    const type = msg.type();
    if (!levels.includes(type)) return;

    logs.push({
      type,
      text: msg.text(),
      location: msg.location(),
      timestamp: Date.now()
    });
  };

  page.on('console', handler);

  return {
    getLogs: () => [...logs],
    getErrors: () => logs.filter(l => l.type === 'error'),
    getWarnings: () => logs.filter(l => l.type === 'warn'),
    clear: () => { logs.length = 0; },
    hasErrors: () => logs.some(l => l.type === 'error'),
    stop: () => {
      page.off('console', handler);
      return logs;
    }
  };
}

/**
 * Capture page errors
 * @param {Object} page - Playwright page
 */
function capturePageErrors(page) {
  const errors = [];

  const handler = (error) => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  };

  page.on('pageerror', handler);

  return {
    getErrors: () => [...errors],
    hasErrors: () => errors.length > 0,
    clear: () => { errors.length = 0; },
    stop: () => {
      page.off('pageerror', handler);
      return errors;
    }
  };
}

/**
 * Get collected console errors
 * @param {Object} consoleCapture - Console capture instance
 */
function getConsoleErrors(consoleCapture) {
  return consoleCapture.getErrors();
}

/**
 * Assert no console errors
 * @param {Object} consoleCapture - Console capture instance
 */
function assertNoConsoleErrors(consoleCapture) {
  const errors = consoleCapture.getErrors();

  if (errors.length > 0) {
    const errorSummary = errors.map(e => `  - ${e.text}`).join('\n');
    throw new Error(`Found ${errors.length} console error(s):\n${errorSummary}`);
  }

  return true;
}

// ============================================================================
// FILE HANDLING (4 functions)
// ============================================================================

/**
 * Upload file to input
 * @param {Object} page - Playwright page
 * @param {string} selector - File input selector
 * @param {string} filePath - Path to file
 * @param {Object} options - Upload options
 */
async function uploadFile(page, selector, filePath, options = {}) {
  const input = page.locator(selector);
  await input.setInputFiles(filePath);
}

/**
 * Upload multiple files
 * @param {Object} page - Playwright page
 * @param {string} selector - File input selector
 * @param {Array<string>} filePaths - Paths to files
 */
async function uploadMultipleFiles(page, selector, filePaths) {
  const input = page.locator(selector);
  await input.setInputFiles(filePaths);
}

/**
 * Download file
 * @param {Object} page - Playwright page
 * @param {Function} triggerAction - Action that triggers download
 * @param {Object} options - Download options
 */
async function downloadFile(page, triggerAction, options = {}) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: options.timeout || 30000 }),
    triggerAction()
  ]);

  const suggestedFilename = download.suggestedFilename();
  const savePath = options.savePath || path.join('/tmp', suggestedFilename);

  await download.saveAs(savePath);
  console.log(`Downloaded: ${savePath}`);

  return {
    path: savePath,
    filename: suggestedFilename
  };
}

/**
 * Wait for download to complete
 * @param {Object} page - Playwright page
 * @param {Function} triggerAction - Action that triggers download
 */
async function waitForDownload(page, triggerAction) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    triggerAction()
  ]);

  return download;
}

// ============================================================================
// UTILITIES (2 functions)
// ============================================================================

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} initialDelay - Initial delay in ms
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delayTime = initialDelay * Math.pow(2, i);
      console.log(`Attempt ${i + 1} failed, retrying in ${delayTime}ms...`);
      await delay(delayTime);
    }
  }

  throw lastError;
}

/**
 * Promise-based delay
 * @param {number} ms - Milliseconds to delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Browser & Context
  launchBrowser,
  createContext,
  createPage,
  saveStorageState,
  loadStorageState,
  detectDevServers,

  // Navigation & Waiting
  waitForPageReady,
  navigateWithRetry,
  waitForSPA,
  waitForElement,

  // Safe Interactions
  safeClick,
  safeType,
  safeSelect,
  safeCheck,
  scrollPage,
  scrollToElement,
  authenticate,
  handleCookieBanner,

  // Form Helpers
  getFormFields,
  getRequiredFields,
  getFieldErrors,
  validateFieldState,
  fillFormFromData,
  submitAndValidate,

  // Accessibility
  checkAccessibility,
  getARIAInfo,
  checkFocusOrder,
  getFocusableElements,

  // Performance
  measurePageLoad,
  measureLCP,
  measureFCP,
  measureCLS,

  // Network
  mockAPIResponse,
  blockResources,
  captureRequests,
  captureResponses,
  waitForAPI,

  // Visual
  takeScreenshot,
  compareScreenshots,
  takeElementScreenshot,

  // Mobile
  emulateDevice,
  setGeolocation,
  simulateTouchEvent,
  swipe,

  // Multi-page
  handlePopup,
  handleNewTab,
  closeAllPopups,
  handleDialog,

  // Data Extraction
  extractTexts,
  extractTableData,
  extractMetaTags,
  extractOpenGraph,
  extractJsonLD,
  extractLinks,

  // Console Monitoring
  captureConsoleLogs,
  capturePageErrors,
  getConsoleErrors,
  assertNoConsoleErrors,

  // File Handling
  uploadFile,
  uploadMultipleFiles,
  downloadFile,
  waitForDownload,

  // Utilities
  retryWithBackoff,
  delay
};
