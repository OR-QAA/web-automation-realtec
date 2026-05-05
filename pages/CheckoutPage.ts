import { type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  private readonly page: Page;

  // Pickup toggle button on checkout order details
  readonly pickupBtn: Locator;

  // Special instructions textarea for the store
  readonly specialInstructions: Locator;

  // Cash payment selection tile
  readonly cashPaymentTile: Locator;

  // Radio button inside cash payment tile
  readonly cashPaymentRadio: Locator;

  // Continue to payment submit button
  readonly continueToPaymentBtn: Locator;

  // Proceed Now button in payment confirmation dialog
  readonly proceedNowBtn: Locator;

  // OK button on order success SweetAlert dialog
  readonly orderSuccessOkBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    // Pickup toggle button on checkout order details
    this.pickupBtn = this.page.locator('#btnPickup');

    // Special instructions textarea for the store
    this.specialInstructions = this.page.locator('textarea[placeholder="Enter any special instructions"]');

    // Cash payment selection tile
    this.cashPaymentTile = this.page.locator('.db-pay-tile').filter({ hasText: 'Cash Payment' });

    // Radio button inside cash payment tile
    this.cashPaymentRadio = this.page
      .locator('.db-pay-tile')
      .filter({ hasText: 'Cash Payment' })
      .locator('span.h-2\\.5.w-2\\.5.rounded-full.bg-sky-600');

    // Continue to payment submit button
    this.continueToPaymentBtn = this.page.locator('#btnPlaceOrder');

    // Proceed Now button in payment confirmation dialog
    this.proceedNowBtn = this.page.locator('#proceedPaymentBtn');

    // OK button on order success SweetAlert dialog
    this.orderSuccessOkBtn = this.page.locator('button.swal2-confirm.custom-ok-button');
  }

  async selectPickup(): Promise<void> {
    await this.pickupBtn.click();
    await this.page.waitForTimeout(600);
  }

  async scrollToPaymentSection(): Promise<void> {
    await this.page.evaluate(() => window.scrollBy(0, 500));
    await this.page.waitForTimeout(500);
  }

  async fillSpecialInstructions(text: string): Promise<void> {
    await this.specialInstructions.fill(text);
  }

  async selectCashPayment(): Promise<void> {
    await this.cashPaymentTile.click();
    await this.cashPaymentRadio.click();
    await this.page.waitForTimeout(600);
  }

  async clickContinueToPayment(): Promise<void> {
    await this.continueToPaymentBtn.click();
    await this.page.waitForTimeout(800);
  }

  async clickProceedNowFromDialog(): Promise<void> {
    await this.page.waitForSelector('#proceedPaymentBtn', { state: 'visible' });
    await this.proceedNowBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async clickOrderSuccessOk(): Promise<void> {
    await this.page.waitForSelector('button.swal2-confirm.custom-ok-button', { state: 'visible' });
    await this.orderSuccessOkBtn.click();
    await this.page.waitForTimeout(800);
  }
}
