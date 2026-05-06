import { test } from '@playwright/test';
import { getUser, resetUser } from '../../helpers/authState';
import { ProductPage } from '../../pages/ProductPage';
import { SignInPage } from '../../pages/SignInPage';
import { SignOutPage } from '../../pages/SignOutPage';
import { SignUpPage } from '../../pages/SignUpPage';

test.describe('Menu Flow - Add To Cart', () => {
  test('user can select first product modifiers and add to cart', async ({ page }) => {
    resetUser();
    const user = getUser();
    const signUpPage = new SignUpPage(page);
    const signOutPage = new SignOutPage(page);
    const signInPage = new SignInPage(page);
    const productPage = new ProductPage(page);

    await test.step('Sign up with shared auth user so credentials are valid', async () => {
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
    });

    await test.step('Sign out and sign in using SignInPage with shared auth user', async () => {
      await signOutPage.logout();
      await signInPage.openSignIn();
      await signInPage.fillEmail(user.email);
      await signInPage.fillPassword(user.password);
      await signInPage.enableRememberMe();
      await signInPage.submit();
      await signInPage.assertUserLoggedInAfterSignIn();
    });

    await test.step('Wait for homepage products and open first product', async () => {
      await productPage.waitForHomepageProducts();
      await productPage.openFirstProduct();
      await productPage.assertProductModalDetailsVisible();
    });

    await test.step('Select first available option in each modifier group', async () => {
      await productPage.selectFirstAvailableOptionInEachModifierGroup();
      await productPage.assertModifierSelectionsApplied();
    });

    await test.step('Keep quantity as one', async () => {
      await productPage.assertQuantityIsOne();
    });

    await test.step('Add to cart and verify success', async () => {
      await productPage.addToCart();
      await productPage.assertProductAddedSuccessfully();
    });
  });
});
