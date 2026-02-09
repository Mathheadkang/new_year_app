"use client";

import { useState } from "react";
import { HistoryEntry, Couplet, GroupedHistory } from "@/lib/types";

interface CoupletHistoryProps {
  history: HistoryEntry[];
  onSelect: (couplet: Couplet) => void;
  onClear: () => void;
  onClearByName: (name: string) => void;
}

const positionLabels = { head: "藏头", middle: "藏中", tail: "藏尾" } as const;

// 将历史记录按名字分组
function groupByName(history: HistoryEntry[]): GroupedHistory {
  const grouped: GroupedHistory = {};
  for (const entry of history) {
    if (!grouped[entry.name]) {
      grouped[entry.name] = [];
    }
    grouped[entry.name].push(entry);
  }
  return grouped;
}

export default function CoupletHistory({
  history,
  onSelect,
  onClear,
  onClearByName,
}: CoupletHistoryProps) {
  const [expandedNames, setExpandedNames] = useState<Set<string>>(new Set());

  if (history.length === 0) return null;

  const grouped = groupByName(history);
  const names = Object.keys(grouped);

  const toggleName = (name: string) => {
    setExpandedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-amber-200 font-bold text-lg rounded-md bg-red-950/50 border border-amber-700/30 px-3 py-1">📜 历史记录</h2>
        <button
          onClick={onClear}
          className="text-sm text-amber-400/60 hover:text-amber-300 transition-colors rounded-md bg-red-950/50 border border-amber-700/30 px-3 py-1"
        >
          清空全部
        </button>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {names.map((name) => {
          const entries = grouped[name];
          const isExpanded = expandedNames.has(name);

          return (
            <div
              key={name}
              className="rounded-lg bg-red-950/40 border border-amber-700/20 overflow-hidden"
            >
              {/* 名字标题行 - 可点击展开/收起 */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-amber-600/10 transition-colors">
                <button
                  onClick={() => toggleName(name)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span
                    className={`text-amber-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                  <span className="text-amber-100 font-medium">{name}</span>
                  <span className="text-xs text-amber-400/50">
                    ({entries.length}条)
                  </span>
                </button>
                <button
                  onClick={() => onClearByName(name)}
                  className="text-xs text-amber-400/40 hover:text-red-400 transition-colors"
                >
                  删除
                </button>
              </div>

              {/* 展开的对联列表 */}
              {isExpanded && (
                <div className="border-t border-amber-700/20">
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => onSelect(entry.couplet)}
                      className="w-full text-left px-4 py-3 hover:bg-amber-600/10 transition-colors border-b border-amber-700/10 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-amber-400/50">
                          {positionLabels[entry.couplet.position]}
                        </span>
                        <span className="text-xs text-amber-400/40">
                          {new Date(entry.createdAt).toLocaleString("zh-CN", {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-amber-300/80 text-sm">
                        {entry.couplet.upper}
                      </p>
                      <p className="text-amber-300/80 text-sm">
                        {entry.couplet.lower}
                      </p>
                      <p className="text-amber-200/60 text-xs mt-1">
                        横批：{entry.couplet.horizontal}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
