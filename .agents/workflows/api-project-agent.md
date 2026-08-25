---
description: Inicia o continúa un proyecto Playwright API con plan aprobado,
  evidencia real y máximo 3 intentos.
---

Usa el rol `@api-project-agent` definido en `.agents/agents.md`.

## Entradas obligatorias
- PROYECTO
- OBJETIVO
- FUENTE
- ALCANCE
- COMANDO_OBJETIVO

Si falta una entrada, registra `ENTRADA_FALTANTE` y `ESCALADO`.

## ETAPA 1 — INVENTARIAR, PLANIFICAR Y ESPERAR
1. Usa `construir-proyecto-api` Fase A.
2. Crea o actualiza `reports/api-project-agent-report.md`.
3. Presenta modo INICIAR o CONTINUAR, inventario, faltantes y archivos propuestos.
4. Registra `PLAN_PENDIENTE` y detente.
5. No continúes hasta recibir literalmente `PLAN APROBADO`.
6. Si se solicitan cambios, modifica solo el plan y vuelve a esperar.

## ETAPA 2 — CONSTRUIR Y VERIFICAR, máximo 3 intentos
Para cada intento:
1. Usa `construir-proyecto-api` Fase B o corrección posterior.
2. Usa `verificar-proyecto-api`.
3. Observa rúbrica, exit code y clasificación.
4. Si obtiene 12/12 y exit code 0, registra:
   - `VERIFICACIÓN SUPERADA`
   - `Estado automático: CANDIDATO`
   - `Decisión humana: PENDIENTE`
   y detente.
5. Si la categoría es DEFECTO_DEL_TEST y quedan intentos, registra la evidencia,
   aplica el cambio mínimo y reejecuta.
6. Para cualquier otra categoría, registra `ESCALADO` y detente sin corregir al azar.
7. Después del intento 3 sin cumplir ambas evidencias, registra `ESCALADO`.

## Respuesta final obligatoria
- Modo: INICIAR o CONTINUAR.
- Estado: CANDIDATO o ESCALADO.
- Rúbrica y exit code.
- Clasificación, intentos y rutas modificadas.
- Ruta del reporte.
- Decisión humana: PENDIENTE.
