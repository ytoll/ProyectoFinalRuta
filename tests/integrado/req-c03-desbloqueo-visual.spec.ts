import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../fixtures/demo-account";

// REQ-C03: "Un curso solo se desbloquea cuando el estudiante ha completado
// su prerequisito. Estar inscrito o en progreso no cuenta como completado."
//
// El bug: la tarjeta de "Diseño de casos de prueba" (requiere "Fundamentos
// de Testing") se muestra desbloqueada apenas el estudiante se INSCRIBE en
// el prerequisito, sin haberlo completado. El intento real de inscripción
// sí se rechaza correctamente (ver tests/integrado/req-c06-prerequisito no
// vía UI) — el bug es que la tarjeta miente visualmente antes de eso.
test.describe("REQ-C03 — la tarjeta se desbloquea sin completar el prerequisito", () => {
  test("V-1: 'Diseño de casos' se muestra desbloqueado apenas te inscribís en Fundamentos, sin completarlo (bug)", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(DEMO_EMAIL, DEMO_PASSWORD);
    await expect(loginPage.successMessage).toBeVisible();

    await page.getByRole("link", { name: "Ver cursos" }).click();
    await page.getByTestId("enroll-fundamentos").waitFor();

    // Precondición correcta: antes de inscribirse, "Diseño de casos" está
    // bloqueado.
    await expect(page.getByTestId("locked-diseno-casos")).toBeVisible();
    await expect(page.getByTestId("enroll-diseno-casos")).toHaveText("Bloqueado");

    // Nos inscribimos en Fundamentos (queda "Inscrito", NO "Completado").
    await page.getByTestId("enroll-fundamentos").click();
    await page.waitForFunction(
      () => document.querySelector('[data-testid="enroll-diseno-casos"]')?.textContent !== "Bloqueado"
    );

    // El bug: "Diseño de casos" ya se muestra desbloqueado, pese a que
    // Fundamentos solo está "Inscrito", no "Completado" (REQ-C03 lo prohíbe
    // explícitamente).
    await expect(page.getByTestId("locked-diseno-casos")).toHaveCount(0);
    await expect(page.getByTestId("enroll-diseno-casos")).toHaveText("Inscribirse");
  });
});
