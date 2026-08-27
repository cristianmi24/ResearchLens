import googleTrends from "google-trends-api";

/**
 * Google no ofrece una API oficial para Google Trends. `google-trends-api`
 * envuelve el endpoint interno que usa la web de trends.google.com — puede
 * fallar o dar rate-limit (HTTP 429) sin previo aviso; por eso siempre se
 * captura el error y se devuelve un arreglo vacío en vez de tumbar la ruta.
 */
export interface TrendPoint {
  date: string;
  interest: number;
}

export async function interestOverTime(keyword: string, monthsBack = 24): Promise<TrendPoint[]> {
  try {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setMonth(startTime.getMonth() - monthsBack);

    const raw = await googleTrends.interestOverTime({ keyword, startTime, endTime, hl: "es" });
    const parsed = JSON.parse(raw) as {
      default: { timelineData: { formattedTime: string; value: number[] }[] };
    };

    return parsed.default.timelineData.map((point) => ({
      date: point.formattedTime,
      interest: point.value[0] ?? 0,
    }));
  } catch (err) {
    console.warn("[google-trends] no se pudo obtener interés:", (err as Error).message);
    return [];
  }
}
