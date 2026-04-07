"use client";

import Link from "next/link";

interface StoryCardProps {
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

function getControversyColor(score: number): string {
  if (score >= 70) return "text-red-600 bg-red-50 ring-red-200";
  if (score >= 50) return "text-amber-600 bg-amber-50 ring-amber-200";
  return "text-blue-600 bg-blue-50 ring-blue-200";
}

function getControversyLabel(score: number): string {
  if (score >= 70) return "Hot Debate";
  if (score >= 50) return "Split Opinion";
  return "Leaning Consensus";
}

export default function StoryCard({
  id,
  title,
  category,
  summary,
  coverEmoji,
  predictionCount,
  controversyScore,
  status,
  panelCount,
  optionCount,
}: StoryCardProps) {
  return (
    <Link href={`/story/${id}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:-translate-y-1">
        {status === "resolved" && (
          <div className="absolute top-4 right-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Resolved
          </div>
        )}

        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-3xl ring-1 ring-zinc-100 transition-transform group-hover:scale-110">
            {coverEmoji}
          </div>
          <div className="min-w-0">
            <span className="mb-1 inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
              {category}
            </span>
            <h3 className="text-lg font-semibold leading-snug text-zinc-900 group-hover:text-amber-700 transition-colors">
              {title}
            </h3>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {summary}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-zinc-500">
            <span>&#x1f3ad;</span> {panelCount} panels
          </span>
          <span className="flex items-center gap-1 text-zinc-500">
            <span>&#x1f52e;</span> {optionCount} outcomes
          </span>
          <span className="flex items-center gap-1 text-zinc-500">
            <span>&#x1f465;</span> {predictionCount.toLocaleString()} predictions
          </span>
          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 font-medium ring-1 ${getControversyColor(
              controversyScore
            )}`}
          >
            {getControversyLabel(controversyScore)}
          </span>
        </div>
      </article>
    </Link>
  );
}
