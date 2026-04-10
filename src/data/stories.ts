import type { Story } from '@/lib/types'

export const STORIES: Story[] = [
  {
    id: 'strait-of-hormuz',
    title: 'The Shadow of the Crescent: America vs. Iran',
    summary:
      'As geopolitical tensions reach a critical inflection point in the Strait of Hormuz, the world watches a high-stakes chess match on the high seas — a narrow corridor where global energy security meets modern naval brinkmanship.',
    category: 'Geopolitics',
    imageUrl: 'https://picsum.photos/seed/hormuz-cover/1200/630',
    date: '2026-04-09',
    status: 'active',
    crisisLevel: 92,
    articleBody: [
      'The geopolitical friction between the United States and Iran has reached a critical inflection point. Following years of "maximum pressure" and the subsequent collapse of the 2015 JCPOA, the diplomatic landscape has shifted from negotiation tables to the high seas. Recent naval escalations in the Persian Gulf have underscored the fragility of regional peace, as both powers navigate a complex web of deterrents and provocations.',
      'At the heart of the current stalemate is the legacy of the nuclear deal and the struggle for regional hegemony. While the JCPOA once promised a path toward Iranian reintegration into the global economy in exchange for nuclear oversight, the withdrawal of the U.S. triggered a spiral of mistrust. Today, the focus has pivoted to maritime security and the protection of global energy supply lines, which remain vulnerable to any sudden shift in the status quo.',
      'Strategic experts warn that this "Maritime Chessboard" could remain volatile for years, creating a potential choke point for global trade not seen in decades of naval history. Three U.S. carrier groups have repositioned. Allied navies from the UK, France, and Australia are converging. The question is no longer whether a miscalculation will occur — but who blinks first.',
    ],
    historicalContext:
      'The Strait of Hormuz is only 33 kilometres wide at its narrowest point. Approximately 20% of the world\'s oil supply — and nearly 30% of global LNG — transits through it daily, making it the single most important energy chokepoint on the planet.',
    historicalEvidence: {
      title: 'The Tanker War (1987–1988)',
      quote:
        'The precedents for today\'s maritime tensions lie in the late 1980s, when the U.S. Navy directly intervened to protect neutral shipping from attacks, leading to the largest naval engagement since WWII.',
      summary:
        'From the 1979 Revolution to the 2015 JCPOA, the cycle of engagement and estrangement has defined the Middle Eastern security architecture for nearly half a century.',
    },
    references: [
      { title: 'Reuters Report: Persian Gulf Logistics', source: 'Security Archive 2026', url: '#' },
      { title: 'Al Jazeera: The Iran–U.S. Stalemate', source: 'Regional Stability Review', url: '#' },
      { title: 'The Editorial: Technical Paper', source: 'Middle East Geopolitical Dynamics', url: '#' },
    ],
    roles: [
      {
        id: 'coalition',
        name: 'The Coalition',
        faction: 'Western Interest',
        quote:
          '"Freedom of navigation is not a privilege — it is the foundation upon which global prosperity is built. We will not yield the Strait."',
        portraitUrl: 'https://picsum.photos/seed/coalition/512/768',
        stats: { strategic: 72, stability: 65 },
        keyPlayerStance: 'Defensive / High Alert',
        portraitPrompt: 'Distinguished Western military admiral in dress uniform, silver hair, confident authoritative expression, cinematic portrait, dark navy backdrop, photorealistic',
      },
      {
        id: 'regional-guard',
        name: 'The Regional Guard',
        faction: 'Regional Sovereignty',
        quote:
          '"Every ship that passes through our waters does so at our discretion. The Strait is not international — it is sovereign."',
        portraitUrl: 'https://picsum.photos/seed/regional-guard/512/768',
        stats: { strategic: 68, stability: 40 },
        keyPlayerStance: 'Aggressive / Opportunistic',
        portraitPrompt: 'Iranian Revolutionary Guard naval commander in uniform, intense determined expression, dramatic side lighting, cinematic portrait, photorealistic',
      },
    ],
    panels: [
      {
        id: 'scene-1',
        characterName: 'The Admiral',
        characterPortrait: 'https://picsum.photos/seed/admiral/512/768',
        backgroundUrl: 'https://picsum.photos/seed/naval-command/1920/1080',
        sectorBadge: 'Eastern Basin Alpha',
        dialogue:
          "Admiral's Log — 0430 hours. Three of their fast-attack vessels crossed the median line twenty minutes ago. Washington wants options on the table before sunrise. What we say in the next six hours will echo for a decade.",
        bgPrompt: 'Naval command center at night, multiple tactical screens glowing blue, officers in uniform at workstations, tense atmosphere, cinematic wide angle, photorealistic',
      },
      {
        id: 'scene-2',
        characterName: 'The Admiral',
        characterPortrait: 'https://picsum.photos/seed/admiral/512/768',
        backgroundUrl: 'https://picsum.photos/seed/naval-ops/1920/1080',
        sectorBadge: 'Eastern Basin Alpha',
        dialogue:
          "Intelligence confirms their coastal missile batteries are on active targeting. One wrong move and we trigger a closure that shuts down 20% of the world's oil in under an hour. The markets are already watching.",
        bgPrompt: 'Aerial view of US carrier strike group in the Persian Gulf at dawn, dramatic storm clouds, military vessels in formation, cinematic photography',
      },
      {
        id: 'scene-3',
        characterName: 'The Admiral',
        characterPortrait: 'https://picsum.photos/seed/admiral/512/768',
        backgroundUrl: 'https://picsum.photos/seed/bridge-dusk/1920/1080',
        sectorBadge: 'Hormuz Corridor',
        dialogue:
          "The question before us isn't military — it's historical. Every admiral who has stood where I stand has had to choose: respond with strength, negotiate with patience, or hold position and wait. Which path shall we take through the Strait?",
        bgPrompt: 'Naval bridge at dusk overlooking the Strait of Hormuz, warm golden hour light through porthole windows, silhouette of officer, cinematic atmosphere, photorealistic',
      },
    ],
    predictionOptions: [
      {
        id: 'de-escalation',
        label: 'Strategic De-escalation',
        description:
          'Propose an emergency diplomatic channel via neutral intermediary. Stand down non-essential patrols while maintaining carrier group positioning.',
        votes: 8412,
        proposedBy: 'Stratos_Alpha',
        popular: true,
      },
      {
        id: 'show-of-force',
        label: 'Calibrated Show of Force',
        description:
          'Execute a coordinated naval exercise at the strait entrance. Signal resolve without direct confrontation — let positioning do the talking.',
        votes: 5203,
        proposedBy: 'NavalHawk_77',
      },
      {
        id: 'economic-pressure',
        label: 'Economic Counter-Pressure',
        description:
          'Coordinate with allied nations to freeze sovereign assets and accelerate alternative energy transit corridors through the Red Sea.',
        votes: 3891,
        proposedBy: 'EconStrategist',
      },
    ],
  },
]

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id)
}
