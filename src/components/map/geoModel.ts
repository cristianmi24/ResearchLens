import { geoContains, geoDistance } from "d3";
import { DEPARTAMENTOS, R_EARTH } from "./geoData";
import type { GeoFeature } from "./topo";

/**
 * Lógica pura del atlas (sin React ni DOM): convierte la distribución
 * geográfica del análisis en los modelos que dibuja el mapa. Está separada del
 * componente para poder verificar con datos reales que cada institución cae en
 * el departamento que le corresponde (ver scripts/verify-map-data.ts).
 */

export interface GeoInstitutionLike {
  id: string;
  name: string;
  count: number;
  city: string | null;
  region: string | null;
  lat: number;
  lon: number;
}

export interface ColombiaDistributionLike {
  total: number;
  sampleSize: number;
  institutions: GeoInstitutionLike[];
  unlocated: number;
  works: string[][];
}

/** Distancia máxima (km) a la que un punto fuera de un polígono aún se asigna a él (costa/geometría simplificada). */
const SNAP_KM = 30;

const coordsOf = (feature: GeoFeature): number[][] => {
  const g = feature.geometry;
  const polygons: number[][][][] = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return polygons.flatMap((polygon) => polygon.flat());
};

/**
 * Código DANE del departamento que contiene el punto [lon, lat]. Si el punto
 * cae apenas fuera (costas, islas, polígonos simplificados), se asigna al
 * departamento cuyo contorno esté a menos de SNAP_KM; si no hay ninguno, null.
 * Bogotá D.C. es un enclave de Cundinamarca: se prueba primero por contención
 * exacta, así que Bogotá no se confunde con su departamento vecino.
 */
export function assignDepartment(lon: number, lat: number, features: GeoFeature[]): string | null {
  const point: [number, number] = [lon, lat];
  const inside = features.filter((f) => geoContains(f, point));
  if (inside.length > 0) {
    // Si hubiera solapamiento por simplificación, prefiere el más pequeño (el enclave).
    inside.sort((a, b) => coordsOf(a).length - coordsOf(b).length);
    return inside[0].properties.DPTO_CCDGO;
  }
  let best: { code: string; km: number } | null = null;
  for (const f of features) {
    for (const [x, y] of coordsOf(f)) {
      const km = geoDistance(point, [x, y]) * R_EARTH;
      if (!best || km < best.km) best = { code: f.properties.DPTO_CCDGO, km };
    }
  }
  return best && best.km <= SNAP_KM ? best.code : null;
}

export interface DepartmentStat {
  code: string;
  name: string;
  /** Estudios de la muestra con al menos una institución en el departamento (cada estudio cuenta una vez). */
  works: number;
  institutions: GeoInstitutionLike[];
}

export interface ColombiaModel {
  byDept: Map<string, DepartmentStat>;
  /** Instituciones con la que se pudo ubicar su departamento, con ese código. */
  placed: (GeoInstitutionLike & { dept: string })[];
  /** Instituciones con coordenadas pero fuera de Colombia continental/insular (no se dibujan). */
  unplaced: GeoInstitutionLike[];
  maxWorks: number;
}

export function buildColombiaModel(colombia: ColombiaDistributionLike, features: GeoFeature[]): ColombiaModel {
  const deptOf = new Map<string, string>();
  const placed: ColombiaModel["placed"] = [];
  const unplaced: GeoInstitutionLike[] = [];

  for (const inst of colombia.institutions) {
    const dept = assignDepartment(inst.lon, inst.lat, features);
    if (dept) {
      deptOf.set(inst.id, dept);
      placed.push({ ...inst, dept });
    } else {
      unplaced.push(inst);
    }
  }

  const byDept = new Map<string, DepartmentStat>();
  const ensure = (code: string): DepartmentStat => {
    let stat = byDept.get(code);
    if (!stat) {
      stat = { code, name: DEPARTAMENTOS[code]?.nombre ?? code, works: 0, institutions: [] };
      byDept.set(code, stat);
    }
    return stat;
  };

  for (const inst of placed) ensure(inst.dept).institutions.push(inst);
  for (const stat of byDept.values()) stat.institutions.sort((a, b) => b.count - a.count);

  // Un estudio cuenta UNA vez por departamento aunque tenga varias instituciones allí.
  for (const institutionIds of colombia.works) {
    const depts = new Set<string>();
    for (const id of institutionIds) {
      const dept = deptOf.get(id);
      if (dept) depts.add(dept);
    }
    for (const dept of depts) ensure(dept).works += 1;
  }

  let maxWorks = 0;
  for (const stat of byDept.values()) maxWorks = Math.max(maxWorks, stat.works);
  return { byDept, placed, unplaced, maxWorks };
}

export interface WorldModel {
  counts: Map<string, number>;
  max: number;
  /** Posición (1 = más estudios) de cada país. */
  rank: Map<string, number>;
  /** % de los estudios (sobre el total de la búsqueda) en los tres países con más estudios. */
  top3Share: number;
}

export function buildWorldModel(countries: { code: string; count: number }[], total: number): WorldModel {
  const sorted = [...countries].sort((a, b) => b.count - a.count);
  const counts = new Map(sorted.map((c) => [c.code, c.count]));
  const rank = new Map(sorted.map((c, i) => [c.code, i + 1]));
  const max = sorted[0]?.count ?? 0;
  const top3 = sorted.slice(0, 3).reduce((sum, c) => sum + c.count, 0);
  return { counts, max, rank, top3Share: total > 0 ? Math.min(100, (top3 / total) * 100) : 0 };
}
