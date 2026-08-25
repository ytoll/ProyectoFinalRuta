import { test, expect } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../fixtures/demo-account";

test.describe("API de cursos", () => {
  test("GET /api/courses responde 200 con la lista de cursos", async ({ request }) => {
    const response = await request.get("/api/courses");

    // 1) El status code es 200 (pedido feliz).
    expect(response.status()).toBe(200);

    // 2) Leemos el body como JSON.
    const body = await response.json();

    // 3) Afirmamos la FORMA de la respuesta, no un número exacto.
    expect(Array.isArray(body.courses)).toBe(true);
    expect(body.courses.length).toBeGreaterThan(0);
    expect(body.courses[0]).toHaveProperty("id");
    expect(body.courses[0]).toHaveProperty("title");
  });

  test("REQ-C04: el cupo de un curso debe bajar en 1 tras inscribirse (bug: no baja)", async ({
    request,
  }) => {
    const login = await request.post("/api/login", {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    });
    expect(login.status()).toBe(200);

    // Antes de inscribirse: leemos cuántos estudiantes tiene "fundamentos".
    const before = await request.get("/api/courses");
    const fundamentosBefore = (await before.json()).courses.find(
      (c: { id: string }) => c.id === "fundamentos"
    );

    const enroll = await request.post("/api/enroll", { data: { courseId: "fundamentos" } });
    expect(enroll.status()).toBe(200);

    // Después de inscribirse: volvemos a leer el mismo curso.
    const after = await request.get("/api/courses");
    const fundamentosAfter = (await after.json()).courses.find(
      (c: { id: string }) => c.id === "fundamentos"
    );

    // El bug: "enrolled" debería subir en 1 (REQ-C04), pero se queda igual.
    expect(fundamentosAfter.enrolled).toBe(fundamentosBefore.enrolled);
  });
});
