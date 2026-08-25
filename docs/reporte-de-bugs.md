# Reporte de bugs — Academia sin Humo

Cada hallazgo documentado acá es una discrepancia comprobada entre el comportamiento real del
producto (`https://academia-sin-humo.vercel.app` / `https://playground.calidadsinhumo.com`) y lo
que exige `/documentacion`. Ninguno fue "arreglado en el test para que dé verde": donde el resultado
no coincide con la spec, se documenta y se clasifica como bug.

---

### BUG-01 · El registro acepta una contraseña de 65 caracteres (máximo debería ser 64)

- **REQ violado:** REQ-R04 — "La contraseña debe tener entre 8 y 64 caracteres (inclusive)."
- **Comportamiento esperado:** Una contraseña de 65 caracteres (límite + 1) debe rechazarse con el
  mensaje "La contraseña no puede tener más de 64 caracteres".
- **Comportamiento real:** El registro se completa con éxito con 65 caracteres. El rechazo recién
  ocurre a partir de 66 caracteres, lo que sugiere que la validación compara con `> 65` en vez de
  `> 64` (error de límite / off-by-one).
- **Pasos para reproducir:**
  1. Abrir `/registro`.
  2. Completar nombre y email con datos válidos.
  3. En contraseña, ingresar exactamente 65 caracteres (ej. `'a'.repeat(65)`).
  4. Completar edad con un dato válido.
  5. Pulsar "Crear cuenta".
  6. Observar que aparece el mensaje de éxito en vez de un rechazo.
- **Evidencia:**
  - Test automatizado: `tests/e2e/registro.spec.ts` → `R-1: el registro acepta un password de 65
    caracteres (bug: el máximo es 64)`.
  - Resultado observado probando 64 / 65 / 66 / 70 caracteres contra el sitio real:
    ```
    --- len=64 --- success visible: true   (correcto)
    --- len=65 --- success visible: true   <-- BUG: debería ser false
    --- len=66 --- success visible: false  "La contraseña no puede tener más de 64 caracteres"
    --- len=70 --- success visible: false  (mismo mensaje)
    ```
  - No se detecta probando a mano: solo se revela controlando el largo exacto con una prueba
    automatizada.
- **Severidad y por qué:** Media. Es un error de validación de límite que no bloquea el flujo
  principal del producto, pero permite crear cuentas con contraseñas fuera de la política declarada
  — relevante si en algún momento se ajustan restricciones de seguridad de contraseña.
- **Capa donde se detecta:** UI.

---

### BUG-02 · El registro acepta el email `x@` sin dominio, pero solo en Firefox

- **REQ violado:** REQ-R03 — "El email debe tener formato válido: debe contener un `@` seguido de un
  dominio con punto"
- **Comportamiento esperado:** El email `x@` (arroba sin dominio) debe rechazarse de forma
  consistente, en cualquier navegador.
- **Comportamiento real:** El comportamiento depende del navegador:
  - En **Chromium** el registro se rechaza (no aparece el mensaje de éxito) → correcto.
  - En **Firefox** el registro se completa con éxito → bug.
  Todo indica que el sitio no implementa su propia validación de dominio, sino que depende de la
  validación nativa del `<input type="email">`, que Chromium y Firefox implementan con reglas
  distintas para casos límite como `x@`.
- **Pasos para reproducir:**
  1. Abrir `/registro`.
  2. Completar nombre, contraseña y edad con datos válidos.
  3. En email, ingresar `x@`.
  4. Pulsar "Crear cuenta".
  5. Repetir en Chromium y en Firefox y comparar el resultado.
- **Evidencia:**
  - Test automatizado: `tests/e2e/registro.spec.ts` → `R-2: el registro acepta el email 'x@' sin
    dominio (bug: falta validar el dominio)`.
  - Resultado de correr el test contra ambos navegadores:
    ```
    1 failed — chromium: Expect "toBeVisible" getByTestId('register-success') (timeout)
    1 passed — firefox
    ```
    En Chromium el test "falla" porque el navegador bloquea el envío (comportamiento correcto). En
    Firefox el test "pasa" porque el email inválido se cuela (comportamiento incorrecto). El test
    queda intencionalmente inconsistente entre proyectos como evidencia del bug — no se homologó
    para que diera verde en los dos.
- **Severidad y por qué:** Media. Es una inconsistencia entre navegadores que compromete la
  integridad de los datos de registro para una porción real de usuarios (los que usan Firefox), sin
  bloquear el resto del producto.
- **Capa donde se detecta:** UI.

---

### BUG-03 · Un curso "Abandonado" se puede retomar (transición prohibida aceptada por la API)

- **REQ violado:** REQ-P03 — "Cualquier transición no listada arriba debe ser rechazada con un
  mensaje de error." (La tabla de REQ-P02 lista explícitamente `Abandonado → Ninguna (estado
  terminal)`: no hay ninguna transición permitida desde "Abandonado", "retomar" incluido.)
- **Comportamiento esperado:** `POST /api/progress` con `action: "retomar"` sobre un curso en estado
  "Abandonado" debe rechazarse (status distinto de 200, o al menos no debe cambiar `currentStatus`).
- **Comportamiento real:** La API responde `200` y el body devuelve `currentStatus: "en-progreso"` —
  el curso "revive" desde un estado que la spec define como terminal. El bug no está solo en la API:
  en `/mi-progreso`, la propia UI **muestra el botón "Retomar" habilitado** sobre un curso abandonado
  (cuando no debería ofrecerlo en absoluto), y al presionarlo confirma explícitamente el mensaje
  "Transición exitosa: abandonado → en-progreso".
- **Pasos para reproducir:**
  - Por API: 1) Inscribirse a un curso: `POST /api/enroll` con `{ courseId: "fundamentos" }`. 2)
    Abandonarlo: `POST /api/progress` con `{ courseId: "fundamentos", action: "abandonar" }` →
    responde 200 (transición válida). 3) Intentar retomarlo: `POST /api/progress` con
    `{ courseId: "fundamentos", action: "retomar" }`. 4) Observar el status code y el `currentStatus`
    del body.
  - Por UI: 1) Con un curso en estado "Abandonado" en `/mi-progreso`, observar que el botón
    "Retomar" aparece habilitado. 2) Presionarlo. 3) Observar el mensaje de confirmación.
- **Evidencia:**
  - Test automatizado: `tests/api/progress.spec.ts` → `P-1: un curso Abandonado se puede retomar
    (bug: Abandonado es terminal)`. La API responde `200` con `currentStatus: "en-progreso"` en vez
    de rechazar la transición.
  - Test automatizado de UI: `tests/integrado/req-p02-abandonado-retomar-ui.spec.ts` →
    `PU-1: la UI ofrece 'Retomar' sobre un curso Abandonado y lo revive a 'en-progreso' (bug)`.
    Reproducido primero a mano en `/mi-progreso` (el botón "Retomar" está disponible sobre un curso
    abandonado, y al presionarlo la propia UI confirma "Transición exitosa: abandonado →
    en-progreso"), y luego automatizado navegando por los links reales de la app (nunca
    `page.goto`, porque una navegación completa dispara BUG-08 y cierra la sesión). Corrido 3 veces
    seguidas contra el sitio real, mismo resultado las 3. A diferencia de REQ-C06 (donde la UI sí
    bloqueaba bien y solo la API fallaba), acá el bug existe en las dos capas por igual.
- **Severidad y por qué:** Alta. Rompe la máquina de estados central del progreso del estudiante —
  compromete la confiabilidad de certificados y reportes basados en el estado del curso. Al estar
  también en la UI (no solo en la API), cualquier estudiante puede activarlo sin saber programación,
  con un solo clic.
- **Capa donde se detecta:** Integrado (API + UI).

---

### BUG-04 · La API de inscripción no valida el prerequisito (incumple REQ-C06)

- **REQ violado:** REQ-C06 — "La API de inscripción debe aplicar las mismas reglas de validación que
  la UI." (Ver también REQ-A02: "La API debe validar: que el curso exista, que haya cupos, y que el
  prerequisito esté completado.")
- **Comportamiento esperado:** `POST /api/enroll` con `courseId: "playwright-cero"` (que requiere
  "fundamentos" como prerequisito) sin haberlo completado debe **rechazarse**.
- **Comportamiento real:** La API responde `200` y el body devuelve `status: "inscrito"` — la
  inscripción se concreta igual, sin validar el prerequisito del lado del servidor. La UI sí respeta
  esta regla (no deja inscribirse sin el prerequisito); la API se puede saltear pegándole
  directamente al endpoint.
- **Pasos para reproducir:**
  1. Sin haber completado el curso "fundamentos" (prerequisito de "playwright-cero").
  2. Llamar directo a `POST /api/enroll` con `{ courseId: "playwright-cero" }`, sin pasar por la UI.
  3. Observar el status code y el body de la respuesta.
- **Evidencia:**
  - Test automatizado: `tests/integrado/req-c06-prerequisito.spec.ts` → `I-1: la API inscribe a un
    curso con prerequisito sin cumplirlo (bug: no valida server-side)`.
  - La API responde `200` con `status: "inscrito"` en vez de rechazar la inscripción.
- **Severidad y por qué:** Alta. Es la "regla estrella" de la spec (REQ-C06): si la API no aplica las
  mismas reglas que la UI, cualquier cliente que hable directo con la API puede saltearse
  restricciones de negocio centrales del catálogo.
- **Capa donde se detecta:** API — pendiente de ampliar a **integrado** en `tests/integrado/`
  agregando la verificación por `GET /api/courses` (o por UI) del estado del catálogo después de la
  inscripción colada, tal como pide la Fase 4 de la consigna.

---

### BUG-05 · El listado de estudiantes reporta 2 páginas cuando deberían ser 3

- **REQ violado:** REQ-N02 — "El total de páginas es ceil(total / pageSize). Con 25 estudiantes y 10
  por página son 3 páginas; ningún estudiante debe quedar inalcanzable."
- **Comportamiento esperado:** Con `total: 25` y `pageSize: 10`, `totalPages` debe ser `3`
  (`Math.ceil(25 / 10)`), de forma que los estudiantes 21-25 sean alcanzables en la página 3.
- **Comportamiento real:** La API responde `totalPages: 2`, lo que sugiere que usa `Math.floor` en
  vez de `Math.ceil` (`25 / 10 = 2.5` → `floor` da 2, `ceil` da 3). Los últimos 5 estudiantes quedan
  inalcanzables por paginación.
- **Pasos para reproducir:**
  1. Llamar a `GET /api/students?page=1&pageSize=10`.
  2. Confirmar que `total` es `25`.
  3. Observar el valor de `totalPages` en la respuesta.
- **Evidencia:**
  - Test automatizado: `tests/api/estudiantes.spec.ts` → `N-1: la API reporta 2 páginas con 25
    estudiantes (bug: deberían ser 3)`.
  - La API responde `totalPages: 2` en vez de `3`.
- **Severidad y por qué:** Media. No rompe el producto, pero deja estudiantes reales inaccesibles
  desde el listado paginado — un problema de integridad de datos visibles, no de seguridad.
- **Capa donde se detecta:** API.

---

### BUG-06 · La subida de CV acepta un PNG cuando la spec exige PDF

- **REQ violado:** REQ-U02 — "Solo se aceptan archivos PDF. Cualquier otro tipo (imagen, texto, etc.)
  debe ser rechazado."
- **Comportamiento esperado:** Subir un archivo `.png` como CV debe rechazarse.
- **Comportamiento real:** La API responde `200` (éxito) al subir un PNG como si fuera un CV válido —
  no valida el tipo de archivo del lado del servidor.
- **Pasos para reproducir:**
  1. Llamar a `POST /api/upload` con un archivo `multipart` de `mimeType: "image/png"`.
  2. Observar el status code de la respuesta.
- **Evidencia:**
  - Test automatizado: `tests/api/upload.spec.ts` → `U-1: la API acepta un PNG cuando la regla exige
    PDF (bug: no valida el tipo)`.
  - La API responde `200` en vez de rechazar el archivo.
- **Severidad y por qué:** Media. Es una falta de validación server-side de tipo de archivo — el
  frontend podría estar filtrando en el `<input>`, pero la API no lo exige, por lo que cualquier
  cliente que hable directo con el endpoint puede subir contenido no válido como CV.
- **Capa donde se detecta:** API.

---

### BUG-07 · La subida de CV acepta un archivo de 2.5 MB cuando el máximo es 2 MB

- **REQ violado:** REQ-U03 — "El tamaño máximo es 2 MB (inclusive). Un archivo de 2.5 MB debe
  rechazarse."
- **Comportamiento esperado:** Un PDF de 2.5 MB debe rechazarse por exceder el máximo.
- **Comportamiento real:** La API responde `200` (éxito). El cálculo probablemente usa
  `Math.floor(2.5) = 2` para comparar contra el máximo de 2, y como `2 > 2` es falso, el archivo pasa
  la validación.
- **Pasos para reproducir:**
  1. Llamar a `POST /api/upload` con un archivo PDF de exactamente 2.5 MB.
  2. Observar el status code de la respuesta.
- **Evidencia:**
  - Test automatizado: `tests/api/upload.spec.ts` → `U-2: la API acepta un archivo de 2.5 MB cuando
    el máximo es 2 (bug: redondea para abajo)`.
  - La API responde `200` en vez de rechazar el archivo.
- **Severidad y por qué:** Media. Mismo tipo de error de límite que BUG-01 (off-by-one / redondeo),
  aplicado al tamaño de archivo en vez de a un campo de texto.
- **Capa donde se detecta:** API.

---

### BUG-08 · La sesión no persiste entre recargas — `/api/auth/me` no reconoce la cookie `ash_session`

- **REQ violado:** REQ-S01 — "Un usuario no logueado debe ver un mensaje pidiendo iniciar sesión."
  (aplicado incorrectamente a un usuario que **sí** inició sesión — ver mecanismo abajo).
- **Comportamiento esperado:** Tras un login exitoso, la sesión debe mantenerse activa entre
  recargas de página; `GET /api/auth/me` debe devolver los datos del usuario mientras la cookie
  `ash_session` sea válida.
- **Comportamiento real:** `POST /api/login` crea correctamente la cookie `ash_session` (`HttpOnly`,
  `SameSite=lax`, expira en 4hs), pero `GET /api/auth/me` con esa misma cookie devuelve
  `{"realUser": null}`. Al recargar la página, el frontend interpreta esto como "no logueado" y
  vuelve a pedir el login — pese a que la cookie de sesión sigue presente y vigente.
- **Pasos para reproducir:**
  1. Ir a `/login` e iniciar sesión con las credenciales de prueba (`ana.garcia@ejemplo.com` /
     `Segura2026!`).
  2. Confirmar en DevTools (pestaña Network → respuesta de `login`) que llega el header
     `Set-Cookie: ash_session=...`.
  3. Confirmar en DevTools → Application → Cookies que `ash_session` quedó guardada.
  4. Recargar la página (`F5`).
  5. Observar que la aplicación vuelve a pedir inicio de sesión, pese a que la cookie sigue ahí.
  6. Navegar directo a `/api/auth/me` (con la cookie todavía presente) y observar la respuesta.
- **Evidencia:**
  - `curl` — `POST /api/login` responde `200` con `Set-Cookie: ash_session=...`.
  - `curl` reusando esa cookie — `GET /api/auth/me` responde `200` con body `{"realUser": null}`.
  - Reproducción manual en navegador: tras login exitoso se ve el nombre y mensaje de bienvenida;
    tras `F5`, la aplicación pide loguearse de nuevo; el inspector muestra `{"realUser": null}` en
    ese momento, con la cookie de sesión todavía presente.
- **Severidad y por qué:** Alta. Invalida la utilidad práctica de iniciar sesión: cualquier flujo que
  dependa de sesión persistente (progreso, catálogo con estado, páginas protegidas de REQ-S01) queda
  roto en cuanto el usuario recarga la página.
- **Capa donde se detecta:** Integrado (API + UI).

---

### BUG-09 · El cupo de un curso no baja al inscribirse

- **REQ violado:** REQ-C04 — "Al inscribirse exitosamente, el número de cupos disponibles debe
  reducirse en 1."
- **Comportamiento esperado:** Tras inscribirse en "Fundamentos de Testing", el campo `enrolled` de
  ese curso (en `GET /api/courses`) debe aumentar en 1, reduciendo los cupos disponibles.
- **Comportamiento real:** `enrolled` queda exactamente igual antes y después de una inscripción
  exitosa. Confirmado con `fundamentos`: `enrolled: 24` antes de inscribirse, y `enrolled: 24` de
  nuevo después (con `maxStudents: 30`), pese a que `POST /api/enroll` respondió `200` con
  `status: "inscrito"`.
- **Pasos para reproducir:**
  1. `GET /api/courses` y anotar el `enrolled` de `fundamentos`.
  2. `POST /api/enroll` con `{ courseId: "fundamentos" }` → responde `200`.
  3. `GET /api/courses` de nuevo y comparar el `enrolled` del mismo curso.
- **Evidencia:**
  - `curl`: `enrolled: 24` antes y después de una inscripción exitosa.
  - Test automatizado: `tests/api/courses.spec.ts` → `REQ-C04: el cupo de un curso debe bajar en 1
    tras inscribirse (bug: no baja)`.
- **Severidad y por qué:** Media-Alta. No bloquea el flujo del estudiante, pero rompe la integridad
  del dato de cupos disponibles: el catálogo puede seguir mostrando lugares libres en un curso que ya
  está lleno, permitiendo sobre-inscripción sin límite real.
- **Capa donde se detecta:** API.

---

### BUG-10 · El formulario de registro no se limpia tras un registro exitoso

- **REQ violado:** REQ-R06 — "Tras un registro exitoso, el formulario debe limpiarse completamente.
  Ningún campo debe conservar datos del registro anterior."
- **Comportamiento esperado:** Tras el mensaje de éxito, los campos nombre, email, contraseña y edad
  deben quedar vacíos.
- **Comportamiento real:** Los cuatro campos conservan exactamente los valores que se acaban de
  enviar.
- **Pasos para reproducir:**
  1. Ir a `/registro` y completar los cuatro campos con datos válidos.
  2. Enviar el formulario y confirmar que aparece el mensaje de éxito.
  3. Observar el contenido de los campos: siguen con los datos enviados.
- **Evidencia:**
  - Test automatizado: `tests/e2e/registro.spec.ts` → `R-3: tras un registro exitoso, el formulario
    NO se limpia (bug: conserva los datos)`.
- **Severidad y por qué:** Baja-Media. No bloquea ningún flujo, pero es una mala señal de UX (un
  registro accidental duplicado es más probable si el usuario no ve el formulario vacío) y es un
  REQ explícito incumplido.
- **Capa donde se detecta:** UI.

---

### BUG-11 · La cuenta se bloquea en el 4to intento fallido, no en el 5to

- **REQ violado:** REQ-L03 — "después de 5 intentos fallidos consecutivos, la cuenta se bloquea por
  30 segundos."
- **Comportamiento esperado:** El bloqueo debe activarse recién después del 5to intento fallido
  consecutivo — es decir, se permiten 5 intentos antes de bloquear.
- **Comportamiento real:** La API bloquea la cuenta en el 4to intento fallido. La propia respuesta
  de la API es contradictoria: dice `"attempts":4,"maxAttempts":5"` pero ya devuelve `423`/`429` con
  `locked:true` en ese momento, un intento antes de agotar los 5 permitidos.
- **Pasos para reproducir:**
  1. Registrar una cuenta nueva.
  2. Llamar 3 veces a `POST /api/login` con la contraseña incorrecta → las 3 responden `401`.
  3. Llamar una 4ta vez con la contraseña incorrecta.
  4. Observar que la 4ta respuesta ya es `429` con `locked: true`.
- **Evidencia:**
  - Test automatizado: `tests/api/login-lockout.spec.ts` → `L-1: la cuenta se bloquea en el intento
    4, no en el 5 (bug: uno antes de lo esperado)`.
  - Nota aparte: se verificó por separado que la **duración** del bloqueo sí es correcta (30
    segundos exactos, medido comparando el timestamp `unlockAt` que devuelve la API contra la hora
    del intento que disparó el bloqueo, sin necesidad de esperar el tiempo real) — test `L-2` en el
    mismo archivo. El bug es únicamente el conteo de intentos, no la duración.
- **Severidad y por qué:** Media. Un estudiante legítimo que se equivoca 4 veces (algo común
  tipeando una contraseña) pierde el intento que la spec le prometía, y queda bloqueado un intento
  antes de lo documentado.
- **Capa donde se detecta:** API.

---

### BUG-12 · El botón de login se re-habilita ~5 segundos antes de que el timer llegue a cero

- **REQ violado:** REQ-L03 — "el botón se habilita exactamente cuando el timer llega a 0."
- **Comportamiento esperado:** El botón "Iniciar sesión" debe permanecer deshabilitado hasta que el
  timer visual muestre "0 segundos", y habilitarse en ese momento exacto.
- **Comportamiento real:** El botón se re-habilita (`disabled: false`) mientras el timer visual
  todavía muestra segundos restantes — medido en múltiples corridas alrededor de los ~25 segundos
  desde el bloqueo, con el timer mostrando "5 segundos" en ese instante. La lógica que decide cuándo
  habilitar el botón parece estar desincronizada de la lógica que calcula el texto del timer (o del
  `unlockAt` real que devuelve la API, que si promete 30 segundos completos — ver BUG-11).
- **Pasos para reproducir:**
  1. Disparar el bloqueo (4 intentos fallidos de login, ver BUG-11).
  2. Observar en pantalla el texto de `login-lockout` y el estado del botón `login-submit` a medida
     que pasa el tiempo, sin recargar la página.
  3. Notar que el botón pasa a habilitado mientras el texto todavía dice "5 segundos" (no "0").
- **Evidencia:**
  - Test automatizado: `tests/e2e/login-lockout-timer.spec.ts` → `L-3: el botón se re-habilita ~5
    segundos antes de que el timer llegue a cero (bug)`. Sondea el estado del botón con
    `expect.poll` (sin esperas fijas) y captura el texto del timer en el instante exacto de la
    habilitación.
  - Reproducción manual observando la corrida del test con el navegador visible
    (`headless: false`): confirmado a ojo antes de escribir el test automatizado.
- **Severidad y por qué:** Media. Es una inconsistencia entre dos partes de la misma feature (el
  texto del timer y el estado real del botón) — no compromete seguridad, pero rompe la confianza del
  usuario en lo que el propio timer le está mostrando.
- **Capa donde se detecta:** UI.

---

### BUG-13 · La tarjeta de un curso se muestra desbloqueada apenas te inscribís en el prerequisito, sin completarlo

- **REQ violado:** REQ-C03 — "Un curso solo se desbloquea cuando el estudiante ha completado su
  prerequisito. Estar inscrito o en progreso no cuenta como completado."
- **Comportamiento esperado:** "Diseño de casos de prueba" (requiere "Fundamentos de Testing") debe
  seguir mostrándose bloqueado mientras "Fundamentos" no esté en estado "Completado".
- **Comportamiento real:** Apenas el estudiante se inscribe en "Fundamentos" (queda "Inscrito", no
  "Completado"), la tarjeta de "Diseño de casos de prueba" pasa a mostrarse desbloqueada: desaparece
  el candado y el botón cambia de "Bloqueado" a "Inscribirse". Es un bug puramente visual: si se
  toca ese botón, la inscripción real sí se rechaza correctamente (ver CP-15, REQ-C02) — la tarjeta
  está mostrando un estado que no es cierto.
- **Pasos para reproducir:**
  1. Loguearse con la cuenta de prueba e ir a `/cursos`.
  2. Confirmar que "Diseño de casos de prueba" está bloqueado (candado visible, botón "Bloqueado").
  3. Inscribirse en "Fundamentos de Testing" (sin completarlo).
  4. Observar que "Diseño de casos de prueba" ya se muestra desbloqueado.
- **Evidencia:**
  - Test automatizado: `tests/integrado/req-c03-desbloqueo-visual.spec.ts` → `V-1: 'Diseño de casos'
    se muestra desbloqueado apenas te inscribís en Fundamentos, sin completarlo (bug)`.
  - Este hallazgo también está catalogado en el propio Desafío del sitio (`/desafio`, código `I-4`),
    confirmando que es un bug conocido e intencional del playground.
- **Severidad y por qué:** Media. No permite saltear la regla de negocio real (la inscripción sigue
  rechazándose), pero engaña al estudiante mostrándole una opción que en realidad no está disponible.
- **Capa donde se detecta:** UI.

---

### BUG-14 · Un estudiante aparece duplicado entre dos páginas del listado

- **REQ violado:** REQ-N03 — "Cada página muestra exactamente pageSize registros distintos. La
  página 1 empieza en el primer registro y ningún registro se repite entre páginas."
- **Comportamiento esperado:** El último estudiante de la página 1 y el primero de la página 2 deben
  ser registros distintos.
- **Comportamiento real:** El estudiante con `id: 11` ("Karen Ávila") aparece como el último
  registro de la página 1 y también como el primero de la página 2 — el mismo estudiante se cuenta
  dos veces. Además, con `pageSize=10` cada página devuelve 11 registros, no 10.
- **Pasos para reproducir:**
  1. `GET /api/students?page=1&pageSize=10` y anotar el `id` del último elemento de `items`.
  2. `GET /api/students?page=2&pageSize=10` y anotar el `id` del primer elemento de `items`.
  3. Comparar: son el mismo `id`.
- **Evidencia:**
  - Test automatizado: `tests/api/estudiantes.spec.ts` → `N-2: el último registro de una página se
    repite como primero de la siguiente (bug)`.
  - Reproducido también por UI en `/estudiantes` de forma manual.
  - Catalogado en el Desafío del sitio (`/desafio`, código `N-2`).
- **Severidad y por qué:** Media. Es un error de "off-by-one" en el cálculo del rango de la
  paginación (probablemente usa `<=` en vez de `<` para el índice final), que además explica por qué
  cada página trae 11 elementos en vez de los 10 pedidos.
- **Capa donde se detecta:** API.

---

## Nota sobre hallazgos fuera de este reporte

- `bug-01-baseurl-duplicado.md` (carpeta `bugs/`) no se incluye acá: es un bug de configuración en
  `playwright.config.ts` (clave `baseURL` duplicada), no una discrepancia entre el producto y la
  spec. Ya fue corregido.
- El hallazgo de `otros-ejercicios/booking.spec.ts` queda fuera del alcance de este proyecto: es
  sobre `restful-booker.herokuapp.com`, un producto distinto de Academia sin Humo, de otro ejercicio
  del curso.
