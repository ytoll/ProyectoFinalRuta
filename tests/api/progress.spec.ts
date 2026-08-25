import { test, expect } from "@playwright/test";

test.describe("API de progreso", () => {
  test("P-1: un curso Abandonado se puede retomar (bug: Abandonado es terminal)", async ({ request }) => {
    const courseId = "fundamentos";

    // Preparación: nos aseguramos de tener una inscripción y la abandonamos.
    await request.post("/api/enroll", { data: { courseId } });
    const abandonar = await request.post("/api/progress", {
      data: { courseId, action: "abandonar" },
    });
    expect(abandonar.status()).toBe(200); // abandonar SÍ es una transición válida

    // La caza: intentamos RETOMAR un curso ya abandonado.
    const retomar = await request.post("/api/progress", {
      data: { courseId, action: "retomar" },
    });

    // El bug: el servidor ACEPTA la transición prohibida (responde 200)
    // y deja el curso "en-progreso", cuando "Abandonado" es terminal.
    expect(retomar.status()).toBe(200);
    const body = await retomar.json();
    expect(body.currentStatus).toBe("en-progreso");
  });
});
