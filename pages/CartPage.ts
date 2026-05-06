import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  private readonly page: Page;

  // Go to checkout button inside cart drawer
  readonly goToCheckoutBtn: Locator;

  // Proceed to checkout button in auth dialog
  readonly proceedCheckoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    // Go to checkout button inside cart drawer
    this.goToCheckoutBtn = this.page.locator('#goCheckoutBtn');

    // Proceed to checkout button in auth dialog
    this.proceedCheckoutBtn = this.page.locator('#proceedCheckoutBtn');
  }

  async clickGoToCheckout(): Promise<void> {
    await this.goToCheckoutBtn.waitFor({ state: 'visible' });
    await expect(this.goToCheckoutBtn).toHaveAttribute('aria-disabled', 'false');
    await this.goToCheckoutBtn.click();
  }

  async clickProceedToCheckoutFromDialog(): Promise<void> {
    // If user is already authenticated, the modal button can stay hidden while
    // navigation proceeds directly to checkout.
    if (await this.proceedCheckoutBtn.isVisible().catch(() => false)) {
      await this.proceedCheckoutBtn.click();
    }
    await this.page.waitForURL('**/check-out');
  }
}
