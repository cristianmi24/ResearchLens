/**
 * Una "skill" es un conocimiento experto empaquetado y versionado que se le da al modelo: quién debe ser,
 * con qué criterios juzgar y cómo responder. Vivir como módulos (y no como texto suelto dentro de cada
 * prompt) permite revisarlas en un solo lugar, reutilizarlas entre tareas y saber qué versión produjo
 * cada resultado.
 */
export interface Skill {
  /** Identificador estable, en kebab-case. */
  id: string;
  /** Nombre legible. */
  name: string;
  /** Para qué sirve y cuándo se usa. */
  description: string;
  /** Se sube cuando cambian los criterios, para poder rastrear qué versión evaluó un documento. */
  version: string;
  /** Instrucciones completas que recibe el modelo. */
  instructions: string;
}
