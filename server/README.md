# ResearchLens API

Backend real de ResearchLens. Sustituye los MOCK_DATA del frontend consultando
fuentes académicas y de IA reales.

## Fuentes integradas

- **OpenAlex** — búsqueda de literatura, conteos, tendencias por año y temas (`works.topics`).
- **Semantic Scholar** — búsqueda complementaria de papers.
- **Crossref** — búsqueda complementaria de papers.
- **arXiv** — búsqueda complementaria (parseo del feed Atom, sin dependencias extra).
- **Gemini** (`generateContent` / `embedContent`) — extracción de conceptos, diagnóstico narrativo,
  comparación idea↔artículo, oportunidades, refinamiento de preguntas y el asistente de chat.
  Similitud = coseno de embeddings reales, no un número inventado.
- **Google Trends** — vía el paquete no oficial `google-trends-api` (Google no publica una API pública).
- **YouTube Data API v3** — búsqueda de videos relacionados (bonus, no consumido aún por el frontend).
- **Postgres (Neon)** — persistencia de proyectos, sesiones de búsqueda y mensajes del asistente.

## Uso

```bash
npm run server:install   # desde la raíz del repo
npm run server:dev       # levanta http://localhost:8787
```

Variables de entorno: se leen del `.env` en la raíz del repo (no de `server/.env`).
Ver ese archivo para las claves requeridas (`GEMINI_API_KEY`, `OPENALEX_*`,
`SEMANTIC_SCHOLAR_API_KEY`, `DATABASE_URL`, etc).

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/research/analyze` | Pipeline completo: idea → búsqueda multi-fuente → similitud → diagnóstico |
| POST | `/api/research/search` | Artículos de la sesión (`diagnosisId` opcional, si no usa la última) |
| GET | `/api/research/articles` / `/:id` | Artículos de la última sesión |
| GET | `/api/research/topics` | Temas derivados de `works.topics` de OpenAlex |
| GET | `/api/research/trends` | Publicaciones por año (OpenAlex `group_by`) |
| GET | `/api/research/opportunities` | Oportunidades + opciones de delimitación (Gemini, grounded) |
| POST | `/api/research/refine` | Propuestas de pregunta de investigación (Gemini, grounded) |
| GET | `/api/research/sources` | Qué fuentes se consultaron y cuántos resultados dieron |
| GET | `/api/research/google-trends?q=` | Interés de búsqueda real (bonus) |
| GET | `/api/research/youtube?q=` | Videos relacionados (bonus) |
| POST | `/api/assistant/chat` | Asistente RAG-lite sobre los artículos ya recuperados |
| GET/POST/DELETE | `/api/projects` | CRUD de proyectos sobre Postgres |

## Notas de diseño

- No hay autenticación ni multiusuario: los endpoints "de lectura" (`/articles`, `/topics`, etc.)
  siempre devuelven la sesión de búsqueda más reciente (tabla `research_sessions`).
- Un fallo de una fuente (ej. Semantic Scholar con rate-limit 429) no tumba `/analyze`: se registra
  en `sources` como `consulted:false` / `resultsCount:0` y el resto del pipeline continúa.
- Las llamadas a Gemini reintentan con backoff ante 429/503 (frecuentes en la API pública).
