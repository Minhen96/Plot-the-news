/**
 * deepseek.ts
 *
 * Calls DeepSeek (OpenAI-compatible API) to generate a full FutureLens story
 * from a news headline and description.
 *
 * Returns a typed DeepSeekStoryOutput containing article content, roles,
 * visual novel panels, and prediction options — ready to assemble into a Story.
 *
 * Used by: src/app/api/stories/generate/route.ts
 */
import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `You are an editorial AI for a geopolitical simulation game called FutureLens.
Given a news article, generate a complete interactive scenario.
Return ONLY valid JSON with no markdown, no code fences, no extra text.`;

function buildPrompt(headline: string, description: string, source?: string, fullContent?: string | null): string {
  return `Headline: "${headline}"
Description: "${description}"
${source ? `Source: ${source}` : ""}
${fullContent ? `\nFull article content:\n${fullContent}\n` : ""}

Generate a complete scenario as JSON with this exact shape:
{
  "summary": "2-sentence dramatic lede",
  "category": "one of: Geopolitics, Finance, Technology, Climate, Security",
  "crisisLevel": <integer 0-100>,
  "coverEmoji": "<single emoji representing the crisis>",
  "coverImageQuery": "unsplash search query for article cover photo",
  "articleBody": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "historicalContext": "1-2 sentences of relevant historical fact",
  "historicalEvidence": {
    "title": "Historical event title",
    "quote": "2-sentence historical parallel",
    "summary": "1 sentence connecting past to present"
  },
  "cliffhanger": "1 dramatic sentence ending the article, hooks the reader into playing",
  "roles": [
    {
      "id": "faction-slug",
      "name": "Role name",
      "faction": "Faction label",
      "quote": "In-character quote in double quotes",
      "stats": { "strategic": <0-100>, "stability": <0-100> },
      "keyPlayerStance": "e.g. Defensive / High Alert",
      "portraitPrompt": "FAL.ai prompt for cinematic character portrait, photorealistic"
    },
    { "id": "faction-slug-2", "name": "...", "faction": "...", "quote": "...", "stats": { "strategic": 0, "stability": 0 }, "keyPlayerStance": "...", "portraitPrompt": "..." }
  ],
  "panels": [
    {
      "id": "scene-1",
      "characterIndex": 0,
      "sectorBadge": "Location name e.g. Eastern Basin Alpha",
      "dialogue": "2-3 sentence in-character monologue, dramatic, present tense",
      "bgPrompt": "Descriptive FAL.ai image prompt for this specific physical location. (e.g. 'Dark neon-lit hackerspace, glowing monitors, cinematic lighting, wide angle'). MUST BE UNIQUE for each scene."
    },
    { "id": "scene-2", "characterIndex": 0, "sectorBadge": "Different location...", "dialogue": "...", "bgPrompt": "Unique image prompt for this completely new location..." },
    { "id": "scene-3", "characterIndex": 0, "sectorBadge": "Another location...", "dialogue": "...", "bgPrompt": "Unique image prompt for this third distinct location..." }
  ],
  "predictionOptions": [
    {
      "id": "option-slug",
      "label": "Short label 3-5 words",
      "description": "1-2 sentence description of this strategic choice",
      "votes": <integer 3000-12000>,
      "proposedBy": "username like Stratos_Alpha",
      "popular": true
    },
    { "id": "option-slug-2", "label": "...", "description": "...", "votes": 0, "proposedBy": "...", "popular": false },
    { "id": "option-slug-3", "label": "...", "description": "...", "votes": 0, "proposedBy": "...", "popular": false }
  ],
  "refs": [
    { "title": "Source title", "source": "Publication name", "url": "#" }
  ]
}`;
}

export interface DeepSeekStoryOutput {
  summary: string;
  category: string;
  crisisLevel: number;
  coverEmoji: string;
  coverImageQuery: string;
  articleBody: string[];
  historicalContext: string;
  historicalEvidence: { title: string; quote: string; summary: string };
  cliffhanger: string;
  roles: {
    id: string;
    name: string;
    faction: string;
    quote: string;
    stats: { strategic: number; stability: number };
    keyPlayerStance: string;
    portraitPrompt: string;
  }[];
  panels: {
    id: string;
    characterIndex: number;
    sectorBadge: string;
    dialogue: string;
    bgPrompt: string;
  }[];
  predictionOptions: {
    id: string;
    label: string;
    description: string;
    votes: number;
    proposedBy: string;
    popular: boolean;
  }[];
  refs: { title: string; source: string; url: string }[];
}

/**
 * Generate story content using DeepSeek
 */
export async function generateStoryContent(
  headline: string,
  description: string,
  source?: string,
  fullContent?: string | null
): Promise<DeepSeekStoryOutput> {
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(headline, description, source, fullContent) },
    ],
    response_format: { type: "json_object" },
  });

  const rawText = response.choices[0].message.content ?? "";

  return JSON.parse(rawText) as DeepSeekStoryOutput;
}
