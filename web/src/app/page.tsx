"use client";

import { useState, useEffect, useCallback } from "react";
import CoupletForm from "@/components/CoupletForm";
import CoupletDisplay from "@/components/CoupletDisplay";
import CoupletHistory from "@/components/CoupletHistory";
import ShareButton from "@/components/ShareButton";
import { Couplet, HidePosition, HistoryEntry, FontFamily } from "@/lib/types";
import { getHistory, addToHistory, clearHistory } from "@/lib/history";

export default function Home() {
  const [couplet, setCouplet] = useState<Couplet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontFamily>("default");
  
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleGenerate = useCallback(
    async (name: string, position: HidePosition) => {
      setLoading(true);
      setError(null);

      const maxRetries = 3;

      try {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, position }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "生成失败，请重试");
          }

          const data: Couplet = await res.json();

          if (data.upper.length === data.lower.length) {
            setCouplet(data);
            addToHistory(name, data);
            setHistory(getHistory());
            return;
          }

          if (attempt === maxRetries) {
            throw new Error(
              "生成的上下联字数不一致，多次重试后仍未成功，请重新尝试"
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "生成失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSelectHistory = useCallback((c: Couplet) => {
    setCouplet(c);
    setError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold text-amber-300 mb-2"
            style={{ fontFamily: "'STKaiti', 'KaiTi', 'SimSun', serif" }}
          >
            春联生成器
          </h1>
          <p className="text-amber-200/70 text-sm">
            2026丙午马年 · 将您的名字巧妙藏入春联
          </p>
        </div>

        {/* Form */}
        <CoupletForm 
          onGenerate={handleGenerate} 
          loading={loading}
          onFontChange={setSelectedFont}
          selectedFont={selectedFont}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 mx-auto max-w-md text-center text-red-300 bg-red-950/50 border border-red-700/50 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Couplet Display */}
        {couplet && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <CoupletDisplay couplet={couplet} fontFamily={selectedFont} />
            <ShareButton couplet={couplet} />
          </div>
        )}

        {/* History */}
        <CoupletHistory
          history={history}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
        />
      </div>
    </main>
  );
}
