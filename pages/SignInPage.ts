import { expect, type Locator, type Page } from '@playwright/test';

export class SignInPage {
  private readonly page: Page;

  // Sidebar toggle button with aria-label Open sidebar.
  private readonly sidebarToggleButton: Locator;

  // Sign In anchor link in sidebar menu.
  private readonly sidebarSignInLink: Locator;

  // Email input field on sign in page.
  private readonly emailInput: Locator;

  // Password input field on sign in page.
  private readonly passwordInput: Locator;

  // Remember me checkbox on sign in page.
  private readonly rememberMeCheckbox: Locator;

  // Sign In submit button to complete login.
  private readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar toggle button with aria-label Open sidebar.
    this.sidebarToggleButton = page.locator('#sidebarBtn');

    // Sign In anchor link in sidebar menu.
    this.sidebarSignInLink = page
      .locator('a[href="https://realspicestepps.com/customer-login"]')
      .first();

    // Email input field on sign in page.
    this.emailInput = page.locator('input[type="email"][placeholder="Enter email"]:visible').first();

    // Password input field on sign in page.
    this.passwordInput = page.locator('input[placeholder="Enter password"]:visible').first();

    // Remember me checkbox on sign in page.
    this.rememberMeCheckbox = page
      .locator('input[type="checkbox"][name="remember"]:visible')
      .first();

    // Sign In submit button to complete login.
    this.signInButton = page
      .locator('button[type="submit"]:visible')
      .filter({ hasText: 'Sign In' })
      .first();
  }

  async openSignIn(): Promise<void> {
    await this.page.waitForSelector('#sidebarBtn');
    const sidebarMenu = this.page.locator('#sidebarMenu');
    if (!(await sidebarMenu.isVisible())) {
      await this.sidebarToggleButton.click();
    }
    await this.page.waitForSelector('#sidebarMenu:not(.hidden)');
    await this.sidebarSignInLink.first().click();
    await this.page.waitForURL('**/customer-login');
    await this.page.waitForSelector('input[type="email"][placeholder="Enter email"]:visible');
  }

  async fillEmail(email: string): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);
  }

  async enableRememberMe(): Promise<void> {
    await expect(this.rememberMeCheckbox).toBeVisible();
    await this.rememberMeCheckbox.check();
  }

  async submit(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
    await this.signInButton.click();
    await this.page.waitForURL('**/');
  }

  async assertUserLoggedInAfterSignIn(): Promise<void> {
    await expect(this.page).toHaveURL(/^(?!.*customer-login).*$/);
  }
}
