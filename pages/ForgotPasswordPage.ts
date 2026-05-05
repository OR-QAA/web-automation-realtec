import { expect, type Locator, type Page } from '@playwright/test';

export class ForgotPasswordPage {
  private readonly page: Page;

  // Forgot Password link on sign in page.
  private readonly forgotPasswordLink: Locator;

  // Email input field on forgot password page.
  private readonly emailInput: Locator;

  // Submit button to send password reset link.
  private readonly sendResetLinkButton: Locator;

  // Confirmation message shown after reset link is sent.
  private readonly resetConfirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Forgot Password link on sign in page.
    this.forgotPasswordLink = page
      .locator('a[href="https://realspicestepps.com/password/reset"]:visible')
      .first();

    // Email input field on forgot password page.
    this.emailInput = page.locator('input[type="email"][placeholder="Enter email"]:visible').first();

    // Submit button to send password reset link.
    this.sendResetLinkButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: 'Send Password Reset Link' })
      .first();

    // Confirmation message shown after reset link is sent.
    this.resetConfirmationMessage = page.locator(
      'text=/password reset link|reset link sent|we have emailed/i',
    );
  }

  async openFromSignIn(): Promise<void> {
    await expect(this.forgotPasswordLink).toBeVisible();
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('**/password/reset');
    await this.page.waitForSelector('input[type="email"][placeholder="Enter email"]:visible');
  }

  async fillEmail(email: string): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(email);
  }

  async sendResetLink(): Promise<void> {
    await expect(this.sendResetLinkButton).toBeVisible();
    await this.sendResetLinkButton.click();
  }

  async assertResetLinkSent(): Promise<void> {
    await expect(this.resetConfirmationMessage.first()).toBeVisible();
  }
}
