import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Sparkles } from "lucide-react";
import { AnalysisProgress } from "@/components/research/AnalysisProgress";
import { Button } from "@/components/ui/Button";
import { useResearch } from "@/hooks/useResearch";
import { ApiError } from "@/services/api";
import type { AnalysisStep } from "@/types/research";

const stepLabels: { key: string; label: string }[] = [
  { key: "understand", label: "Comprendiendo la idea" },
  { key: "concepts", label: "Identificando conceptos" },
  { key: "search", label: "Buscando literatura" },
  { key: "similarity", label: "Analizando similitud" },
  { key: "opportunities", label: "Identificando oportunidades" },
];

function buildSteps(activeIndex: number): AnalysisStep[] {
  return stepLabels.map((s, i) => ({
    ...s,
    status: i < activeIndex ? "done" : i === activeIndex ? "active" : "pending",
  }));
}

export function Analysis() {
  const navigate = useNavigate();
  const { ideaInput, runAnalysis } = useResearch();
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAnalysis = useRef(false);

  useEffect(() => {
    if (!ideaInput) {
      navigate("/idea");
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => Math.min(prev + 1, stepLabels.length - 1));
    }, 550);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ideaInput) return;
    // El backend consulta varias fuentes académicas reales (algunas con límite propio de solicitudes,
    // como arXiv o Semantic Scholar) más varias llamadas a la IA: la duración real varía, así que se
    // muestra cuánto tiempo lleva corriendo en vez de dejar los pasos congelados sin explicación.
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [ideaInput]);

  useEffect(() => {
    if (activeIndex === stepLabels.length - 1 && !startedAnalysis.current) {
      startedAnalysis.current = true;
      runAnalysis()
        .then(() => {
          setTimeout(() => navigate("/results"), 500);
        })
        .catch((err) => {
          setError(err instanceof ApiError ? err.message : "No se pudo completar el análisis. Intenta de nuevo.");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-10 animate-fade-in text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
          <AlertTriangle size={22} />
        </div>
        <h1 className="text-xl font-semibold text-ink-primary">No pudimos terminar el análisis</h1>
        <p className="text-sm text-ink-secondary mt-2 leading-relaxed">{error}</p>
        <Button className="mt-6" onClick={() => navigate("/idea")}>
          Volver a mi idea
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-4">
          <Sparkles size={22} />
        </div>
        <h1 className="text-xl font-semibold text-ink-primary">
          Estamos convirtiendo tu idea en conceptos investigables...
        </h1>
        <p className="text-sm text-ink-muted mt-2">
          Suele tardar entre 15 y 30 segundos (consultamos varias fuentes académicas reales, algunas con
          límite propio de solicitudes) — llevas {elapsedSeconds}s.
        </p>
      </div>

      <AnalysisProgress steps={buildSteps(activeIndex)} />
    </div>
  );
}
