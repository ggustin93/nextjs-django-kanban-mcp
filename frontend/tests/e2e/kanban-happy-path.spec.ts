/**
 * Kanban Board E2E Happy Path Test
 * =================================
 *
 * Critical user journey: View board → Create task → Verify creation
 *
 * Best Practices Applied:
 *   - Web-first assertions (toBeVisible over isVisible)
 *   - Role-based locators (getByRole, getByLabel)
 *   - Test isolation (each test independent)
 *   - Real backend integration (true E2E)
 */

import { test, expect } from '@playwright/test';

test.describe('Kanban Board - Happy Path', () => {
  test('user can view board and create a task', async ({ page }) => {
    // 1. Navigate to Kanban board (root route)
    await page.goto('/');

    // 2. Verify board loads with title
    await expect(page.getByRole('heading', { name: 'Kanban Board' })).toBeVisible();

    // 3. Verify all 4 column headers are visible (using heading role)
    await expect(page.getByRole('heading', { name: 'To Do' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Doing' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Waiting' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Done' })).toBeVisible();

    // 4. Open create task dialog
    await page.getByRole('button', { name: /add task/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // 5. Fill in task details
    const taskTitle = `E2E Test Task ${Date.now()}`;
    await page.getByLabel(/title/i).fill(taskTitle);

    // 6. Submit the form
    await page.getByRole('button', { name: /create/i }).click();

    // 7. Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 8. Verify new task appears on the board
    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});
