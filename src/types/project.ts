import type { ResearchDiagnosis } from "./research";
import type { Article } from "./article";
import type { Opportunity } from "./topic";
import type { ResearchQuestionProposal } from "./research";

export interface ProjectHistoryEntry {
  id: string;
  label: string;
  date: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  originalIdea: string;
  createdAt: string;
  lastAnalyzedAt: string;
  diagnosis: ResearchDiagnosis;
  savedArticles: Article[];
  opportunities: Opportunity[];
  currentQuestion: string | null;
  proposals: ResearchQuestionProposal[];
  history: ProjectHistoryEntry[];
}
