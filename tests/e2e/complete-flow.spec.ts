import { test, expect } from '@playwright/test';
import { generateUserData } from '../../helpers/testData';
import { ProductPage } from '../../pages/ProductPage';

test('Complete E2E Flow', async ({ page }) => {
  const productPage = new ProductPage(page);
  const continueToCheckout = async (): Promise<void> => {
    const proceedCheckoutBtn = page.locator('#proceedCheckoutBtn');

    try {
      await Promise.race([
        page.waitForURL('**/check-out', { timeout: 8000 }),
        proceedCheckoutBtn.waitFor({ state: 'visible', timeout: 8000 }),
      ]);
    } catch {
      // Continue with explicit checks below for deterministic fallback.
    }

    if ((await page.url()).includes('/check-out')) {
      return;
    }

    if (await proceedCheckoutBtn.isVisible().catch(() => false)) {
      await proceedCheckoutBtn.click();
    }

    await page.waitForURL('**/check-out');
  };

  // Generate ONE user — reuse across entire test
  const user = generateUserData();
  console.log('Test user email:', user.email);

  // ═══════════════════════════════════════
  // 1. OPEN WEBSITE
  // ═══════════════════════════════════════
  await page.goto('https://realspicestepps.com/');
  await page.waitForTimeout(1000);

  // ═══════════════════════════════════════
  // 2. SIGN UP
  // ═══════════════════════════════════════

  // Open sidebar
  await page.locator('#sidebarBtn').click();
  await page.waitForTimeout(800);

  // Click Sign Up link inside sidebar menu only (not homepage banner)
  await page.locator('#sidebarMenu')
    // `name: 'Sign Up'` matches both "Sign Up" and "Sign up to get started" (strict mode),
    // so we require an exact accessible name match.
    .getByRole('link', { name: 'Sign Up', exact: true })
    .first()
    .click();
  
  // Wait for page navigation to complete fully
  await page.waitForLoadState('networkidle');
  await page.waitForURL('**/customer-register');
  await page.waitForTimeout(1500);

  // Verify sign up form is visible before filling
  const registerForm = page.locator('form[action*="/register"]').last();
  await registerForm.waitFor({ state: 'visible', timeout: 10000 });

  // Fill Full name
  await registerForm.getByPlaceholder('Enter name')
    .fill(`${user.firstName} ${user.lastName}`);
  await page.waitForTimeout(300);

  // Fill Phone number
  await registerForm.getByPlaceholder('Enter number')
    .fill(user.phone);
  await page.waitForTimeout(300);

  // Fill Email — format: test.user1234@gmail.com
  await registerForm.getByPlaceholder('Enter email')
    .fill(user.email);
  await page.waitForTimeout(300);

  // Fill Password
  const passwordByLabel = registerForm.getByLabel('Password');
  if ((await passwordByLabel.count()) > 0) {
    await passwordByLabel.first().fill(user.password);
  } else {
    await registerForm.locator('#password, #reg_password').first().fill(user.password);
  }
  await page.waitForTimeout(300);

  // Fill Confirm Password
  const confirmPasswordByLabel = registerForm.getByLabel('Confirm Password');
  if ((await confirmPasswordByLabel.count()) > 0) {
    await confirmPasswordByLabel.first().fill(user.password);
  } else {
    await registerForm
      .locator('#password_confirmation, #reg_password_confirmation')
      .first()
      .fill(user.password);
  }
  await page.waitForTimeout(300);

  // Accept terms
  await registerForm.locator('input[name="agree"]').check();
  await page.waitForTimeout(300);

  // Click Sign Up submit button
  await registerForm.getByRole('button', { name: 'Sign Up' }).first().click();
  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  await page.waitForTimeout(1000);
  console.log('Sign Up done ✅');

  // ═══════════════════════════════════════
  // 3. LOGOUT
  // ═══════════════════════════════════════

  // Open sidebar
  await page.locator('#sidebarBtn').click();
  await page.waitForTimeout(800);

  // Click Logout explicitly (avoid clicking app-store/footer links)
  await page.locator('#sidebarMenu').getByText('Logout', { exact: true }).click();
  await page.waitForTimeout(800);

  // Click Yes on logout confirmation dialog
  await page.waitForSelector('#rt-logout-yes-btn', { state: 'visible' });
  await page.locator('#rt-logout-yes-btn').click();
  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  await page.waitForTimeout(1000);
  console.log('Logout done ✅');

  // ═══════════════════════════════════════
  // 4. FORGOT PASSWORD
  // ═══════════════════════════════════════

  // Open sidebar
  await page.locator('#sidebarBtn').click();
  await page.waitForTimeout(800);

  // Click Sign In
  await page.locator(
    'a[href="https://realspicestepps.com/customer-login"]'
  ).first().click();
  await page.waitForURL('**/customer-login');
  await page.waitForTimeout(800);

  // Click Forgot Password link
  await page.locator(
    'a[href="https://realspicestepps.com/password/reset"]:visible'
  )
    .first()
    .click();
  await page.waitForTimeout(800);

  // Enter same email used at sign up
  await page.locator(
    'input[type="email"][placeholder="Enter email"]:visible'
  ).fill(user.email);
  await page.waitForTimeout(400);

  // Click Send Password Reset Link
  await page.locator('button[type="submit"]:visible')
    .filter({ hasText: 'Send Password Reset Link' })
    .first()
    .click();
  await page.waitForTimeout(1000);
  console.log('Forgot Password done ✅');

  // ═══════════════════════════════════════
  // 5. SIGN IN (same user)
  // ═══════════════════════════════════════

  // Open sidebar
  await page.locator('#sidebarBtn').click();
  await page.waitForSelector('#sidebarMenu:not(.hidden)', { state: 'visible' });

  // Click Sign In
  await page.locator(
    'a[href="https://realspicestepps.com/customer-login"]'
  ).first().click();
  await page.waitForURL('**/customer-login');
  await page.waitForSelector('input[type="email"][placeholder="Enter email"]:visible', { timeout: 15000 });

  // Fill email — same as sign up
  await page.waitForSelector('input[type="email"][placeholder="Enter email"]:visible', { timeout: 15000 });
  await page.locator('input[type="email"][placeholder="Enter email"]:visible').first().fill(user.email);
  await page.waitForTimeout(300);

  // Fill password — same as sign up
  await page.locator('input[placeholder="Enter password"]:visible').first().fill(user.password);
  await page.waitForTimeout(300);

  // Check Remember Me
  await page.locator(
    'input[type="checkbox"][name="remember"]'
  ).click();
  await page.waitForTimeout(300);

  // Click Sign In button
  await page.locator('button[type="submit"]:visible')
    .filter({ hasText: 'Sign In' })
    .first()
    .click();
  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  await page.waitForTimeout(1000);
  console.log('Sign In done ✅');

  // ═══════════════════════════════════════
  // 6. PICKUP ORDER
  // ═══════════════════════════════════════

  // Open first product and satisfy modifier requirements with shared page object logic
  await productPage.openFirstProduct();
  await productPage.selectFirstAvailableOptionInEachModifierGroup();
  await productPage.addToCart();
  await page.waitForTimeout(800);

  // Wait for cart drawer
  await page.waitForSelector('#goCheckoutBtn', { state: 'visible' });
  await page.waitForTimeout(800);

  // Click Go to Checkout
  await page.locator('#goCheckoutBtn').click();
  await page.waitForTimeout(800);

  // Continue to checkout from auth/cart transition
  await continueToCheckout();
  await page.waitForTimeout(800);

  // Select Pickup
  await page.waitForSelector('#btnPickup', { state: 'visible' });
  await page.locator('#btnPickup').click();
  await page.waitForTimeout(600);

  // Scroll down
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);

  // Special instructions
  await page.locator(
    'textarea[placeholder="Enter any special instructions"]'
  ).fill('Please make it extra spicy');
  await page.waitForTimeout(400);

  // Click Cash Payment tile
  await page.locator('.db-pay-tile')
    .filter({ hasText: 'Cash Payment' })
    .click();
  await page.waitForTimeout(600);

  // Click Continue to Payment
  await page.waitForSelector('#btnPlaceOrder', { state: 'visible' });
  await page.locator('#btnPlaceOrder').click();
  await page.waitForTimeout(800);

  // Click Proceed Now
  await page.waitForSelector('#proceedPaymentBtn', { state: 'visible' });
  await page.locator('#proceedPaymentBtn').click();
  await page.waitForTimeout(1000);

  // Click OK on success dialog
  await page.waitForSelector(
    'button.swal2-confirm.custom-ok-button',
    { state: 'visible' }
  );
  await page.locator('button.swal2-confirm.custom-ok-button').click();
  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  await page.waitForTimeout(1000);
  console.log('Pickup Order done ✅');

  // ═══════════════════════════════════════
  // 7. DELIVERY ORDER (same user — no login)
  // ═══════════════════════════════════════

  // Open first product and satisfy modifier requirements
  await productPage.openFirstProduct();
  await productPage.selectFirstAvailableOptionInEachModifierGroup();
  await productPage.addToCart();
  await page.waitForTimeout(800);

  // Wait for cart drawer
  await page.waitForSelector('#goCheckoutBtn', { state: 'visible' });
  await page.waitForTimeout(800);

  // Click Go to Checkout
  await page.locator('#goCheckoutBtn').click();
  await page.waitForTimeout(800);

  // Continue to checkout from auth/cart transition
  await continueToCheckout();
  await page.waitForTimeout(800);

  // Delivery is selected by default — no click needed

  // Click Add New Address
  await page.waitForSelector('#addAddressLink', { state: 'visible' });
  await page.locator('#addAddressLink').click();
  await page.waitForTimeout(600);

  // Enter postcode
  await page.waitForSelector('#addrPostcode', { state: 'visible' });
  await page.locator('#addrPostcode').fill('G33 6EP');
  await page.waitForTimeout(400);

  // Click Search
  await page.locator('#btnPostcodeSearch').click();
  await page.waitForTimeout(1200);

  // Enter building/street
  await page.waitForSelector('#addrBuilding', { state: 'visible' });
  await page.locator('#addrBuilding').fill('12 Cumbernauld Road');
  await page.waitForTimeout(400);

  // Click Add Address
  await page.waitForSelector('#btnAddAddress', { state: 'visible' });
  await page.locator('#btnAddAddress').click();
  await page.waitForTimeout(1000);

  // Select saved address tile
  await page.locator('.rounded-lg.border.border-gray-200')
    .filter({ hasText: 'G33 6EP' })
    .first().click();
  await page.waitForTimeout(600);

  // Scroll down
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);

  // Click Cash Payment tile
  await page.locator('.db-pay-tile')
    .filter({ hasText: 'Cash Payment' })
    .click();
  await page.waitForTimeout(600);

  // Click Continue to Payment
  await page.waitForSelector('#btnPlaceOrder', { state: 'visible' });
  await page.locator('#btnPlaceOrder').click();
  await page.waitForTimeout(800);

  // Click Proceed Now
  await page.waitForSelector('#proceedPaymentBtn', { state: 'visible' });
  await page.locator('#proceedPaymentBtn').click();
  await page.waitForTimeout(1000);

  // Click OK on success dialog
  await page.waitForSelector(
    'button.swal2-confirm.custom-ok-button',
    { state: 'visible' }
  );
  await page.locator('button.swal2-confirm.custom-ok-button').click();
  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  await page.waitForTimeout(1000);
  console.log('Delivery Order done ✅');
  console.log('COMPLETE E2E FLOW PASSED 🎉');
});
