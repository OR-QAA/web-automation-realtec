import { expect, test } from '@playwright/test';
import { SignUpPage } from '../pages/SignUpPage';

// English first names for realistic dynamic data.
const FIRST_NAMES = ['Oliver', 'George', 'Harry', 'Noah', 'Arthur', 'Leo'];

// English last names for realistic dynamic data.
const LAST_NAMES = ['Smith', 'Taylor', 'Brown', 'Wilson', 'Davies', 'Evans'];

// Email domain for dynamic sign-up accounts.
const EMAIL_DOMAIN = 'gmail.com';

// Minimum required password length.
const MIN_PASSWORD_LENGTH = 8;

const randomFrom = (items: string[]): string => items[Math.floor(Math.random() * items.length)];

const buildDynamicName = (): string => `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;

const buildUkMobileNumber = (): string => {
  const nineDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `07${nineDigits}`;
};

const buildDynamicEmail = (fullName: string): string => {
  const [firstName, lastName] = fullName.toLowerCase().split(' ');
  const shortId = `${Date.now()}`.slice(-4);
  return `${firstName}.${lastName}${shortId}@${EMAIL_DOMAIN}`;
};

const buildStrongPassword = (): string => {
  const base = `Qa@${Date.now()}9`;
  return base.length >= MIN_PASSWORD_LENGTH ? base : `${base}Aa!9`;
};

const isStrongPassword = (password: string): boolean =>
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

test.describe('Sign Up Feature', () => {
  test('user can fill and submit sign up form', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const demoDelayMs = 1200;
    const fullName = buildDynamicName();
    const phone = buildUkMobileNumber();
    const email = buildDynamicEmail(fullName);
    const password = buildStrongPassword();

    await test.step('Validate generated test data constraints', async () => {
      expect(fullName).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
      expect(phone).toMatch(/^07\d{9}$/);
      expect(password.length).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH);
      expect(isStrongPassword(password)).toBeTruthy();
    });

    await test.step('Open website', async () => {
      await signUpPage.goto();
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Open sign up screen from sidebar', async () => {
      await signUpPage.openSignUp();
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Fill full name', async () => {
      await signUpPage.fillName(fullName);
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Fill phone', async () => {
      await signUpPage.fillPhone(phone);
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Fill email', async () => {
      await signUpPage.fillEmail(email);
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Fill password', async () => {
      await signUpPage.fillPassword(password);
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Fill confirm password', async () => {
      await signUpPage.fillConfirmPassword(password);
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Accept terms checkbox', async () => {
      await signUpPage.acceptTerms();
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Submit sign up form', async () => {
      await signUpPage.submit();
      await page.waitForTimeout(demoDelayMs);
    });

    await test.step('Verify user is logged in with new credentials', async () => {
      await signUpPage.assertUserLoggedInAfterSignup();
      await page.waitForTimeout(demoDelayMs);
    });
  });
});
