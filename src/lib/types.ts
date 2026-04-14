// --- Roles ---

export interface RoleStats {
  strategic: number  // 0–100
  stability: number  // 0–100
}

export interface Role {
  id: string
  name: string
  faction: string
  quote: string
  portraitUrl: string
  stats: RoleStats
  keyPlayerStance?: string
  portraitPrompt?: string  // stored for on-demand FAL.ai regeneration
}

// --- Narrative ---

export interface Scene {
  id: string
  characterName: string
  characterPortrait: string
  backgroundUrl: string
  sectorBadge: string
  dialogue: string
  bgPrompt?: string       // stored for on-demand FAL.ai regeneration
}

// --- Prediction ---

export interface Directive {
  id: string
  label: string
  description: string
  votes: number
  proposedBy: string
  popular?: boolean
}

// --- Simulation ---

export interface SimulationPhase {
  phase: 'short' | 'mid' | 'long'
  label: string
  timeframe: string
  event: string
  emoji: string
  probability?: number
  operationalStatus?: string
  causalFactors?: string[]
}

export interface SimulationResult {
  timeline: SimulationPhase[]
  verdict?: 'correct' | 'partially_correct' | 'incorrect'
  reasoning?: string
}

// --- News ---

export interface News {
  id: string
  title: string
  summary: string
  imageUrl: string
  date: string
  category: string
  sourceUrl?: string
  crisisLevel?: number
  coverEmoji?: string
  cliffhanger?: string
  articleBody: string[]
  historicalContext: string
  historicalEvidence?: HistoricalEvidence
  references?: Reference[]
}

// --- Story ---

export interface HistoricalEvidence {
  title: string
  quote: string
  summary: string
}

export interface Reference {
  title: string
  source: string
  url: string
}

export interface Story {
  // --- News fields (from news table) ---
  id: string
  title: string
  summary: string
  category: string
  imageUrl: string
  date: string
  sourceUrl?: string
  crisisLevel?: number
  coverEmoji?: string
  cliffhanger?: string
  articleBody: string[]
  historicalContext: string
  historicalEvidence?: HistoricalEvidence
  references?: Reference[]
  // --- Game fields (from stories table) ---
  status: 'active' | 'resolved'
  roles: Role[]
  panels: Scene[]
  predictionOptions: Directive[]
  resolvedTimeline?: SimulationPhase[]
  resolvedOutcome?: string
  txHash?: string
  simulations?: Record<string, SimulationPhase[]>
  // --- Aggregate metadata ---
  isGenerated: boolean
  predictionCount?: number
  consensusOption?: string
  controversyScore?: number
}

// --- Session state (stored in sessionStorage) ---

export interface SessionPrediction {
  storyId: string
  roleId: string
  directiveId?: string
  customText?: string
  confidence: number  // 0–100
  txHash?: string
}

// --- Prediction (DB record) ---

export interface Prediction {
  id: string
  storyId: string
  userAddress: string
  optionId: string
  optionLabel: string
  confidence: number
  justification?: string
  timestamp: number
  txHash?: string
  resolved: boolean
  correct?: boolean
  simulatedTimeline?: SimulationPhase[]
}

// --- News Article (newsdata.io) ---

export interface NewsArticle {
  title: string
  description: string
  content?: string
  keywords?: string[]
  category?: string[]
  url: string
  image: string | null
  publishedAt: string
  source: { name: string; url: string }
}

// --- User ---

export interface UserStats {
  address: string
  displayName: string
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  reputationScore: number
  streak: number
  onChainProofs: number
  badge: 'First Foresight' | 'Pattern Seeker' | 'Analyst' | 'Strategist' | 'Oracle' | null
}

export interface LeaderboardEntry {
  address: string
  displayName: string
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  reputationScore: number
  streak: number
  rank: number
}
