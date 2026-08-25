# Bug #4 — Un curso "Abandonado" se puede retomar (Abandonado debería ser terminal)

- **Endpoint:** `POST /api/progress` (sobre `https://academia-sin-humo.vercel.app`)
- **Tipo:** Bug de máquina de estados (transición prohibida permitida por la API)
- **Severidad sugerida:** Alta — rompe una regla de negocio central del progreso del curso

## Pasos

1. Inscribirse a un curso (`POST /api/enroll` con `courseId`).
2. Abandonar el curso (`POST /api/progress` con `action: "abandonar"`) → debe responder 200.
3. Intentar retomar el mismo curso (`POST /api/progress` con `action: "retomar"`).
4. Observar el status code y el `currentStatus` del body de la respuesta.

## Descripción

Según la regla de negocio, "Abandonado" debería ser un estado **terminal**: una vez que un curso se marca como abandonado, no debería poder volver a "en-progreso" mediante la acción "retomar". Al probarlo, la API acepta la transición prohibida.

## Comportamiento esperado

`POST /api/progress` con `action: "retomar"` sobre un curso en estado "Abandonado" debería **rechazarse** (status distinto de 200, o al menos no debería cambiar `currentStatus` a "en-progreso").

## Comportamiento actual (bug)

La API responde `200` y el body devuelve `currentStatus: "en-progreso"`, es decir, el curso "revive" desde un estado que debería ser terminal.

## Evidencia (prueba automatizada)

```typescript
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
```

Resultado observado al correr `npx playwright test tests/api.spec.ts -g "P-1"`: pasa en chromium y firefox (2 de los 14 tests totales del suite), confirmando que la transición prohibida es aceptada por la API.

## Estado

- [x] Encontrado
- [ ] Corregido
