import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ResearchDiagnosis, ResearchIdeaInput, ResearchQuestionProposal, RefineFormInput, SourceConsultation } from "@/types/research";
import type { Article } from "@/types/article";
import type { DelimitationOption, Opportunity, Topic } from "@/types/topic";
import { analyzeIdea, getArticles, getOpportunities, getSessionById, getSources, getTopics, getTrends, refineQuestion } from "@/services/researchApi";

interface ResearchState {
  ideaInput: ResearchIdeaInput | null;
  /** id de la sesión (búsqueda) que se está mostrando actualmente; null hasta el primer análisis. */
  sessionId: string | null;
  diagnosis: ResearchDiagnosis | null;
  articles: Article[];
  topics: Topic[];
  trends: { year: number; publications: number }[];
  opportunities: Opportunity[];
  delimitationOptions: DelimitationOption[];
  sources: SourceConsultation[];
  proposals: ResearchQuestionProposal[];
  selectedQuestion: string | null;
  isAnalyzing: boolean;
  isLoadingSession: boolean;
  hasResults: boolean;
}

interface ResearchContextValue extends ResearchState {
  submitIdea: (input: ResearchIdeaInput) => void;
  runAnalysis: () => Promise<void>;
  runRefine: (input: RefineFormInput) => Promise<void>;
  selectQuestion: (question: string) => void;
  /** Carga una búsqueda pasada por su id (desde el historial) reemplazando por completo el estado actual, para que nunca se mezcle con otra búsqueda. */
  loadSession: (id: string) => Promise<void>;
  reset: () => void;
}

const initialState: ResearchState = {
  ideaInput: null,
  sessionId: null,
  diagnosis: null,
  articles: [],
  topics: [],
  trends: [],
  opportunities: [],
  delimitationOptions: [],
  sources: [],
  proposals: [],
  selectedQuestion: null,
  isAnalyzing: false,
  isLoadingSession: false,
  hasResults: false,
};

const ResearchContext = createContext<ResearchContextValue | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ResearchState>(initialState);

  const submitIdea = useCallback((input: ResearchIdeaInput) => {
    setState((prev) => ({ ...prev, ideaInput: input, hasResults: false }));
  }, []);

  const runAnalysis = useCallback(async () => {
    setState((prev) => ({ ...prev, isAnalyzing: true }));
    const idea = state.ideaInput ?? { rawText: "", objective: "", academicLevel: "pregrado" as const };

    try {
      // El backend construye artículos/temas/oportunidades como parte del
      // análisis; hay que esperar a que termine antes de pedirlos.
      const diagnosis = await analyzeIdea(idea);
      const [articles, topics, trends, opportunitiesData, sources] = await Promise.all([
        getArticles(),
        getTopics(),
        getTrends(),
        getOpportunities(),
        getSources(),
      ]);

      setState((prev) => ({
        ...prev,
        sessionId: diagnosis.id,
        diagnosis,
        articles,
        topics,
        trends,
        opportunities: opportunitiesData.opportunities,
        delimitationOptions: opportunitiesData.delimitationOptions,
        sources,
        isAnalyzing: false,
        hasResults: true,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, isAnalyzing: false }));
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ideaInput]);

  const runRefine = useCallback(async (input: RefineFormInput) => {
    const proposals = await refineQuestion(input);
    setState((prev) => ({ ...prev, proposals }));
  }, []);

  const selectQuestion = useCallback((question: string) => {
    setState((prev) => ({ ...prev, selectedQuestion: question }));
  }, []);

  const loadSession = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoadingSession: true }));
    try {
      const session = await getSessionById(id);
      // Reemplaza TODO el estado por el de esta sesión puntual: nunca se
      // combinan artículos/temas/oportunidades de dos búsquedas distintas.
      setState({
        ideaInput: {
          rawText: session.originalIdea,
          objective: "",
          academicLevel: session.diagnosis.academicLevel ?? "pregrado",
        },
        sessionId: session.id,
        diagnosis: session.diagnosis,
        articles: session.articles,
        topics: session.topics,
        trends: session.trends,
        opportunities: session.opportunities,
        delimitationOptions: session.delimitationOptions,
        sources: session.sources,
        proposals: [],
        selectedQuestion: null,
        isAnalyzing: false,
        isLoadingSession: false,
        hasResults: true,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, isLoadingSession: false }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<ResearchContextValue>(
    () => ({ ...state, submitIdea, runAnalysis, runRefine, selectQuestion, loadSession, reset }),
    [state, submitIdea, runAnalysis, runRefine, selectQuestion, loadSession, reset]
  );

  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
}

export function useResearch(): ResearchContextValue {
  const ctx = useContext(ResearchContext);
  if (!ctx) throw new Error("useResearch debe usarse dentro de <ResearchProvider>");
  return ctx;
}
