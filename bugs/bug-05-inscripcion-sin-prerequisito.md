# Bug #5 — La API inscribe a un curso sin validar el prerequisito

- **Endpoint:** `POST /api/enroll` (sobre `https://academia-sin-humo.vercel.app`)
- **Tipo:** Bug de validación server-side (falta chequeo de regla de negocio)
- **Severidad sugerida:** Alta — la UI exige el prerequisito, pero se puede saltear pegándole directo a la API

## Pasos

1. Sin haber completado el curso "fundamentos" (prerequisito).
2. Llamar directo a `POST /api/enroll` con `{ courseId: "playwright-cero" }`, sin pasar por la UI.
3. Observar el status code y el body de la respuesta.

## Descripción

El curso "playwright-cero" requiere "fundamentos" como prerequisito. La UI de inscripción respeta esa regla (no deja inscribirse sin haberlo completado), pero la API no la valida del lado del servidor: si se llama directamente al endpoint, la inscripción se acepta igual.

## Comportamiento esperado

`POST /api/enroll` con `courseId: "playwright-cero"` sin haber completado "fundamentos" debería **rechazarse** (status distinto de 200, indicando prerequisito no cumplido).

## Comportamiento actual (bug)

La API responde `200` y el body devuelve `status: "inscrito"`, es decir, la inscripción se concreta igual sin validar el prerequisito.

## Evidencia (prueba automatizada)

```typescript
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
```

Resultado observado al correr `npx playwright test tests/api.spec.ts -g "I-1"`: 2 passed (chromium, firefox), confirmando que el prerequisito no se valida del lado del servidor.

## Estado

- [x] Encontrado
- [ ] Corregido
