import { test, expect } from "@playwright/test";

test.describe("Paginación de estudiantes", () => {
  test("N-1: la API reporta 2 páginas con 25 estudiantes (bug: deberían ser 3)", async ({ request }) => {
    // Le pedimos la primera página de 10 a la API.
    const respuesta = await request.get("/api/students?page=1&pageSize=10");
    const data = await respuesta.json();

    // Confirmamos el escenario: hay 25 estudiantes en total.
    expect(data.total).toBe(25);

    // El bug: con 25 y de a 10 deberían ser 3 páginas, pero la API dice 2.
    // 25 / 10 = 2.5; usa Math.floor (2) cuando debería usar Math.ceil (3).
    expect(data.totalPages).toBe(2);
  });

  test("N-2: el último registro de una página se repite como primero de la siguiente (bug)", async ({
    request,
  }) => {
    const pagina1 = await request.get("/api/students?page=1&pageSize=10");
    const dataPagina1 = await pagina1.json();

    const pagina2 = await request.get("/api/students?page=2&pageSize=10");
    const dataPagina2 = await pagina2.json();

    const ultimoDePagina1 = dataPagina1.items.at(-1);
    const primeroDePagina2 = dataPagina2.items[0];

    // El bug: el último id de la página 1 es el mismo que el primero de la
    // página 2 — un registro se muestra dos veces.
    expect(primeroDePagina2.id).toBe(ultimoDePagina1.id);
  });
});
