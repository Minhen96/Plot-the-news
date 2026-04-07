export interface StoryPanel {
  id: number;
  narrative: string;
  caption: string;
  visualDescription: string;
  emoji: string; // Visual icon for the panel
}

export interface PredictionOption {
  id: string;
  label: string;
  description: string;
  probability: string; // AI-estimated likelihood
}

export interface HistoricalEvidence {
  title: string;
  year: string;
  summary: string;
  outcome: string;
  relevance: string;
  panels: StoryPanel[];
}

export interface Story {
  id: string;
  title: string;
  category: string;
  summary: string;
  coverEmoji: string;
  date: string;
  predictionCount: number;
  consensusOption?: string;
  controversyScore: number; // 0-100, higher = more split
  status: "active" | "resolved";
  resolvedOutcome?: string;
  panels: StoryPanel[];
  cliffhanger: string;
  predictionOptions: PredictionOption[];
  historicalEvidence: HistoricalEvidence[];
}

export interface Prediction {
  id: string;
  storyId: string;
  userAddress: string;
  optionId: string;
  optionLabel: string;
  confidence: number; // 1-5
  justification?: string;
  timestamp: number;
  txHash?: string;
  resolved: boolean;
  correct?: boolean;
}

export interface LeaderboardEntry {
  address: string;
  displayName: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  reputationScore: number;
  streak: number;
  rank: number;
}
