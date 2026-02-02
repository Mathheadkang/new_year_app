"use client";

import { HistoryEntry, Couplet } from "@/lib/types";

interface CoupletHistoryProps {
  history: HistoryEntry[];
  onSelect: (couplet: Couplet) => void;
  onClear: () => void;
}

const positionLabels = { head: "藏头", middle: "藏中", tail: "藏尾" } as const;

export default function CoupletHistory({
  history,
  onSelect,
  onClear,
}: CoupletHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-amber-200 font-bold text-lg">历史记录</h2>
        <button
          onClick={onClear}
          className="text-sm text-amber-400/60 hover:text-amber-300 transition-colors"
        >
          清空
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry.couplet)}
            className="w-full text-left px-4 py-3 rounded-lg bg-red-950/40 border border-amber-700/20 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-100 font-medium">{entry.name}</span>
              <span className="text-xs text-amber-400/50">
                {positionLabels[entry.couplet.position]} ·{" "}
                {new Date(entry.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
            <p className="text-amber-300/70 text-sm mt-1 truncate">
              {entry.couplet.upper} | {entry.couplet.lower}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
