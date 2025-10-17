// Playwright Test for WordShare App
// This test requires Playwright to be installed: npm install -D @playwright/test

const { test, expect } = require('@playwright/test');

const APP_URL = 'https://vps.nekodigi.com/ccbot/projects/1deb1b1a/';

// Test credentials
const TEST_USER = {
  email: `test_${Date.now()}@example.com`,
  password: 'testpass123',
  username: `testuser_${Date.now()}`
};

test.describe('WordShare App Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('should load the app correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/WordShare/);
    await expect(page.locator('.app-title')).toContainText('WordShare');
  });

  test('should show auth screen on first load', async ({ page }) => {
    await expect(page.locator('#auth-screen')).toBeVisible();
    await expect(page.locator('#app-screen')).not.toBeVisible();
  });

  test('should switch between login and signup tabs', async ({ page }) => {
    // Click signup tab
    await page.click('[data-tab="signup"]');
    await expect(page.locator('#signup-form')).toBeVisible();
    await expect(page.locator('#login-form')).not.toBeVisible();

    // Click login tab
    await page.click('[data-tab="login"]');
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('#signup-form')).not.toBeVisible();
  });

  test('should create a new user account', async ({ page }) => {
    // Switch to signup tab
    await page.click('[data-tab="signup"]');

    // Fill signup form
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);

    // Submit form
    await page.click('#signup-form button[type="submit"]');

    // Wait for auth to complete and app screen to show
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    // Verify we're in the app
    await expect(page.locator('#app-screen')).toBeVisible();
    await expect(page.locator('#auth-screen')).not.toBeVisible();
  });

  test('should login with existing credentials', async ({ page }) => {
    // First create an account
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    // Logout
    await page.click('#logout-btn');
    await page.waitForSelector('#auth-screen:not(.hidden)');

    // Login
    await page.fill('#login-email', TEST_USER.email);
    await page.fill('#login-password', TEST_USER.password);
    await page.click('#login-form button[type="submit"]');

    // Verify login success
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });
    await expect(page.locator('#app-screen')).toBeVisible();
  });

  test('should create a new deck', async ({ page, context }) => {
    // Signup first
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    // Navigate to My Decks
    await page.click('[data-view="my-decks"]');

    // Click create deck button
    await page.click('#create-deck-btn');

    // Wait for modal
    await expect(page.locator('#deck-modal')).toBeVisible();

    // Fill deck form
    await page.fill('#deck-title', 'Test Deck');
    await page.fill('#deck-description', 'This is a test deck');
    await page.check('#deck-public');

    // Fill first word (should be auto-added)
    const firstTerm = page.locator('.word-term').first();
    const firstDef = page.locator('.word-definition').first();
    await firstTerm.fill('Hello');
    await firstDef.fill('こんにちは');

    // Add another word
    await page.click('#add-word-btn');
    const secondTerm = page.locator('.word-term').nth(1);
    const secondDef = page.locator('.word-definition').nth(1);
    await secondTerm.fill('World');
    await secondDef.fill('世界');

    // Submit form
    await page.click('#deck-form button[type="submit"]');

    // Wait for modal to close
    await page.waitForSelector('#deck-modal.hidden', { timeout: 5000 });

    // Verify deck appears in list
    await expect(page.locator('.deck-card')).toBeVisible();
    await expect(page.locator('.deck-title')).toContainText('Test Deck');
  });

  test('should view deck details', async ({ page }) => {
    // Signup and create deck first
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    // Create a deck
    await page.click('[data-view="my-decks"]');
    await page.click('#create-deck-btn');
    await page.fill('#deck-title', 'View Test Deck');
    await page.fill('#deck-description', 'Test description');
    await page.check('#deck-public');
    await page.locator('.word-term').first().fill('Test');
    await page.locator('.word-definition').first().fill('テスト');
    await page.click('#deck-form button[type="submit"]');
    await page.waitForSelector('#deck-modal.hidden', { timeout: 5000 });

    // Click on deck card
    await page.click('.deck-card');

    // Verify detail modal opens
    await expect(page.locator('#deck-detail-modal')).toBeVisible();
    await expect(page.locator('#detail-deck-title')).toContainText('View Test Deck');
    await expect(page.locator('#detail-description')).toContainText('Test description');

    // Verify words are displayed
    await expect(page.locator('.word-display-item')).toBeVisible();
    await expect(page.locator('.word-term')).toContainText('Test');
    await expect(page.locator('.word-definition')).toContainText('テスト');
  });

  test('should like a deck', async ({ page }) => {
    // Signup and create public deck
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    await page.click('[data-view="my-decks"]');
    await page.click('#create-deck-btn');
    await page.fill('#deck-title', 'Like Test Deck');
    await page.check('#deck-public');
    await page.locator('.word-term').first().fill('Like');
    await page.locator('.word-definition').first().fill('いいね');
    await page.click('#deck-form button[type="submit"]');
    await page.waitForSelector('#deck-modal.hidden', { timeout: 5000 });

    // Open deck detail
    await page.click('.deck-card');
    await expect(page.locator('#deck-detail-modal')).toBeVisible();

    // Get initial like count
    const initialLikes = await page.locator('#like-count').textContent();

    // Click like button
    await page.click('#like-btn');

    // Wait for like to process
    await page.waitForTimeout(1000);

    // Verify like count increased
    const newLikes = await page.locator('#like-count').textContent();
    expect(parseInt(newLikes)).toBe(parseInt(initialLikes) + 1);
  });

  test('should post a comment', async ({ page }) => {
    // Signup and create public deck
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    await page.click('[data-view="my-decks"]');
    await page.click('#create-deck-btn');
    await page.fill('#deck-title', 'Comment Test Deck');
    await page.check('#deck-public');
    await page.locator('.word-term').first().fill('Comment');
    await page.locator('.word-definition').first().fill('コメント');
    await page.click('#deck-form button[type="submit"]');
    await page.waitForSelector('#deck-modal.hidden', { timeout: 5000 });

    // Open deck detail
    await page.click('.deck-card');
    await expect(page.locator('#deck-detail-modal')).toBeVisible();

    // Post a comment
    await page.fill('#comment-input', 'This is a test comment!');
    await page.click('#comment-form button[type="submit"]');

    // Wait for comment to appear
    await page.waitForTimeout(1000);

    // Verify comment appears
    await expect(page.locator('.comment-item')).toBeVisible();
    await expect(page.locator('.comment-text')).toContainText('This is a test comment!');
  });

  test('should navigate between views', async ({ page }) => {
    // Signup first
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    // Test navigation to My Decks
    await page.click('[data-view="my-decks"]');
    await expect(page.locator('#my-decks-view')).toBeVisible();
    await expect(page.locator('#feed-view')).not.toBeVisible();

    // Test navigation to Profile
    await page.click('[data-view="profile"]');
    await expect(page.locator('#profile-view')).toBeVisible();
    await expect(page.locator('#my-decks-view')).not.toBeVisible();

    // Test navigation back to Feed
    await page.click('[data-view="feed"]');
    await expect(page.locator('#feed-view')).toBeVisible();
    await expect(page.locator('#profile-view')).not.toBeVisible();
  });

  test('should display profile information', async ({ page }) => {
    // Signup
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    // Navigate to profile
    await page.click('[data-view="profile"]');

    // Verify profile displays user info
    await expect(page.locator('#profile-username')).toContainText(TEST_USER.username);
    await expect(page.locator('#profile-email')).toContainText(TEST_USER.email);

    // Verify stats are displayed
    await expect(page.locator('#decks-count')).toBeVisible();
    await expect(page.locator('#followers-count')).toBeVisible();
    await expect(page.locator('#following-count')).toBeVisible();
  });

  test('should work offline (PWA)', async ({ page, context }) => {
    // Load the page first
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');

    // Wait for service worker to be ready
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Try to reload
    await page.reload();

    // Should still load (from cache or show offline page)
    await page.waitForLoadState('load');

    // Verify offline notice appears
    const offlineNotice = page.locator('#offline-notice');
    // The offline notice should either be visible or exist in DOM
    const noticeExists = await offlineNotice.count();
    expect(noticeExists).toBeGreaterThan(0);
  });

  test('should logout successfully', async ({ page }) => {
    // Signup
    await page.click('[data-tab="signup"]');
    await page.fill('#signup-username', TEST_USER.username);
    await page.fill('#signup-email', TEST_USER.email);
    await page.fill('#signup-password', TEST_USER.password);
    await page.click('#signup-form button[type="submit"]');
    await page.waitForSelector('#app-screen:not(.hidden)', { timeout: 10000 });

    // Navigate to profile and logout
    await page.click('[data-view="profile"]');
    await page.click('#logout-btn');

    // Verify we're back at auth screen
    await page.waitForSelector('#auth-screen:not(.hidden)');
    await expect(page.locator('#auth-screen')).toBeVisible();
    await expect(page.locator('#app-screen')).not.toBeVisible();
  });
});
