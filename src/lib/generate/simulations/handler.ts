import OpenAI from "openai";
import type { SimulationPhase } from "@/lib/types";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

/**
 * Generate a simulation timeline for a given story + prediction choice.
 */
export async function generateSimulation(
  storyTitle: string,
  optionLabel: string,
  roleId: string,
  cliffhanger?: string
): Promise<SimulationPhase[]> {
  const prompt = `Story: "${storyTitle}"
Role: "${roleId}"
Strategic choice: "${optionLabel}"
${cliffhanger ? `Context: "${cliffhanger}"` : ""}

Generate a 3-phase geopolitical simulation as JSON. Each event is 2-3 dramatic in-character sentences.

{
  "timeline": [
    {
      "phase": "short",
      "label": "Short-term",
      "timeframe": "Days 1-7",
      "emoji": "🟡",
      "event": "2-3 dramatic narrative sentences describing the immediate outcome",
      "probability": <integer 60-85>,
      "operationalStatus": "Short status chip e.g. 'Cooling Period'",
      "causalFactors": ["brief factor 1", "brief factor 2"]
    },
    {
      "phase": "mid",
      "label": "Mid-term",
      "timeframe": "Weeks 1-12",
      "emoji": "🟠",
      "event": "2-3 dramatic sentences about consequences over weeks",
      "probability": <integer 40-65>,
      "operationalStatus": "Status chip",
      "causalFactors": ["brief factor 1", "brief factor 2"]
    },
    {
      "phase": "long",
      "label": "Long-term",
      "timeframe": "Year 1-3",
      "emoji": "🔴",
      "event": "2-3 dramatic sentences about lasting structural impact",
      "probability": <integer 25-50>,
      "operationalStatus": "Status chip",
      "causalFactors": ["brief factor 1", "brief factor 2"]
    }
  ]
}`;

  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content:
          "You are a geopolitical simulation AI for FutureLens. Generate realistic outcome scenarios. Return ONLY valid JSON with no markdown or extra text.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = JSON.parse(response.choices[0].message.content ?? "{}");
  return raw.timeline as SimulationPhase[];
}
