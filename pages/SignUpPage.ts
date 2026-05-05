import { expect, type Locator, type Page } from '@playwright/test';

export class SignUpPage {
  private readonly page: Page;

  // Store the page URL in one place.
  private readonly url = 'https://realspicestepps.com/';

  // Sidebar menu container to scope auth navigation actions.
  private readonly sidebarMenu: Locator;

  // Sidebar open button in top header.
  private readonly sidebarOpenButton: Locator;

  // Sidebar Sign Up entry for register page navigation.
  private readonly sidebarSignUpLink: Locator;

  // Register form container to avoid hidden auth field collisions.
  private readonly registerForm: Locator;

  // Full name input in Sign Up form.
  private readonly fullNameInput: Locator;

  // Phone number input in Sign Up form.
  private readonly phoneInput: Locator;

  // Email input in Sign Up form.
  private readonly emailInput: Locator;

  // Password input in Sign Up form.
  private readonly passwordInputByLabel: Locator;

  // Confirm Password input in Sign Up form.
  private readonly confirmPasswordInputByLabel: Locator;

  // Terms acceptance checkbox in Sign Up form.
  private readonly termsCheckbox: Locator;

  // Submit Sign Up button in Sign Up modal.
  private readonly submitSignUpButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar menu container to scope auth navigation actions.
    this.sidebarMenu = page.locator('#sidebarMenu');

    // Sidebar open button in top header.
    this.sidebarOpenButton = page.getByRole('button', { name: 'Open sidebar' });

    // Sidebar Sign Up entry for register page navigation.
    this.sidebarSignUpLink = this.sidebarMenu.getByRole('link', { name: 'Sign Up' });

    // Register form container to avoid hidden auth field collisions.
    this.registerForm = page.locator('form[action*="/register"]').last();

    // Full name input in Sign Up form.
    this.fullNameInput = this.registerForm.getByPlaceholder('Enter name');

    // Phone number input in Sign Up form.
    this.phoneInput = this.registerForm.getByPlaceholder('Enter number');

    // Email input in Sign Up form.
    this.emailInput = this.registerForm.getByPlaceholder('Enter email');

    // Password input in Sign Up form (primary locator rule).
    this.passwordInputByLabel = this.registerForm.getByLabel('Password');

    // Confirm Password input in Sign Up form (primary locator rule).
    this.confirmPasswordInputByLabel = this.registerForm.getByLabel('Confirm Password');

    // Terms acceptance checkbox in Sign Up form.
    this.termsCheckbox = this.registerForm.locator('input[name="agree"]');

    // Submit Sign Up button in Sign Up modal.
    this.submitSignUpButton = this.registerForm.getByRole('button', { name: 'Sign Up' }).first();
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('body');
  }

  async openSignUp(): Promise<void> {
    await this.page.waitForSelector('#sidebarBtn');
    await this.sidebarOpenButton.click();
    await this.page.waitForSelector('#sidebarMenu:not(.hidden)');
    await this.sidebarSignUpLink.first().click();
    await this.page.waitForURL('**/customer-register');
    await expect(this.fullNameInput).toBeVisible();
  }

  async fillName(name: string): Promise<void> {
    await expect(this.fullNameInput).toBeVisible();
    await this.fullNameInput.fill(name);
  }

  async fillPhone(phone: string): Promise<void> {
    await expect(this.phoneInput).toBeVisible();
    await this.phoneInput.fill(phone);
  }

  async fillEmail(email: string): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await expect(this.registerForm).toBeVisible();
    if ((await this.passwordInputByLabel.count()) > 0) {
      await this.passwordInputByLabel.first().fill(password);
      return;
    }
    // CSS fallback only when label association is not present.
    await this.registerForm.locator('#password, #reg_password').first().fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await expect(this.registerForm).toBeVisible();
    if ((await this.confirmPasswordInputByLabel.count()) > 0) {
      await this.confirmPasswordInputByLabel.first().fill(password);
      return;
    }
    // CSS fallback only when label association is not present.
    await this.registerForm
      .locator('#password_confirmation, #reg_password_confirmation')
      .first()
      .fill(password);
  }

  async acceptTerms(): Promise<void> {
    await expect(this.termsCheckbox).toBeVisible();
    await this.termsCheckbox.check();
  }

  async submit(): Promise<void> {
    await expect(this.submitSignUpButton).toBeVisible();
    await this.submitSignUpButton.click();
  }

  async assertUserLoggedInAfterSignup(): Promise<void> {
    await this.page.waitForSelector('#sidebarBtn');
    await this.sidebarOpenButton.click();
    await this.page.waitForSelector('#sidebarMenu:not(.hidden)');

    // Guest auth links should not be visible for a logged-in user.
    await expect(this.sidebarMenu.getByRole('link', { name: 'Sign In' })).toHaveCount(0);
    await expect(this.sidebarMenu.getByRole('link', { name: 'Sign Up' })).toHaveCount(0);
  }
}
