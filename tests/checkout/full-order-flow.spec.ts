import { test } from '@playwright/test';
import { SignUpPage } from '../../pages/SignUpPage';
import { ProductPage } from '../../pages/ProductPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { getUser, resetUser } from '../../helpers/authState';

test('Full E2E — Sign Up → Pickup Order → Delivery Order (Same User)',
async ({ page }) => {

  const signUpPage   = new SignUpPage(page);
  const productPage  = new ProductPage(page);
  const cartPage     = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Generate fresh dynamic user for this test run
  resetUser();
  const user = getUser();

  // ═══════════════════════════════════════════════
  // PART 1 — SIGN UP
  // ═══════════════════════════════════════════════

  // Step 1: Go to homepage
  await page.goto('https://realspicestepps.com/');
  await page.waitForTimeout(800);

  // Step 2: Sign up with dynamic user — auto login after signup
  await signUpPage.openSignUp();
  await signUpPage.fillName(user.fullName);
  await signUpPage.fillPhone(user.phone);
  await signUpPage.fillEmail(user.email);
  await signUpPage.fillPassword(user.password);
  await signUpPage.fillConfirmPassword(user.password);
  await signUpPage.acceptTerms();
  await signUpPage.submit();
  await signUpPage.assertUserLoggedInAfterSignup();

  // Step 2A: Close sidebar menu opened during login-state assertion
  if (await page.locator('#sidebarMenu').isVisible()) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  await page.waitForTimeout(800);
  console.log('Sign Up completed — user auto logged in ✅');

  // ═══════════════════════════════════════════════
  // PART 2 — PICKUP ORDER
  // ═══════════════════════════════════════════════

  // Step 3: Select first product from homepage
  await productPage.openFirstProduct();
  await page.waitForTimeout(600);

  // Step 4: Select modifiers
  await productPage.selectFirstAvailableOptionInEachModifierGroup();
  await page.waitForTimeout(600);

  // Step 5: Add to cart
  await productPage.addToCart();
  await page.waitForTimeout(800);

  // Step 6: Wait for cart drawer to open
  await page.waitForSelector('#goCheckoutBtn', { state: 'visible' });
  await page.waitForTimeout(800);

  // Step 7: Click Go to Checkout
  await cartPage.goToCheckoutBtn.click();
  await page.waitForTimeout(800);

  // Step 8: Click Proceed to Checkout in auth dialog
  await page.waitForSelector('#proceedCheckoutBtn', { state: 'visible' });
  await cartPage.proceedCheckoutBtn.click();
  await page.waitForTimeout(800);

  // Step 9: Wait for checkout page
  await page.waitForURL('**/check-out');
  await page.waitForTimeout(800);

  // Step 10: Select Pickup option
  await page.waitForSelector('#btnPickup', { state: 'visible' });
  await checkoutPage.pickupBtn.click();
  await page.waitForTimeout(600);

  // Step 11: Scroll down to payment section
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);

  // Step 12: Enter special instructions
  await checkoutPage.specialInstructions.fill('Please make it extra spicy');
  await page.waitForTimeout(400);

  // Step 13: Click Cash Payment tile
  await checkoutPage.cashPaymentTile.click();
  await page.waitForTimeout(600);

  // Step 14: Click Cash Payment radio button
  await checkoutPage.cashPaymentRadio.click();
  await page.waitForTimeout(600);

  // Step 15: Click Continue to Payment
  await page.waitForSelector('#btnPlaceOrder', { state: 'visible' });
  await checkoutPage.continueToPaymentBtn.click();
  await page.waitForTimeout(800);

  // Step 16: Click Proceed Now in payment dialog
  await page.waitForSelector('#proceedPaymentBtn', { state: 'visible' });
  await checkoutPage.proceedNowBtn.click();
  await page.waitForTimeout(1000);

  // Step 17: Click OK on order success dialog
  await page.waitForSelector(
    'button.swal2-confirm.custom-ok-button',
    { state: 'visible' }
  );
  await checkoutPage.orderSuccessOkBtn.click();
  await page.waitForTimeout(800);

  // Step 18: Verify back on homepage
  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  await page.waitForTimeout(800);
  console.log('Pickup order placed successfully ✅');

  // ═══════════════════════════════════════════════
  // PART 3 — DELIVERY ORDER (SAME USER — NO LOGIN)
  // ═══════════════════════════════════════════════

  // Step 19: Select first product again from homepage
  // Note: Same user still logged in — no sign in needed
  await productPage.openFirstProduct();
  await page.waitForTimeout(600);

  // Step 20: Select modifiers
  await productPage.selectFirstAvailableOptionInEachModifierGroup();
  await page.waitForTimeout(600);

  // Step 21: Add to cart
  await productPage.addToCart();
  await page.waitForTimeout(800);

  // Step 22: Wait for cart drawer to open
  await page.waitForSelector('#goCheckoutBtn', { state: 'visible' });
  await page.waitForTimeout(800);

  // Step 23: Click Go to Checkout
  await cartPage.goToCheckoutBtn.click();
  await page.waitForTimeout(800);

  // Step 24: Click Proceed to Checkout in auth dialog
  await page.waitForSelector('#proceedCheckoutBtn', { state: 'visible' });
  await cartPage.proceedCheckoutBtn.click();
  await page.waitForTimeout(800);

  // Step 25: Wait for checkout page
  // Note: Delivery is already selected by default — no need to click
  await page.waitForURL('**/check-out');
  await page.waitForTimeout(800);

  // Step 26: Click Add New Address link
  await page.waitForSelector('#addAddressLink', { state: 'visible' });
  await page.locator('#addAddressLink').click();
  await page.waitForTimeout(600);

  // Step 27: Enter postcode G33 6EP
  await page.waitForSelector('#addrPostcode', { state: 'visible' });
  await page.locator('#addrPostcode').fill('G33 6EP');
  await page.waitForTimeout(400);

  // Step 28: Click Search to find address by postcode
  await page.waitForSelector('#btnPostcodeSearch', { state: 'visible' });
  await page.locator('#btnPostcodeSearch').click();
  await page.waitForTimeout(1200);

  // Step 29: Enter building/street number
  await page.waitForSelector('#addrBuilding', { state: 'visible' });
  await page.locator('#addrBuilding').fill('12 Cumbernauld Road');
  await page.waitForTimeout(400);

  // Step 30: Click Add Address to save address
  await page.waitForSelector('#btnAddAddress', { state: 'visible' });
  await page.locator('#btnAddAddress').click();
  await page.waitForTimeout(1000);

  // Step 31: Click on saved address tile
  await page.waitForSelector(
    'div.rounded-lg.border.border-gray-200.peer-checked\\:border-sky-500.peer-checked\\:ring-1.peer-checked\\:ring-sky-300.px-4.py-3.cursor-pointer.flex.items-start.justify-between',
    { state: 'visible' }
  );
  await page
    .locator(
      'div.rounded-lg.border.border-gray-200.peer-checked\\:border-sky-500.peer-checked\\:ring-1.peer-checked\\:ring-sky-300.px-4.py-3.cursor-pointer.flex.items-start.justify-between'
    )
    .filter({ hasText: 'Home' })
    .first()
    .click();
  await page.waitForTimeout(600);

  // Step 32: Click radio button inside saved address tile
  await page.waitForSelector(
    'div.rounded-lg.border.border-gray-200.peer-checked\\:border-sky-500.peer-checked\\:ring-1.peer-checked\\:ring-sky-300.px-4.py-3.cursor-pointer.flex.items-start.justify-between span.h-2\\.5.w-2\\.5.rounded-full.bg-sky-600.opacity-0.peer-checked\\:opacity-100',
    { state: 'visible' }
  );
  await page
    .locator(
      'div.rounded-lg.border.border-gray-200.peer-checked\\:border-sky-500.peer-checked\\:ring-1.peer-checked\\:ring-sky-300.px-4.py-3.cursor-pointer.flex.items-start.justify-between span.h-2\\.5.w-2\\.5.rounded-full.bg-sky-600.opacity-0.peer-checked\\:opacity-100'
    )
    .first()
    .click();
  await page.waitForTimeout(600);

  // Step 33: Scroll down to payment section
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);

  // Step 34-35: Select Cash Payment reliably
  await checkoutPage.cashPaymentTile.first().click();
  await page.waitForTimeout(600);
  await checkoutPage.cashPaymentRadio.first().click();
  await page.waitForTimeout(600);

  // Step 36: Click Continue to Payment
  await page.waitForSelector('#btnPlaceOrder', { state: 'visible' });
  await checkoutPage.continueToPaymentBtn.click();
  await page.waitForTimeout(800);

  // Step 37: Click Proceed Now in payment dialog
  await page.waitForSelector('#proceedPaymentBtn', { state: 'visible' });
  await checkoutPage.proceedNowBtn.click();
  await page.waitForTimeout(1000);

  // Step 38: Click OK on order success dialog
  await page.waitForSelector(
    'button.swal2-confirm.custom-ok-button',
    { state: 'visible' }
  );
  await checkoutPage.orderSuccessOkBtn.click();
  await page.waitForTimeout(800);

  // Step 39: Verify back on homepage
  await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
  console.log('Delivery order placed successfully ✅');
  console.log('Full E2E flow completed ✅');
});
