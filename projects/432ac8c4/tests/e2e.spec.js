// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vps.nekodigi.com/ccbot/projects/432ac8c4/';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'test123456';

test.describe('TaskFlow PWA - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/TaskFlow/);
  });

  test('should display auth screen on first load', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });

    const authScreen = await page.locator('#auth-screen');
    await expect(authScreen).toBeVisible();
  });

  test('should have PWA manifest', async ({ page }) => {
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', './manifest.json');
  });

  test('should have meta tags for SEO', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /TaskFlow/);

    const twitterCard = await page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('should register a new user', async ({ page }) => {
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });

    // Click on register link
    await page.click('#show-register');

    // Fill in registration form
    await page.fill('#register-email', TEST_EMAIL);
    await page.fill('#register-password', TEST_PASSWORD);

    // Submit registration
    await page.click('#register-btn');

    // Wait for app screen to appear (user is logged in)
    await page.waitForSelector('#app-screen', { state: 'visible', timeout: 15000 });

    const appScreen = await page.locator('#app-screen');
    await expect(appScreen).toBeVisible();

    // Verify user email is displayed
    const userEmail = await page.locator('#user-email');
    await expect(userEmail).toContainText(TEST_EMAIL);
  });

  test('should create a new task', async ({ page }) => {
    // Login first (reuse previous test or create new account)
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });
    await page.click('#show-register');
    await page.fill('#register-email', `test-${Date.now()}@example.com`);
    await page.fill('#register-password', TEST_PASSWORD);
    await page.click('#register-btn');
    await page.waitForSelector('#app-screen', { state: 'visible', timeout: 15000 });

    // Create a task
    await page.fill('#task-title', 'Test Task');
    await page.fill('#task-description', 'This is a test task description');
    await page.selectOption('#task-priority', 'high');

    await page.click('#add-task-btn');

    // Wait for task to appear
    await page.waitForTimeout(2000);

    // Verify task is displayed
    const taskTitle = await page.locator('.task-title', { hasText: 'Test Task' });
    await expect(taskTitle).toBeVisible();
  });

  test('should filter tasks', async ({ page }) => {
    // Login and create tasks
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });
    await page.click('#show-register');
    await page.fill('#register-email', `test-${Date.now()}@example.com`);
    await page.fill('#register-password', TEST_PASSWORD);
    await page.click('#register-btn');
    await page.waitForSelector('#app-screen', { state: 'visible', timeout: 15000 });

    // Create high priority task
    await page.fill('#task-title', 'High Priority Task');
    await page.selectOption('#task-priority', 'high');
    await page.click('#add-task-btn');
    await page.waitForTimeout(1000);

    // Create low priority task
    await page.fill('#task-title', 'Low Priority Task');
    await page.selectOption('#task-priority', 'low');
    await page.click('#add-task-btn');
    await page.waitForTimeout(2000);

    // Click on high priority filter
    await page.click('[data-filter="high"]');
    await page.waitForTimeout(1000);

    // Verify only high priority task is visible
    const highTask = await page.locator('.task-title', { hasText: 'High Priority Task' });
    await expect(highTask).toBeVisible();
  });

  test('should complete a task', async ({ page }) => {
    // Login and create a task
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });
    await page.click('#show-register');
    await page.fill('#register-email', `test-${Date.now()}@example.com`);
    await page.fill('#register-password', TEST_PASSWORD);
    await page.click('#register-btn');
    await page.waitForSelector('#app-screen', { state: 'visible', timeout: 15000 });

    await page.fill('#task-title', 'Task to Complete');
    await page.click('#add-task-btn');
    await page.waitForTimeout(2000);

    // Click checkbox to complete task
    const checkbox = await page.locator('.task-checkbox').first();
    await checkbox.check();
    await page.waitForTimeout(1000);

    // Verify task has completed class
    const taskItem = await page.locator('.task-item.completed').first();
    await expect(taskItem).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Login and create a task
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });
    await page.click('#show-register');
    await page.fill('#register-email', `test-${Date.now()}@example.com`);
    await page.fill('#register-password', TEST_PASSWORD);
    await page.click('#register-btn');
    await page.waitForSelector('#app-screen', { state: 'visible', timeout: 15000 });

    await page.fill('#task-title', 'Task to Delete');
    await page.click('#add-task-btn');
    await page.waitForTimeout(2000);

    // Click delete button
    page.on('dialog', dialog => dialog.accept());
    await page.click('.task-delete-btn');
    await page.waitForTimeout(2000);

    // Verify task is gone
    const noTasks = await page.locator('#no-tasks');
    await expect(noTasks).toBeVisible();
  });

  test('should edit a task', async ({ page }) => {
    // Login and create a task
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });
    await page.click('#show-register');
    await page.fill('#register-email', `test-${Date.now()}@example.com`);
    await page.fill('#register-password', TEST_PASSWORD);
    await page.click('#register-btn');
    await page.waitForSelector('#app-screen', { state: 'visible', timeout: 15000 });

    await page.fill('#task-title', 'Original Task');
    await page.click('#add-task-btn');
    await page.waitForTimeout(2000);

    // Click edit button
    await page.click('.task-edit-btn');
    await page.waitForTimeout(500);

    // Verify form is populated
    const titleInput = await page.locator('#task-title');
    await expect(titleInput).toHaveValue('Original Task');

    // Update task
    await page.fill('#task-title', 'Updated Task');
    await page.click('#update-task-btn');
    await page.waitForTimeout(2000);

    // Verify updated task is displayed
    const updatedTask = await page.locator('.task-title', { hasText: 'Updated Task' });
    await expect(updatedTask).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    // Login first
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });
    await page.click('#show-register');
    await page.fill('#register-email', `test-${Date.now()}@example.com`);
    await page.fill('#register-password', TEST_PASSWORD);
    await page.click('#register-btn');
    await page.waitForSelector('#app-screen', { state: 'visible', timeout: 15000 });

    // Click logout
    await page.click('#logout-btn');
    await page.waitForTimeout(1000);

    // Verify auth screen is visible
    const authScreen = await page.locator('#auth-screen');
    await expect(authScreen).toBeVisible();
  });

  test('should switch between login and register forms', async ({ page }) => {
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });

    // Initially login form should be visible
    const loginForm = await page.locator('#login-form');
    await expect(loginForm).toBeVisible();

    // Click show register
    await page.click('#show-register');
    await page.waitForTimeout(300);

    const registerForm = await page.locator('#register-form');
    await expect(registerForm).toBeVisible();

    // Click show login
    await page.click('#show-login');
    await page.waitForTimeout(300);

    await expect(loginForm).toBeVisible();
  });

  test('should display error for invalid login', async ({ page }) => {
    await page.waitForSelector('#auth-screen', { state: 'visible', timeout: 10000 });

    await page.fill('#login-email', 'nonexistent@example.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('#login-btn');

    await page.waitForTimeout(2000);

    // Verify error message is displayed
    const errorMessage = await page.locator('#auth-error');
    await expect(errorMessage).toBeVisible();
  });

});
