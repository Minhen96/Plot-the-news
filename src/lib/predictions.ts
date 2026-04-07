import { Prediction, LeaderboardEntry } from "@/lib/types";

// In-memory prediction store (for hackathon demo)
// In production, this would be backed by Supabase + on-chain data
const predictions: Prediction[] = [];

// Seed some demo predictions
const demoAddresses = [
  "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
  "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
  "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
  "0xF977814e90dA44bFA03b6295A0616a897441aceC",
];

const demoNames = [
  "CryptoOracle",
  "NewsHawk",
  "PredictorPrime",
  "FutureSeeker",
  "ChainSage",
  "DataDruid",
  "TrendWhisper",
  "BlockProphet",
];

// Generate demo predictions
function seedDemoPredictions() {
  if (predictions.length > 0) return;

  const stories = [
    "tiktok-ban-2024",
    "ai-regulation-eu",
    "climate-tipping-point",
    "crypto-etf-revolution",
    "ev-price-war",
    "space-commercialization",
  ];
  const options: Record<string, string[]> = {
    "tiktok-ban-2024": ["full-ban", "partial-deal", "legal-block", "extension"],
    "ai-regulation-eu": [
      "global-standard",
      "eu-brain-drain",
      "watered-down",
      "middle-ground",
    ],
    "climate-tipping-point": [
      "recovery",
      "slow-decline",
      "tipping-point",
      "tech-solution",
    ],
    "crypto-etf-revolution": [
      "mainstream-adoption",
      "bubble-burst",
      "regulatory-clamp",
      "slow-burn",
    ],
    "ev-price-war": [
      "china-dominates",
      "tariff-walls",
      "tech-leapfrog",
      "consolidation",
    ],
    "space-commercialization": [
      "trillion-economy",
      "military-dominance",
      "debris-crisis",
      "steady-growth",
    ],
  };

  for (let i = 0; i < demoAddresses.length; i++) {
    for (const storyId of stories) {
      const storyOptions = options[storyId];
      const optionId =
        storyOptions[Math.floor(Math.random() * storyOptions.length)];
      predictions.push({
        id: `demo-${i}-${storyId}`,
        storyId,
        userAddress: demoAddresses[i],
        optionId,
        optionLabel: optionId,
        confidence: Math.floor(Math.random() * 5) + 1,
        timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
        resolved: storyId === "crypto-etf-revolution",
        correct:
          storyId === "crypto-etf-revolution"
            ? optionId === "mainstream-adoption"
            : undefined,
      });
    }
  }
}

seedDemoPredictions();

export function addPrediction(prediction: Prediction): void {
  predictions.push(prediction);
}

export function getPredictionsForStory(storyId: string): Prediction[] {
  return predictions.filter((p) => p.storyId === storyId);
}

export function getUserPredictions(userAddress: string): Prediction[] {
  return predictions.filter(
    (p) => p.userAddress.toLowerCase() === userAddress.toLowerCase()
  );
}

export function getUserPredictionForStory(
  userAddress: string,
  storyId: string
): Prediction | undefined {
  return predictions.find(
    (p) =>
      p.userAddress.toLowerCase() === userAddress.toLowerCase() &&
      p.storyId === storyId
  );
}

export function getLeaderboard(): LeaderboardEntry[] {
  const userMap = new Map<
    string,
    {
      total: number;
      correct: number;
      totalConfidence: number;
    }
  >();

  for (const p of predictions) {
    const addr = p.userAddress;
    const entry = userMap.get(addr) || {
      total: 0,
      correct: 0,
      totalConfidence: 0,
    };
    entry.total++;
    entry.totalConfidence += p.confidence;
    if (p.correct) entry.correct++;
    userMap.set(addr, entry);
  }

  const entries: LeaderboardEntry[] = [];
  let rank = 1;

  for (const [address, data] of userMap) {
    const idx = demoAddresses.indexOf(address);
    const displayName = idx >= 0 ? demoNames[idx] : `User ${address.slice(0, 6)}`;
    const accuracy =
      data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    const reputationScore =
      data.correct * 100 +
      data.total * 10 +
      Math.round(data.totalConfidence / data.total) * 5;

    entries.push({
      address,
      displayName,
      totalPredictions: data.total,
      correctPredictions: data.correct,
      accuracy,
      reputationScore,
      streak: Math.floor(Math.random() * 5),
      rank: 0,
    });
  }

  entries.sort((a, b) => b.reputationScore - a.reputationScore);
  entries.forEach((e, i) => (e.rank = i + 1));

  return entries;
}

export function getStoryPredictionStats(storyId: string) {
  const storyPredictions = getPredictionsForStory(storyId);
  const optionCounts: Record<string, number> = {};
  let totalConfidence = 0;

  for (const p of storyPredictions) {
    optionCounts[p.optionId] = (optionCounts[p.optionId] || 0) + 1;
    totalConfidence += p.confidence;
  }

  return {
    totalPredictions: storyPredictions.length,
    optionCounts,
    averageConfidence:
      storyPredictions.length > 0
        ? Math.round(totalConfidence / storyPredictions.length * 10) / 10
        : 0,
  };
}
