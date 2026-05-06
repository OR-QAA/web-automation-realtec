import { test, expect } from '@playwright/test';
import { generateUserData } from '../../helpers/testData';

test('Complete E2E Flow', async ({ page }) => {

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
  await page.waitForURL('https://realspicestepps.com/');
  await page.waitForTimeout(1000);
  console.log('Sign Up done ✅');

  // ═══════════════════════════════════════
  // 3. LOGOUT
  // ═══════════════════════════════════════

  // Open sidebar
  await page.locator('#sidebarBtn').click();
  await page.waitForTimeout(800);

  // Click last item in sidebar = Logout
  const sidebarLinks = page.locator('#sidebarMenu a, #sidebarMenu button');
  const count = await sidebarLinks.count();
  await sidebarLinks.nth(count - 1).click();
  await page.waitForTimeout(800);

  // Click Yes on logout confirmation dialog
  await page.waitForSelector('#rt-logout-yes-btn', { state: 'visible' });
  await page.locator('#rt-logout-yes-btn').click();
  await page.waitForURL('https://realspicestepps.com/');
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
    'a[href="https://realspicestepps.com/password/reset"]'
  ).click();
  await page.waitForTimeout(800);

  // Enter same email used at sign up
  await page.locator(
    'input[type="email"][placeholder="Enter email"]'
  ).fill(user.email);
  await page.waitForTimeout(400);

  // Click Send Password Reset Link
  await page.locator('button[type="submit"]')
    .filter({ hasText: 'Send Password Reset Link' })
    .click();
  await page.waitForTimeout(1000);
  console.log('Forgot Password done ✅');

  // ═══════════════════════════════════════
  // 5. SIGN IN (same user)
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

  // Fill email — same as sign up
  await page.locator(
    'input[type="email"][placeholder="Enter email"]'
  ).fill(user.email);
  await page.waitForTimeout(300);

  // Fill password — same as sign up
  await page.locator(
    'input[placeholder="Enter password"]'
  ).fill(user.password);
  await page.waitForTimeout(300);

  // Check Remember Me
  await page.locator(
    'input[type="checkbox"][name="remember"]'
  ).click();
  await page.waitForTimeout(300);

  // Click Sign In button
  await page.locator('button[type="submit"]')
    .filter({ hasText: 'Sign In' })
    .click();
  await page.waitForURL('https://realspicestepps.com/');
  await page.waitForTimeout(1000);
  console.log('Sign In done ✅');

  // ═══════════════════════════════════════
  // 6. PICKUP ORDER
  // ═══════════════════════════════════════

  // Click first product on homepage
  await page.locator('.product-card, [data-product], .menu-item')
    .first().click();
  await page.waitForTimeout(800);

  // Select first option in each modifier group
  const modifierOptions = page.locator(
    'input[type="radio"], input[type="checkbox"]'
  );
  const modCount = await modifierOptions.count();
  for (let i = 0; i < modCount; i++) {
    const mod = modifierOptions.nth(i);
    const isVisible = await mod.isVisible();
    if (isVisible) {
      await mod.click();
      await page.waitForTimeout(300);
    }
  }

  // Click Add to Cart
  await page.locator('button')
    .filter({ hasText: /add to cart/i })
    .click();
  await page.waitForTimeout(800);

  // Wait for cart drawer
  await page.waitForSelector('#goCheckoutBtn', { state: 'visible' });
  await page.waitForTimeout(800);

  // Click Go to Checkout
  await page.locator('#goCheckoutBtn').click();
  await page.waitForTimeout(800);

  // Click Proceed to Checkout in dialog
  await page.waitForSelector('#proceedCheckoutBtn', { state: 'visible' });
  await page.locator('#proceedCheckoutBtn').click();
  await page.waitForURL('**/check-out');
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
  await page.waitForURL('https://realspicestepps.com/');
  await page.waitForTimeout(1000);
  console.log('Pickup Order done ✅');

  // ═══════════════════════════════════════
  // 7. DELIVERY ORDER (same user — no login)
  // ═══════════════════════════════════════

  // Click first product on homepage
  await page.locator('.product-card, [data-product], .menu-item')
    .first().click();
  await page.waitForTimeout(800);

  // Select modifiers
  const modifierOptions2 = page.locator(
    'input[type="radio"], input[type="checkbox"]'
  );
  const modCount2 = await modifierOptions2.count();
  for (let i = 0; i < modCount2; i++) {
    const mod = modifierOptions2.nth(i);
    const isVisible = await mod.isVisible();
    if (isVisible) {
      await mod.click();
      await page.waitForTimeout(300);
    }
  }

  // Click Add to Cart
  await page.locator('button')
    .filter({ hasText: /add to cart/i })
    .click();
  await page.waitForTimeout(800);

  // Wait for cart drawer
  await page.waitForSelector('#goCheckoutBtn', { state: 'visible' });
  await page.waitForTimeout(800);

  // Click Go to Checkout
  await page.locator('#goCheckoutBtn').click();
  await page.waitForTimeout(800);

  // Click Proceed to Checkout
  await page.waitForSelector('#proceedCheckoutBtn', { state: 'visible' });
  await page.locator('#proceedCheckoutBtn').click();
  await page.waitForURL('**/check-out');
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
  await page.waitForURL('https://realspicestepps.com/');
  await page.waitForTimeout(1000);
  console.log('Delivery Order done ✅');
  console.log('COMPLETE E2E FLOW PASSED 🎉');
});
