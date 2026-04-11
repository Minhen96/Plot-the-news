import OpenAI from "openai";
import { PredictionRefinement } from "../types";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `You are a strategic intelligence AI for FutureLens. 
Your task is to take a raw user prediction and refine it into a professional, concise Strategic Directive.

A Strategic Directive consists of:
1. Label: 3-5 words, punchy, professional.
2. Description: 1-2 sentences of strategic foresight, professional but dramatic.

Rules:
- Keep it grounded in the provided news context.
- Maintain a neutral, analytical tone.
- Return ONLY valid JSON.`;

export async function refinePrediction(
  userText: string,
  context: { title: string; cliffhanger: string }
): Promise<PredictionRefinement> {
  const prompt = `News Article: "${context.title}"
Context: "${context.cliffhanger}"
User's Prediction: "${userText}"

Refine this into a Strategic Directive:
{
  "label": "Punchy Label",
  "description": "Professional 1-2 sentence description"
}`;

  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 512,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = JSON.parse(response.choices[0].message.content ?? "{}");
  return {
    label: raw.label,
    description: raw.description,
  } as PredictionRefinement;
}
