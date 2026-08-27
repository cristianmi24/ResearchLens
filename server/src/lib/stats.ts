/**
 * Utilidades estadísticas genéricas (sin dependencias externas) usadas por el
 * pipeline para pasar de "el LLM opina que la tendencia es X" a cifras
 * calculadas directamente sobre los datos recuperados.
 */

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  /** Coeficiente de determinación (0-1): qué tan bien la recta explica los puntos. */
  r2: number;
}

/** Regresión lineal simple (mínimos cuadrados) de y sobre x. */
export function linearRegression(points: { x: number; y: number }[]): LinearRegressionResult {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, r2: 0 };

  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;

  let ssXY = 0;
  let ssXX = 0;
  let ssYY = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = meanY - slope * meanX;
  const r2 = ssXX === 0 || ssYY === 0 ? 0 : (ssXY * ssXY) / (ssXX * ssYY);

  return { slope, intercept, r2 };
}

/** Coeficiente de correlación de Pearson entre dos series alineadas por índice. `null` si no es calculable. */
export function pearsonCorrelation(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 2) return null;

  const meanA = a.slice(0, n).reduce((sum, v) => sum + v, 0) / n;
  const meanB = b.slice(0, n).reduce((sum, v) => sum + v, 0) / n;

  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }

  if (denA === 0 || denB === 0) return null;
  return num / Math.sqrt(denA * denB);
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
