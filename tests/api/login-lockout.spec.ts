import { test, expect } from "@playwright/test";
import { DEMO_PASSWORD } from "../fixtures/demo-account";

// REQ-L03: "después de 5 intentos fallidos consecutivos, la cuenta se
// bloquea por 30 segundos."
test.describe("REQ-L03 — rate limiting de login", () => {
  test("L-1: la cuenta se bloquea en el intento 4, no en el 5 (bug: uno antes de lo esperado)", async ({
    page,
    request,
  }) => {
    // Cuenta nueva y descartable, para no afectar la cuenta demo compartida
    // que usan el resto de los tests.
    const email = `lockout-${Date.now()}@ejemplo.com`;

    await page.goto("/registro");
    await page.getByTestId("register-name").fill("Lockout Test");
    await page.getByTestId("register-email").fill(email);
    await page.getByTestId("register-password").fill(DEMO_PASSWORD);
    await page.getByTestId("register-age").fill("25");
    await page.getByTestId("register-submit").click();
    await expect(page.getByTestId("register-success")).toBeVisible();

    // 3 intentos fallidos: la spec permite hasta 5 antes de bloquear.
    for (let i = 1; i <= 3; i++) {
      const response = await request.post("/api/login", {
        data: { email, password: "PasswordIncorrecta1!" },
      });
      expect(response.status()).toBe(401);
    }

    // El bug: el 4to intento fallido ya bloquea la cuenta (status 429),
    // cuando la spec dice que el bloqueo ocurre "después de 5 intentos".
    const cuartoIntento = await request.post("/api/login", {
      data: { email, password: "PasswordIncorrecta1!" },
    });
    const body = await cuartoIntento.json();
    expect(cuartoIntento.status()).toBe(429);
    expect(body.attempts).toBe(4);
  });

  test("L-2: la duración real del bloqueo son 30 segundos (medido por timestamp, sin esperar)", async ({
    page,
    request,
  }) => {
    const email = `lockout-duracion-${Date.now()}@ejemplo.com`;

    await page.goto("/registro");
    await page.getByTestId("register-name").fill("Lockout Duracion");
    await page.getByTestId("register-email").fill(email);
    await page.getByTestId("register-password").fill(DEMO_PASSWORD);
    await page.getByTestId("register-age").fill("25");
    await page.getByTestId("register-submit").click();
    await expect(page.getByTestId("register-success")).toBeVisible();

    for (let i = 1; i <= 3; i++) {
      await request.post("/api/login", {
        data: { email, password: "PasswordIncorrecta1!" },
      });
    }

    // El intento que dispara el bloqueo: anotamos la hora local exacta.
    const horaDelBloqueo = Date.now();
    await request.post("/api/login", { data: { email, password: "PasswordIncorrecta1!" } });

    // Cualquier intento posterior ya bloqueado trae "unlockAt" (timestamp
    // absoluto de cuándo se desbloquea).
    const siguienteIntento = await request.post("/api/login", {
      data: { email, password: "PasswordIncorrecta1!" },
    });
    const body = await siguienteIntento.json();

    const duracionRealMs = body.unlockAt - horaDelBloqueo;

    // La spec promete 30 segundos (30_000 ms). Permitimos un margen chico
    // por la latencia de red entre el request que bloquea y este.
    expect(duracionRealMs).toBeGreaterThan(28_000);
    expect(duracionRealMs).toBeLessThan(30_500);
  });
});
