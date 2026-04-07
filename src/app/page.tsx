"use client";

import { useState, useEffect } from "react";
import StoryCard from "@/components/StoryCard";

interface StorySummary {
  id: string;
  title: string;
  category: string;
  summary: string;
  coverEmoji: string;
  predictionCount: number;
  controversyScore: number;
  status: "active" | "resolved";
  panelCount: number;
  optionCount: number;
}

export default function Home() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => {
        setStories(data);
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === "all" ? stories : stories.filter((s) => s.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Predict the Future.
          <br />
          <span className="text-amber-600">Prove You Called It.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-500">
          Trending news stories told as comics. Make predictions on how they
          end. Your picks are hashed and recorded on the DCAI L3 blockchain —
          immutable, timestamped, tamper-proof.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            On-chain verified
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
            AI-powered stories
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-200">
            DCAI L3 on Base
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-zinc-400">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            {
              step: "1",
              icon: "&#x1f4f0;",
              title: "Read the Story",
              desc: "Trending news told as visual comic panels",
            },
            {
              step: "2",
              icon: "&#x1f52e;",
              title: "Make a Prediction",
              desc: "Choose the outcome you believe is most likely",
            },
            {
              step: "3",
              icon: "&#x26d3;",
              title: "Recorded On-Chain",
              desc: "Your prediction hash is anchored on DCAI L3",
            },
            {
              step: "4",
              icon: "&#x1f3c6;",
              title: "Prove You Called It",
              desc: "When the story resolves, your proof is immutable",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-2xl ring-1 ring-zinc-100"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              <h3 className="text-sm font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filter tabs */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Trending Stories</h2>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          {(["all", "active", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Story grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-zinc-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((story, idx) => (
            <div
              key={story.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <StoryCard {...story} />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200 py-8 text-center">
        <p className="text-sm text-zinc-400">
          ChronicleChain — Tamper-proof prediction records on DCAI L3 / Base
        </p>
        <p className="mt-1 text-xs text-zinc-300">
          Built for NottsHack 2026 | Powered by Claude AI + DCAI L3
        </p>
      </footer>
    </div>
  );
}
