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
}

// --- Narrative ---

export interface Scene {
  id: string
  characterName: string
  characterPortrait: string
  backgroundUrl: string
  sectorBadge: string
  dialogue: string
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
}

export interface SimulationResult {
  timeline: SimulationPhase[]
  verdict?: 'correct' | 'partially_correct' | 'incorrect'
  reasoning?: string
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
  id: string
  title: string
  lede: string
  category: string
  imageUrl: string
  date: string
  status: 'active' | 'resolved'
  articleBody: string[]
  historicalContext: string
  historicalEvidence?: HistoricalEvidence
  references?: Reference[]
  roles: Role[]
  scenes: Scene[]
  directives: Directive[]
  resolvedTimeline?: SimulationPhase[]
  txHash?: string
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

// --- GNews ---

export interface GNewsArticle {
  title: string
  description: string
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
