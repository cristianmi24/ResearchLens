# Autoevaluación del frontend — Lista de chequeo UX, Movilidad y Patrones (Pressman & Maxim, cap. 12–14)

Proyecto: **Zetia** · Rama: `main` · Fecha: 25/10/2026

Escala: **C** = 2 pts · **CP** = 1 pt · **NC** = 0 pts. La valoración es honesta: donde falta evidencia
(pruebas con usuarios, Lighthouse) se marca CP o NC aunque la interfaz lo soporte.

## Capítulo 12 — Experiencia de usuario

| ID | Valoración | Evidencia en el frontend | Pendiente |
|---|---|---|---|
| UX-01 Arquitectura de información | C | Inicio en 4 secciones rotuladas (Inicio, Qué hace, Cómo funciona, Quiénes somos); app con menú lateral rotulado (`navItems.ts`) y tarjetas con títulos. | — |
| UX-02 Usuario en control | CP | Borrador automático de la idea con "Descartar borrador" y confirmación no invasiva (`ResearchIdeaInput.tsx`); diálogo de acceso cerrable con Escape, clic fuera o ✕; botón Atrás del navegador funciona entre secciones. | No hay "Deshacer" tras eliminar un proyecto. |
| UX-03 Carga de memoria | C | Detalles opcionales plegables, ejemplos en placeholders, ayudas contextuales (`FieldHelp`), valores por defecto (nivel "Pregrado", área "Educación"), migas de pan del flujo Idea → Diagnóstico → Resultados. | — |
| UX-04 Consistencia | CP | Paleta y componentes `Button`/`Card` compartidos en la app; iconos de una sola librería (lucide). | El inicio usa tipografías propias (Sora / Plus Jakarta) distintas de la app (Atkinson / Crimson Pro). |
| UX-05 Personas y tareas | CP | La pantalla de inicio de la app lleva en un clic a "Mi idea"; el flujo de análisis está descompuesto en pasos (idea → diagnóstico → resultados → oportunidades → refinar). | Documentar las Personas (estudiante de pregrado, de maestría, docente) y el HTA en `docs/ux/`. |
| UX-06 Ergonomía de Tognazzini | C | Botones principales grandes; spinner y texto "Procesando..." al enviar, botón deshabilitado para evitar doble envío; el borrador sobrevive a recargas y caídas de red. | — |
| UX-07 Accesibilidad (WCAG) | CP | Anillo de foco global (`:focus-visible`), enlace "Saltar al contenido", `aria-current` en menú y migas, `aria-invalid` + mensajes de error enlazados, `alt` en imágenes, `<nav>`/`<main>` semánticos. | Correr Lighthouse/WAVE y adjuntar el reporte (meta > 90). |
| UX-08 Prototipos y SUS | NC | — | Hacer la prueba con 5 estudiantes usando la plantilla de abajo y guardar los resultados aquí. |

## Capítulo 13 — Movilidad

| ID | Valoración | Evidencia | Pendiente |
|---|---|---|---|
| MOB-01 Pirámide de diseño móvil | C | Rejillas que colapsan a 1 columna, menú en cajón (drawer) en móvil, sin scroll horizontal (verificado a 375 px). | — |
| MOB-02 Zona del pulgar | CP | Paginador de secciones abajo con botones de 48 px; controles del menú de 44 px en pantallas táctiles. | Revisar el tamaño de todos los controles dentro de la app autenticada. |
| MOB-03 Contexto | CP | `inputMode="email"`, `autoComplete` (email, contraseña nueva/actual, nombre) en el acceso; diseño fluido que se adapta al girar el dispositivo. | Modo oscuro (`prefers-color-scheme`): requiere reemplazar ~100 colores fijos (`bg-white`, hex) por tokens. |
| MOB-04 Red y rendimiento | C | Aviso flotante sin conexión / conexión restablecida (`OfflineBanner.tsx`); logo de 1,1 MB → WebP de 15 KB, fondo de 2,1 MB → WebP de 80 KB; `loading="lazy"` en miniaturas; páginas cargadas bajo demanda (`lazy()`). | — |

## Capítulo 14 — Patrones

| ID | Valoración | Evidencia | Pendiente |
|---|---|---|---|
| PAT-01 Arquitectura por componentes | C | `components/` (vista), `services/` (API), `hooks/` (estado), `pages/` (pantallas); sin acceso a datos en las vistas. | — |
| PAT-02 Navegación | C | Migas de pan en toda la app (`Breadcrumbs.tsx`), pestañas Ingresar/Registrarme, menú con sección activa resaltada, cajón en móvil, paginador "3 / 4 · Cómo funciona". | — |
| PAT-03 Formularios | C | Validación en línea campo a campo con mensaje bajo el campo y borde rojo, que desaparece al corregir; mostrar/ocultar contraseña; contador de caracteres en la idea. | — |
| PAT-04 Antipatrones | CP | `Welcome.tsx` pasó de 714 a 248 líneas (paneles y modal separados); botones de icono con `aria-label` y `title`; nunca se abre un modal sobre otro. | `MapaInteractivo.tsx` (1170 líneas) sigue siendo un "Blob": dividir en capa de datos, globo y vista de Colombia. |

**Puntaje estimado:** UX 10/16 · MOB 6/8 · PAT 7/8 → **23/32 (72 %)**. Con UX-08, Lighthouse y la división del mapa
se llegaría a ~29/32.

---

## Plantilla para la prueba de usabilidad (UX-08)

**Protocolo (regla de los 5 usuarios de Nielsen):** 5 estudiantes que no hayan usado Zetia, 20 minutos cada uno.

Tareas:
1. Crear una cuenta.
2. Escribir una idea de investigación propia y analizarla.
3. Encontrar en qué países se investiga el tema.
4. Obtener una pregunta de investigación refinada.
5. Guardar el análisis como proyecto y volver a abrirlo.

Anotar por tarea: ¿la completó? (sí/no), tiempo, errores y comentarios en voz alta.

**Cuestionario SUS** (1 = totalmente en desacuerdo … 5 = totalmente de acuerdo):
1. Creo que me gustaría usar Zetia con frecuencia.
2. Encontré Zetia innecesariamente complejo.
3. Pensé que Zetia era fácil de usar.
4. Creo que necesitaría ayuda de una persona técnica para usar Zetia.
5. Las funciones de Zetia están bien integradas.
6. Había demasiada inconsistencia en Zetia.
7. Imagino que la mayoría aprendería a usar Zetia muy rápido.
8. Encontré Zetia muy engorroso de usar.
9. Me sentí muy seguro usando Zetia.
10. Necesité aprender muchas cosas antes de poder usar Zetia.

**Cálculo:** ítems impares → (respuesta − 1); ítems pares → (5 − respuesta). Sumar y multiplicar por 2,5.
Resultado de 0 a 100; por encima de 68 es aceptable y por encima de 80 es bueno.

| Usuario | SUS | Tareas completadas | Observaciones |
|---|---|---|---|
| E1 | | /5 | |
| E2 | | /5 | |
| E3 | | /5 | |
| E4 | | /5 | |
| E5 | | /5 | |
| **Promedio** | | | |
