"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ComicPanel from "@/components/ComicPanel";
import PredictionUI from "@/components/PredictionUI";
import EvidenceSection from "@/components/EvidenceSection";
import { Story } from "@/lib/types";

interface StoryWithStats extends Story {
  stats: {
    totalPredictions: number;
    optionCounts: Record<string, number>;
    averageConfidence: number;
  };
}

export default function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [story, setStory] = useState<StoryWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);
  const [showSpeculative, setShowSpeculative] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [showAllPanels, setShowAllPanels] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("walletAddress");
    if (saved) setAddress(saved);

    fetch(`/api/stories/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setStory(data);
        setLoading(false);
      });
  }, [id]);

  async function handlePredict(optionId: string, confidence: number) {
    if (!address || !story) return;

    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyId: story.id,
        optionId,
        userAddress: address,
        confidence,
      }),
    });

    if (res.ok) {
      setSelectedOption(optionId);
      setShowSpeculative(true);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Story not found</h1>
        <Link href="/" className="mt-4 text-amber-600 hover:underline">
          Back to stories
        </Link>
      </div>
    );
  }

  const speculativeOption = story.predictionOptions.find(
    (o) => o.id === selectedOption
  );

  // Build speculative panels if prediction was made
  const speculativePanels = speculativeOption
    ? [
        {
          id: 100,
          narrative: `Based on your prediction: "${speculativeOption.label}" — here's how the story could play out. ${speculativeOption.description}`,
          caption: "Your Predicted Future",
          visualDescription: "Speculative future visualization",
          emoji: "&#x1f52e;",
        },
        {
          id: 101,
          narrative: `If this comes true, it would follow the pattern of ${
            story.historicalEvidence[0]?.title || "similar historical events"
          }. The implications would reshape the landscape significantly.`,
          caption: "The Ripple Effects",
          visualDescription: "Chain of consequences",
          emoji: "&#x1f30a;",
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-zinc-600"
        >
          &larr; Back to stories
        </Link>
      </div>

      {/* Story header */}
      <header className="mb-8">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{story.coverEmoji}</span>
          <div>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
              {story.category}
            </span>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-zinc-900">
              {story.title}
            </h1>
            <p className="mt-2 text-zinc-500">{story.summary}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-400">
              <span>{story.panels.length} panels</span>
              <span>&middot;</span>
              <span>
                {(
                  story.stats.totalPredictions + story.predictionCount
                ).toLocaleString()}{" "}
                predictions
              </span>
              <span>&middot;</span>
              <span>Avg confidence: {story.stats.averageConfidence}/5</span>
              {story.status === "resolved" && (
                <>
                  <span>&middot;</span>
                  <span className="text-emerald-600 font-medium">
                    Resolved
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Comic panels */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-zinc-900">The Story So Far</h2>

        {showAllPanels ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {story.panels.map((panel, idx) => (
              <div
                key={panel.id}
                className="animate-slide-in"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <ComicPanel
                  panel={panel}
                  index={idx}
                  total={story.panels.length}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Single panel view with navigation */}
            <div className="animate-slide-in">
              <ComicPanel
                panel={story.panels[currentPanel]}
                index={currentPanel}
                total={story.panels.length}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentPanel(Math.max(0, currentPanel - 1))}
                disabled={currentPanel === 0}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-30"
              >
                &larr; Previous
              </button>
              <span className="text-sm text-zinc-400">
                Panel {currentPanel + 1} of {story.panels.length}
              </span>
              {currentPanel < story.panels.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentPanel(
                      Math.min(story.panels.length - 1, currentPanel + 1)
                    )
                  }
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  onClick={() => setShowAllPanels(true)}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
                >
                  View All Panels
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Cliffhanger */}
      <section className="mb-10 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center">
        <span className="text-3xl">&#x26a1;</span>
        <h3 className="mt-2 text-lg font-bold text-amber-800">
          The Cliffhanger
        </h3>
        <p className="mt-2 text-amber-700">{story.cliffhanger}</p>
      </section>

      {/* Prediction section */}
      <section className="mb-10">
        <PredictionUI
          storyId={story.id}
          options={story.predictionOptions}
          userAddress={address}
          onPredict={handlePredict}
          existingPrediction={selectedOption || undefined}
          isResolved={story.status === "resolved"}
          resolvedOutcome={story.resolvedOutcome}
          communityVotes={story.stats.optionCounts}
        />
      </section>

      {/* Speculative future (after prediction) */}
      {showSpeculative && speculativePanels.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-amber-700">
            &#x1f52e; Your Predicted Future
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {speculativePanels.map((panel, idx) => (
              <div
                key={panel.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                <ComicPanel
                  panel={panel}
                  index={idx}
                  total={speculativePanels.length}
                  isSpeculative
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* On-chain proof card */}
      {(showSpeculative || story.status === "resolved") && (
        <section className="mb-10 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#x26d3;</span>
            <div>
              <h3 className="font-bold">
                {story.status === "resolved"
                  ? "On-Chain Verification"
                  : "Prediction Anchored On-Chain"}
              </h3>
              <p className="text-sm text-zinc-400">
                DCAI L3 on Base &middot; Immutable &middot; Tamper-proof
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 rounded-xl bg-zinc-800/50 p-4 font-mono text-xs text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-500">Network</span>
              <span>DCAI L3 (Base)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Story Hash</span>
              <span className="truncate ml-4">
                {`0x${Array.from({ length: 16 }, () =>
                  Math.floor(Math.random() * 16).toString(16)
                ).join("")}...`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Prediction Hash</span>
              <span className="truncate ml-4">
                {`0x${Array.from({ length: 16 }, () =>
                  Math.floor(Math.random() * 16).toString(16)
                ).join("")}...`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Timestamp</span>
              <span>{new Date().toISOString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status</span>
              <span className="text-emerald-400">Confirmed</span>
            </div>
          </div>
          <button className="mt-4 w-full rounded-lg bg-amber-600 py-2 text-sm font-semibold transition hover:bg-amber-700">
            &#x1f517; View on Block Explorer
          </button>
        </section>
      )}

      {/* Historical evidence */}
      <section className="mb-10">
        <EvidenceSection evidence={story.historicalEvidence} />
      </section>

      {/* Share card */}
      {showSpeculative && (
        <section className="mb-10 text-center">
          <div className="inline-block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900">
              Share Your Prediction
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Show the world you called it — with blockchain proof
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700">
                Copy Prediction Card
              </button>
              <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50">
                Share Link
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
