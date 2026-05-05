import { test } from '@playwright/test';
import { getUser, resetUser } from '../../helpers/authState';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { SignInPage } from '../../pages/SignInPage';
import { SignOutPage } from '../../pages/SignOutPage';
import { SignUpPage } from '../../pages/SignUpPage';

test.describe('Auth Flow - Sign In After Sign Up', () => {
  test('user can logout, request reset, and sign in with same credentials', async ({ page }) => {
    resetUser();
    const user = getUser();

    const signUpPage = new SignUpPage(page);
    const signOutPage = new SignOutPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);
    const signInPage = new SignInPage(page);

    await test.step('Open website and go to sign up', async () => {
      await signUpPage.goto();
      await signUpPage.openSignUp();
    });

    await test.step('Sign up with dynamic user data', async () => {
      await signUpPage.fillName(user.fullName);
      await signUpPage.fillPhone(user.phone);
      await signUpPage.fillEmail(user.email);
      await signUpPage.fillPassword(user.password);
      await signUpPage.fillConfirmPassword(user.password);
      await signUpPage.acceptTerms();
      await signUpPage.submit();
    });

    await test.step('Verify user is logged in after sign up', async () => {
      await signUpPage.assertUserLoggedInAfterSignup();
    });

    await test.step('Logout flow with confirmation dialog', async () => {
      await signOutPage.logout();
    });

    await test.step('Navigate to sign in page from sidebar', async () => {
      await signInPage.openSignIn();
    });

    await test.step('Forgot password flow with same sign-up email', async () => {
      await forgotPasswordPage.openFromSignIn();
      await forgotPasswordPage.fillEmail(user.email);
      await forgotPasswordPage.sendResetLink();
      await forgotPasswordPage.assertResetLinkSent();
    });

    await test.step('Open sign in again from sidebar', async () => {
      await signInPage.openSignIn();
    });

    await test.step('Sign in with same sign-up email and password', async () => {
      await signInPage.fillEmail(user.email);
      await signInPage.fillPassword(user.password);
      await signInPage.enableRememberMe();
      await signInPage.submit();
    });

    await test.step('Verify login success after sign in', async () => {
      await signInPage.assertUserLoggedInAfterSignIn();
    });
  });
});
