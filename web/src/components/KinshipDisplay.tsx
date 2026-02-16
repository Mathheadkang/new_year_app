"use client";

import { KinshipResult } from "@/lib/types";

interface KinshipDisplayProps {
  result: KinshipResult;
}

export default function KinshipDisplay({ result }: KinshipDisplayProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-red-700/80 border-4 border-amber-500 rounded-xl px-6 py-5 shadow-xl text-center">
        <div className="mb-3">
          {result.terms.map((term, i) => (
            <span
              key={i}
              className="inline-block text-amber-300 text-3xl font-bold mx-1"
              style={{ fontFamily: "'STKaiti', 'KaiTi', 'SimSun', serif" }}
            >
              {term}
            </span>
          ))}
        </div>
        <div className="border-t border-amber-500/30 pt-3">
          <p className="text-amber-100/80 text-sm leading-relaxed">
            {result.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
