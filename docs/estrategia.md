# Estrategia de pruebas — Academia sin Humo

## Riesgo principal

- **Riesgo:** Dos reglas de negocio centrales no se validan del lado del servidor: la API de
  inscripción no exige el prerequisito de un curso (REQ-C06), y un curso "Abandonado" —estado que la
  spec define como terminal— puede revivirse a "En progreso" vía la API (REQ-P02/P03). Además, la
  sesión no persiste tras el login: `POST /api/login` crea la cookie `ash_session`, pero
  `GET /api/auth/me` con esa misma cookie devuelve `realUser: null`, y un refresh de página vuelve a
  pedir el login.
- **A quién afecta y cómo:** Los dos primeros afectan la integridad académica del producto: cualquier
  cliente que hable directo con la API (no solo la UI) puede saltear requisitos de aprendizaje
  diseñados pedagógicamente, y el sistema puede terminar certificando o reportando un progreso que no
  refleja el recorrido real del estudiante — esto ocurre siempre, esté el estudiante activo o no. El
  bug de sesión, en cambio, no afecta mientras el estudiante permanece logueado sin recargar: el
  problema aparece puntualmente al refrescar la página (confirmado en `/login`, `/cursos` y
  `/mi-progreso`), momento en el que se pierde el reconocimiento de la sesión y se rompe cualquier
  flujo que dependa de ella (progreso, catálogo con estado, páginas protegidas).

## Flujos evaluados

| Flujo | Frecuencia | Valor/Riesgo | ¿Automatizo? | Capa (UI/API/integrado) | Por qué |
|---|---|---|---|---|---|
| Inscripción — prerequisito (REQ-C02, C06) | Alta | Alto (riesgo #1) | Sí | API + integrado | La API se puede llamar sin pasar por la UI y saltea la regla "estrella" de la spec; ocurre siempre, esté el estudiante activo o no |
| Progreso — transiciones de estado (REQ-P01-05) | Media | Alto (riesgo #2) | Sí | Integrado | Bug confirmado en API y en UI: "Abandonado" (estado terminal) revive a "En progreso" con un clic desde `/mi-progreso` |
| Sesión — persistencia tras login (REQ-S01, S02) | Alta | Alto (riesgo #3) | Sí | Integrado | Solo se manifiesta al refrescar la página (mientras el estudiante permanece activo sin recargar, no hay síntoma); confirmado en `/login`, `/cursos` y `/mi-progreso`; es la pista de mayor valor que da la propia consigna |
| Login (REQ-L01, L02, L04) | Alta | Alto | Sí | UI | Puerta de entrada a todo el producto |
| Registro (REQ-R01-07) | Media | Alto | Sí | UI | Reglas de validación numerosas; ya se encontraron 2 bugs de límite/consistencia |
| Catálogo — listado y cupos (REQ-C01, C03, C04) | Alta | Medio | Sí | API + UI | 2 bugs confirmados: el cupo no baja al inscribirse (REQ-C04), y la tarjeta de un curso se desbloquea visualmente sin completar el prerequisito (REQ-C03) |
| Subida de CV en Perfil (REQ-U01-03) | Media | Medio | Sí | API | Zona nunca antes probada en el curso; 2 bugs confirmados (tipo y tamaño de archivo) |
| Listado paginado de estudiantes (REQ-N01-03) | Baja | Medio | Sí | API | 2 bugs confirmados: cálculo de páginas con `floor` en vez de `ceil` (REQ-N02), y un estudiante se repite entre páginas (REQ-N03) |
| Rate limiting de login (REQ-L03) | Baja | Medio | Sí | API + UI | 2 bugs confirmados: bloquea en el intento 4 en vez del 5, y el botón se re-habilita ~5s antes de que el timer visual llegue a cero. La duración prometida (30s) sí es correcta, medida por timestamp |
| Reserva de fecha (REQ-D01-03) | Baja | Sin explorar | No en esta entrega | — | No se navegó ni se probó esta zona; queda como brecha de cobertura declarada, no como "bajo riesgo" confirmado |
| Desafío (caza de bugs libre) | N/A | N/A | No | — | Es una zona de práctica sin REQ numerados propios que validar |

## Alcance elegido

- **Lo que SÍ entra:** Sesión (bug de persistencia, REQ-S01), inscripción con prerequisito (REQ-C06),
  desbloqueo visual de cursos (REQ-C03), transiciones de progreso (REQ-P02/P03), login (REQ-L02/L04),
  registro (REQ-R03/R04/R06), catálogo y cupos (REQ-C01/C04), subida de CV (REQ-U02/U03), paginación
  de estudiantes (REQ-N02/N03), y el rate limiting de login completo (REQ-L03, conteo de intentos y
  timer visual). Todo esto ya está automatizado: 3 flujos E2E, 6 archivos de test de API, 3 flujos
  integrados, con 14 bugs documentados contra la spec — 11 de los cuales coinciden con el tablero
  oficial del Desafío del propio sitio (`/desafio`), lo que sirve como validación externa de que son
  hallazgos reales.
- **Lo que NO entra, y por qué:** la zona de Reserva (REQ-D01-03) porque no se llegó a explorar en
  esta entrega; la zona de Desafío porque no tiene reglas numeradas propias que validar (aunque se
  usó su tablero de hallazgos como checklist de validación cruzada).
- **Lo que NO voy a poder demostrar con estas pruebas:** que el módulo de Reserva
  cumple sus validaciones de fecha; el comportamiento del producto bajo carga o uso concurrente (todas
  las pruebas corren de forma secuencial y aislada); la causa raíz del bug de sesión (se documentó el
  síntoma observable — `realUser: null` con cookie válida — no se investigó el código del servidor
  para saber por qué ocurre); ni que el resto del catálogo de cursos (más allá de "fundamentos" y
  "playwright-cero", usados en las pruebas) se comporta de forma idéntica. Tampoco se pudo
  confirmar con certeza si el progreso de la cuenta demo persiste entre sesiones distintas: se
  observó que cada login nuevo parece arrancar sin inscripciones previas, lo que sugiere que el
  estado podría estar atado a la sesión y no a la cuenta — por eso los tests automatizados se
  inscriben desde cero en cada corrida, en vez de asumir un estado previo.
