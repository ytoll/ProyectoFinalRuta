# Bug #1 — Clave `baseURL` duplicada en `playwright.config.ts`

- **Archivo:** `playwright.config.ts`, dentro del bloque `use: {}`
- **Tipo:** Bug de configuración (clave duplicada en objeto JS/TS)
- **Severidad sugerida:** Baja/Media

## Pasos

1. Abrir `playwright.config.ts`.
2. Ir al bloque `use: {}`.
3. Observar que la clave `baseURL` está declarada dos veces.
4. Correr `npx tsc --noEmit` para confirmar que el compilador lo marca como error.

## Código original (con el bug)

```ts
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  baseURL: "https://academia-sin-humo.vercel.app",

  trace: 'on-first-retry',
  actionTimeout: 10_000,
  navigationTimeout: 15_000,
},
```

## Descripción

El objeto `use` tenía la propiedad `baseURL` declarada dos veces. En JavaScript/TypeScript esto no genera error de compilación, pero es un anti-patrón: la última declaración sobrescribe silenciosamente a la anterior sin ningún aviso.

## Comportamiento esperado

Solo debería existir una declaración de `baseURL`, apuntando a `https://academia-sin-humo.vercel.app`.

## Comportamiento actual (antes del fix)

Funcionalmente los tests sí usaban la URL correcta (la segunda línea ganaba), pero el archivo quedaba con código muerto/confuso. Cualquier linter con la regla `no-dupe-keys` (ESLint) lo marcaría como error, y alguien editando después podría modificar la línea equivocada pensando que tiene efecto.

## Evidencia (captura por terminal)

Diagnóstico del editor (TypeScript Language Server):

```
playwright.config.ts
  Line 28, Col 5 — error TS1117: An object literal cannot have multiple properties with the same name.
```

Salida de `npx tsc --noEmit` (línea relevante):

```
playwright.config.ts(28,5): error TS1117: An object literal cannot have multiple properties with the same name.
```

## Corrección aplicada

```ts
use: {
  baseURL: "https://academia-sin-humo.vercel.app",

  trace: 'on-first-retry',
  actionTimeout: 10_000,
  navigationTimeout: 15_000,
},
```

## Estado

- [x] Encontrado
- [x] Corregido
