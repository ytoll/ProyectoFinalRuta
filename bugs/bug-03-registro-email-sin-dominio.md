# Bug #3 — El registro acepta el email `x@` sin dominio (solo en Firefox)

- **Sitio:** `https://academia-sin-humo.vercel.app/registro`
- **Tipo:** Bug de validación de formato (falta validar el dominio del email) — inconsistente entre navegadores
- **Severidad sugerida:** Media

## Pasos

1. Abrir `/registro`.
2. Completar nombre, contraseña y edad con datos válidos.
3. En email, ingresar `x@` (arroba sin dominio).
4. Pulsar "Crear cuenta".
5. Repetir en Chromium y en Firefox para comparar el resultado.

## Descripción

El formulario de registro debería validar que el email tenga un formato completo (usuario + `@` + dominio). Al probar un email roto a propósito, `x@` (arroba sin dominio), el comportamiento **difiere según el navegador**:

- En **Chromium** el registro se rechaza (no aparece el mensaje de éxito) → correcto.
- En **Firefox** el registro se completa con éxito → bug.

Todo indica que el sitio no implementa su propia validación de dominio en el campo email, sino que depende de la validación nativa del `<input type="email">` del navegador. Chromium y Firefox implementan esa validación nativa con reglas distintas para casos límite como `x@`, por eso el mismo input produce resultados distintos.

## Comportamiento esperado

Con el email `x@` (sin dominio), el registro debería **rechazarse en todos los navegadores**, de forma consistente, sin depender de la validación nativa del `<input>`.

## Comportamiento actual (bug)

| Navegador | Resultado |
|---|---|
| Chromium | Rechazado (no aparece `register-success`) — correcto |
| **Firefox** | **Éxito (`register-success` visible) — bug** |

## Evidencia (prueba automatizada)

```typescript
test("R-2: el registro acepta el email 'x@' sin dominio (bug: falta validar el dominio)", async ({ page }) => {
  const registroPage = new RegistroPage(page);
  await registroPage.goto();

  // Email roto a propósito: arroba sin dominio. Debería rechazarse.
  await registroPage.register('Test Tester', 'x@', 'Segura2026!', '25');

  // Doble afirmación, más precisa: hubo éxito Y no hubo error de email.
  await expect(registroPage.successMessage).toBeVisible();
  await expect(registroPage.emailError).toHaveCount(0);
});
```

Resultado observado al correr `npx playwright test tests/ui/registro.spec.ts -g "R-2"` (11/8/2026):

```
1 failed  — chromium: Expect "toBeVisible" getByTestId('register-success') — ui/registro.spec.ts:25 (timeout)
1 passed  — firefox
```

En chromium el test falla porque `register-success` nunca se vuelve visible (el navegador bloquea el envío por validación nativa). En firefox el test pasa, confirmando que ahí sí se cuela el email inválido.

## Nota

Este test queda "flaky" entre proyectos por diseño: falla en chromium (comportamiento correcto) y pasa en firefox (bug real). No se debe "arreglar" el test para que pase en ambos sin antes corregir la app — documentarlo así es intencional como evidencia del bug.

## Estado

- [x] Encontrado
- [ ] Corregido
