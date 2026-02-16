"use client";

import { useState, useEffect, useCallback } from "react";
import CoupletForm from "@/components/CoupletForm";
import CoupletDisplay from "@/components/CoupletDisplay";
import CoupletHistory from "@/components/CoupletHistory";
import ShareButton from "@/components/ShareButton";
import BackgroundPicker from "@/components/BackgroundPicker";
import ContactUs from "@/components/ContactUs";
import HourglassModal from "@/components/HourglassModal";
import SystemSelector from "@/components/SystemSelector";
import FamilyCoupletForm from "@/components/FamilyCoupletForm";
import BlessingForm from "@/components/BlessingForm";
import BlessingDisplay from "@/components/BlessingDisplay";
import KinshipForm from "@/components/KinshipForm";
import KinshipDisplay from "@/components/KinshipDisplay";
import RiddleDisplay from "@/components/RiddleDisplay";
import TextHistory from "@/components/TextHistory";
import {
  Couplet, HidePosition, HistoryEntry, FontFamily,
  SystemType, BlessingResult, KinshipResult, RiddleResult, TextHistoryEntry,
} from "@/lib/types";
import { SYSTEMS } from "@/lib/constants";
import {
  getHistory,
  addToHistory,
  clearHistory,
  clearHistoryByName,
  getRecentHistoryForPrompt,
  systemNeedsLock,
  getSystemRemainingFree,
  getSystemRemainingTime,
  formatSystemRemainingTime,
  incrementSystemCount,
  getTextHistory,
  addTextHistory,
  clearTextHistory,
  getRecentRiddlesForPrompt,
} from "@/lib/history";

export default function Home() {
  const [activeSystem, setActiveSystem] = useState<SystemType>("name_couplet");

  // System 1: 姓名春联
  const [couplet, setCouplet] = useState<Couplet | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // System 2: 亲属春联
  const [familyCouplet, setFamilyCouplet] = useState<Couplet | null>(null);
  const [familyHistory, setFamilyHistory] = useState<HistoryEntry[]>([]);

  // System 3: 祝福语
  const [blessing, setBlessing] = useState<BlessingResult | null>(null);
  const [blessingHistory, setBlessingHistory] = useState<TextHistoryEntry[]>([]);

  // System 4: 亲戚关系
  const [kinship, setKinship] = useState<KinshipResult | null>(null);
  const [kinshipHistory, setKinshipHistory] = useState<TextHistoryEntry[]>([]);

  // System 5: 灯谜
  const [riddle, setRiddle] = useState<RiddleResult | null>(null);
  const [riddleHistory, setRiddleHistory] = useState<TextHistoryEntry[]>([]);

  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontFamily>("default");
  const [remainingFree, setRemainingFree] = useState(5);
  const [refreshTimeLeft, setRefreshTimeLeft] = useState("");
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showHourglass, setShowHourglass] = useState(false);
  const [hourglassSeconds, setHourglassSeconds] = useState(0);

  // 更新当前系统的剩余次数
  const refreshSystemStats = useCallback((system: SystemType) => {
    setRemainingFree(getSystemRemainingFree(system));
    setRefreshTimeLeft(formatSystemRemainingTime(system));
  }, []);

  // 切换系统时刷新状态
  useEffect(() => {
    refreshSystemStats(activeSystem);
    setError(null);

    // 加载对应系统的历史
    if (activeSystem === "name_couplet") {
      setHistory(getHistory("name_couplet"));
    } else if (activeSystem === "family_couplet") {
      setFamilyHistory(getHistory("family_couplet"));
    } else if (activeSystem === "blessing") {
      setBlessingHistory(getTextHistory("blessing"));
    } else if (activeSystem === "kinship") {
      setKinshipHistory(getTextHistory("kinship"));
    } else if (activeSystem === "riddle") {
      setRiddleHistory(getTextHistory("riddle"));
    }
  }, [activeSystem, refreshSystemStats]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshSystemStats(activeSystem);
    }, 60000);
    return () => clearInterval(timer);
  }, [activeSystem, refreshSystemStats]);

  // 小屏幕随机背景图片
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 6) + 1;
    const mobileBackground = `url('/horse_background/horse${randomIndex}.jpg')`;

    const handleBackground = () => {
      if (window.innerWidth <= 768) {
        document.body.style.backgroundImage = mobileBackground;
      } else {
        document.body.style.backgroundImage = '';
      }
    };

    handleBackground();
    window.addEventListener('resize', handleBackground);
    return () => window.removeEventListener('resize', handleBackground);
  }, []);

  // 检查限额的通用函数
  const checkLimitAndProceed = useCallback((system: SystemType, action: () => Promise<void>) => {
    if (systemNeedsLock(system)) {
      setHourglassSeconds(Math.ceil(getSystemRemainingTime(system) / 1000));
      setRefreshTimeLeft(formatSystemRemainingTime(system));
      setShowHourglass(true);
      return;
    }
    action();
  }, []);

  // ========== System 1: 姓名春联 ==========
  const doGenerateNameCouplet = useCallback(async (name: string, position: HidePosition) => {
    setLoading(true);
    setError(null);
    const previousCouplets = getRecentHistoryForPrompt(name);
    const maxRetries = 3;

    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system: "name_couplet", name, position, previousCouplets }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "生成失败，请重试");
        }

        const data: Couplet = await res.json();
        if (data.upper.length === data.lower.length) {
          setCouplet(data);
          addToHistory(name, data, "name_couplet");
          setHistory(getHistory("name_couplet"));
          refreshSystemStats("name_couplet");
          return;
        }

        if (attempt === maxRetries) {
          throw new Error("生成的上下联字数不一致，多次重试后仍未成功，请重新尝试");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [refreshSystemStats]);

  const handleGenerateNameCouplet = useCallback(
    (name: string, position: HidePosition) => {
      checkLimitAndProceed("name_couplet", () => doGenerateNameCouplet(name, position));
    },
    [checkLimitAndProceed, doGenerateNameCouplet]
  );

  // ========== System 2: 亲属春联 ==========
  const doGenerateFamilyCouplet = useCallback(async (name1: string, name2: string, relationship: string) => {
    setLoading(true);
    setError(null);
    const historyKey = `${name1}&${name2}`;
    const previousCouplets = getRecentHistoryForPrompt(historyKey, "family_couplet");
    const maxRetries = 3;

    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system: "family_couplet", name1, name2, relationship, previousCouplets }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "生成失败，请重试");
        }

        const data: Couplet = await res.json();
        if (data.upper.length === data.lower.length) {
          setFamilyCouplet(data);
          addToHistory(historyKey, data, "family_couplet");
          setFamilyHistory(getHistory("family_couplet"));
          refreshSystemStats("family_couplet");
          return;
        }

        if (attempt === maxRetries) {
          throw new Error("生成的上下联字数不一致，多次重试后仍未成功，请重新尝试");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [refreshSystemStats]);

  const handleGenerateFamilyCouplet = useCallback(
    (name1: string, name2: string, relationship: string) => {
      checkLimitAndProceed("family_couplet", () => doGenerateFamilyCouplet(name1, name2, relationship));
    },
    [checkLimitAndProceed, doGenerateFamilyCouplet]
  );

  // ========== System 3: 祝福语 ==========
  const handleGenerateBlessing = useCallback(
    (sender: string, receiver: string, relationship: string) => {
      checkLimitAndProceed("blessing", async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ system: "blessing", sender, receiver, relationship }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "生成失败，请重试");
          }
          const data: BlessingResult = await res.json();
          setBlessing(data);

          incrementSystemCount("blessing");
          addTextHistory({
            systemType: "blessing",
            label: `${sender} → ${receiver}（${relationship}）`,
            content: data.text,
          });
          setBlessingHistory(getTextHistory("blessing"));
          refreshSystemStats("blessing");
        } catch (err) {
          setError(err instanceof Error ? err.message : "生成失败，请重试");
        } finally {
          setLoading(false);
        }
      });
    },
    [checkLimitAndProceed, refreshSystemStats]
  );

  // ========== System 4: 亲戚关系 ==========
  const handleGenerateKinship = useCallback(
    (chain: string) => {
      checkLimitAndProceed("kinship", async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ system: "kinship", chain }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "生成失败，请重试");
          }
          const data: KinshipResult = await res.json();
          setKinship(data);

          incrementSystemCount("kinship");
          addTextHistory({
            systemType: "kinship",
            label: chain,
            content: chain,
            extra: data.terms.join("、"),
          });
          setKinshipHistory(getTextHistory("kinship"));
          refreshSystemStats("kinship");
        } catch (err) {
          setError(err instanceof Error ? err.message : "生成失败，请重试");
        } finally {
          setLoading(false);
        }
      });
    },
    [checkLimitAndProceed, refreshSystemStats]
  );

  // ========== System 5: 灯谜 ==========
  const handleGenerateRiddle = useCallback(
    () => {
      checkLimitAndProceed("riddle", async () => {
        setLoading(true);
        setError(null);
        try {
          const previousRiddles = getRecentRiddlesForPrompt();
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ system: "riddle", previousRiddles }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "生成失败，请重试");
          }
          const data: RiddleResult = await res.json();
          setRiddle(data);

          incrementSystemCount("riddle");
          addTextHistory({
            systemType: "riddle",
            label: "灯谜",
            content: data.question,
            extra: data.answer,
          });
          setRiddleHistory(getTextHistory("riddle"));
          refreshSystemStats("riddle");
        } catch (err) {
          setError(err instanceof Error ? err.message : "生成失败，请重试");
        } finally {
          setLoading(false);
        }
      });
    },
    [checkLimitAndProceed, refreshSystemStats]
  );

  // ========== History handlers ==========
  const handleSelectHistory = useCallback((c: Couplet) => {
    setCouplet(c);
    setError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory("name_couplet");
    setHistory([]);
  }, []);

  const handleClearHistoryByName = useCallback((name: string) => {
    clearHistoryByName(name, "name_couplet");
    setHistory(getHistory("name_couplet"));
  }, []);

  const handleSelectFamilyHistory = useCallback((c: Couplet) => {
    setFamilyCouplet(c);
    setError(null);
  }, []);

  const handleClearFamilyHistory = useCallback(() => {
    clearHistory("family_couplet");
    setFamilyHistory([]);
  }, []);

  const handleClearFamilyHistoryByName = useCallback((name: string) => {
    clearHistoryByName(name, "family_couplet");
    setFamilyHistory(getHistory("family_couplet"));
  }, []);

  const handleSelectBlessingHistory = useCallback((entry: TextHistoryEntry) => {
    setBlessing({ text: entry.content });
    setError(null);
  }, []);

  const handleSelectKinshipHistory = useCallback((entry: TextHistoryEntry) => {
    if (entry.extra) {
      setKinship({
        terms: entry.extra.split("、"),
        explanation: "",
      });
    }
    setError(null);
  }, []);

  const handleSelectRiddleHistory = useCallback((entry: TextHistoryEntry) => {
    setRiddle({
      question: entry.content,
      answer: entry.extra || "",
    });
    setError(null);
  }, []);

  // 获取当前系统信息
  const currentSystem = SYSTEMS.find(s => s.value === activeSystem)!;


  return (
    <main className="min-h-screen py-8 px-4">
      <ContactUs />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1
            className="text-4xl md:text-5xl font-bold text-amber-300 mb-2"
            style={{ fontFamily: "'STKaiti', 'KaiTi', 'SimSun', serif" }}
          >
            春节工具箱
          </h1>
          <p className="text-amber-200/70 text-sm">
            2026丙午马年 · {currentSystem.description}
          </p>
        </div>

        {/* System Selector */}
        <SystemSelector value={activeSystem} onChange={setActiveSystem} />

        {/* Error */}
        {error && (
          <div className="mt-4 mb-4 mx-auto max-w-md text-center text-red-300 bg-red-950/50 border border-red-700/50 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* ===== System 1: 姓名春联 ===== */}
        {activeSystem === "name_couplet" && (
          <>
            <CoupletForm
              onGenerate={handleGenerateNameCouplet}
              loading={loading}
              onFontChange={setSelectedFont}
              selectedFont={selectedFont}
              remainingFree={remainingFree}
              refreshTimeLeft={refreshTimeLeft}
            />

            {couplet && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <CoupletDisplay couplet={couplet} fontFamily={selectedFont} />
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors shadow flex items-center gap-2 ${
                      showBackgroundPicker
                        ? "bg-amber-500 text-white"
                        : "bg-amber-700 hover:bg-amber-600 text-amber-100"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    选择背景
                  </button>
                  <ShareButton couplet={couplet} fontFamily={selectedFont} backgroundImage={selectedBackground} />
                </div>
                {showBackgroundPicker && (
                  <BackgroundPicker selected={selectedBackground} onChange={setSelectedBackground} />
                )}
              </div>
            )}

            <CoupletHistory
              history={history}
              onSelect={handleSelectHistory}
              onClear={handleClearHistory}
              onClearByName={handleClearHistoryByName}
            />
          </>
        )}

        {/* ===== System 2: 亲属春联 ===== */}
        {activeSystem === "family_couplet" && (
          <>
            <FamilyCoupletForm
              onGenerate={handleGenerateFamilyCouplet}
              loading={loading}
              onFontChange={setSelectedFont}
              selectedFont={selectedFont}
              remainingFree={remainingFree}
              refreshTimeLeft={refreshTimeLeft}
            />

            {familyCouplet && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <CoupletDisplay couplet={familyCouplet} fontFamily={selectedFont} />
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors shadow flex items-center gap-2 ${
                      showBackgroundPicker
                        ? "bg-amber-500 text-white"
                        : "bg-amber-700 hover:bg-amber-600 text-amber-100"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    选择背景
                  </button>
                  <ShareButton couplet={familyCouplet} fontFamily={selectedFont} backgroundImage={selectedBackground} />
                </div>
                {showBackgroundPicker && (
                  <BackgroundPicker selected={selectedBackground} onChange={setSelectedBackground} />
                )}
              </div>
            )}

            <CoupletHistory
              history={familyHistory}
              onSelect={handleSelectFamilyHistory}
              onClear={handleClearFamilyHistory}
              onClearByName={handleClearFamilyHistoryByName}
            />
          </>
        )}

        {/* ===== System 3: 祝福语 ===== */}
        {activeSystem === "blessing" && (
          <>
            <BlessingForm
              onGenerate={handleGenerateBlessing}
              loading={loading}
              remainingFree={remainingFree}
              refreshTimeLeft={refreshTimeLeft}
            />

            {blessing && (
              <div className="mt-8">
                <BlessingDisplay result={blessing} />
              </div>
            )}

            <TextHistory
              history={blessingHistory}
              systemType="blessing"
              onSelect={handleSelectBlessingHistory}
              onClear={() => { clearTextHistory("blessing"); setBlessingHistory([]); }}
            />
          </>
        )}

        {/* ===== System 4: 亲戚关系 ===== */}
        {activeSystem === "kinship" && (
          <>
            <KinshipForm
              onGenerate={handleGenerateKinship}
              loading={loading}
              remainingFree={remainingFree}
              refreshTimeLeft={refreshTimeLeft}
            />

            {kinship && (
              <div className="mt-8">
                <KinshipDisplay result={kinship} />
              </div>
            )}

            <TextHistory
              history={kinshipHistory}
              systemType="kinship"
              onSelect={handleSelectKinshipHistory}
              onClear={() => { clearTextHistory("kinship"); setKinshipHistory([]); }}
            />
          </>
        )}

        {/* ===== System 5: 灯谜 ===== */}
        {activeSystem === "riddle" && (
          <>
            <div className="w-full max-w-md mx-auto space-y-5">
              <button
                onClick={handleGenerateRiddle}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-bold text-lg tracking-wider transition-colors shadow-lg"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    出题中...
                  </span>
                ) : (
                  "出一道灯谜"
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
            </div>

            {riddle && (
              <div className="mt-8">
                <RiddleDisplay result={riddle} />
              </div>
            )}

            <TextHistory
              history={riddleHistory}
              systemType="riddle"
              collapsible
              onSelect={handleSelectRiddleHistory}
              onClear={() => { clearTextHistory("riddle"); setRiddleHistory([]); }}
            />
          </>
        )}
      </div>

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
