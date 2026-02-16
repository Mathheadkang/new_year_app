"use client";

import { useState, useEffect } from "react";
import { RiddleResult } from "@/lib/types";

interface RiddleDisplayProps {
  result: RiddleResult;
}

export default function RiddleDisplay({ result }: RiddleDisplayProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [result]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-red-700/80 border-4 border-amber-500 rounded-xl px-6 py-5 shadow-xl text-center">
        {/* 谜面 */}
        <p className="text-amber-200/60 text-xs mb-2">谜面</p>
        <p
          className="text-amber-300 text-2xl font-bold leading-relaxed mb-4"
          style={{ fontFamily: "'STKaiti', 'KaiTi', 'SimSun', serif" }}
        >
          {result.question}
        </p>

        {/* 谜底 */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="px-6 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 font-medium transition-colors shadow"
          >
            揭晓答案
          </button>
        ) : (
          <div className="animate-fade-in">
            <p className="text-amber-200/60 text-xs mb-1">谜底</p>
            <p
              className="text-amber-100 text-xl font-bold"
              style={{ fontFamily: "'STKaiti', 'KaiTi', 'SimSun', serif" }}
            >
              {result.answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
