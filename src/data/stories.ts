import { Story } from "@/lib/types";

// Pre-built demo stories for hackathon presentation
export const demoStories: Story[] = [
  {
    id: "tiktok-ban-2024",
    title: "TikTok Faces US Ban: National Security vs. Free Speech",
    category: "Technology & Policy",
    summary:
      "The US government moves to ban TikTok over national security concerns, sparking debate over digital rights and geopolitics.",
    coverEmoji: "📱",
    date: "2024-03-15",
    predictionCount: 1847,
    consensusOption: "partial-deal",
    controversyScore: 72,
    status: "active",
    panels: [
      {
        id: 1,
        narrative:
          "In early 2024, US lawmakers introduce legislation requiring ByteDance to divest TikTok or face a nationwide ban.",
        caption: "The Ultimatum",
        visualDescription:
          "A government building with a giant gavel coming down on a phone screen showing the TikTok logo",
        emoji: "🏛️",
      },
      {
        id: 2,
        narrative:
          "150 million American users rally online with #SaveTikTok. Creators warn of devastating economic impact — many built entire careers on the platform.",
        caption: "Digital Uprising",
        visualDescription:
          "Millions of phones lighting up with protest messages, creators holding signs",
        emoji: "📣",
      },
      {
        id: 3,
        narrative:
          "ByteDance explores options: sell to a US company, restructure data operations, or challenge the law in court. Meanwhile, other countries watch closely.",
        caption: "The Chess Game",
        visualDescription:
          "A chess board with pieces representing different countries and tech companies",
        emoji: "♟️",
      },
      {
        id: 4,
        narrative:
          "The Supreme Court agrees to hear the case. Both sides present arguments about national security, free speech, and the future of the internet.",
        caption: "The Courtroom Showdown",
        visualDescription:
          "Supreme Court justices deliberating with digital screens showing both sides",
        emoji: "⚖️",
      },
      {
        id: 5,
        narrative:
          "As the deadline approaches, backroom negotiations intensify. Tech giants circle as potential buyers. The world waits.",
        caption: "The Countdown",
        visualDescription:
          "A ticking clock with corporate logos swirling around it",
        emoji: "⏰",
      },
    ],
    cliffhanger:
      "The ban deadline is approaching. ByteDance faces an impossible choice: sell the crown jewel or lose the world's largest market. What happens next?",
    predictionOptions: [
      {
        id: "full-ban",
        label: "Full Ban Enacted",
        description:
          "TikTok is completely banned in the US. Users switch to alternatives like Instagram Reels and YouTube Shorts.",
        probability: "25%",
      },
      {
        id: "partial-deal",
        label: "Forced Sale / Restructuring",
        description:
          "ByteDance sells TikTok's US operations to an American company or creates a separate US entity with domestic data controls.",
        probability: "40%",
      },
      {
        id: "legal-block",
        label: "Courts Block the Ban",
        description:
          "The Supreme Court rules the ban unconstitutional on First Amendment grounds. TikTok continues operating as-is.",
        probability: "20%",
      },
      {
        id: "extension",
        label: "Indefinite Extension",
        description:
          "Political pressure and lobbying lead to repeated deadline extensions. The ban never actually takes effect.",
        probability: "15%",
      },
    ],
    historicalEvidence: [
      {
        title: "Huawei 5G Ban (2019)",
        year: "2019",
        summary:
          "The US banned Huawei from 5G networks, citing national security. Allies followed suit, reshaping global telecom infrastructure.",
        outcome:
          "Huawei was effectively locked out of Western markets. China accelerated domestic tech development.",
        relevance:
          "Same national security framing, same US-China tech tensions, but Huawei had no direct consumer base to rally.",
        panels: [
          {
            id: 1,
            narrative:
              "US intelligence agencies flag Huawei equipment as a potential surveillance vector for the Chinese government.",
            caption: "The Warning",
            visualDescription: "Security analysts examining network diagrams with red flags",
            emoji: "🔍",
          },
          {
            id: 2,
            narrative:
              "Despite lobbying, Huawei is banned from US 5G networks. Allies pressured to follow.",
            caption: "The Domino Effect",
            visualDescription: "Flags of countries falling like dominoes",
            emoji: "🌐",
          },
          {
            id: 3,
            narrative:
              "Huawei pivots to other markets. China launches massive semiconductor independence programs.",
            caption: "The Pivot",
            visualDescription: "Factory producing chips with Chinese flag in background",
            emoji: "🔄",
          },
        ],
      },
      {
        title: "India Bans Chinese Apps (2020)",
        year: "2020",
        summary:
          "India banned 59 Chinese apps including TikTok following border clashes. 200 million Indian TikTok users lost access overnight.",
        outcome:
          "Indian alternatives emerged (Josh, Moj). TikTok lost its largest market by users. ByteDance revenue took a significant hit.",
        relevance:
          "Direct precedent — TikTok was actually banned in a major market. Shows what user displacement looks like.",
        panels: [
          {
            id: 1,
            narrative:
              "Border tensions between India and China escalate after deadly clashes in Ladakh.",
            caption: "The Trigger",
            visualDescription: "Mountain border with tension on both sides",
            emoji: "⛰️",
          },
          {
            id: 2,
            narrative:
              "India bans 59 Chinese apps overnight. 200 million TikTok users wake up to find the app gone.",
            caption: "The Blackout",
            visualDescription: "Millions of phone screens going dark simultaneously",
            emoji: "📵",
          },
          {
            id: 3,
            narrative:
              "Indian developers rush to fill the void. Multiple short-video apps launch within weeks.",
            caption: "The Replacement",
            visualDescription: "New app icons sprouting from the ground like plants",
            emoji: "🌱",
          },
        ],
      },
    ],
  },
  {
    id: "ai-regulation-eu",
    title: "EU AI Act: The World's First Comprehensive AI Law",
    category: "AI & Regulation",
    summary:
      "The European Union passes the AI Act, creating the world's first comprehensive AI regulation framework. Tech companies scramble to comply.",
    coverEmoji: "🤖",
    date: "2024-06-01",
    predictionCount: 923,
    controversyScore: 58,
    status: "active",
    panels: [
      {
        id: 1,
        narrative:
          "After years of debate, the EU Parliament passes the AI Act with a massive majority. It classifies AI systems by risk level.",
        caption: "The Vote",
        visualDescription:
          "EU Parliament with hands raised, a holographic AI brain in the center",
        emoji: "🗳️",
      },
      {
        id: 2,
        narrative:
          "Tech giants react. Some threaten to limit EU services. Others begin expensive compliance overhauls. Startups worry about survival.",
        caption: "Industry Shock",
        visualDescription:
          "Tech company logos on buildings, some with alarm lights flashing",
        emoji: "🏢",
      },
      {
        id: 3,
        narrative:
          "The 'Brussels Effect' begins — companies start applying EU rules globally rather than maintaining two separate AI systems.",
        caption: "The Ripple",
        visualDescription:
          "Ripple waves spreading from Europe across a world map",
        emoji: "🌊",
      },
      {
        id: 4,
        narrative:
          "Enforcement begins in phases. High-risk AI in healthcare, law enforcement, and hiring faces the strictest scrutiny.",
        caption: "The Reckoning",
        visualDescription:
          "Magnifying glass examining AI systems in hospitals and courtrooms",
        emoji: "🔬",
      },
    ],
    cliffhanger:
      "The AI Act is law, but enforcement is just beginning. Will it become the global standard — or will it push AI innovation out of Europe?",
    predictionOptions: [
      {
        id: "global-standard",
        label: "Becomes Global Standard",
        description:
          "Other countries adopt similar frameworks. The EU AI Act becomes the de facto global AI regulation template.",
        probability: "35%",
      },
      {
        id: "eu-brain-drain",
        label: "EU Loses AI Competitiveness",
        description:
          "Strict regulation drives AI companies and talent to the US and Asia. Europe falls behind in AI development.",
        probability: "25%",
      },
      {
        id: "watered-down",
        label: "Enforcement Weakened",
        description:
          "Lobbying and practical challenges lead to weak enforcement. The law exists but has little real impact.",
        probability: "25%",
      },
      {
        id: "middle-ground",
        label: "Balanced Outcome",
        description:
          "Some companies leave, but the framework attracts 'trustworthy AI' investment. EU carves out a niche.",
        probability: "15%",
      },
    ],
    historicalEvidence: [
      {
        title: "GDPR Impact (2018)",
        year: "2018",
        summary:
          "The EU's GDPR privacy law became the global standard for data protection despite initial resistance from tech companies.",
        outcome:
          "GDPR became the template for privacy laws worldwide. Companies adapted. Some EU innovation concerns were valid but manageable.",
        relevance:
          "Same regulatory approach (EU first-mover), same industry pushback, same 'Brussels Effect' dynamics.",
        panels: [
          {
            id: 1,
            narrative:
              "EU passes GDPR. Tech industry warns of chaos and innovation death.",
            caption: "The Panic",
            visualDescription: "Newspaper headlines about GDPR doom",
            emoji: "📰",
          },
          {
            id: 2,
            narrative:
              "Companies spend billions on compliance. Cookie banners appear everywhere. But the sky doesn't fall.",
            caption: "The Adaptation",
            visualDescription: "Websites covered in cookie consent popups",
            emoji: "🍪",
          },
          {
            id: 3,
            narrative:
              "California, Brazil, Japan and others pass similar laws. GDPR becomes the global privacy baseline.",
            caption: "The Standard",
            visualDescription: "World map lighting up country by country with privacy laws",
            emoji: "🌍",
          },
        ],
      },
    ],
  },
  {
    id: "climate-tipping-point",
    title: "Amazon Rainforest Hits Critical Tipping Point",
    category: "Climate & Environment",
    summary:
      "Scientists warn the Amazon is approaching an irreversible tipping point where the rainforest could transform into savanna, with catastrophic global consequences.",
    coverEmoji: "🌳",
    date: "2024-09-20",
    predictionCount: 1256,
    controversyScore: 45,
    status: "active",
    panels: [
      {
        id: 1,
        narrative:
          "Satellite data reveals record deforestation in the Amazon. Scientists publish alarming research showing 17% of the forest has been lost.",
        caption: "The Data",
        visualDescription:
          "Satellite view of Amazon with red patches of deforestation spreading",
        emoji: "🛰️",
      },
      {
        id: 2,
        narrative:
          "Brazil's new government launches aggressive anti-deforestation policies. Illegal logging operations are raided. Deforestation rates begin to drop.",
        caption: "The Crackdown",
        visualDescription:
          "Police helicopters over illegal logging sites, trees being protected",
        emoji: "🚁",
      },
      {
        id: 3,
        narrative:
          "Despite policy wins, scientists warn that climate feedback loops may have already started. Parts of the eastern Amazon are now emitting more carbon than they absorb.",
        caption: "The Warning",
        visualDescription:
          "A healthy green forest on one side transitioning to brown savanna on the other",
        emoji: "⚠️",
      },
      {
        id: 4,
        narrative:
          "International funding promises pour in at COP. But the gap between pledges and action remains enormous. Indigenous communities demand a seat at the table.",
        caption: "The Promise Gap",
        visualDescription:
          "A conference room with world leaders, a gap between stacks of money labeled 'promised' and 'delivered'",
        emoji: "💰",
      },
    ],
    cliffhanger:
      "The Amazon stands at a crossroads. New policies show promise, but climate feedback loops may already be unstoppable. Can the forest be saved in time?",
    predictionOptions: [
      {
        id: "recovery",
        label: "Recovery Begins",
        description:
          "Sustained policy enforcement and international funding reverse deforestation trends. The tipping point is averted.",
        probability: "20%",
      },
      {
        id: "slow-decline",
        label: "Slow Degradation Continues",
        description:
          "Some improvements, but not enough. The Amazon slowly degrades, losing more species and carbon storage capacity each year.",
        probability: "40%",
      },
      {
        id: "tipping-point",
        label: "Tipping Point Crossed",
        description:
          "Despite efforts, feedback loops accelerate. Large portions of the Amazon begin irreversible transition to savanna within a decade.",
        probability: "25%",
      },
      {
        id: "tech-solution",
        label: "Tech-Enabled Conservation",
        description:
          "AI monitoring, blockchain-verified carbon credits, and precision reforestation technologies prove game-changing.",
        probability: "15%",
      },
    ],
    historicalEvidence: [
      {
        title: "Aral Sea Collapse (1960-2000)",
        year: "1960",
        summary:
          "Once the 4th largest lake, the Aral Sea was drained by Soviet irrigation projects, causing ecological catastrophe.",
        outcome:
          "The Aral Sea lost 90% of its volume. The surrounding region suffered health crises, economic collapse, and climate change.",
        relevance:
          "Shows how crossing environmental tipping points leads to irreversible ecological transformation.",
        panels: [
          {
            id: 1,
            narrative:
              "Soviet planners divert rivers feeding the Aral Sea to irrigate cotton fields. The lake begins to shrink.",
            caption: "The Diversion",
            visualDescription: "Rivers being redirected with concrete channels",
            emoji: "🚰",
          },
          {
            id: 2,
            narrative:
              "By the 1990s, fishing villages sit 100km from the water. Ships rust in desert sand. A way of life is destroyed.",
            caption: "The Desert",
            visualDescription: "Rusting ships stranded in sand where water used to be",
            emoji: "🏜️",
          },
          {
            id: 3,
            narrative:
              "Toxic dust storms from the dry seabed spread pesticides across the region. Health crises follow.",
            caption: "The Fallout",
            visualDescription: "Dust storm carrying toxic particles over towns",
            emoji: "🌪️",
          },
        ],
      },
    ],
  },
  {
    id: "crypto-etf-revolution",
    title: "Bitcoin ETF Approved: Wall Street Meets Crypto",
    category: "Finance & Blockchain",
    summary:
      "After years of rejections, the SEC approves spot Bitcoin ETFs. Institutional money floods in, changing the crypto landscape forever.",
    coverEmoji: "₿",
    date: "2024-01-11",
    predictionCount: 2341,
    consensusOption: "mainstream-adoption",
    controversyScore: 38,
    status: "resolved",
    resolvedOutcome: "mainstream-adoption",
    panels: [
      {
        id: 1,
        narrative:
          "January 10, 2024: The SEC approves 11 spot Bitcoin ETFs simultaneously, ending a decade-long battle.",
        caption: "The Green Light",
        visualDescription: "SEC building with a giant green traffic light, Bitcoin symbol shining",
        emoji: "✅",
      },
      {
        id: 2,
        narrative:
          "Day one trading exceeds $4.6 billion. BlackRock, Fidelity, and other giants compete for market share. Bitcoin price surges.",
        caption: "The Flood",
        visualDescription: "Wall Street with a tidal wave of golden Bitcoin coins",
        emoji: "🌊",
      },
      {
        id: 3,
        narrative:
          "Within months, Bitcoin ETFs become the fastest-growing ETF category in history. Retirement funds begin allocating to Bitcoin.",
        caption: "The Mainstream",
        visualDescription:
          "Regular people checking their retirement accounts showing Bitcoin allocation",
        emoji: "📈",
      },
      {
        id: 4,
        narrative:
          "The success triggers Ethereum ETF applications. Other countries accelerate their own crypto ETF frameworks.",
        caption: "The Domino",
        visualDescription:
          "ETF application papers flying from multiple buildings worldwide",
        emoji: "🃏",
      },
    ],
    cliffhanger:
      "Bitcoin ETFs are live and breaking records. Will this be the bridge that brings crypto to every portfolio — or a bubble waiting to pop?",
    predictionOptions: [
      {
        id: "mainstream-adoption",
        label: "Mainstream Financial Adoption",
        description:
          "ETFs onboard millions of new investors. Bitcoin becomes a standard portfolio allocation like gold.",
        probability: "45%",
      },
      {
        id: "bubble-burst",
        label: "ETF-Driven Bubble",
        description:
          "Easy access drives speculation. A major correction follows, damaging institutional confidence.",
        probability: "20%",
      },
      {
        id: "regulatory-clamp",
        label: "Regulatory Backlash",
        description:
          "Success attracts more regulatory scrutiny. New restrictions dampen the initial enthusiasm.",
        probability: "15%",
      },
      {
        id: "slow-burn",
        label: "Gradual Integration",
        description:
          "Steady but unspectacular growth. Crypto becomes another asset class without the dramatic transformation predicted.",
        probability: "20%",
      },
    ],
    historicalEvidence: [
      {
        title: "Gold ETF Launch (2004)",
        year: "2004",
        summary:
          "The first gold ETF (GLD) launched in 2004, making gold investment accessible to retail investors for the first time.",
        outcome:
          "Gold went from $400 to $1,900 over the next 7 years. ETFs fundamentally changed how people invest in gold.",
        relevance:
          "Direct parallel — a previously hard-to-access asset class made simple through ETFs.",
        panels: [
          {
            id: 1,
            narrative:
              "Before ETFs, buying gold meant dealing with vaults, dealers, and high premiums. Most retail investors couldn't participate.",
            caption: "The Barrier",
            visualDescription: "A giant vault door blocking regular people from gold bars",
            emoji: "🏦",
          },
          {
            id: 2,
            narrative:
              "GLD launches and quickly becomes one of the largest ETFs in the world. Gold demand soars.",
            caption: "The Opening",
            visualDescription: "Vault doors swinging open with people streaming in",
            emoji: "🚪",
          },
          {
            id: 3,
            narrative:
              "Gold prices rise 375% over the next 7 years. ETFs are credited with fundamentally changing gold markets.",
            caption: "The Bull Run",
            visualDescription: "A golden bull charging upward on a chart",
            emoji: "🐂",
          },
        ],
      },
    ],
  },
  {
    id: "ev-price-war",
    title: "Global EV Price War: Tesla vs China",
    category: "Business & Innovation",
    summary:
      "Chinese EV makers slash prices globally, triggering a brutal price war that threatens established automakers and reshapes the $3 trillion auto industry.",
    coverEmoji: "🚗",
    date: "2024-07-15",
    predictionCount: 678,
    controversyScore: 63,
    status: "active",
    panels: [
      {
        id: 1,
        narrative:
          "BYD launches the Seagull EV at under $10,000 — cheaper than many used cars. Western automakers watch in disbelief.",
        caption: "The Price Shock",
        visualDescription: "A tiny affordable EV with a huge price tag showing $9,999",
        emoji: "💰",
      },
      {
        id: 2,
        narrative:
          "Tesla responds with aggressive price cuts across all models. Traditional automakers, already bleeding money on EVs, face an impossible choice.",
        caption: "The Response",
        visualDescription: "Price tags on cars being slashed with scissors",
        emoji: "✂️",
      },
      {
        id: 3,
        narrative:
          "EU and US announce tariffs on Chinese EVs. But consumers ask: why should we pay twice as much for the same technology?",
        caption: "The Tariff Wall",
        visualDescription: "A wall of tariff barriers with consumers looking over it at cheaper cars",
        emoji: "🧱",
      },
      {
        id: 4,
        narrative:
          "Chinese manufacturers begin building factories in Europe and Mexico to circumvent tariffs. The globalization of Chinese EVs accelerates.",
        caption: "The Workaround",
        visualDescription: "Factories being built around the world with Chinese EV brands",
        emoji: "🏭",
      },
    ],
    cliffhanger:
      "Chinese EVs are reshaping the global auto industry. Tariffs buy time but can't stop the technology gap from closing. How does this end?",
    predictionOptions: [
      {
        id: "china-dominates",
        label: "Chinese Brands Win Globally",
        description:
          "Chinese EVs capture 30%+ global market share. Multiple Western automakers face bankruptcy or acquisition.",
        probability: "30%",
      },
      {
        id: "tariff-walls",
        label: "Protected Markets Emerge",
        description:
          "High tariffs create separate markets. Chinese brands dominate Asia/Africa while Western brands hold US/EU.",
        probability: "35%",
      },
      {
        id: "tech-leapfrog",
        label: "Western Tech Leapfrog",
        description:
          "Western companies invest in solid-state batteries and autonomous driving to leapfrog Chinese cost advantages.",
        probability: "15%",
      },
      {
        id: "consolidation",
        label: "Industry Mega-Mergers",
        description:
          "Price pressure forces massive consolidation. Only 5-6 global EV makers survive by 2030.",
        probability: "20%",
      },
    ],
    historicalEvidence: [
      {
        title: "Japanese Auto Invasion (1970s-80s)",
        year: "1970",
        summary:
          "Japanese automakers disrupted the US market with cheaper, more reliable cars, permanently reshaping the global auto industry.",
        outcome:
          "Japanese brands captured 30% of the US market. Detroit lost hundreds of thousands of jobs. US automakers eventually adapted but never recovered dominance.",
        relevance:
          "Nearly identical pattern: a foreign competitor with cost/quality advantages disrupts established Western automakers.",
        panels: [
          {
            id: 1,
            narrative:
              "The oil crisis hits. American gas-guzzlers become unaffordable. Toyota and Honda offer affordable, efficient alternatives.",
            caption: "The Opening",
            visualDescription: "Gas station with sky-high prices, small Japanese cars driving past",
            emoji: "⛽",
          },
          {
            id: 2,
            narrative:
              "Detroit lobbies for tariffs and quotas. 'Voluntary' export restraints are imposed. But Japanese quality keeps winning customers.",
            caption: "The Resistance",
            visualDescription: "Protesters smashing Japanese cars while consumers buy more",
            emoji: "🔨",
          },
          {
            id: 3,
            narrative:
              "Japanese manufacturers build US factories. By the 1990s, they're 'American-made' cars. The industry is forever changed.",
            caption: "The Integration",
            visualDescription: "Japanese-brand factory with American workers and flags",
            emoji: "🤝",
          },
        ],
      },
    ],
  },
  {
    id: "space-commercialization",
    title: "The Space Economy Boom: From Sci-Fi to Business",
    category: "Science & Technology",
    summary:
      "Private space companies reach new milestones as commercial space stations, lunar mining, and satellite mega-constellations turn space into a trillion-dollar economy.",
    coverEmoji: "🚀",
    date: "2024-11-01",
    predictionCount: 534,
    controversyScore: 51,
    status: "active",
    panels: [
      {
        id: 1,
        narrative:
          "SpaceX's Starship completes its first successful orbital flight and landing. The cost of reaching orbit drops by 90%.",
        caption: "The Breakthrough",
        visualDescription: "Massive Starship rocket landing perfectly on a pad",
        emoji: "🚀",
      },
      {
        id: 2,
        narrative:
          "NASA announces partnerships with three companies to build commercial space stations. The ISS successor will be privately owned.",
        caption: "The Handoff",
        visualDescription: "ISS with private company logos on new modules being attached",
        emoji: "🛸",
      },
      {
        id: 3,
        narrative:
          "Satellite mega-constellations provide global internet. But astronomers warn of light pollution and space debris risks.",
        caption: "The Double Edge",
        visualDescription: "Beautiful internet coverage map overlaid with debris collision warnings",
        emoji: "📡",
      },
      {
        id: 4,
        narrative:
          "Multiple nations and companies announce lunar resource missions. The question shifts from 'can we?' to 'who owns what?'",
        caption: "The Moon Rush",
        visualDescription: "Moon surface with multiple flags and mining equipment",
        emoji: "🌙",
      },
    ],
    cliffhanger:
      "Space is becoming big business. But who will govern it, who profits, and can we avoid turning orbit into a junkyard?",
    predictionOptions: [
      {
        id: "trillion-economy",
        label: "Trillion-Dollar Space Economy by 2030",
        description:
          "Manufacturing, tourism, mining, and communications make space a major economic sector.",
        probability: "25%",
      },
      {
        id: "military-dominance",
        label: "Militarization Dominates",
        description:
          "Great power competition turns space into primarily a military domain. Commercial development slows.",
        probability: "20%",
      },
      {
        id: "debris-crisis",
        label: "Space Debris Crisis",
        description:
          "Kessler syndrome threat forces dramatic slowdown in launches. International debris cleanup becomes priority.",
        probability: "20%",
      },
      {
        id: "steady-growth",
        label: "Steady Commercial Growth",
        description:
          "Space economy grows steadily but without the dramatic breakthroughs predicted. Most value stays in satellites and communications.",
        probability: "35%",
      },
    ],
    historicalEvidence: [
      {
        title: "Commercial Aviation Revolution (1950s-60s)",
        year: "1950",
        summary:
          "Jet aviation transformed from military technology to commercial service, making global travel accessible and creating entirely new industries.",
        outcome:
          "Air travel went from luxury to commodity. Tourism became a global industry. International business was revolutionized.",
        relevance:
          "Same pattern: military/government technology becomes commercially viable as costs drop dramatically.",
        panels: [
          {
            id: 1,
            narrative:
              "The de Havilland Comet and Boeing 707 make jet travel commercial. Flying goes from 3-day journey to 8 hours.",
            caption: "The Jet Age",
            visualDescription: "First commercial jets with excited passengers boarding",
            emoji: "✈️",
          },
          {
            id: 2,
            narrative:
              "Airlines multiply. Competition drives prices down. The middle class can now fly internationally.",
            caption: "The Democratization",
            visualDescription: "Families with luggage excitedly heading to airports",
            emoji: "👨‍👩‍👧‍👦",
          },
          {
            id: 3,
            narrative:
              "Tourism becomes a global industry. Business goes international. The world shrinks.",
            caption: "The Small World",
            visualDescription: "Globe with planes connecting all continents, cities growing",
            emoji: "🌐",
          },
        ],
      },
    ],
  },
];

export function getStoryById(id: string): Story | undefined {
  return demoStories.find((s) => s.id === id);
}

export function getActiveStories(): Story[] {
  return demoStories.filter((s) => s.status === "active");
}

export function getResolvedStories(): Story[] {
  return demoStories.filter((s) => s.status === "resolved");
}
