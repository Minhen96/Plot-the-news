"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-2">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-zinc-600"
        >
          &larr; Back to stories
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">
          &#x1f3c6; Prediction Leaderboard
        </h1>
        <p className="mt-2 text-zinc-500">
          Rankings powered by on-chain prediction records. Scores are
          transparent, verifiable, and tamper-proof.
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            On-chain scores
          </span>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
            DCAI L3 verified
          </span>
        </div>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-zinc-200"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {entries.slice(0, 3).map((entry, idx) => {
              const medals = ["&#x1f947;", "&#x1f948;", "&#x1f949;"];
              const bgColors = [
                "from-amber-50 to-yellow-50 ring-amber-200",
                "from-zinc-50 to-slate-50 ring-zinc-300",
                "from-orange-50 to-amber-50 ring-orange-200",
              ];
              return (
                <div
                  key={entry.address}
                  className={`rounded-2xl bg-gradient-to-br p-6 text-center ring-1 ${bgColors[idx]} ${
                    idx === 0 ? "sm:order-2 sm:-mt-4" : idx === 1 ? "sm:order-1" : "sm:order-3"
                  }`}
                >
                  <span
                    className="text-4xl"
                    dangerouslySetInnerHTML={{ __html: medals[idx] }}
                  />
                  <h3 className="mt-2 text-lg font-bold text-zinc-900">
                    {entry.displayName}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </p>
                  <div className="mt-3 text-3xl font-bold text-amber-600">
                    {entry.reputationScore}
                  </div>
                  <p className="text-xs text-zinc-500">Reputation Score</p>
                  <div className="mt-2 flex justify-center gap-3 text-xs text-zinc-500">
                    <span>{entry.totalPredictions} predictions</span>
                    <span>{entry.accuracy}% accurate</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Predictor</th>
                  <th className="px-4 py-3 text-right">Predictions</th>
                  <th className="px-4 py-3 text-right">Correct</th>
                  <th className="px-4 py-3 text-right">Accuracy</th>
                  <th className="px-4 py-3 text-right">Reputation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {entries.map((entry) => (
                  <tr
                    key={entry.address}
                    className="transition hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-zinc-500">
                      #{entry.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-semibold text-zinc-900">
                          {entry.displayName}
                        </span>
                        <span className="ml-2 text-xs text-zinc-400 font-mono">
                          {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                        </span>
                      </div>
                      {entry.streak > 0 && (
                        <span className="text-xs text-amber-600">
                          &#x1f525; {entry.streak} streak
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-zinc-600">
                      {entry.totalPredictions}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-600 font-medium">
                      {entry.correctPredictions}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.accuracy >= 50
                            ? "bg-emerald-50 text-emerald-700"
                            : entry.accuracy >= 25
                            ? "bg-amber-50 text-amber-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {entry.accuracy}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-amber-600">
                      {entry.reputationScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Explanation */}
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900">
              How Reputation Score Works
            </h3>
            <div className="mt-3 grid gap-4 text-sm text-zinc-600 sm:grid-cols-3">
              <div>
                <span className="font-semibold text-zinc-800">
                  Correct Prediction
                </span>
                <p className="mt-0.5 text-xs text-zinc-500">
                  +100 points per correct outcome prediction, verified on-chain
                </p>
              </div>
              <div>
                <span className="font-semibold text-zinc-800">
                  Participation
                </span>
                <p className="mt-0.5 text-xs text-zinc-500">
                  +10 points per prediction submitted, encourages engagement
                </p>
              </div>
              <div>
                <span className="font-semibold text-zinc-800">
                  Confidence Bonus
                </span>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Up to +25 points for high-confidence correct predictions
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
