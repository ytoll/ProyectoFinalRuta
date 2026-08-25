import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../fixtures/demo-account';

test.describe('HU-LOGIN-01 - Inicio de sesión', () => {
  test('CP1 - Login con credenciales válidas muestra mensaje de éxito', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(DEMO_EMAIL, DEMO_PASSWORD);

    await expect(loginPage.successMessage).toBeVisible();
  });

  test('CP2 - Login con contraseña incorrecta muestra mensaje de error y no concede acceso', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(DEMO_EMAIL, 'ContraseñaIncorrecta1!');

    // MI DUDA PARA S11:
    // No probé waitForTimeout a propósito: ya lo usé en otro proyecto y no me
    // funcionó (de hecho todavía no me funciona ahí), así que no le tengo
    // confianza. Usé toBeVisible() esperando que "espere sola", pero no estoy
    // 100% segura de que sea la forma correcta de afirmar que el mensaje de
    // éxito NO aparece, ni de cuánto tiempo espera Playwright antes de fallar.
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.successMessage).not.toBeVisible();
  });
});
