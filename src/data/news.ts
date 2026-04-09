import type { NewsArticle } from '@/lib/types'

// Shown only when NEWSDATA_API_KEY is not set
export const WORLD_FALLBACK: NewsArticle[] = [
    {
        title: 'Iran Moves to Close Strait of Hormuz — Oil Markets in Freefall',
        description:
            'As geopolitical tensions escalate in the Strait of Hormuz, the world watches a high-stakes chess match on the high seas. A narrow corridor where global energy security meets modern naval brinkmanship.',
        url: '#fallback-hormuz',
        image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'The Illuminated Editorial', url: '#' },
        crisisLevel: 92,
        factions: [
            { name: 'The Coalition (West)', stance: 'Defensive' },
            { name: 'The Regional Guard (Iran)', stance: 'Aggressive' }
        ]
    },
    {
        title: 'The Amazon\'s Last Breath: Satellite Data Reveals Accelerating Shifts',
        description:
            'Unprecedented shifts in the rainforest\'s ecosystem demand immediate global conservation efforts as tipping points loom.',
        url: '#fallback-amazon',
        image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'The Illuminated Editorial', url: '#' },
    },
    {
        title: 'Urban Gridlock: The True Cost of Modern Mobility',
        description:
            'Infrastructure failures in major cities are costing the global economy trillions in lost productivity annually.',
        url: '#fallback-gridlock',
        image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'The Illuminated Editorial', url: '#' },
    },
]

export const ECONOMY_FALLBACK: NewsArticle[] = [
    {
        title: 'The Rebirth of Local Currency',
        description: 'Small communities are turning to hyper-local bartering systems as trust in central banks erodes.',
        url: '#fallback-currency',
        image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'The Illuminated Editorial', url: '#' },
    },
    {
        title: 'Market Analysis: The Circuit Pulse',
        description: 'Tech stocks fluctuate as global supply chains tighten further amid geopolitical uncertainty.',
        url: '#fallback-circuit',
        image: null,
        publishedAt: new Date().toISOString(),
        source: { name: 'The Illuminated Editorial', url: '#' },
    },
]

const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

export const LAST_WEEK_FALLBACK: NewsArticle[] = [
    {
        title: 'The Diplomatic Silence Before the Storm',
        description: 'Back-channel talks between Washington and Tehran stalled last week as both sides hardened their positions ahead of the naval exercises.',
        url: '#fallback-silence',
        image: null,
        publishedAt: lastWeek,
        source: { name: 'The Illuminated Editorial', url: '#' },
    },
    {
        title: 'Oil Futures Spike on Gulf Tension Reports',
        description: 'Crude benchmarks jumped 4.2% as satellite imagery confirmed new Iranian naval deployments near the Strait entrance.',
        url: '#fallback-oilfutures',
        image: null,
        publishedAt: lastWeek,
        source: { name: 'The Illuminated Editorial', url: '#' },
    },
    {
        title: 'Allied Navies Convene in Bahrain for Emergency Summit',
        description: 'Senior commanders from twelve nations gathered to coordinate responses to the deteriorating maritime security situation.',
        url: '#fallback-navies',
        image: null,
        publishedAt: lastWeek,
        source: { name: 'The Illuminated Editorial', url: '#' },
    },
]