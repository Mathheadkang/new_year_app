"use client";

import { useState } from "react";
import { TextHistoryEntry, SystemType } from "@/lib/types";

interface TextHistoryProps {
  history: TextHistoryEntry[];
  systemType: SystemType;
  collapsible?: boolean;
  onSelect?: (entry: TextHistoryEntry) => void;
  onClear: () => void;
}

function getSystemHistoryTitle(system: SystemType): string {
  switch (system) {
    case "blessing": return "祝福记录";
    case "kinship": return "查询记录";
    case "riddle": return "灯谜记录";
    default: return "历史记录";
  }
}

export default function TextHistory({
  history,
  systemType,
  collapsible = false,
  onSelect,
  onClear,
}: TextHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="flex items-center justify-between mb-3">
        {collapsible ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-amber-200 font-bold text-lg rounded-md bg-red-950/50 border border-amber-700/30 px-3 py-1 hover:bg-amber-600/10 transition-colors"
          >
            <span className={`text-amber-400 text-sm transition-transform ${expanded ? "rotate-90" : ""}`}>
              ▶
            </span>
            {getSystemHistoryTitle(systemType)}
            <span className="text-xs text-amber-400/50 font-normal">({history.length})</span>
          </button>
        ) : (
          <h2 className="text-amber-200 font-bold text-lg rounded-md bg-red-950/50 border border-amber-700/30 px-3 py-1">
            {getSystemHistoryTitle(systemType)}
          </h2>
        )}
        {(!collapsible || expanded) && (
          <button
            onClick={onClear}
            className="text-sm text-amber-400/60 hover:text-amber-300 transition-colors rounded-md bg-red-950/50 border border-amber-700/30 px-3 py-1"
          >
            清空全部
          </button>
        )}
      </div>

      {(!collapsible || expanded) && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect?.(entry)}
              className="w-full text-left px-4 py-3 rounded-lg bg-red-950/40 border border-amber-700/20 hover:bg-amber-600/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-amber-400/50">{entry.label}</span>
                <span className="text-xs text-amber-400/40">
                  {new Date(entry.createdAt).toLocaleString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-amber-300/80 text-sm line-clamp-2">{entry.content}</p>
              {systemType === "riddle" && entry.extra && (
                <p className="text-amber-200/50 text-xs mt-1">谜底：{entry.extra}</p>
              )}
              {systemType === "kinship" && entry.extra && (
                <p className="text-amber-200/50 text-xs mt-1">称谓：{entry.extra}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
