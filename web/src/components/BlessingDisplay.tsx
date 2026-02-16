"use client";

import { useState } from "react";
import { BlessingResult } from "@/lib/types";

interface BlessingDisplayProps {
  result: BlessingResult;
}

export default function BlessingDisplay({ result }: BlessingDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = result.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-red-700/80 border-4 border-amber-500 rounded-xl px-6 py-5 shadow-xl">
        <p
          className="text-amber-100 text-lg leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "'STKaiti', 'KaiTi', 'SimSun', serif" }}
        >
          {result.text}
        </p>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleCopy}
          className={`px-6 py-2 rounded-lg font-medium transition-colors shadow flex items-center gap-2 ${
            copied
              ? "bg-green-600 text-white"
              : "bg-amber-700 hover:bg-amber-600 text-amber-100"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              一键复制
            </>
          )}
        </button>
      </div>
    </div>
  );
}
