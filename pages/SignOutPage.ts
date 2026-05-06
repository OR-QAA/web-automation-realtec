import { expect, type Locator, type Page } from '@playwright/test';

export class SignOutPage {
  private readonly page: Page;

  // Sidebar toggle button with aria-label Open sidebar.
  private readonly sidebarToggleButton: Locator;

  // Logout button as the last item in the sidebar menu.
  private readonly logoutButton: Locator;

  // Yes button inside logout confirmation dialog.
  private readonly logoutConfirmYesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar toggle button with aria-label Open sidebar.
    this.sidebarToggleButton = page.getByRole('button', { name: 'Open sidebar' });

    // Logout button as the last item in the sidebar menu.
    this.logoutButton = page.locator('#sidebarMenu button[data-rt="logout"]').last();

    // Yes button inside logout confirmation dialog.
    this.logoutConfirmYesButton = page.locator('#rt-logout-yes-btn');
  }

  async openSidebar(): Promise<void> {
    await this.page.waitForSelector('#sidebarBtn');
    const sidebarMenu = this.page.locator('#sidebarMenu');
    if (!(await sidebarMenu.isVisible())) {
      await this.sidebarToggleButton.click();
    }
    await this.page.waitForSelector('#sidebarMenu:not(.hidden)');
  }

  async logout(): Promise<void> {
    await this.openSidebar();
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
    await this.page.waitForSelector('#rt-logout-yes-btn');
    await this.logoutConfirmYesButton.click();
    await this.page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  }
}
