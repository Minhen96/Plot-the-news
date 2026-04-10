import { NextResponse } from "next/server";
import { getStory } from "@/data/stories";
import { addPrediction, getUserPredictionForStory } from "@/lib/predictions";
import { hashPrediction, hashStory } from "@/lib/blockchain";

export async function POST(request: Request) {
  const body = await request.json();
  const { storyId, optionId, userAddress, confidence, justification } = body;

  if (!storyId || !optionId || !userAddress) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const story = getStory(storyId);
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const option = story.predictionOptions.find((o) => o.id === optionId);
  if (!option) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const existing = await getUserPredictionForStory(userAddress, storyId);
  if (existing) {
    return NextResponse.json(
      { error: "Already predicted on this story", prediction: existing },
      { status: 409 }
    );
  }

  const timestamp = Date.now();
  const predictionHash = hashPrediction(storyId, optionId, userAddress, timestamp);
  const storyHash = hashStory(storyId);

  const prediction = await addPrediction({
    storyId,
    userAddress,
    optionId,
    optionLabel: option.label,
    confidence: confidence ?? 3,
    justification: justification ?? null,
    timestamp,
    txHash: null,
    resolved: false,
    correct: null,
  });

  return NextResponse.json({
    prediction,
    blockchain: {
      predictionHash,
      storyHash,
      message: "Sign this transaction in your wallet to record your prediction on-chain",
      contractCall: {
        method: "registerPrediction",
        args: [storyHash, predictionHash, confidence ?? 3],
      },
    },
  });
}
