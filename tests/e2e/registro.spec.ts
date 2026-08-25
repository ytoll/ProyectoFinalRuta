import { test, expect } from '@playwright/test';
import { RegistroPage } from '../../pages/RegistroPage';

test.describe('HU-REGISTRO-01 - Valores límite en contraseña', () => {
  test("R-1: el registro acepta un password de 65 caracteres (bug: el máximo es 64)", async ({ page }) => {
    const registroPage = new RegistroPage(page);
    await registroPage.goto();

    // 65 caracteres exactos: justo uno más que el máximo permitido.
    await registroPage.register('Test Tester', 'r1-65@ejemplo.com', 'a'.repeat(65), '25');

    // Dejamos constancia del bug: con 65 caracteres aparece el éxito
    // cuando la regla (máx 64) exige que se rechace.
    await expect(registroPage.successMessage).toBeVisible();
  });

  test("R-2: el registro acepta el email 'x@' sin dominio (bug: falta validar el dominio)", async ({ page }) => {
    const registroPage = new RegistroPage(page);
    await registroPage.goto();

    // Email roto a propósito: arroba sin dominio. Debería rechazarse.
    await registroPage.register('Test Tester', 'x@', 'Segura2026!', '25');

    // Doble afirmación, más precisa: hubo éxito Y no hubo error de email.
    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.emailError).toHaveCount(0);
  });

  test("R-3: tras un registro exitoso, el formulario NO se limpia (bug: conserva los datos)", async ({
    page,
  }) => {
    const registroPage = new RegistroPage(page);
    await registroPage.goto();

    const email = `r3-${Date.now()}@ejemplo.com`;
    await registroPage.register('Test Tester', email, 'Segura2026!', '25');
    await expect(registroPage.successMessage).toBeVisible();

    // El bug: los cuatro campos deberían quedar vacíos y no lo están.
    await expect(registroPage.nameInput).toHaveValue('Test Tester');
    await expect(registroPage.emailInput).toHaveValue(email);
    await expect(registroPage.passwordInput).toHaveValue('Segura2026!');
    await expect(registroPage.ageInput).toHaveValue('25');
  });
});
