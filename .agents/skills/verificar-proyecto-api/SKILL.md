---
name: verificar-proyecto-api
description: Aplica una rúbrica de proyecto API, ejecuta el comando aprobado y
  clasifica cada fallo sin construir ni fabricar verde.
---

# Skill: verificar proyecto API

## Entradas
- Plan aprobado y modo.
- FUENTE, ALCANCE y COMANDO_OBJETIVO.
- Archivos modificados.
- Número de intento.

## Reglas
- No edites archivos de implementación.
- No aceptes solo una explicación: ejecuta cuando el entorno lo permita.
- Registra evidencia completa y legible.

## Rúbrica 12/12
1. Runner y lenguaje reconocidos.
2. Comando objetivo explícito.
3. `baseURL` sin duplicación.
4. Método y ruta respaldados.
5. Body y headers respaldados.
6. Status respaldado.
7. Aserciones visibles en el test.
8. Datos dinámicos no fijados.
9. Autenticación no inventada.
10. Sin secretos versionados.
11. Convenciones existentes conservadas.
12. Cambios y evidencia trazados.

Solo 12/12 significa `CALIDAD COMPLETA`.

## Verificación ejecutable
1. Ejecuta exactamente COMANDO_OBJETIVO.
2. Registra comando, intento, duración, exit code, aprobados, fallidos y error relevante.
3. Un exit code distinto de 0 no autoriza a debilitar assertions.

## Clasificación obligatoria
- DEFECTO_DEL_TEST: el código contradice la fuente o usa mal Playwright.
- DISCREPANCIA_CONTRATO_PRODUCTO: test y fuente coinciden, producto responde distinto.
- AMBIGÜEDAD_DEL_CONTRATO: la fuente no permite una expectativa segura.
- BLOQUEO_DE_ENTORNO: red, servicio, runner o dependencia impiden demostrar.
- ENTRADA_FALTANTE: falta información necesaria y continuar exigiría inventar.

## Salida
Actualiza `reports/api-project-agent-report.md` con inventario, plan, rúbrica,
ejecución, clasificación, archivos modificados y estado reservado para el Workflow.
