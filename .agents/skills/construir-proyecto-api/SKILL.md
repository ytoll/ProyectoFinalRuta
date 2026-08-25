---
name: construir-proyecto-api
description: Hace el inventario de un proyecto, propone iniciar o continuar automatización API
  y aplica solo el plan aprobado.
---

# Skill: construir o ampliar un proyecto API

## Entradas
- PROYECTO
- OBJETIVO
- FUENTE
- ALCANCE
- COMANDO_OBJETIVO

## Fase A — Inventariar y planificar
1. Lee `package.json`, lenguaje, runner y scripts si existen.
2. Busca `playwright.config.*`, `baseURL`, tests API, Service Objects, fixtures y hooks.
3. Lee FUENTE y separa contrato documentado de muestra observada.
4. Si no existe base utilizable, propone modo `INICIAR`.
5. Si existe, propone modo `CONTINUAR` y conserva sus convenciones.
6. Registra encontrados, faltantes, modo, archivos a tocar y comando.
7. Presenta `PLAN_PENDIENTE` y detente. No modifiques ni instales todavía.

## Fase B — Aplicar solo con `PLAN APROBADO`
1. Respeta ALCANCE y archivos aprobados.
2. En modo INICIAR crea únicamente la estructura mínima aprobada.
3. En modo CONTINUAR reutiliza configuración, scripts y nombres existentes.
4. Usa método, ruta, headers, body, status y schema respaldados por FUENTE.
5. Mantén aserciones en el test.
6. Crea Service Object, fixture o hook solo si reduce repetición demostrada.
7. No leas ni escribas secretos en el repositorio.
8. Entrega la lista exacta de cambios a la skill verificadora.

## Corrección posterior
Corrige solo si la verificación clasifica `DEFECTO_DEL_TEST` y muestra evidencia
concreta. Aplica el cambio mínimo; no amplíes el alcance.
