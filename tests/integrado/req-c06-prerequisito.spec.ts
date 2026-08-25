import { test, expect } from "@playwright/test";

// REQ-C06: "La API de inscripción debe aplicar las mismas reglas de validación
// que la UI. Un curso con prerequisito pendiente debe ser rechazado tanto en
// la UI como en la API."
test.describe("REQ-C06 — validación de prerequisito API vs UI", () => {
  test("I-1: la API inscribe a un curso con prerequisito sin cumplirlo (bug: no valida server-side)", async ({ request }) => {
    // "playwright-cero" requiere "fundamentos" como prerequisito.
    // No lo completamos: pedimos la inscripción directo a la API.
    const response = await request.post("/api/enroll", {
      data: { courseId: "playwright-cero" },
    });

    // El bug: el servidor acepta la inscripción (200) y devuelve
    // status "inscrito", saltándose el prerequisito que la UI sí exige.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("inscrito");
  });
});
