"use client";

import { useState } from "react";
import { KINSHIP_CHIPS } from "@/lib/constants";

interface KinshipFormProps {
  onGenerate: (chain: string) => void;
  loading: boolean;
  remainingFree: number;
  refreshTimeLeft: string;
}

export default function KinshipForm({
  onGenerate,
  loading,
  remainingFree,
  refreshTimeLeft,
}: KinshipFormProps) {
  const [chain, setChain] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chain.trim() || loading) return;
    onGenerate(chain.trim());
  };

  const handleChipClick = (chip: string) => {
    setChain((prev) => {
      if (!prev.trim()) return chip;
      // 如果末尾已有"的"，直接加称谓
      if (prev.endsWith("的")) return prev + chip;
      return prev + "的" + chip;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
      <div>
        <label className="block text-amber-100 text-sm font-medium mb-2">
          亲属关系链
        </label>
        <input
          type="text"
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          placeholder="例如：爸爸的妈妈的弟弟的儿子的女儿"
          className="w-full px-4 py-3 rounded-lg bg-red-950/50 border border-amber-600/50 text-amber-50 placeholder-amber-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center text-lg"
        />
      </div>

      <div>
        <label className="block text-amber-100 text-sm font-medium mb-2">
          快捷添加
        </label>
        <div className="flex flex-wrap gap-2">
          {KINSHIP_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 rounded-lg border text-sm transition-all bg-red-950/30 border-amber-700/30 text-amber-200 hover:border-amber-500/50 hover:bg-amber-600/20"
            >
              {chip}
            </button>
          ))}
        </div>
        {chain && (
          <button
            type="button"
            onClick={() => setChain("")}
            className="mt-2 text-xs text-amber-400/50 hover:text-amber-300 transition-colors"
          >
            清空
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={!chain.trim() || loading}
        className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-bold text-lg tracking-wider transition-colors shadow-lg"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            计算中...
          </span>
        ) : (
          "算一算"
        )}
      </button>

      <div className="flex flex-col items-center gap-1">
        <p className="text-center text-sm text-amber-400/60 rounded-md bg-red-950/50 border border-amber-700/30 px-3 py-1">
          剩余免费次数：
          <span className={remainingFree > 0 ? "text-amber-300" : "text-red-400"}>
            {remainingFree}
          </span>
          /5
        </p>
        {remainingFree === 0 && refreshTimeLeft && (
          <p className="text-center text-xs text-amber-400/50 flex items-center justify-center gap-1">
            <span>⏳</span>
            {refreshTimeLeft}
          </p>
        )}
      </div>
    </form>
  );
}
