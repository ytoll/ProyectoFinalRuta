import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../fixtures/demo-account";

// REQ-P02 / REQ-P03: "Abandonado" es un estado terminal — no tiene transiciones
// permitidas. "Cualquier transición no listada arriba debe ser rechazada con
// un mensaje de error."
//
// El bug: no es solo la API (ver tests/api/progress.spec.ts, P-1). La propia
// UI de /mi-progreso ofrece el botón "Retomar" sobre un curso abandonado, y al
// presionarlo revive el curso a "en-progreso" en vez de rechazar la acción.
const COURSE_ID = "fundamentos";

test.describe("REQ-P02 — 'Abandonado' es terminal, también en la UI", () => {
  test("PU-1: la UI ofrece 'Retomar' sobre un curso Abandonado y lo revive a 'en-progreso' (bug)", async ({
    page,
  }) => {
    // Login por UI, para que la sesión del navegador quede autenticada.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(DEMO_EMAIL, DEMO_PASSWORD);
    await expect(loginPage.successMessage).toBeVisible();

    // Toda la navegación es por links de la propia app (nunca page.goto):
    // una navegación completa dispara el bug de sesión (BUG-08) y nos
    // sacaría de la cuenta antes de llegar a probar este bug. Además, cada
    // login nuevo resetea el progreso de la cuenta demo a cero, así que hay
    // que inscribirse de nuevo en cada corrida.
    await page.getByRole("link", { name: "Ver cursos" }).click();
    await page.getByTestId(`enroll-${COURSE_ID}`).click();

    await page.getByTestId("nav-mi-progreso").click();
    await page.getByTestId(`action-${COURSE_ID}-abandonar`).click();

    // Verificación: con el curso Abandonado, el botón "Retomar" aparece, y
    // "Abandonar" no (esa es la precondición correcta).
    await expect(page.getByTestId(`action-${COURSE_ID}-retomar`)).toBeVisible();
    await expect(page.getByTestId(`action-${COURSE_ID}-abandonar`)).toHaveCount(0);

    // La caza: tocamos "Retomar" sobre el curso abandonado.
    await page.getByTestId(`action-${COURSE_ID}-retomar`).click();

    // El bug: el curso vuelve a "en-progreso" — reaparece el botón
    // "Abandonar" (que solo existe en ese estado) y la barra de progreso.
    await expect(page.getByTestId(`action-${COURSE_ID}-abandonar`)).toBeVisible();
    await expect(page.getByTestId(`progress-value-${COURSE_ID}`)).toBeVisible();
  });
});
