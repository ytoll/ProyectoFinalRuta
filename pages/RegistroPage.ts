import { type Page, type Locator } from '@playwright/test';

export class RegistroPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly ageInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly emailError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('register-name');
    this.emailInput = page.getByTestId('register-email');
    this.passwordInput = page.getByTestId('register-password');
    this.ageInput = page.getByTestId('register-age');
    this.submitButton = page.getByTestId('register-submit');
    this.successMessage = page.getByTestId('register-success');
    this.emailError = page.getByTestId('register-email-error');
  }

  async goto() {
    await this.page.goto('/registro');
  }

  async register(name: string, email: string, password: string, age: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.ageInput.fill(age);
    await this.submitButton.click();
  }
}
