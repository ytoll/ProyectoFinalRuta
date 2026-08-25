import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../fixtures/demo-account";

// REQ-S01: "Las páginas /cursos y /mi-progreso requieren autenticación. Un
// usuario no logueado debe ver un mensaje pidiendo iniciar sesión."
//
// El bug: tras un login exitoso, POST /api/login crea la cookie ash_session,
// pero GET /api/auth/me con esa misma cookie devuelve realUser: null. El
// frontend interpreta eso como "no logueado" y aplica el comportamiento de
// REQ-S01 a un usuario que en realidad sí inició sesión.
test.describe("REQ-S01 — la sesión debe persistir tras el login", () => {
  test("S-1: /api/auth/me devuelve realUser: null con una cookie de sesión recién creada (bug)", async ({
    request,
  }) => {
    // Preparación: login por API, igual que haría el formulario.
    const login = await request.post("/api/login", {
      data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    });
    expect(login.status()).toBe(200);

    // La caza: reusamos la sesión recién creada (el fixture `request`
    // mantiene las cookies del contexto) para consultar quién está logueado.
    const me = await request.get("/api/auth/me");
    expect(me.status()).toBe(200);

    const body = await me.json();

    // El bug: con una cookie de sesión válida y recién creada, la API
    // igual devuelve realUser: null, en vez de los datos del usuario.
    expect(body.realUser).toBe(null);
  });

  test("S-2: tras loguearse por UI, un refresh pierde la sesión (bug)", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(DEMO_EMAIL, DEMO_PASSWORD);

    // Confirmamos que el login funcionó: mensaje de bienvenida visible.
    await expect(loginPage.successMessage).toBeVisible();

    // La caza: recargamos la página con la sesión recién iniciada.
    await page.reload();

    // El bug: tras el refresh, la app ya no reconoce la sesión y vuelve a
    // pedir el login, en vez de mantener al usuario autenticado.
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
