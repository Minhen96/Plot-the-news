import { Directive, Role, Scene, SimulationPhase, Reference, HistoricalEvidence } from "@/lib/types";

export interface StoryGenerationOutput {
  summary: string;
  category: string;
  crisisLevel: number;
  coverEmoji: string;
  coverImageQuery: string;
  articleBody: string[];
  historicalContext: string;
  historicalEvidence: HistoricalEvidence;
  cliffhanger: string;
  roles: Role[];
  panels: Scene[];
  predictionOptions: Directive[];
  refs: Reference[];
}

export interface GeneratedImages {
  coverUrl: string;
  panelUrls: string[];
  portraitUrls: string[];
}

export interface PredictionRefinement {
  label: string;
  description: string;
  justification?: string;
}
