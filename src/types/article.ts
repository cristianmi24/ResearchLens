export type ArticleSource =
  | "OpenAlex"
  | "Crossref"
  | "Semantic Scholar"
  | "arXiv"
  | "DOAJ";

export type ComparisonMatch = "coincide" | "parcial" | "diferente";

export interface ComparisonField {
  label: string;
  ideaValue: string;
  articleValue: string;
  match: ComparisonMatch;
}

export interface Article {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: ArticleSource;
  doi: string;
  abstract: string;
  mainConcepts: string[];
  /** Países (ISO alfa-2) de las instituciones de los autores. Solo lo informa OpenAlex. */
  countries?: string[];
  similarityPercent: number;
  similarityReason: string;
  comparison: ComparisonField[];
}
