const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vps.nekodigi.com/ccbot/projects/f1282b85';

// テスト用のユーザー情報
const TEST_USER = {
  email: `test_${Date.now()}@example.com`,
  password: 'test123456'
};

test.describe('チケットアプリ 基本テスト', () => {
  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`, { waitUntil: 'domcontentloaded' });

    // ページタイトルの確認
    await expect(page).toHaveTitle(/ログイン - チケットアプリ/, { timeout: 10000 });

    // ログインフォームが表示されている
    await expect(page.locator('#login-form')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#login-password')).toBeVisible({ timeout: 10000 });
  });

  test('PWA manifest が正しく設定されている', async ({ page }) => {
    const manifestResponse = await page.goto(`${BASE_URL}/manifest.json`);
    expect(manifestResponse.status()).toBe(200);

    const manifestContent = await manifestResponse.json();
    expect(manifestContent.name).toBe('チケットアプリ');
    expect(manifestContent.short_name).toBe('チケット');
  });

  test('Service Worker ファイルが存在する', async ({ page }) => {
    const swResponse = await page.goto(`${BASE_URL}/sw.js`);
    expect(swResponse.status()).toBe(200);
  });

  test('CSSファイルが読み込まれる', async ({ page }) => {
    const cssResponse = await page.goto(`${BASE_URL}/css/style.css`);
    expect(cssResponse.status()).toBe(200);
  });

  test('全HTMLページが正常にアクセスできる', async ({ page }) => {
    const pages = [
      '/login.html',
      '/index.html',
      '/search.html',
      '/detail.html',
      '/mytickets.html'
    ];

    for (const pagePath of pages) {
      const response = await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'domcontentloaded' });
      expect(response.status()).toBe(200);
    }
  });

  test('全JavaScriptファイルが存在する', async ({ page }) => {
    const scripts = [
      '/js/config.js',
      '/js/auth.js',
      '/js/search.js',
      '/js/purchase.js',
      '/js/tickets.js',
      '/js/recommendations.js'
    ];

    for (const scriptPath of scripts) {
      const response = await page.goto(`${BASE_URL}${scriptPath}`);
      expect(response.status()).toBe(200);
    }
  });
});
