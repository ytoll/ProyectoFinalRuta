import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DEMO_PASSWORD } from "../fixtures/demo-account";

// REQ-L03: "...la cuenta se bloquea por 30 segundos. Durante el bloqueo: el
// botón de login debe estar deshabilitado, un timer visual muestra los
// segundos restantes, el botón se habilita exactamente cuando el timer
// llega a 0."
//
// Este test cubre la parte de REQ-L03 que tests/api/login-lockout.spec.ts
// no cubre: el timer VISIBLE en pantalla, no solo el timestamp que devuelve
// la API. Espera el tiempo real del bloqueo (no es waitForTimeout: es medir
// el comportamiento real de un temporizador, que solo se puede observar
// dejando pasar el tiempo). El sondeo usa expect.poll, no un sleep fijo.
test.describe("REQ-L03 — timer visual del bloqueo de login", () => {
  test("L-3: el botón se re-habilita ~5 segundos antes de que el timer llegue a cero (bug)", async ({
    page,
  }) => {
    test.setTimeout(45_000);

    const email = `lockout-timer-${Date.now()}@ejemplo.com`;

    await page.goto("/registro");
    await page.getByTestId("register-name").fill("Lockout Timer");
    await page.getByTestId("register-email").fill(email);
    await page.getByTestId("register-password").fill(DEMO_PASSWORD);
    await page.getByTestId("register-age").fill("25");
    await page.getByTestId("register-submit").click();
    await expect(page.getByTestId("register-success")).toBeVisible();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    for (let i = 1; i <= 4; i++) {
      await loginPage.login(email, "PasswordIncorrecta1!");
      await expect(page.getByTestId("login-submit")).not.toHaveText("Verificando...");
    }

    // El timer arranca mostrando 30 segundos, y el botón queda deshabilitado.
    await expect(page.getByTestId("login-lockout")).toContainText("30 segundos");
    await expect(page.getByTestId("login-submit")).toBeDisabled();

    // Sondeamos (sin sleep fijo) hasta que el botón se re-habilite solo.
    await expect
      .poll(async () => page.getByTestId("login-submit").isDisabled(), {
        timeout: 35_000,
        intervals: [250],
      })
      .toBe(false);

    // El bug: en el instante exacto en que se habilita, el timer visual
    // todavía muestra segundos restantes (~5), no "0 segundos" como exige
    // la spec ("se habilita exactamente cuando el timer llega a 0").
    const textoAlHabilitarse = await page.getByTestId("login-lockout").textContent();
    expect(textoAlHabilitarse).toMatch(/[1-9]\d* segundos/);
  });
});
