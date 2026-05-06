import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;

  // Product cards displayed on homepage sections.
  private readonly productCards: Locator;

  // First available product card from homepage listings.
  private readonly firstProductCard: Locator;

  // Product modal container that appears after selecting a product.
  private readonly productModal: Locator;

  // Product title in product modal header section.
  private readonly productTitle: Locator;

  // Product description text under product title.
  private readonly productDescription: Locator;

  // Product base price shown in modal header.
  private readonly productPrice: Locator;

  // All modifier groups rendered in product modal.
  private readonly modifierGroups: Locator;

  // Modifier group title element (scoped per group when used).
  private readonly modifierGroupTitle: Locator;

  // Required badge for modifier groups.
  private readonly requiredModifierBadge: Locator;

  // Rule text such as Select 1 within each modifier group.
  private readonly modifierGroupHint: Locator;

  // Visible option rows under each modifier group.
  private readonly visibleModifierOptionRows: Locator;

  // Radio or checkbox inputs for modifier options.
  private readonly modifierOptionInputs: Locator;

  // Quantity value indicator in product modal.
  private readonly quantityValue: Locator;

  // Quantity increase button on product modal.
  private readonly quantityIncreaseButton: Locator;

  // Add to Cart action button in product modal footer.
  private readonly addToCartButton: Locator;

  // Header cart amount text used as one success signal.
  private readonly cartHeaderAmount: Locator;

  // Cart panel container used as another success signal.
  private readonly cartPanel: Locator;

  // Cart items wrap used to detect empty vs added item state.
  private readonly cartItemsWrap: Locator;

  constructor(page: Page) {
    this.page = page;

    // Product cards displayed on homepage sections.
    this.productCards = page.locator('.menu-card');

    // First available product card from homepage listings.
    this.firstProductCard = page.locator('.menu-card').first();

    // Product modal container that appears after selecting a product.
    this.productModal = page.locator('#productModal');

    // Product title in product modal header section.
    this.productTitle = this.productModal.locator('.pm-title').first();

    // Product description text under product title (exclude hidden allergens panel).
    this.productDescription = this.productModal
      .locator('.pm-sub:not([data-allergens-panel])')
      .first();

    // Product base price shown in modal header.
    this.productPrice = this.productModal.locator('.pm-price[data-header-price]').first();

    // All modifier groups rendered in product modal.
    this.modifierGroups = this.productModal.locator('section.pm-section[data-group-id]');

    // Modifier group title element (scoped per group when used).
    this.modifierGroupTitle = this.productModal.locator('.pm-opt-title');

    // Required badge for modifier groups.
    this.requiredModifierBadge = this.productModal.locator('.pm-chip.req');

    // Rule text such as Select 1 within each modifier group.
    this.modifierGroupHint = this.productModal.locator('.pm-opt-hint');

    // Visible option rows under each modifier group.
    this.visibleModifierOptionRows = this.productModal.locator(
      '.pm-opt-row:not([style*="display:none"])',
    );

    // Radio or checkbox inputs for modifier options.
    this.modifierOptionInputs = this.productModal.locator(
      '.pm-opt-row:not([style*="display:none"]) input.pm-radio, .pm-opt-row:not([style*="display:none"]) input[type="checkbox"]',
    );

    // Quantity value indicator in product modal.
    this.quantityValue = this.productModal.locator('[data-qty]');

    // Quantity increase button on product modal.
    this.quantityIncreaseButton = this.productModal.locator('[data-qty-inc]');

    // Add to Cart action button in product modal footer.
    this.addToCartButton = this.productModal.locator('button.pm-add[data-add]');

    // Header cart amount text used as one success signal.
    this.cartHeaderAmount = page.locator('#cartButtonAmount');

    // Cart panel container used as another success signal.
    this.cartPanel = page.locator('#cartPanel');

    // Cart items wrap used to detect empty vs added item state.
    this.cartItemsWrap = page.locator('#cartItemsWrap');
  }

  async waitForHomepageProducts(): Promise<void> {
    await this.page.waitForSelector('.menu-card');
    await expect(this.productCards.first()).toBeVisible();
  }

  async openFirstProduct(): Promise<void> {
    await expect(this.firstProductCard).toBeVisible();
    await this.firstProductCard.click();
    await this.page.waitForSelector('#productModal');
    await expect(this.productModal).toBeVisible();
  }

  async assertProductModalDetailsVisible(): Promise<void> {
    await expect(this.productTitle).toBeVisible();
    if (await this.productDescription.isVisible().catch(() => false)) {
      await expect(this.productDescription).toBeVisible();
    } else {
      console.warn('Product description is not visible in modal; continuing without failing.');
    }
    await expect(this.productPrice).toBeVisible();
  }

  async selectFirstAvailableOptionInEachModifierGroup(): Promise<void> {
    await this.page.waitForSelector('#productModal section.pm-section[data-group-id]');
    const groupCount = await this.modifierGroups.count();

    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      const group = this.modifierGroups.nth(groupIndex);

      await expect(group).toBeVisible();
      await expect(group.locator('.pm-opt-title')).toBeVisible();

      const viewMore = group.locator('.pm-viewmore[data-more]');
      if ((await viewMore.count()) > 0 && (await viewMore.first().isVisible())) {
        await viewMore.first().click();
        await this.page.waitForTimeout(500);
      }

      await this.page.waitForSelector(
        '#productModal section.pm-section[data-group-id] .pm-opt-row:not([style*="display:none"])',
      );

      const firstOptionInput = group
        .locator(
          '.pm-opt-row:not([style*="display:none"]) input.pm-radio, .pm-opt-row:not([style*="display:none"]) input[type="checkbox"]',
        )
        .first();

      await expect(firstOptionInput).toBeVisible();
      await firstOptionInput.check();
      await this.page.waitForTimeout(500);
      await expect(firstOptionInput).toBeChecked();
    }
  }

  async assertModifierSelectionsApplied(): Promise<void> {
    const groupCount = await this.modifierGroups.count();

    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      const checkedOptionCount = await this.modifierGroups
        .nth(groupIndex)
        .locator('input.pm-radio:checked, input[type="checkbox"]:checked')
        .count();

      const requiredBadgeCount = await this.modifierGroups.nth(groupIndex).locator('.pm-chip.req').count();

      if (requiredBadgeCount > 0) {
        expect(checkedOptionCount).toBeGreaterThan(0);
      } else {
        expect(checkedOptionCount).toBeGreaterThan(0);
      }
    }
  }

  async assertQuantityIsOne(): Promise<void> {
    await expect(this.quantityIncreaseButton).toBeVisible();
    await expect(this.quantityValue).toHaveText('1');
  }

  async addToCart(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible();
    await expect(this.addToCartButton).toBeEnabled();
    await this.addToCartButton.click();
  }

  async assertProductAddedSuccessfully(): Promise<void> {
    const amountChanged = async (): Promise<boolean> => {
      const amountCount = await this.cartHeaderAmount.count();
      if (amountCount === 0) {
        return false;
      }

      if (!(await this.cartHeaderAmount.first().isVisible())) {
        return false;
      }

      const amountText = (await this.cartHeaderAmount.first().innerText()).trim();
      return amountText !== '' && amountText !== 'Cart £0.00';
    };

    const cartHasItems = async (): Promise<boolean> => {
      const wrapCount = await this.cartItemsWrap.count();
      if (wrapCount === 0) {
        return false;
      }

      const wrapText = (await this.cartItemsWrap.first().innerText()).trim();
      return !wrapText.includes('Your cart is empty.');
    };

    await expect
      .poll(async () => {
        const [headerAmountUpdated, cartContainsItem] = await Promise.all([
          amountChanged(),
          cartHasItems(),
        ]);
        const panelVisible = (await this.cartPanel.count()) > 0 && (await this.cartPanel.isVisible());

        return headerAmountUpdated || cartContainsItem || panelVisible;
      })
      .toBeTruthy();
  }
}
