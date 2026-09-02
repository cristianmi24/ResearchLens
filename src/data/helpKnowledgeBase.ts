export interface HelpEntry {
  id: string;
  /** Pregunta "canónica": se muestra como sugerencia y también aporta palabras clave al buscador. */
  question: string;
  /** Palabras clave adicionales (sinónimos, variantes) para que el buscador local encuentre esta entrada. */
  keywords: string[];
  answer: string;
}

/**
 * Base de conocimiento local sobre cómo funciona ResearchLens. El asistente de ayuda busca aquí con un
 * comparador de palabras clave (ver utils/helpMatcher.ts) — NUNCA llama a Qwen ni a ningún otro modelo,
 * así que responde gratis, al instante, y solo con información real y verificada del sistema.
 */
export const helpKnowledgeBase: HelpEntry[] = [
  {
    id: "que-es",
    question: "¿Qué es ResearchLens?",
    keywords: ["que es", "researchlens", "proyecto", "para que sirve", "sistema", "app", "plataforma"],
    answer:
      "ResearchLens convierte una idea de investigación escrita en lenguaje natural en un diagnóstico " +
      "fundamentado: busca literatura científica real en cuatro fuentes académicas al mismo tiempo, calcula " +
      "qué tan parecida es tu idea a lo que ya existe, te muestra qué tan explorado está el tema y te " +
      "sugiere posibles oportunidades de investigación — todo en una sola búsqueda.",
  },
  {
    id: "demo-completa",
    question: "Muéstrame una demo de cómo funciona todo",
    keywords: [
      "demo", "ejemplo", "paso a paso", "proceso", "pipeline", "explica todo", "como funciona",
      "funciona por dentro", "de principio a fin", "recorrido", "flujo",
    ],
    answer:
      "Te muestro el recorrido completo con un ejemplo:\n\n" +
      '1. Escribes tu idea con tus palabras: "Uso de IA generativa en la enseñanza de programación en ' +
      'universitarios colombianos".\n' +
      "2. Un modelo de IA (Qwen) la convierte en palabras clave de búsqueda efectivas y detecta el área " +
      "(ej. Educación).\n" +
      "3. Se consultan EN PARALELO cuatro fuentes académicas reales: OpenAlex, Semantic Scholar, Crossref y " +
      "arXiv.\n" +
      "4. Se eliminan los artículos duplicados (por DOI o título) entre esas cuatro fuentes.\n" +
      "5. Se calcula la similitud real entre tu idea y cada artículo con embeddings + similitud coseno — " +
      "un número matemático, no una opinión inventada.\n" +
      "6. Con esos datos reales se genera tu diagnóstico: por ejemplo 'Moderadamente explorado', con una " +
      "explicación en español y una tendencia (creciente/estable/decreciente) según publicaciones por año.\n" +
      "7. Los artículos se agrupan en temas para el mapa de investigación (cada círculo es un tema, el " +
      "tamaño indica cuántos estudios hay).\n" +
      "8. Se cruza el tema con Google Trends (interés público) contra las publicaciones académicas, con " +
      "regresión lineal y correlación real.\n" +
      "9. Se identifican oportunidades de investigación: vacíos poco explorados o ángulos de " +
      "diferenciación.\n" +
      "10. Desde ahí puedes refinar tu pregunta, guardar todo como un proyecto, revisarlo después en tu " +
      "historial, o preguntarle al asistente de literatura sobre los artículos ya encontrados.\n\n" +
      "Todo esto ocurre en segundos, después de un solo clic en 'Analizar idea'.",
  },
  {
    id: "diagnostico",
    question: "¿Qué es el diagnóstico de exploración?",
    keywords: [
      "diagnostico", "exploracion", "nivel", "explorado", "bajo", "moderado", "alto", "tendencia",
      "creciente", "decreciente",
    ],
    answer:
      "Es una clasificación de qué tan explorado está tu tema (bajo, moderado o alto), calculada a partir " +
      "de cuántos estudios relacionados existen realmente en las fuentes consultadas, no de una opinión de " +
      "la IA. También incluye la tendencia de publicaciones en los últimos años (creciente, estable o " +
      "decreciente) y la similitud promedio de tu idea con la literatura encontrada. La IA solo se usa " +
      "para explicar en palabras esas cifras ya calculadas, nunca para inventarlas.",
  },
  {
    id: "fuentes",
    question: "¿De dónde salen los artículos científicos?",
    keywords: [
      "fuentes", "articulos", "literatura", "openalex", "semantic scholar", "crossref", "arxiv",
      "de donde", "bases de datos",
    ],
    answer:
      "De cuatro fuentes académicas reales, consultadas en paralelo: OpenAlex (fuente principal, conteos y " +
      "tendencias por año), Semantic Scholar, Crossref y arXiv (preprints recientes). Si alguna fuente " +
      "falla o responde 'demasiadas solicitudes', ResearchLens reintenta con pausas cada vez más largas; " +
      "si aun así no responde, el resto del análisis sigue con las fuentes que sí funcionaron, y te lo " +
      "indica en el panel de 'Fuentes consultadas'.",
  },
  {
    id: "similitud",
    question: "¿Cómo se calcula la similitud con mi idea?",
    keywords: [
      "similitud", "parecido", "coincide", "embeddings", "coseno", "comparacion", "que tan parecido",
    ],
    answer:
      "Tu idea y el resumen de cada artículo se convierten en vectores numéricos (embeddings) y se mide " +
      "qué tan cerca están entre sí (similitud coseno). Es un cálculo matemático real, no una cifra " +
      "inventada por la IA generativa — esta última solo se usa después, para explicar en palabras en qué " +
      "se parece y en qué se diferencia cada artículo (población, contexto, variable).",
  },
  {
    id: "mapa-temas",
    question: "¿Qué es el mapa de investigación?",
    keywords: ["mapa", "temas", "concentracion", "circulos", "investigacion", "agrupacion"],
    answer:
      "Es una vista visual de los temas relacionados con tu idea: cada círculo representa un tema, su " +
      "tamaño indica cuántos estudios existen sobre él, y su color indica qué tan concentrada está la " +
      "investigación en ese tema (muy concentrada = más explorado, poco concentrada = posible oportunidad).",
  },
  {
    id: "trends",
    question: "¿Qué es el interés público / Google Trends?",
    keywords: ["google trends", "interes publico", "busquedas", "tendencia social"],
    answer:
      "Es una comparación entre cuánto se busca tu tema en Google (interés público) y cuánto se publica " +
      "académicamente sobre él, calculada con un método estadístico real (regresión lineal y correlación " +
      "de Pearson) — no es una opinión generada por IA.",
  },
  {
    id: "oportunidades",
    question: "¿Qué son las oportunidades de investigación?",
    keywords: ["oportunidades", "vacios", "diferenciacion", "poco explorado", "angulo"],
    answer:
      "Son posibles vacíos poco explorados, zonas parcialmente cubiertas o ángulos donde tu idea podría " +
      "diferenciarse, identificados a partir de los temas y artículos reales ya recuperados — nunca " +
      "inventando estadísticas nuevas. También verás 2-3 sugerencias concretas para delimitar tu idea " +
      "(cambiar población, variable o contexto).",
  },
  {
    id: "refinar",
    question: "¿Cómo refino mi pregunta de investigación?",
    keywords: [
      "refinar", "pregunta", "construye", "mejor pregunta", "delimitar", "poblacion", "contexto",
      "variable", "geografia",
    ],
    answer:
      "En 'Construye una mejor pregunta' llenas un formulario corto (población, contexto, " +
      "intervención/variable, variable de resultado, geografía, tipo de estudio) y recibes 3 propuestas de " +
      "pregunta ya delimitadas, cada una calificada en claridad, delimitación, literatura disponible y " +
      "diferenciación — calibradas con el panorama real de literatura que ya se encontró para tu idea.",
  },
  {
    id: "videos",
    question: "¿Cómo funcionan los videos relacionados?",
    keywords: ["videos", "youtube", "relacionados", "filtro", "irrelevantes"],
    answer:
      "Se buscan videos de YouTube sobre tu tema, y se filtran localmente antes de mostrarse: se compara " +
      "el título y canal de cada video contra las palabras clave de tu búsqueda, y si no comparten nada " +
      "relevante, se descarta. Ese filtro no usa IA ni gasta tokens — es solo comparación de palabras.",
  },
  {
    id: "proyectos-historial",
    question: "¿Cómo guardo un proyecto o veo mi historial?",
    keywords: [
      "guardar", "proyecto", "proyectos", "historial", "busquedas anteriores", "continuar despues",
    ],
    answer:
      "En 'Mis proyectos' puedes dar clic en 'Guardar proyecto actual' para no perder tu progreso, volver a " +
      "él cuando quieras, o eliminarlo si ya no lo necesitas. En 'Mi historial' puedes ver todas tus " +
      "búsquedas anteriores y abrir cualquiera exactamente como quedó guardada (diagnóstico, artículos, " +
      "temas y oportunidades juntos), sin que se mezcle con una búsqueda más reciente.",
  },
  {
    id: "asistente-literatura",
    question: "¿En qué se diferencia este asistente del asistente de literatura?",
    keywords: [
      "asistente", "diferencia", "otro asistente", "preguntar al asistente", "chat", "ia", "qwen",
    ],
    answer:
      "Este asistente de ayuda (con el que hablas ahora) responde solo con información fija sobre cómo " +
      "funciona ResearchLens, sin usar ningún modelo de IA — por eso es instantáneo y gratis. El botón " +
      "'Preguntar al asistente' (abajo a la derecha, dentro de una búsqueda) es distinto: sí usa un modelo " +
      "de IA (Qwen) para responder preguntas sobre los artículos que ya se encontraron para tu idea, " +
      "citando siempre sus fuentes reales y sin inventar datos que no estén en ellas.",
  },
  {
    id: "cuenta-login",
    question: "¿Cómo creo una cuenta o inicio sesión?",
    keywords: [
      "cuenta", "login", "iniciar sesion", "registro", "contraseña", "google", "microsoft", "facebook",
      "apple", "github", "clerk", "social",
    ],
    answer:
      "Puedes crear una cuenta con nombre, apellido, correo y una contraseña de mínimo 8 caracteres " +
      "(cifrada con bcrypt, nunca se guarda en texto plano), o entrar directamente con Google, Microsoft, " +
      "Facebook, Apple o GitHub si el proyecto tiene Clerk configurado — en ese caso, ResearchLens nunca ve " +
      "ni guarda la contraseña de esa cuenta externa, solo tu nombre y correo para identificarte. Al " +
      "registrarte debes aceptar los términos y condiciones y la política de privacidad.",
  },
  {
    id: "seguridad",
    question: "¿Qué tan seguros están mis datos?",
    keywords: [
      "seguridad", "privacidad", "datos", "cifrado", "jwt", "bcrypt", "helmet", "rate limit",
      "fuerza bruta", "terceros",
    ],
    answer:
      "El frontend nunca contiene claves de API (todas las llamadas a servicios externos se hacen desde el " +
      "backend). Tu sesión se identifica con un token JWT, tu contraseña se guarda cifrada (bcrypt), el " +
      "servidor limita cuántos intentos de login puede hacer una misma IP en pocos minutos (contra fuerza " +
      "bruta) y usa cabeceras HTTP de seguridad (Helmet). Cada usuario solo puede ver y modificar sus " +
      "propios proyectos, búsquedas y mensajes.",
  },
  {
    id: "limite-uso",
    question: "¿Cuántos análisis puedo hacer al día?",
    keywords: ["limite", "tope", "analisis por dia", "cuantos analisis", "uso diario"],
    answer:
      "Por defecto 15 análisis completos por día por usuario (configurable por quien despliegue el " +
      "proyecto), para evitar que una sola cuenta agote el saldo compartido de la IA. El contador se " +
      "reinicia todos los días a medianoche (UTC) y puedes ver cuántos te quedan en 'Mi historial'.",
  },
  {
    id: "errores",
    question: "¿Qué pasa si algo falla o entro a una página que no existe?",
    keywords: ["error", "404", "no existe", "no carga", "falla", "pantalla en blanco"],
    answer:
      "Si entras a una URL que no existe, ResearchLens muestra una página 404 en vez de un error en " +
      "blanco. Si una pantalla tarda en responder (por ejemplo mientras verifica tu sesión), se muestra un " +
      "indicador de carga en vez de quedarse congelada.",
  },

  // Comentarios de cortesía (saludos, agradecimientos, despedidas): se responden aquí mismo, sin
  // gastar tokens de Qwen, para que el asistente no trate un "gracias" como una pregunta sin respuesta.
  {
    id: "saludo",
    question: "Hola",
    keywords: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "hey", "que tal", "saludos"],
    answer:
      "¡Hola! Soy el asistente de ResearchLens. Puedo explicarte cómo funciona el sistema, mostrarte una " +
      "demo completa paso a paso, o responder preguntas sobre los artículos que ya encontramos para tu " +
      "idea. ¿En qué te ayudo?",
  },
  {
    id: "como-estas",
    question: "¿Cómo estás?",
    keywords: ["como estas", "que tal estas", "como te va", "como andas", "todo bien"],
    answer:
      "Todo bien, gracias por preguntar. Soy un asistente sin sentimientos, pero con toda la información " +
      "de ResearchLens a la mano. ¿Qué necesitas saber?",
  },
  {
    id: "gracias",
    question: "Gracias",
    keywords: ["gracias", "muchas gracias", "te agradezco", "genial gracias", "perfecto gracias"],
    answer: "De nada. Si tienes otra pregunta sobre ResearchLens o sobre tu búsqueda, aquí estoy.",
  },
  {
    id: "quien-eres",
    question: "¿Quién eres?",
    keywords: ["quien eres", "eres una ia", "eres un bot", "eres humano", "que eres", "eres real"],
    answer:
      "Soy el asistente de ResearchLens. Para preguntas sobre cómo funciona el sistema respondo con " +
      "información fija, sin usar ningún modelo de IA. Para preguntas sobre los artículos que ya " +
      "encontramos en tu búsqueda actual, sí uso un modelo de IA (Qwen), citando siempre las fuentes " +
      "reales.",
  },
  {
    id: "despedida",
    question: "Adiós",
    keywords: ["adios", "chao", "nos vemos", "hasta luego", "bye", "me voy"],
    answer: "¡Hasta luego! Vuelve cuando quieras si tienes otra pregunta sobre ResearchLens.",
  },
];

export const helpSuggestedQuestions: string[] = [
  "Muéstrame una demo de cómo funciona todo",
  "¿Qué es el diagnóstico de exploración?",
  "¿Cómo se calcula la similitud?",
  "¿Puedo entrar con Google o Microsoft?",
  "¿Qué tan seguros están mis datos?",
];

export const helpWelcomeText =
  "Hola, soy el asistente de ayuda de ResearchLens. No uso ningún modelo de IA para responderte — busco " +
  "en información real y fija sobre cómo funciona el sistema, así que siempre respondo al instante y sin " +
  "costo. Pregúntame cómo funciona cualquier parte de la app, o pídeme una demo completa.";

export const helpFallbackText =
  "No tengo una respuesta clara para eso en mi información sobre ResearchLens. Prueba con otras palabras, " +
  "o pídeme 'una demo de cómo funciona todo' para ver el recorrido completo.";
