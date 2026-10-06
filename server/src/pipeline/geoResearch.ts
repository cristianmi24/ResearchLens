import * as openAlex from "../lib/openalex.js";
import type { GeoInstitution, GeoResearchDistribution } from "../types.js";

const NATIONAL_COUNTRY = "CO";
const NATIONAL_SAMPLE = 200;

/**
 * Dónde se investiga el tema. Combina dos consultas a OpenAlex sobre los mismos
 * términos de búsqueda que el resto del análisis:
 *  1) conteo exacto de estudios por país (todos los resultados);
 *  2) vista nacional (Colombia): los estudios más relevantes con institución
 *     colombiana y las coordenadas de esas instituciones, para ubicarlas por
 *     departamento en el mapa.
 * Nunca lanza hacia el pipeline: el llamador captura el error y el análisis
 * sigue igual sin esta sección.
 */
export async function buildGeoDistribution(keywords: string[]): Promise<GeoResearchDistribution | null> {
  const query = keywords.join(" ").trim();
  if (!query) return null;

  const world = await openAlex.worksByCountry(query);
  if (world.countries.length === 0) return null;

  let colombia: GeoResearchDistribution["colombia"] = null;
  if (world.countries.some((c) => c.code === NATIONAL_COUNTRY)) {
    const national = await openAlex.institutionWorksForCountry(query, NATIONAL_COUNTRY, NATIONAL_SAMPLE);
    const geo = await openAlex.institutionGeo([...national.institutions.keys()]);

    const countByInstitution = new Map<string, number>();
    for (const ids of national.works) {
      for (const id of ids) countByInstitution.set(id, (countByInstitution.get(id) ?? 0) + 1);
    }

    const institutions: GeoInstitution[] = [];
    for (const [id, name] of national.institutions) {
      const place = geo.get(id);
      if (!place) continue;
      institutions.push({ id, name, count: countByInstitution.get(id) ?? 0, ...place });
    }
    institutions.sort((a, b) => b.count - a.count);

    const located = new Set(institutions.map((i) => i.id));
    colombia = {
      total: national.total,
      sampleSize: national.works.length,
      institutions,
      unlocated: national.institutions.size - located.size,
      works: national.works.map((ids) => ids.filter((id) => located.has(id))),
    };
  }

  return { query, total: world.total, countries: world.countries, colombia };
}
