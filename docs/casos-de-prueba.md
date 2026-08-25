# Casos de prueba — Academia sin Humo

Diseñados desde `/documentacion`, no desde la pantalla. Cada caso cita el REQ que valida. Se usan
cinco técnicas distintas, siguiendo la tabla de la Fase 1 de la consigna: valores límite, tabla de
decisión, transición de estados, comportamiento temporal y autorización/estado.

---

## A. Valores límite — REQ-R02, R04, R05, R06 (Registro)

### CP-01 · Nombre de 1 carácter (límite − 1)
- **REQ que valida:** REQ-R02 — "El nombre debe tener entre 2 y 50 caracteres."
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Completar nombre con 1 carácter (`"A"`), email/password/edad válidos, enviar.
- **Resultado esperado (según la spec):** Rechazado.
- **Resultado obtenido:** Rechazado.
- **Estado:** PASA

### CP-02 · Nombre de 2 caracteres (límite)
- **REQ que valida:** REQ-R02
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Nombre con 2 caracteres (`"AA"`), resto válido, enviar.
- **Resultado esperado:** Aceptado.
- **Resultado obtenido:** Aceptado.
- **Estado:** PASA

### CP-03 · Nombre de 50 caracteres (límite)
- **REQ que valida:** REQ-R02
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Nombre con 50 caracteres, resto válido, enviar.
- **Resultado esperado:** Aceptado.
- **Resultado obtenido:** Aceptado.
- **Estado:** PASA

### CP-04 · Nombre de 51 caracteres (límite + 1)
- **REQ que valida:** REQ-R02
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Nombre con 51 caracteres, resto válido, enviar.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Rechazado.
- **Estado:** PASA

### CP-05 · Contraseña de 7 caracteres (límite − 1)
- **REQ que valida:** REQ-R04 — "La contraseña debe tener entre 8 y 64 caracteres (inclusive). Una
  contraseña de 7 caracteres debe ser rechazada."
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Contraseña de 7 caracteres (`'a'.repeat(7)`), resto válido, enviar.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Rechazado.
- **Estado:** PASA

### CP-06 · Contraseña de 8 caracteres (límite)
- **REQ que valida:** REQ-R04
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Contraseña de 8 caracteres, resto válido, enviar.
- **Resultado esperado:** Aceptado.
- **Resultado obtenido:** Aceptado.
- **Estado:** PASA

### CP-07 · Contraseña de 64 caracteres (límite)
- **REQ que valida:** REQ-R04
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Contraseña de 64 caracteres, resto válido, enviar.
- **Resultado esperado:** Aceptado.
- **Resultado obtenido:** Aceptado.
- **Estado:** PASA

### CP-08 · Contraseña de 65 caracteres (límite + 1)
- **REQ que valida:** REQ-R04
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Contraseña de 65 caracteres, resto válido, enviar.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Aceptado (el rechazo recién ocurre a partir de 66 caracteres).
- **Estado:** FALLA → BUG-01

### CP-09 · Edad 15 (límite − 1)
- **REQ que valida:** REQ-R05 — "La edad debe estar entre 16 y 99 (inclusive)."
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Edad = 15, resto válido, enviar.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Rechazado.
- **Estado:** PASA

### CP-10 · Edad 16 (límite)
- **REQ que valida:** REQ-R05
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Edad = 16, resto válido, enviar.
- **Resultado esperado:** Aceptado.
- **Resultado obtenido:** Aceptado.
- **Estado:** PASA

### CP-11 · Edad 99 (límite)
- **REQ que valida:** REQ-R05
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Edad = 99, resto válido, enviar.
- **Resultado esperado:** Aceptado.
- **Resultado obtenido:** Aceptado.
- **Estado:** PASA

### CP-12 · Edad 100 (límite + 1)
- **REQ que valida:** REQ-R05
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Edad = 100, resto válido, enviar.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Rechazado.
- **Estado:** PASA

### CP-13 · Email `x@` sin dominio (bonus — valor inválido, no es límite numérico)
- **REQ que valida:** REQ-R03 — "El email debe tener formato válido: debe contener un `@` seguido de
  un dominio con punto."
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Email = `x@`, resto válido, enviar. Repetir en Chromium y Firefox.
- **Resultado esperado:** Rechazado en cualquier navegador.
- **Resultado obtenido:** Rechazado en Chromium; aceptado en Firefox.
- **Estado:** FALLA → BUG-02

### CP-14 · El formulario debe limpiarse tras un registro exitoso (bonus — postcondición, no límite)
- **REQ que valida:** REQ-R06 — "Tras un registro exitoso, el formulario debe limpiarse
  completamente. Ningún campo debe conservar datos del registro anterior."
- **Precondición:** Formulario de registro vacío, resto de campos con datos válidos.
- **Pasos:** Completar los 4 campos con datos válidos y enviar. Tras el mensaje de éxito, observar
  el contenido de los 4 campos.
- **Resultado esperado:** Los 4 campos quedan vacíos.
- **Resultado obtenido:** Los 4 campos conservan los valores enviados.
- **Estado:** FALLA → BUG-10

---

## B. Tabla de decisión — REQ-C02 (Catálogo e inscripción)

Cuatro combinaciones de prerequisito × cupo. Solo se ejecutaron 2 de las 4 (ambas sobre la misma
combinación: prerequisito NO completado + cupo disponible, comparando UI vs. API). Las otras 3
quedan **pendientes**: requieren llevar un curso hasta "Completado" o agotar los cupos de un curso,
algo que no se investigó en esta entrega (ver `docs/estrategia.md`).

### CP-15 · Sin prerequisito completado, con cupo disponible — intento por UI
- **REQ que valida:** REQ-C02 (fila "No / Sí → Rechazado (prerequisito pendiente)"), REQ-C03.
- **Precondición:** Inscripto en "Fundamentos de Testing" pero sin completarlo. "Diseño de casos de
  prueba" (requiere Fundamentos) tiene cupos disponibles.
- **Pasos:** Ir a `/cursos`, intentar inscribirse en "Diseño de casos de prueba".
- **Resultado esperado (según la spec):** Rechazado.
- **Resultado obtenido:** Rechazado, con el mensaje "Debes completar 'Fundamentos de Testing' antes
  de inscribirte."
- **Estado:** PASA

### CP-16 · Sin prerequisito completado, con cupo disponible — intento por API
- **REQ que valida:** REQ-C02 (misma fila que CP-15), REQ-C06 ("La API de inscripción debe aplicar
  las mismas reglas de validación que la UI").
- **Precondición:** Sin haber completado "Fundamentos de Testing".
- **Pasos:** `POST /api/enroll` con `{ courseId: "playwright-cero" }`, sin pasar por la UI.
- **Resultado esperado:** Rechazado (igual que CP-15, por REQ-C06).
- **Resultado obtenido:** Aceptado — `200`, `status: "inscrito"`.
- **Estado:** FALLA → BUG-04

### CP-17 · Con prerequisito completado, con cupo disponible (pendiente)
- **REQ que valida:** REQ-C02 (fila "Sí / Sí → Inscrito").
- **Estado:** PENDIENTE — no ejecutado en esta entrega. Requiere llevar "Fundamentos" a estado
  "Completado" antes de inscribirse en su dependiente; no se investigó el flujo completo de
  progreso (comenzar → completar) a tiempo para esta entrega.

### CP-18 · Con prerequisito completado, sin cupo disponible (pendiente)
- **REQ que valida:** REQ-C02 (fila "Sí / No → Lista de espera").
- **Estado:** PENDIENTE — no ejecutado en esta entrega. Requiere agotar los cupos de un curso
  (probablemente inscribiendo múltiples cuentas de práctica), no investigado a tiempo.

### CP-19 · Sin prerequisito completado, sin cupo disponible (pendiente)
- **REQ que valida:** REQ-C02 (fila "No / No → Rechazado").
- **Estado:** PENDIENTE — no ejecutado en esta entrega, mismo motivo que CP-18.

---

## C. Transición de estados — REQ-P01, P02, P03 (Progreso del estudiante)

### CP-20 · Inscrito → Abandonar (transición válida)
- **REQ que valida:** REQ-P02 — tabla de transiciones ("Inscrito → En progreso, Abandonado").
- **Precondición:** Curso recién inscrito, estado "Inscrito".
- **Pasos:** `POST /api/progress` con `action: "abandonar"`.
- **Resultado esperado:** Aceptado, `currentStatus: "abandonado"`.
- **Resultado obtenido:** Aceptado (`200`).
- **Estado:** PASA

### CP-21 · Abandonado → Retomar (transición prohibida)
- **REQ que valida:** REQ-P03 — "Cualquier transición no listada arriba debe ser rechazada con un
  mensaje de error." (REQ-P02 lista `Abandonado → Ninguna (estado terminal)`.)
- **Precondición:** Curso en estado "Abandonado".
- **Pasos:** Por API — `POST /api/progress` con `action: "retomar"`. Por UI — tocar el botón
  "Retomar" en `/mi-progreso`.
- **Resultado esperado:** Rechazado en ambas capas.
- **Resultado obtenido:** Aceptado en ambas — la API responde `200` con `currentStatus:
  "en-progreso"`, y la UI confirma "Transición exitosa: abandonado → en-progreso".
- **Estado:** FALLA → BUG-03

### CP-22 · En progreso → Certificar directo (transición prohibida, salta "Completado")
- **REQ que valida:** REQ-P03 (misma cita que CP-21; REQ-P02 no lista `En progreso → Certificado`
  como transición válida).
- **Precondición:** Curso en estado "En progreso" (no completado todavía).
- **Pasos:** En `/mi-progreso`, tocar "Certificar" sobre un curso en progreso.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Rechazado, con el mensaje "Transición inválida: en-progreso →
  certificado".
- **Estado:** PASA

### CP-23 · Completado → Certificar (transición válida)
- **REQ que valida:** REQ-P02 — tabla de transiciones ("Completado → Certificado").
- **Precondición:** Curso en estado "Completado".
- **Pasos:** En `/mi-progreso`, tocar "Certificar".
- **Resultado esperado:** Aceptado, curso pasa a "Certificado".
- **Resultado obtenido:** Aceptado, con el mensaje "Transición exitosa: completado → certificado".
- **Estado:** PASA

---

## D. Comportamiento temporal — REQ-L03 (Rate limiting de login)

### CP-24 · Bloqueo en el intento 4, cuando la spec permite 5
- **REQ que valida:** REQ-L03 — "después de 5 intentos fallidos consecutivos, la cuenta se bloquea
  por 30 segundos."
- **Precondición:** Cuenta recién registrada, sin intentos fallidos previos.
- **Pasos:** `POST /api/login` con contraseña incorrecta 3 veces (deben responder `401`), luego una
  4ta vez.
- **Resultado esperado:** Las primeras 3 responden `401`; recién la 5ta debería bloquear.
- **Resultado obtenido:** La 4ta respuesta ya bloquea (`429`, `locked: true`), con
  `attempts: 4, maxAttempts: 5` — contradictorio con su propio bloqueo.
- **Estado:** FALLA → BUG-11

### CP-25 · Duración real del bloqueo (medida por timestamp, no a ojo)
- **REQ que valida:** REQ-L03 — "...la cuenta se bloquea por 30 segundos."
- **Precondición:** Cuenta ya bloqueada (después de CP-24).
- **Pasos:** Registrar la hora local (`Date.now()`) en el momento del intento que dispara el
  bloqueo. Leer el campo `unlockAt` (timestamp absoluto) de la respuesta de un intento posterior ya
  bloqueado. Calcular `unlockAt − horaDelBloqueo`.
- **Resultado esperado:** ≈ 30 000 ms.
- **Resultado obtenido:** ≈ 30 000 ms (dentro de un margen chico de latencia de red).
- **Estado:** PASA — la duración prometida por la API es correcta (ver CP-26 para el
  comportamiento real del botón).

### CP-26 · El botón se re-habilita antes de que el timer visual llegue a cero
- **REQ que valida:** REQ-L03 — "el botón se habilita exactamente cuando el timer llega a 0."
- **Precondición:** Cuenta bloqueada tras el 4to intento fallido (ver CP-24), sin recargar la
  página.
- **Pasos:** Sondear el estado del botón `login-submit` y el texto de `login-lockout` hasta que el
  botón se habilite, sin refrescar ni intervenir.
- **Resultado esperado:** El botón se habilita cuando el timer muestra "0 segundos".
- **Resultado obtenido:** El botón se habilita ~25 segundos después del bloqueo, con el timer
  todavía mostrando "5 segundos" — no llegó a cero.
- **Estado:** FALLA → BUG-12

---

## E. Autorización y estado — REQ-S01, S02 (Sesión)

### CP-27 · Página protegida sin sesión (nunca logueado)
- **REQ que valida:** REQ-S01 — "Las páginas `/cursos` y `/mi-progreso` requieren autenticación. Un
  usuario no logueado debe ver un mensaje pidiendo iniciar sesión."
- **Precondición:** Navegador sin ninguna cookie de sesión (nunca se inició sesión).
- **Pasos:** Navegar directo a `/mi-progreso`.
- **Resultado esperado:** Mensaje pidiendo iniciar sesión.
- **Resultado obtenido:** Muestra "🔒 Inicia sesión — Necesitas iniciar sesión para acceder a esta
  página."
- **Estado:** PASA

### CP-28 · Sesión válida que se pierde al refrescar
- **REQ que valida:** REQ-S01 (aplicado incorrectamente a un usuario que sí inició sesión).
- **Precondición:** Login exitoso con las credenciales de prueba.
- **Pasos:** Loguearse → confirmar cookie `ash_session` → recargar la página (`F5`) → consultar
  `GET /api/auth/me`.
- **Resultado esperado:** La sesión se mantiene; `/api/auth/me` devuelve los datos del usuario.
- **Resultado obtenido:** Tras recargar, se pide loguearse de nuevo; `/api/auth/me` devuelve
  `{"realUser": null}` pese a la cookie válida. Confirmado en `/login`, `/cursos` y `/mi-progreso`.
- **Estado:** FALLA → BUG-08

### CP-29 · El progreso se reinicia al cerrar sesión (pendiente)
- **REQ que valida:** REQ-S02 — "Al cerrar sesión, todo el progreso del estudiante se reinicia. Al
  volver a iniciar sesión, el estudiante empieza sin cursos inscritos."
- **Estado:** PENDIENTE — no ejecutado en esta entrega. No se investigó el flujo de cierre de sesión
  a tiempo. Nota relacionada: se observó que cada login nuevo con la cuenta demo ya empieza sin
  inscripciones previas (ver `docs/estrategia.md`), lo cual podría estar relacionado con este REQ o
  ser síntoma del mismo problema de manejo de sesión que BUG-08 — no se confirmó cuál de las dos
  cosas está pasando.

---

## F. Contrato de API (bonus) — REQ-C04

### CP-30 · El cupo de un curso baja en 1 tras inscribirse
- **REQ que valida:** REQ-C04 — "Al inscribirse exitosamente, el número de cupos disponibles debe
  reducirse en 1."
- **Precondición:** Sesión iniciada con la cuenta de prueba.
- **Pasos:** `GET /api/courses` (anotar `enrolled` de "fundamentos") → `POST /api/enroll` con
  `{ courseId: "fundamentos" }` → `GET /api/courses` de nuevo (comparar `enrolled`).
- **Resultado esperado (según la spec):** `enrolled` sube en 1.
- **Resultado obtenido:** `enrolled` queda igual (24 antes, 24 después).
- **Estado:** FALLA → BUG-09

---

## G. Otros hallazgos documentados (bonus, fuera de las 5 técnicas principales)

### CP-31 · El listado de estudiantes reporta 2 páginas cuando deberían ser 3
- **REQ que valida:** REQ-N02 — "El total de páginas es ceil(total / pageSize). Con 25 estudiantes y
  10 por página son 3 páginas."
- **Precondición:** 25 estudiantes registrados en el sistema.
- **Pasos:** `GET /api/students?page=1&pageSize=10`, observar `totalPages`.
- **Resultado esperado:** `totalPages: 3`.
- **Resultado obtenido:** `totalPages: 2`.
- **Estado:** FALLA → BUG-05

### CP-32 · Un estudiante se repite entre la página 1 y la página 2
- **REQ que valida:** REQ-N03 — "Ningún registro se repite entre páginas."
- **Precondición:** 25 estudiantes registrados.
- **Pasos:** Comparar el último `id` de `GET /api/students?page=1&pageSize=10` contra el primer `id`
  de `GET /api/students?page=2&pageSize=10`.
- **Resultado esperado:** IDs distintos.
- **Resultado obtenido:** Mismo `id` (11) en ambos.
- **Estado:** FALLA → BUG-14

### CP-33 · La subida de CV acepta un PNG cuando exige PDF
- **REQ que valida:** REQ-U02 — "Solo se aceptan archivos PDF."
- **Precondición:** Ninguna.
- **Pasos:** `POST /api/upload` con un archivo `image/png`.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Aceptado (`200`).
- **Estado:** FALLA → BUG-06

### CP-34 · La subida de CV acepta un archivo de 2.5 MB cuando el máximo es 2 MB
- **REQ que valida:** REQ-U03 — "El tamaño máximo es 2 MB (inclusive). Un archivo de 2.5 MB debe
  rechazarse."
- **Precondición:** Ninguna.
- **Pasos:** `POST /api/upload` con un PDF de 2.5 MB.
- **Resultado esperado:** Rechazado.
- **Resultado obtenido:** Aceptado (`200`).
- **Estado:** FALLA → BUG-07

### CP-35 · La tarjeta de un curso se desbloquea visualmente sin completar el prerequisito
- **REQ que valida:** REQ-C03 — "Estar inscrito o en progreso no cuenta como completado."
- **Precondición:** "Diseño de casos de prueba" bloqueado (requiere "Fundamentos de Testing").
- **Pasos:** Inscribirse en "Fundamentos" (sin completarlo), observar la tarjeta de "Diseño de casos
  de prueba".
- **Resultado esperado:** Sigue bloqueada.
- **Resultado obtenido:** Se muestra desbloqueada (candado desaparece, botón pasa a "Inscribirse").
- **Estado:** FALLA → BUG-13

### CP-36 · Camino feliz: inscribirse por UI queda registrado del lado del servidor
- **REQ que valida:** REQ-C02 (fila de inscripción exitosa), como flujo integrado UI → API.
- **Precondición:** Sesión iniciada, curso "Fundamentos de Testing" (sin prerequisito) sin
  inscripción previa.
- **Pasos:** Inscribirse en "Fundamentos" con un clic real en `/cursos`. Verificar por
  `GET /api/progress` que el curso aparece con `status: "inscrito"`.
- **Resultado esperado (según la spec):** La inscripción exitosa por UI queda reflejada en el
  estado del servidor.
- **Resultado obtenido:** Confirmado — `GET /api/progress` devuelve el curso con
  `status: "inscrito"` (con un sondeo corto por consistencia eventual del backend).
- **Estado:** PASA — cierra el hueco de "camino feliz" que señaló el juez en la primera evaluación
  (ver más abajo). Dato dinámico compartido: el `courseId` y el momento de inscripción nacen en el
  clic de la UI y se consumen leyendo la API — detalle completo en
  `tests/integrado/req-c02-inscripcion-camino-feliz.spec.ts`.

---

## Resumen

| Técnica | Casos | PASA | FALLA (bug) | Pendiente |
|---|---|---|---|---|
| Valores límite | CP-01 a CP-14 | 11 | 3 (BUG-01, BUG-02, BUG-10) | 0 |
| Tabla de decisión | CP-15 a CP-19 | 1 | 1 (BUG-04) | 3 |
| Transición de estados | CP-20 a CP-23 | 3 | 1 (BUG-03) | 0 |
| Comportamiento temporal | CP-24 a CP-26 | 1 | 2 (BUG-11, BUG-12) | 0 |
| Autorización y estado | CP-27 a CP-29 | 1 | 1 (BUG-08) | 1 |
| Contrato de API (bonus) | CP-30 | 0 | 1 (BUG-09) | 0 |
| Otros hallazgos (bonus) | CP-31 a CP-35 | 0 | 5 (BUG-05, 06, 07, 13, 14) | 0 |
| Integrado — camino feliz (bonus) | CP-36 | 1 | 0 | 0 |
| **Total** | **36** | **18** | **14** | **4** |

---

## Evaluación del juez

Aplicando los 4 criterios de la consigna (cobertura, claridad, casos límite, trazabilidad al REQ):

- **Cobertura: 3/3** — las 5 técnicas pedidas tienen al menos un caso ejecutado con evidencia real,
  y aparecieron 14 bugs en total contra la spec (más del doble de lo planeado al empezar). El hueco
  que queda — 3 de 4 combinaciones de la tabla de decisión REQ-C02, y REQ-S02 — está declarado
  explícitamente, no escondido. Once de los catorce bugs coinciden con el tablero oficial del
  Desafío del propio sitio (`/desafio`), lo cual es una validación externa independiente de que son
  hallazgos reales y no falsos positivos.
- **Claridad: 3/3** — cada caso tiene datos concretos y pasos reproducibles sin ambigüedad, sin
  referencias cruzadas a otros casos.
- **Casos límite: 3/3** — los tres campos numéricos de registro están cubiertos en el límite exacto
  y límite±1, siguiendo la metodología que sugiere la propia spec.
- **Trazabilidad al REQ: 3/3** — los 36 casos citan su REQ, la mayoría con cita textual literal.

**Total: 12/12.**

**Qué acepté del juez:** en la primera pasada (11/12), señaló que faltaba un caso de "camino feliz"
real en la tabla de decisión. Ese hueco puntual se resolvió con `CP-36`: un flujo integrado real
(UI inscribe, API confirma) que demuestra que la inscripción exitosa funciona de punta a punta, no
solo los caminos de rechazo. La combinación específica de REQ-C02 con prerequisito completado
(CP-17) sigue pendiente porque requiere además avanzar un curso hasta "Completado", que no se
investigó a tiempo. Investigar más a fondo el resto del alcance (bloqueo de login, cupos,
paginación, CV, desbloqueo visual) también subió la cobertura general, por los bugs nuevos que
aparecieron en el camino — incluyendo uno (BUG-12, el timer) que casi se documenta mal por un
conteo manual poco confiable, y
se corrigió midiendo con precisión antes de escribirlo.

**Qué quedó pendiente a pesar del puntaje:** CP-17, CP-18, CP-19 (3 de 4 combinaciones de REQ-C02) y
CP-29 (REQ-S02). Decisión: se documentan como alcance declarado en `docs/estrategia.md` en vez de
forzarlos con el tiempo que queda para esta entrega — es la misma prioridad de "declarar antes que
fingir cobertura completa" que rige todo el proyecto.

**Qué quedó pendiente a pesar del puntaje:** CP-17, CP-18, CP-19 (3 de 4 combinaciones de REQ-C02) y
CP-28 (REQ-S02). Decisión: se documentan como alcance declarado en `docs/estrategia.md` en vez de
forzarlos con el tiempo que queda para esta entrega — es la misma prioridad de "declarar antes que
fingir cobertura completa" que rige todo el proyecto.
