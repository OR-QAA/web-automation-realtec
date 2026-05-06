import { expect, test } from '@playwright/test';
import { getUser, resetUser } from '../../helpers/authState';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { ProductPage } from '../../pages/ProductPage';
import { SignInPage } from '../../pages/SignInPage';
import { SignUpPage } from '../../pages/SignUpPage';

test.describe('Checkout Flow - Place Order', () => {
  test('user can place order from cart and redirect to homepage', async ({ page }) => {
    test.setTimeout(120000);

    resetUser();
    const user = getUser();
    const signUpPage = new SignUpPage(page);
    const signInPage = new SignInPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Create shared auth user account before sign in pre-condition', async () => {
      await signUpPage.goto();
      await signUpPage.openSignUp();
      await signUpPage.fillName(user.fullName);
      await signUpPage.fillPhone(user.phone);
      await signUpPage.fillEmail(user.email);
      await signUpPage.fillPassword(user.password);
      await signUpPage.fillConfirmPassword(user.password);
      await signUpPage.acceptTerms();
      await signUpPage.submit();
      await signUpPage.assertUserLoggedInAfterSignup();
      await page.context().clearCookies();
      await page.goto('https://realspicestepps.com/');
      await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      });
    });

    await test.step('Sign in using shared auth user', async () => {
      await page.goto('https://realspicestepps.com/');
      await signInPage.openSignIn();
      await signInPage.fillEmail(user.email);
      await signInPage.fillPassword(user.password);
      await signInPage.enableRememberMe();
      await signInPage.submit();
      await signInPage.assertUserLoggedInAfterSignIn();
    });

    await test.step('Select product and add to cart', async () => {
      await productPage.waitForHomepageProducts();
      await productPage.openFirstProduct();
      await productPage.assertProductModalDetailsVisible();
      await productPage.selectFirstAvailableOptionInEachModifierGroup();
      await productPage.assertModifierSelectionsApplied();
      await productPage.assertQuantityIsOne();
      await productPage.addToCart();
      await productPage.assertProductAddedSuccessfully();
    });

    await test.step('Go to checkout from cart drawer', async () => {
      await cartPage.clickGoToCheckout();
    });

    await test.step('Proceed to checkout from auth dialog', async () => {
      await page.waitForTimeout(800);
      await cartPage.clickProceedToCheckoutFromDialog();
    });

    await test.step('Checkout as pickup and add special instructions', async () => {
      await checkoutPage.selectPickup();
      await checkoutPage.scrollToPaymentSection();
      await checkoutPage.fillSpecialInstructions('Please make it extra spicy');
    });

    await test.step('Select cash payment and continue', async () => {
      await checkoutPage.selectCashPayment();
      await checkoutPage.clickContinueToPayment();
    });

    await test.step('Confirm payment and finalize order', async () => {
      await page.waitForTimeout(800);
      await checkoutPage.clickProceedNowFromDialog();
      await page.waitForTimeout(800);
      await checkoutPage.clickOrderSuccessOk();
    });

    await test.step('Verify redirected to homepage after order placement', async () => {
      await page.waitForURL(/^https:\/\/realspicestepps\.com\/?(?:[?#].*)?$/);
      await expect(page).toHaveTitle(/Real Spice Stepps/i);
      console.log('Order placed successfully and redirected to homepage ✅');
    });
  });
});
