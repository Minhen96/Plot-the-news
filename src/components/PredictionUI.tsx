"use client";

import { useState } from "react";
import { PredictionOption } from "@/lib/types";

interface PredictionUIProps {
  storyId: string;
  options: PredictionOption[];
  userAddress: string | null;
  onPredict: (optionId: string, confidence: number) => Promise<void>;
  existingPrediction?: string;
  isResolved?: boolean;
  resolvedOutcome?: string;
  communityVotes?: Record<string, number>;
}

export default function PredictionUI({
  options,
  userAddress,
  onPredict,
  existingPrediction,
  isResolved,
  resolvedOutcome,
  communityVotes = {},
}: PredictionUIProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingPrediction);

  const totalVotes = Object.values(communityVotes).reduce((a, b) => a + b, 0);

  async function handleSubmit() {
    if (!selected || !userAddress) return;
    setSubmitting(true);
    try {
      await onPredict(selected, confidence);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-zinc-900">
          {isResolved
            ? "Story Resolved"
            : submitted
            ? "Your Prediction is Recorded"
            : "Make Your Prediction"}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {isResolved
            ? "The outcome has been verified and recorded on-chain."
            : submitted
            ? "Your prediction hash has been anchored on the blockchain."
            : "Choose the outcome you believe is most likely. Your prediction will be recorded immutably on-chain."}
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected === option.id || existingPrediction === option.id;
          const isCorrect = isResolved && resolvedOutcome === option.id;
          const voteCount = communityVotes[option.id] || 0;
          const votePercent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <button
              key={option.id}
              onClick={() => !submitted && !isResolved && setSelected(option.id)}
              disabled={submitted || isResolved}
              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${
                isCorrect
                  ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300"
                  : isSelected
                  ? "border-amber-400 bg-amber-50 ring-2 ring-amber-300"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              } ${submitted || isResolved ? "cursor-default" : "cursor-pointer"}`}
            >
              {/* Vote bar background */}
              {totalVotes > 0 && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                    isCorrect
                      ? "bg-emerald-100"
                      : isSelected
                      ? "bg-amber-100"
                      : "bg-zinc-100"
                  }`}
                  style={{ width: `${votePercent}%` }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900">
                        {option.label}
                      </span>
                      {isCorrect && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          CORRECT OUTCOME
                        </span>
                      )}
                      {existingPrediction === option.id && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          YOUR PICK
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {option.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold text-zinc-600">
                      {option.probability}
                    </span>
                    {totalVotes > 0 && (
                      <div className="mt-0.5 text-xs text-zinc-400">
                        {votePercent}% voted
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!submitted && !isResolved && (
        <div className="mt-6 space-y-4">
          {/* Confidence slider */}
          <div>
            <label className="mb-2 flex items-center justify-between text-sm font-medium text-zinc-700">
              <span>Confidence Level</span>
              <span className="text-amber-600">
                {"★".repeat(confidence)}
                {"☆".repeat(5 - confidence)}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
              <span>Wild guess</span>
              <span>Somewhat sure</span>
              <span>Very confident</span>
            </div>
          </div>

          {/* Submit */}
          {!userAddress ? (
            <p className="rounded-xl bg-zinc-50 p-3 text-center text-sm text-zinc-500">
              Connect your wallet to make predictions and record them on-chain
            </p>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Recording on blockchain..."
                : selected
                ? "Submit Prediction & Record On-Chain"
                : "Select an outcome first"}
            </button>
          )}
        </div>
      )}

      {submitted && !isResolved && (
        <div className="mt-6 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <span>&#x2705;</span> Prediction Recorded
          </div>
          <p className="mt-1 text-xs text-emerald-600">
            Your prediction has been hashed and anchored on the DCAI L3 chain.
            No one can change it — not even you. When this story resolves,
            we&apos;ll verify your prediction against the outcome.
          </p>
        </div>
      )}
    </div>
  );
}
