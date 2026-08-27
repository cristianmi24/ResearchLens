import { interestOverTime } from "../lib/googleTrends.js";
import { linearRegression, pearsonCorrelation, round } from "../lib/stats.js";
import type { PublicInterestAnalysis, TrendDirection } from "../types.js";

const MIN_POINTS_FOR_TREND = 3;
const MIN_YEARS_FOR_CORRELATION = 3;
// Cambio relativo por punto de la serie (respecto al interés promedio) a
// partir del cual se considera que la pendiente es una tendencia real y no
// ruido de la serie.
const SLOPE_NOISE_THRESHOLD = 0.01;

function yearOf(dateLabel: string): number | null {
  const match = dateLabel.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function trendFromSlope(slope: number, meanInterest: number): TrendDirection {
  if (meanInterest <= 0) return "estable";
  const relativeChange = slope / meanInterest;
  if (relativeChange > SLOPE_NOISE_THRESHOLD) return "creciente";
  if (relativeChange < -SLOPE_NOISE_THRESHOLD) return "decreciente";
  return "estable";
}

/**
 * Cruza el interés de búsqueda público (Google Trends) con el volumen de
 * publicaciones académicas (OpenAlex, ya calculado en `buildDiagnosis`) para
 * el mismo tema. Nunca lanza: si Trends falla, da pocos puntos, o no hay
 * años en común con la literatura, devuelve `null` y el resto del análisis
 * sigue igual.
 */
export async function analyzePublicInterest(
  keyword: string,
  academicTrendByYear: { year: number; count: number }[],
): Promise<PublicInterestAnalysis | null> {
  if (!keyword.trim()) return null;

  const timeline = await interestOverTime(keyword, 24);
  if (timeline.length < MIN_POINTS_FOR_TREND) return null;

  const points = timeline.map((p, i) => ({ x: i, y: p.interest }));
  const { slope, r2 } = linearRegression(points);
  const meanInterest = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const trend = trendFromSlope(slope, meanInterest);

  // Promedia el interés semanal/mensual por año calendario para poder
  // compararlo con el conteo anual de publicaciones (misma granularidad).
  const interestByYear = new Map<number, number[]>();
  for (const point of timeline) {
    const year = yearOf(point.date);
    if (year === null) continue;
    const list = interestByYear.get(year) ?? [];
    list.push(point.interest);
    interestByYear.set(year, list);
  }

  const academicByYear = new Map(academicTrendByYear.map((y) => [y.year, y.count]));
  const pairedInterest: number[] = [];
  const pairedAcademic: number[] = [];
  for (const [year, values] of interestByYear) {
    const academicCount = academicByYear.get(year);
    if (academicCount === undefined) continue;
    pairedInterest.push(values.reduce((sum, v) => sum + v, 0) / values.length);
    pairedAcademic.push(academicCount);
  }

  const correlation =
    pairedInterest.length >= MIN_YEARS_FOR_CORRELATION
      ? pearsonCorrelation(pairedInterest, pairedAcademic)
      : null;

  return {
    keyword,
    timeline,
    slope: round(slope),
    r2: round(r2),
    trend,
    correlationWithAcademicTrend: correlation === null ? null : round(correlation),
    method:
      "Regresión lineal por mínimos cuadrados sobre el interés de búsqueda (Google Trends) para la pendiente/tendencia; " +
      "correlación de Pearson entre el interés público promedio por año y las publicaciones académicas por año (OpenAlex) para la relación entre ambos.",
  };
}
