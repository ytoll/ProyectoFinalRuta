# QA Automation — Academia sin Humo

Suite de pruebas automatizadas sobre [Academia sin Humo](https://playground.calidadsinhumo.com), por
**Yuniet Toll**, construida con Playwright y TypeScript como proyecto final de la Ruta de
Transformación QA Automation con IA de TesteandoYa.

## Qué prueba y por qué

Prioricé las reglas de negocio que, si se rompen, comprometen la integridad académica del producto
sin que nadie lo note fácilmente: que la API valide el prerequisito de un curso igual que la UI
(REQ-C06), que un curso "Abandonado" no pueda revivirse a "En progreso" (REQ-P02/P03), y que la
sesión de un estudiante persista después de loguearse (REQ-S01). A partir de ahí amplié la cobertura
a registro, login, catálogo y cupos, subida de CV, listado de estudiantes y rate limiting de login,
combinando tests de UI, de API y flujos integrados.

## Qué NO prueba

- 3 de las 4 combinaciones de la tabla de decisión de inscripción (REQ-C02): solo confirmé la de
  "prerequisito no completado, con cupo" (por UI y por API); faltan los caminos con cupo agotado y
  con prerequisito completado.
- El cierre de sesión y su efecto sobre el progreso (REQ-S02).
- El módulo de Reserva de fecha (REQ-D01-03) — no llegué a explorarlo en esta entrega.
- Comportamiento del producto bajo carga o uso concurrente (todas las pruebas corren de forma
  secuencial y aislada).
- La causa raíz del bug de sesión — documenté el síntoma observable (`realUser: null` con cookie
  válida), no investigué el código del servidor para saber por qué ocurre.

Detalle completo de alcance y la matriz de riesgo en [`docs/estrategia.md`](docs/estrategia.md).

## Arquitectura

- **Page Object Model** en `pages/`
- **Tests de UI** en `tests/e2e/`, **de API** en `tests/api/`, y **flujos integrados** (UI + API) en
  `tests/integrado/`
- **CI en GitHub Actions**, corriendo en cada push y Pull Request a `main`
  ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml))
- `otros-ejercicios/` queda fuera de la suite a propósito: son hallazgos de otro ejercicio del curso
  y de otro producto (`restful-booker`), no de Academia sin Humo

## Hallazgos

14 bugs documentados contra la especificación, cada uno con REQ citado textualmente, evidencia y un
test automatizado que lo reproduce. 11 de los 14 coinciden con el tablero oficial de hallazgos del
propio Desafío del sitio (`/desafio`), lo que sirve como validación cruzada independiente.

| Bug | REQ | Severidad |
|---|---|---|
| BUG-01 · Password de 65 caracteres se acepta (máximo es 64) | REQ-R04 | Media |
| BUG-02 · Email sin dominio se acepta, solo en Firefox | REQ-R03 | Media |
| BUG-03 · Curso "Abandonado" se puede retomar (API y UI) | REQ-P03 | Alta |
| BUG-04 · La API no valida el prerequisito de un curso | REQ-C06 | Alta |
| BUG-05 · Paginación reporta 2 páginas en vez de 3 | REQ-N02 | Media |
| BUG-06 · Se acepta un CV que no es PDF | REQ-U02 | Media |
| BUG-07 · Se acepta un CV de más de 2 MB | REQ-U03 | Media |
| BUG-08 · La sesión no persiste entre recargas de página | REQ-S01 | Alta |
| BUG-09 · El cupo de un curso no baja al inscribirse | REQ-C04 | Media-Alta |
| BUG-10 · El formulario de registro no se limpia tras el éxito | REQ-R06 | Baja-Media |
| BUG-11 · El login bloquea en el intento 4, no en el 5 | REQ-L03 | Media |
| BUG-12 · El botón se re-habilita ~5s antes de que el timer llegue a 0 | REQ-L03 | Media |
| BUG-13 · Un curso se desbloquea visualmente sin completar el prerequisito | REQ-C03 | Media |
| BUG-14 · Un estudiante se repite entre páginas del listado | REQ-N03 | Media |

Detalle completo (pasos para reproducir, evidencia, comportamiento esperado vs. real) en
[`docs/reporte-de-bugs.md`](docs/reporte-de-bugs.md). Los casos de prueba que sustentan cada
hallazgo, diseñados desde la especificación con 5 técnicas distintas, están en
[`docs/casos-de-prueba.md`](docs/casos-de-prueba.md).

## Cómo correrlo

```bash
npm install
npx playwright install --with-deps
npx playwright test
```

Ver el reporte HTML después de correr:

```bash
npx playwright show-report
```

Correr un archivo puntual, por ejemplo el flujo integrado de sesión:

```bash
npx playwright test tests/integrado/req-s01-sesion.spec.ts
```

**Run de CI de referencia:**
[github.com/ytoll/ProyectoFinalRuta/actions/runs/32898625641](https://github.com/ytoll/ProyectoFinalRuta/actions/runs/32898625641)
— 40 tests (20 casos × 2 navegadores), todos en verde, con el artifact `playwright-report` adjunto.

## Herramientas de IA que construí

- **`@pom-agent`** — genera o corrige Page Objects a partir de evidencia HTML real (no inventa
  selectores), con una rúbrica de verificación 12/12 y ejecución del test objetivo antes de aceptar
  el resultado.
- **`@api-project-agent`** — inicia o continúa proyectos de test de API, con inventario y plan
  aprobado antes de tocar nada, rúbrica de calidad, y clasificación obligatoria de cualquier
  discrepancia (`DEFECTO_DEL_TEST`, `DISCREPANCIA_CONTRATO_PRODUCTO`, `AMBIGÜEDAD_DEL_CONTRATO`,
  `BLOQUEO_DE_ENTORNO`, `ENTRADA_FALTANTE`).
- **Juez con rúbrica** — evalúa los casos de prueba diseñados contra 4 criterios (cobertura,
  claridad, casos límite, trazabilidad al REQ), documentado en la sección final de
  [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md) junto con qué acepté y qué quedó pendiente de
  su evaluación.
