"use client";

import { useState, useEffect, useCallback } from "react";
import CoupletForm from "@/components/CoupletForm";
import CoupletDisplay from "@/components/CoupletDisplay";
import CoupletHistory from "@/components/CoupletHistory";
import ShareButton from "@/components/ShareButton";
import ContactUs from "@/components/ContactUs";
import HourglassModal from "@/components/HourglassModal";
// import AdModal from "@/components/AdModal"; // 暂时禁用广告功能
import { Couplet, HidePosition, HistoryEntry, FontFamily } from "@/lib/types";
import {
  getHistory,
  addToHistory,
  clearHistory,
  clearHistoryByName,
  getRecentHistoryForPrompt,
  needsToWatchAd,
  getRemainingFreeGenerations,
  getRemainingTime,
  formatRemainingTime,
  // grantAdBonus, // 暂时禁用广告功能
} from "@/lib/history";

export default function Home() {
  const [couplet, setCouplet] = useState<Couplet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontFamily>("default");
  const [remainingFree, setRemainingFree] = useState(5);
  const [refreshTimeLeft, setRefreshTimeLeft] = useState("");
  const [showHourglass, setShowHourglass] = useState(false);
  const [hourglassSeconds, setHourglassSeconds] = useState(0);
  // const [showAdModal, setShowAdModal] = useState(false); // 暂时禁用广告功能
  // const [pendingGenerate, setPendingGenerate] = useState<{
  //   name: string;
  //   position: HidePosition;
  // } | null>(null);

  useEffect(() => {
    setHistory(getHistory());
    setRemainingFree(getRemainingFreeGenerations());
    setRefreshTimeLeft(formatRemainingTime());
    
    // 每分钟更新剩余时间显示
    const timer = setInterval(() => {
      setRemainingFree(getRemainingFreeGenerations());
      setRefreshTimeLeft(formatRemainingTime());
    }, 60000); // 每分钟更新一次
    
    return () => clearInterval(timer);
  }, []);

  // 小屏幕随机背景图片，响应窗口大小变化
  useEffect(() => {
    // 页面加载时随机选择一个背景，之后不再改变
    const randomIndex = Math.floor(Math.random() * 6) + 1;
    const mobileBackground = `url('/horse_background/horse${randomIndex}.jpg')`;

    const handleBackground = () => {
      if (window.innerWidth <= 768) {
        // 小屏幕：使用预先选定的马背景
        document.body.style.backgroundImage = mobileBackground;
      } else {
        // 大屏幕：清除 JS 设置的背景，让 CSS 控制
        document.body.style.backgroundImage = '';
      }
    };

    handleBackground();

    // 监听窗口大小变化
    window.addEventListener('resize', handleBackground);

    return () => {
      window.removeEventListener('resize', handleBackground);
    };
  }, []);

  const doGenerate = useCallback(
    async (name: string, position: HidePosition) => {
      setLoading(true);
      setError(null);

      // 获取该名字的历史记录（最近10条）用于去重
      const previousCouplets = getRecentHistoryForPrompt(name);

      const maxRetries = 3;

      try {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, position, previousCouplets }),
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
            setRemainingFree(getRemainingFreeGenerations());
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

  const handleGenerate = useCallback(
    async (name: string, position: HidePosition) => {
      // 检查是否达到限制
      if (needsToWatchAd()) {
        setHourglassSeconds(Math.ceil(getRemainingTime() / 1000));
        setRefreshTimeLeft(formatRemainingTime());
        setShowHourglass(true);
        return;
      }

      await doGenerate(name, position);
      setRefreshTimeLeft(formatRemainingTime());
    },
    [doGenerate]
  );

  // 暂时禁用广告功能
  // const handleAdComplete = useCallback(() => {
  //   setShowAdModal(false);
  //   grantAdBonus();
  //   setRemainingFree(getRemainingFreeGenerations());

  //   // 继续之前暂停的生成
  //   if (pendingGenerate) {
  //     doGenerate(pendingGenerate.name, pendingGenerate.position);
  //     setPendingGenerate(null);
  //   }
  // }, [pendingGenerate, doGenerate]);

  // const handleAdClose = useCallback(() => {
  //   setShowAdModal(false);
  //   setPendingGenerate(null);
  // }, []);

  const handleSelectHistory = useCallback((c: Couplet) => {
    setCouplet(c);
    setError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const handleClearHistoryByName = useCallback((name: string) => {
    clearHistoryByName(name);
    setHistory(getHistory());
  }, []);

  return (
    <main className="min-h-screen py-8 px-4">
      <ContactUs />
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
          remainingFree={remainingFree}
          refreshTimeLeft={refreshTimeLeft}
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
          onClearByName={handleClearHistoryByName}
        />
      </div>

      {/* Ad Modal - 暂时禁用广告功能 */}
      {/* <AdModal
        isOpen={showAdModal}
        onClose={handleAdClose}
        onAdComplete={handleAdComplete}
      /> */}

      {/* Hourglass Cooldown Modal */}
      <HourglassModal
        isOpen={showHourglass}
        onClose={() => setShowHourglass(false)}
        totalSeconds={hourglassSeconds}
        refreshTimeText={refreshTimeLeft}
      />
    </main>
  );
}
