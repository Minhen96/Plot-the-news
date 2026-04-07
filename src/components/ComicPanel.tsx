"use client";

import { StoryPanel } from "@/lib/types";

interface ComicPanelProps {
  panel: StoryPanel;
  index: number;
  total: number;
  isSpeculative?: boolean;
}

const PANEL_COLORS = [
  "from-blue-50 to-indigo-50 ring-blue-200",
  "from-amber-50 to-orange-50 ring-amber-200",
  "from-emerald-50 to-teal-50 ring-emerald-200",
  "from-purple-50 to-violet-50 ring-purple-200",
  "from-rose-50 to-pink-50 ring-rose-200",
  "from-cyan-50 to-sky-50 ring-cyan-200",
];

export default function ComicPanel({
  panel,
  index,
  total,
  isSpeculative = false,
}: ComicPanelProps) {
  const colorClass = PANEL_COLORS[index % PANEL_COLORS.length];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ring-1 transition-all duration-500 ${
        isSpeculative
          ? "ring-amber-300 bg-gradient-to-br from-amber-50/80 to-orange-50/80 opacity-90"
          : `bg-gradient-to-br ${colorClass}`
      }`}
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Panel number badge */}
      <div
        className={`absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          isSpeculative
            ? "bg-amber-500 text-white"
            : "bg-white/90 text-zinc-700 ring-1 ring-zinc-200"
        }`}
      >
        {index + 1}
      </div>

      {/* Speculative badge */}
      {isSpeculative && (
        <div className="absolute top-3 right-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Speculative
        </div>
      )}

      <div className="p-6 pt-12">
        {/* Large emoji as visual */}
        <div className="mb-4 flex items-center justify-center">
          <span className="text-7xl drop-shadow-sm">{panel.emoji}</span>
        </div>

        {/* Caption */}
        <h4
          className={`mb-2 text-center text-lg font-bold ${
            isSpeculative ? "text-amber-800" : "text-zinc-800"
          }`}
        >
          {panel.caption}
        </h4>

        {/* Narrative */}
        <p
          className={`text-center text-sm leading-relaxed ${
            isSpeculative ? "text-amber-700" : "text-zinc-600"
          }`}
        >
          {panel.narrative}
        </p>

        {/* Progress indicator */}
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i <= index
                  ? isSpeculative
                    ? "w-4 bg-amber-400"
                    : "w-4 bg-zinc-400"
                  : "w-2 bg-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
