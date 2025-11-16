import { test, expect } from '@playwright/test'

test('post, reply and like flow', async ({ page }) => {
  await page.goto('/forum')

  // Post a new message
  const unique = `E2E test ${Date.now()}`
  await page.fill('textarea[placeholder^="What"]', unique)
  await page.click('button:has-text("Post Message")')

  // Wait for the new message to appear
  await expect(page.locator('p', { hasText: unique })).toBeVisible({ timeout: 5000 })

  // Reply to the message
  const messageCard = page.locator('div.card-holiday').filter({ hasText: unique }).first()
  await messageCard.locator('button:has-text("Reply")').click()
  const replyText = `${unique} reply`
  await messageCard.locator('textarea[placeholder^="Reply to"]').fill(replyText)
  await messageCard.locator('button:has-text("Send Reply")').click()

  // Wait for reply text to appear (it will be appended as message text)
  await expect(page.locator('p', { hasText: replyText })).toBeVisible({ timeout: 5000 })

  // Like the original message
  await messageCard.locator('button:has-text("Like")').click()
  await expect(messageCard.locator('button', { hasText: '💚 Liked' })).toBeVisible()
})
