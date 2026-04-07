"use client";

import { useState } from "react";
import { HistoricalEvidence } from "@/lib/types";
import ComicPanel from "./ComicPanel";

interface EvidenceSectionProps {
  evidence: HistoricalEvidence[];
}

export default function EvidenceSection({ evidence }: EvidenceSectionProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (evidence.length === 0) return null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-zinc-900">
          Seen This Before?
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Historical parallels that could inform your prediction. AI-surfaced,
          community-verified.
        </p>
      </div>

      <div className="space-y-4">
        {evidence.map((ev, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-zinc-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl ring-1 ring-violet-200">
                &#x1f4da;
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-zinc-900">{ev.title}</h4>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                    {ev.year}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500 line-clamp-1">
                  {ev.summary}
                </p>
              </div>
              <span
                className={`text-zinc-400 transition-transform ${
                  expanded === idx ? "rotate-180" : ""
                }`}
              >
                &#x25BC;
              </span>
            </button>

            {expanded === idx && (
              <div className="border-t border-zinc-100 bg-zinc-50/50 p-5">
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  {ev.panels.map((panel, pIdx) => (
                    <ComicPanel
                      key={pIdx}
                      panel={panel}
                      index={pIdx}
                      total={ev.panels.length}
                    />
                  ))}
                </div>

                <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-zinc-200">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Outcome
                    </span>
                    <p className="mt-1 text-sm text-zinc-700">{ev.outcome}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Why It&apos;s Relevant
                    </span>
                    <p className="mt-1 text-sm text-zinc-700">{ev.relevance}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
