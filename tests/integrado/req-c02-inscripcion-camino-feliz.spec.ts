import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../fixtures/demo-account";

// REQ-C02, fila "Sí prerequisito / Sí cupo → Inscrito" (en este caso,
// "fundamentos" no tiene prerequisito, así que aplica directo).
//
// Patrón de S16, en la dirección que sí es confiable en este entorno:
// la UI prepara (inscribe con un clic real) y la API verifica que el
// estado quedó reflejado del lado del servidor.
//
// Dato dinámico compartido: el `courseId` ("fundamentos") y el momento de
// la inscripción (`enrolledAt`) nacen en la acción de la UI (clic en
// "Inscribirse") y se consumen leyendo `GET /api/progress` por API.
//
// Qué demuestra la UI: que el clic de inscripción se ejecuta sin errores
// visibles. Qué demuestra la API: que ese mismo curso queda registrado del
// lado del servidor con status "inscrito", no solo en la pantalla.
// Qué NO demuestra el conjunto: no confirma que el cupo se descuente
// correctamente (ver BUG-09, que ya prueba lo contrario) ni cubre las otras
// 3 combinaciones de la tabla de decisión de REQ-C02 (declaradas pendientes
// en docs/estrategia.md). Tampoco limpia el estado que crea: no hay un
// endpoint documentado para "desinscribirse", así que queda como riesgo
// abierto, no como omisión escondida.
test.describe("REQ-C02 — camino feliz de inscripción (UI prepara, API verifica)", () => {
  test("C-1: inscribirse por UI en un curso sin prerequisito queda registrado en la API", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(DEMO_EMAIL, DEMO_PASSWORD);
    await expect(loginPage.successMessage).toBeVisible();

    // La UI prepara: nos inscribimos en "fundamentos" con un clic real.
    await page.getByRole("link", { name: "Ver cursos" }).click();
    await page.getByTestId("enroll-fundamentos").click();
    await expect(page.getByTestId("enroll-fundamentos")).not.toHaveText("Inscribirse");

    // La API verifica: el mismo curso queda registrado del lado del
    // servidor con status "inscrito". Sondeamos unos segundos por si hay
    // demora de consistencia eventual entre la escritura y la lectura.
    await expect
      .poll(
        async () => {
          const progreso = await page.request.get("/api/progress");
          const body = await progreso.json();
          return body.enrollments.some(
            (e: { courseId: string }) => e.courseId === "fundamentos"
          );
        },
        { timeout: 10_000, intervals: [500] }
      )
      .toBe(true);

    const progresoFinal = await page.request.get("/api/progress");
    const bodyFinal = await progresoFinal.json();
    const fundamentos = bodyFinal.enrollments.find(
      (e: { courseId: string }) => e.courseId === "fundamentos"
    );
    expect(fundamentos.status).toBe("inscrito");
  });
});
