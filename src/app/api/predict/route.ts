import { NextResponse } from "next/server";
import { getStory } from "@/data/stories";
import { getStoryById, upsertStory } from "@/lib/stories";
import { addPrediction, getUserPredictionForStory } from "@/lib/predictions";
import { hashPrediction, hashStory } from "@/lib/blockchain";
import { refinePrediction } from "@/lib/generate";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const body = await request.json();
  const { storyId, optionId, userAddress, confidence, justification } = body;

  if (!storyId || !optionId || !userAddress) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Find story — DB first, then static
  let story = await getStoryById(storyId).catch(() => undefined) ?? getStory(storyId);
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // If story came from static data, ensure it exists in DB (required for FK)
  const inDb = await getStoryById(storyId).catch(() => undefined);
  if (!inDb) {
    await upsertStory(story).catch(() => { /* best-effort */ });
  }

  let finalOptionId = optionId;
  let finalOptionLabel = "";

  if (optionId === 'custom') {
    if (!justification) {
      return NextResponse.json({ error: "Justification required for custom prediction" }, { status: 400 });
    }

    // Refine user input into a professional Directive
    const refined = await refinePrediction(justification, {
      title: story.title,
      cliffhanger: story.cliffhanger ?? "",
    });

    const newOptionId = `community-${uuidv4().slice(0, 8)}`;
    const newDirective = {
      id: newOptionId,
      label: refined.label,
      description: refined.description,
      votes: 1,
      proposedBy: userAddress,
      popular: false,
    };

    // Update story with new community directive
    const currentOptions = story.predictionOptions || [];
    const updatedOptions = [...currentOptions, newDirective];

    await db
      .update(stories)
      .set({ predictionOptions: updatedOptions })
      .where(eq(stories.id, storyId))
      .catch(() => {});

    finalOptionId = newOptionId;
    finalOptionLabel = refined.label;
  } else {
    const option = story.predictionOptions.find((o) => o.id === optionId);
    if (!option) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }
    finalOptionLabel = option.label;
  }

  const existing = await getUserPredictionForStory(userAddress, storyId);
  if (existing) {
    return NextResponse.json(
      { error: "Already predicted on this story", prediction: existing },
      { status: 409 }
    );
  }

  const timestamp = Date.now();
  
  // TODO: Implement on-chain recording
  // The prediction and story hashes are calculated here but not yet sent to a contract.
  const predictionHash = hashPrediction(storyId, finalOptionId, userAddress, timestamp);
  const storyHash = hashStory(storyId);

  const prediction = await addPrediction({
    storyId,
    userAddress,
    optionId: finalOptionId,
    optionLabel: finalOptionLabel,
    confidence: confidence ?? 75,
    justification: justification ?? null,
    timestamp,
    txHash: undefined, // TODO: Store real transaction hash after on-chain record
    resolved: false,
    correct: undefined,
  });

  return NextResponse.json({
    prediction,
    blockchain: {
      predictionHash,
      storyHash,
      // TODO: Replace with real contract interaction in the future
      message: "Sign this transaction in your wallet to record your prediction on-chain (SIMULATED)",
      contractCall: {
        method: "registerPrediction",
        args: [storyHash, predictionHash, confidence ?? 75],
      },
    },
  });
}
