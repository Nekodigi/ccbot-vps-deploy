// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Playwright Test Suite for InfoCollector
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vps.nekodigi.com/ccbot/projects/8692e1ed';

// Test credentials - using unique email to avoid conflicts
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'test123456';

test.describe('InfoCollector PWA - Basic Functionality', () => {

    test('should load the application', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page).toHaveTitle(/InfoCollector/);
        await expect(page.locator('.app-title')).toContainText('InfoCollector');
    });

    test('should have PWA manifest', async ({ page }) => {
        await page.goto(BASE_URL);
        const manifestLink = page.locator('link[rel="manifest"]');
        await expect(manifestLink).toHaveAttribute('href', './manifest.json');
    });

    test('should register service worker', async ({ page }) => {
        await page.goto(BASE_URL);

        // Wait for service worker registration
        await page.waitForTimeout(2000);

        const swRegistered = await page.evaluate(() => {
            return navigator.serviceWorker.controller !== null ||
                   navigator.serviceWorker.getRegistrations().then(regs => regs.length > 0);
        });

        expect(swRegistered).toBeTruthy();
    });

    test('should display auth screen initially', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('#auth-screen')).toBeVisible();
        await expect(page.locator('#login-form')).toBeVisible();
    });

    test('should toggle between login and signup forms', async ({ page }) => {
        await page.goto(BASE_URL);

        // Initially login form should be visible
        await expect(page.locator('#login-form')).toHaveClass(/active/);

        // Click show signup link
        await page.locator('#show-signup').click();
        await expect(page.locator('#signup-form')).toHaveClass(/active/);

        // Click show login link
        await page.locator('#show-login').click();
        await expect(page.locator('#login-form')).toHaveClass(/active/);
    });

    test('should validate empty signup fields', async ({ page }) => {
        await page.goto(BASE_URL);

        await page.locator('#show-signup').click();
        await page.locator('#signup-btn').click();

        // Should show error message
        await expect(page.locator('#auth-error')).toBeVisible();
    });

});

test.describe('InfoCollector PWA - User Registration and Login', () => {

    test('should successfully register a new user', async ({ page }) => {
        await page.goto(BASE_URL);

        // Switch to signup form
        await page.locator('#show-signup').click();

        // Fill signup form
        await page.locator('#signup-email').fill(TEST_EMAIL);
        await page.locator('#signup-password').fill(TEST_PASSWORD);

        // Submit form
        await page.locator('#signup-btn').click();

        // Wait for authentication and redirect to app screen
        await page.waitForSelector('#app-screen', { timeout: 10000 });
        await expect(page.locator('#app-screen')).toBeVisible();
        await expect(page.locator('#auth-screen')).not.toBeVisible();
    });

    test('should successfully login with existing user', async ({ page }) => {
        // First register
        await page.goto(BASE_URL);
        await page.locator('#show-signup').click();
        await page.locator('#signup-email').fill(TEST_EMAIL);
        await page.locator('#signup-password').fill(TEST_PASSWORD);
        await page.locator('#signup-btn').click();
        await page.waitForSelector('#app-screen', { timeout: 10000 });

        // Logout
        await page.locator('#logout-btn').click();
        await page.waitForSelector('#auth-screen');

        // Now login
        await page.locator('#login-email').fill(TEST_EMAIL);
        await page.locator('#login-password').fill(TEST_PASSWORD);
        await page.locator('#login-btn').click();

        // Should be logged in
        await page.waitForSelector('#app-screen', { timeout: 10000 });
        await expect(page.locator('#app-screen')).toBeVisible();
    });

    test('should display error with invalid login credentials', async ({ page }) => {
        await page.goto(BASE_URL);

        await page.locator('#login-email').fill('nonexistent@example.com');
        await page.locator('#login-password').fill('wrongpassword');
        await page.locator('#login-btn').click();

        // Should show error message
        await expect(page.locator('#auth-error')).toBeVisible();
    });

});

test.describe('InfoCollector PWA - Information Collection', () => {

    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto(BASE_URL);
        await page.locator('#show-signup').click();
        const uniqueEmail = `test_${Date.now()}@example.com`;
        await page.locator('#signup-email').fill(uniqueEmail);
        await page.locator('#signup-password').fill(TEST_PASSWORD);
        await page.locator('#signup-btn').click();
        await page.waitForSelector('#app-screen', { timeout: 10000 });
    });

    test('should display tab navigation', async ({ page }) => {
        await expect(page.locator('.tab-btn[data-tab="collect"]')).toBeVisible();
        await expect(page.locator('.tab-btn[data-tab="organize"]')).toBeVisible();
        await expect(page.locator('.tab-btn[data-tab="assistant"]')).toBeVisible();
    });

    test('should switch between tabs', async ({ page }) => {
        // Initially collect tab should be active
        await expect(page.locator('.tab-btn[data-tab="collect"]')).toHaveClass(/active/);

        // Switch to organize tab
        await page.locator('.tab-btn[data-tab="organize"]').click();
        await expect(page.locator('.tab-btn[data-tab="organize"]')).toHaveClass(/active/);
        await expect(page.locator('#organize-tab')).toHaveClass(/active/);

        // Switch to AI assistant tab
        await page.locator('.tab-btn[data-tab="assistant"]').click();
        await expect(page.locator('.tab-btn[data-tab="assistant"]')).toHaveClass(/active/);
        await expect(page.locator('#assistant-tab')).toHaveClass(/active/);
    });

    test('should add a new information item', async ({ page }) => {
        // Fill information form
        await page.locator('#info-title').fill('テスト情報');
        await page.locator('#info-content').fill('これはテストコンテンツです。');
        await page.locator('#info-url').fill('https://example.com');
        await page.locator('#info-tags').fill('テスト, サンプル');

        // Submit form
        await page.locator('#add-info-btn').click();

        // Should switch to organize tab
        await page.waitForTimeout(1000);
        await expect(page.locator('.tab-btn[data-tab="organize"]')).toHaveClass(/active/);

        // Should display the new item
        await expect(page.locator('.info-item')).toBeVisible();
        await expect(page.locator('.info-item-title')).toContainText('テスト情報');
    });

    test('should validate empty information fields', async ({ page }) => {
        // Try to submit without filling fields
        await page.locator('#add-info-btn').click();

        // Should show error
        await expect(page.locator('#auth-error')).toBeVisible();
    });

});

test.describe('InfoCollector PWA - Information Organization', () => {

    test.beforeEach(async ({ page }) => {
        // Login and add test data
        await page.goto(BASE_URL);
        await page.locator('#show-signup').click();
        const uniqueEmail = `test_${Date.now()}@example.com`;
        await page.locator('#signup-email').fill(uniqueEmail);
        await page.locator('#signup-password').fill(TEST_PASSWORD);
        await page.locator('#signup-btn').click();
        await page.waitForSelector('#app-screen', { timeout: 10000 });

        // Add test information
        await page.locator('#info-title').fill('テスト項目1');
        await page.locator('#info-content').fill('内容1');
        await page.locator('#info-tags').fill('タグ1');
        await page.locator('#add-info-btn').click();
        await page.waitForTimeout(1000);

        // Add another item
        await page.locator('.tab-btn[data-tab="collect"]').click();
        await page.locator('#info-title').fill('テスト項目2');
        await page.locator('#info-content').fill('内容2');
        await page.locator('#info-tags').fill('タグ2');
        await page.locator('#add-info-btn').click();
        await page.waitForTimeout(1000);
    });

    test('should display information items', async ({ page }) => {
        await page.locator('.tab-btn[data-tab="organize"]').click();

        const items = page.locator('.info-item');
        await expect(items).toHaveCount(2);
    });

    test('should search information items', async ({ page }) => {
        await page.locator('.tab-btn[data-tab="organize"]').click();

        // Search for specific item
        await page.locator('#search-input').fill('テスト項目1');
        await page.waitForTimeout(500);

        const items = page.locator('.info-item');
        await expect(items).toHaveCount(1);
        await expect(items.first()).toContainText('テスト項目1');
    });

    test('should filter by category', async ({ page }) => {
        await page.locator('.tab-btn[data-tab="organize"]').click();

        // Filter by tag
        await page.locator('#category-filter').selectOption('タグ1');
        await page.waitForTimeout(500);

        const items = page.locator('.info-item');
        await expect(items).toHaveCount(1);
    });

    test('should delete information item', async ({ page }) => {
        await page.locator('.tab-btn[data-tab="organize"]').click();

        // Count initial items
        const initialCount = await page.locator('.info-item').count();

        // Delete first item
        page.once('dialog', dialog => dialog.accept());
        await page.locator('.delete-btn').first().click();

        // Wait for deletion
        await page.waitForTimeout(1000);

        // Count should decrease
        const newCount = await page.locator('.info-item').count();
        expect(newCount).toBe(initialCount - 1);
    });

    test('should update notes for information item', async ({ page }) => {
        await page.locator('.tab-btn[data-tab="organize"]').click();

        // Update notes
        const notesTextarea = page.locator('.info-item-notes textarea').first();
        await notesTextarea.fill('追加されたメモ');
        await notesTextarea.blur();

        // Wait for update
        await page.waitForTimeout(1000);

        // Reload page and check if notes persisted
        await page.reload();
        await page.waitForSelector('#app-screen', { timeout: 10000 });
        await page.locator('.tab-btn[data-tab="organize"]').click();

        await expect(page.locator('.info-item-notes textarea').first()).toHaveValue('追加されたメモ');
    });

});

test.describe('InfoCollector PWA - AI Assistant', () => {

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto(BASE_URL);
        await page.locator('#show-signup').click();
        const uniqueEmail = `test_${Date.now()}@example.com`;
        await page.locator('#signup-email').fill(uniqueEmail);
        await page.locator('#signup-password').fill(TEST_PASSWORD);
        await page.locator('#signup-btn').click();
        await page.waitForSelector('#app-screen', { timeout: 10000 });

        // Switch to AI tab
        await page.locator('.tab-btn[data-tab="assistant"]').click();
    });

    test('should display AI assistant interface', async ({ page }) => {
        await expect(page.locator('#chat-messages')).toBeVisible();
        await expect(page.locator('#chat-input')).toBeVisible();
        await expect(page.locator('#send-chat-btn')).toBeVisible();
    });

    test('should display system welcome message', async ({ page }) => {
        const systemMessage = page.locator('.chat-message.system');
        await expect(systemMessage).toBeVisible();
        await expect(systemMessage).toContainText('収集した情報について質問してください');
    });

    test('should send and receive chat messages', async ({ page }) => {
        // Type a message
        await page.locator('#chat-input').fill('こんにちは');
        await page.locator('#send-chat-btn').click();

        // User message should appear
        await expect(page.locator('.chat-message.user').last()).toContainText('こんにちは');

        // Wait for AI response (this may take time)
        await page.waitForSelector('.chat-message.assistant', { timeout: 30000 });

        // Assistant message should appear
        await expect(page.locator('.chat-message.assistant').last()).toBeVisible();
    });

});

test.describe('InfoCollector PWA - Responsive Design', () => {

    test('should work on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(BASE_URL);

        await expect(page.locator('.app-title')).toBeVisible();
        await expect(page.locator('#login-form')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(BASE_URL);

        await expect(page.locator('.app-title')).toBeVisible();
        await expect(page.locator('#login-form')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(BASE_URL);

        await expect(page.locator('.app-title')).toBeVisible();
        await expect(page.locator('#login-form')).toBeVisible();
    });

});

test.describe('InfoCollector PWA - Meta Tags', () => {

    test('should have proper SEO meta tags', async ({ page }) => {
        await page.goto(BASE_URL);

        // Check basic meta tags
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /情報収集/);

        // Check OGP tags
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /InfoCollector/);
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');

        // Check Twitter Card tags
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    });

});
