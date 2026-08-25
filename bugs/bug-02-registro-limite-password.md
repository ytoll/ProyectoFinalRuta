# Bug #2 — El registro acepta una contraseña de 65 caracteres (el máximo debería ser 64)

- **Sitio:** `https://playground.calidadsinhumo.com/registro`
- **Tipo:** Bug de validación de límite (off-by-one / valores límite)
- **Severidad sugerida:** Media

## Pasos

1. Abrir `/registro`.
2. Completar nombre y email con datos válidos.
3. En contraseña, ingresar 65 caracteres (ej. la letra `'a'` x65).
4. Completar edad con un dato válido.
5. Pulsar "Crear cuenta".

## Descripción

El formulario de registro dice validar que la contraseña tenga como máximo 64 caracteres. Al probar el valor límite exacto (65 caracteres, es decir límite + 1), el registro se completa con éxito en lugar de rechazarse. El rechazo solo ocurre a partir de 66 caracteres.

Esto sugiere que la validación compara con `> 65` en vez de `> 64`, dejando pasar silenciosamente el caso límite inmediato al máximo permitido.

## Comportamiento esperado

Con una contraseña de 65 caracteres (máximo + 1), el registro debería **rechazarse** con el mensaje "La contraseña no puede tener más de 64 caracteres".

## Comportamiento actual (bug)

| Longitud de contraseña | Resultado |
|---|---|
| 64 caracteres | Éxito (correcto) |
| **65 caracteres** | **Éxito (incorrecto — debería rechazar)** |
| 66 caracteres | Rechazado: "La contraseña no puede tener más de 64 caracteres" |
| 70 caracteres | Rechazado (mismo mensaje) |

## Por qué no se detecta probando a mano

Al escribir la contraseña manualmente en el navegador es fácil no contar exactamente cuántos caracteres se están ingresando. Si se prueba con una contraseña "bien larga" (66+), el sistema rechaza correctamente y parece no haber bug. El error solo se revela probando el valor límite exacto (65), lo cual requiere una prueba automatizada que controle el número de caracteres con precisión (ej. `'a'.repeat(65)`).

## Evidencia (prueba automatizada)

```typescript
test("R-1: el registro acepta un password de 65 caracteres (bug: el máximo es 64)", async ({ page }) => {
  await page.goto("/registro");

  await page.getByTestId("register-name").fill("Test Tester");
  await page.getByTestId("register-email").fill("r1-65@ejemplo.com");
  // 65 caracteres exactos: justo uno más que el máximo permitido.
  await page.getByTestId("register-password").fill("a".repeat(65));
  await page.getByTestId("register-age").fill("25");
  await page.getByTestId("register-submit").click();

  // Dejamos constancia del bug: con 65 caracteres aparece el éxito
  // cuando la regla (máx 64) exige que se rechace.
  await expect(page.getByTestId("register-success")).toBeVisible();
});
```

Resultado observado al probar 64 / 65 / 66 / 70 caracteres contra el sitio real:

```
--- len requested=64, actual filled length=64 ---
success visible: true
--- len requested=65, actual filled length=65 ---
success visible: true          <-- BUG: debería ser false
--- len requested=66, actual filled length=66 ---
success visible: false
relevant text lines: La contraseña no puede tener más de 64 caracteres
--- len requested=70, actual filled length=70 ---
success visible: false
relevant text lines: La contraseña no puede tener más de 64 caracteres
```

## Estado

- [x] Encontrado
- [ ] Corregido
